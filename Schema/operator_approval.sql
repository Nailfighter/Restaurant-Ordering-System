-- Operator approval system for the Order Kiosk.
-- Every auth user gets an operator_profiles row; kiosk access requires approved = true.
-- The ultimate admin email is auto-approved with role 'admin' on signup.

create table public.operator_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'operator' check (role in ('admin', 'operator')),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.operator_profiles enable row level security;

-- security definer so policies can check admin status without recursing into RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from operator_profiles
    where id = auth.uid() and role = 'admin' and approved
  );
$$;

create policy "Users can read own profile"
  on public.operator_profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.operator_profiles for select
  using (public.is_admin());

create policy "Admins can update profiles"
  on public.operator_profiles for update
  using (public.is_admin());

-- Auto-provision a profile row on signup; the ultimate admin is pre-approved.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.operator_profiles (id, email, display_name, role, approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    case when new.email = 'nailfighter000@gmail.com' then 'admin' else 'operator' end,
    new.email = 'nailfighter000@gmail.com'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Migration 2 (per_service_access): per-service access flags.
-- Admins implicitly have full access; flags matter for regular operators.
-- Note: this supersedes the `approved` column and the handle_new_user above —
-- the live function now also seeds access flags (see below).
-- ============================================================================

-- alter table public.operator_profiles
--   add column access_kiosk boolean not null default false,
--   add column access_dashboard boolean not null default false,
--   add column access_kitchen boolean not null default false;
--
-- update public.operator_profiles set access_kiosk = true where approved;
-- update public.operator_profiles
--   set access_kiosk = true, access_dashboard = true, access_kitchen = true
--   where role = 'admin';
--
-- create or replace function public.handle_new_user() ... (see Supabase
-- migration history `per_service_access` for the live version, which inserts
-- the access_* columns and sets them all true for the ultimate admin email)

-- Backfill profiles for any users that signed up before this migration
insert into public.operator_profiles (id, email, display_name, role, approved)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'display_name', ''),
  case when u.email = 'nailfighter000@gmail.com' then 'admin' else 'operator' end,
  u.email = 'nailfighter000@gmail.com'
from auth.users u
on conflict (id) do nothing;

-- ============================================================================
-- Migration 3 (admin_delete_all_data): gated wipe of orders + order_items,
-- used by the "Danger Zone" button on the kiosk's /admin page.
-- ============================================================================

create or replace function public.admin_delete_all_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can delete all data';
  end if;
  truncate table order_items, orders restart identity cascade;
end;
$$;

grant execute on function public.admin_delete_all_data() to authenticated;

-- ============================================================================
-- Migration 4 (admin_delete_pin): replaces the email-OTP reauthentication
-- step above with a dedicated delete PIN the admin sets themselves. The
-- email step was blocked by Supabase's default mailer (org-member /
-- rate-limit restrictions on projects without custom SMTP configured).
-- Supersedes admin_delete_all_data() (no args) with a PIN-checked version.
-- ============================================================================

drop function if exists public.admin_delete_all_data();

alter table public.operator_profiles
  add column delete_pin_hash text;

create or replace function public.admin_set_delete_pin(new_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can set a delete PIN';
  end if;
  if length(new_pin) < 4 then
    raise exception 'PIN must be at least 4 characters';
  end if;
  update public.operator_profiles
    set delete_pin_hash = extensions.crypt(new_pin, extensions.gen_salt('bf'))
    where id = auth.uid();
end;
$$;

create or replace function public.admin_delete_all_data(pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_hash text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can delete all data';
  end if;

  select delete_pin_hash into stored_hash
  from public.operator_profiles
  where id = auth.uid();

  if stored_hash is null then
    raise exception 'No delete PIN has been set yet';
  end if;

  if stored_hash <> extensions.crypt(pin, stored_hash) then
    raise exception 'Incorrect PIN';
  end if;

  truncate table order_items, orders restart identity cascade;
end;
$$;

grant execute on function public.admin_set_delete_pin(text) to authenticated;
grant execute on function public.admin_delete_all_data(text) to authenticated;

-- ============================================================================
-- Migration 5 (admin_delete_pin_vault): supersedes the per-admin settable PIN
-- above with a single fixed, unchangeable PIN ("1524") stored in Supabase
-- Vault (encrypted secret store). There is no app UI to view or change it.
-- ============================================================================

select vault.create_secret('1524', 'delete_pin', 'Fixed PIN required by admin_delete_all_data() on the kiosk admin panel.');

create or replace function public.admin_delete_all_data(pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_pin text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can delete all data';
  end if;

  select decrypted_secret into stored_pin
  from vault.decrypted_secrets
  where name = 'delete_pin';

  if stored_pin is null or pin <> stored_pin then
    raise exception 'Incorrect PIN';
  end if;

  truncate table order_items, orders restart identity cascade;
end;
$$;

grant execute on function public.admin_delete_all_data(text) to authenticated;

drop function if exists public.admin_set_delete_pin(text);
alter table public.operator_profiles drop column if exists delete_pin_hash;

-- ============================================================================
-- Migration 6 (super_admin_role): adds a 'super_admin' role above 'admin'.
--   - any admin (admin or super_admin) can promote an operator to admin
--   - only the super_admin can demote an admin back to operator
--   - only the super_admin can permanently remove an account (admin or operator)
--   - all admins keep full access to all 3 services and can toggle non-admin
--     operators' per-service access flags (unchanged)
-- The ultimate admin email (nailfighter000@gmail.com) is promoted from
-- 'admin' to 'super_admin'. is_admin() now recognizes both 'admin' and
-- 'super_admin'; a new is_super_admin() gates the two restricted actions.
-- The old "Admins can update profiles" RLS policy (any column, any admin) is
-- replaced with one that lets admins update access_* flags but blocks
-- changing role through a direct table update -- role changes must go
-- through promote_to_admin / demote_admin / remove_operator below.
-- ============================================================================

do $$
declare
  con_name text;
begin
  select conname into con_name
  from pg_constraint
  where conrelid = 'public.operator_profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%role%';
  if con_name is not null then
    execute format('alter table public.operator_profiles drop constraint %I', con_name);
  end if;
end $$;

alter table public.operator_profiles
  add constraint operator_profiles_role_check check (role in ('operator', 'admin', 'super_admin'));

update public.operator_profiles set role = 'super_admin' where email = 'nailfighter000@gmail.com';

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from operator_profiles
    where id = auth.uid() and role in ('admin', 'super_admin') and approved
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from operator_profiles
    where id = auth.uid() and role = 'super_admin' and approved
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_ultimate_admin boolean := new.email = 'nailfighter000@gmail.com';
begin
  insert into public.operator_profiles
    (id, email, display_name, role, approved, access_kiosk, access_dashboard, access_kitchen)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    case when is_ultimate_admin then 'super_admin' else 'operator' end,
    is_ultimate_admin,
    is_ultimate_admin,
    is_ultimate_admin,
    is_ultimate_admin
  );
  return new;
end;
$$;

create or replace function public.same_role(p_id uuid, p_new_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select role = p_new_role from operator_profiles where id = p_id;
$$;

drop policy if exists "Admins can update profiles" on public.operator_profiles;

create policy "Admins can update access flags"
  on public.operator_profiles for update
  using (public.is_admin())
  with check (public.is_admin() and public.same_role(id, role));

create or replace function public.promote_to_admin(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can promote an operator';
  end if;

  update public.operator_profiles
  set role = 'admin'
  where id = target_id and role = 'operator';

  if not found then
    raise exception 'Operator not found or already an admin';
  end if;
end;
$$;

create or replace function public.demote_admin(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only the super admin can remove admin access';
  end if;

  update public.operator_profiles
  set role = 'operator',
      access_kiosk = false,
      access_dashboard = false,
      access_kitchen = false
  where id = target_id and role = 'admin';

  if not found then
    raise exception 'Admin not found';
  end if;
end;
$$;

create or replace function public.remove_operator(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role text;
begin
  if not public.is_super_admin() then
    raise exception 'Only the super admin can remove an account';
  end if;

  select role into target_role from public.operator_profiles where id = target_id;

  if target_role is null then
    raise exception 'Account not found';
  end if;

  if target_role = 'super_admin' then
    raise exception 'The super admin account cannot be removed';
  end if;

  delete from auth.users where id = target_id;
end;
$$;

grant execute on function public.promote_to_admin(uuid) to authenticated;
grant execute on function public.demote_admin(uuid) to authenticated;
grant execute on function public.remove_operator(uuid) to authenticated;

-- ============================================================================
-- Migration 7 (order_operator_tracking): tracks which operator created an
-- order and which last updated it (e.g. advanced its status from the
-- Kitchen Display System). Surfaced in the Order-Kiosk's order-number
-- search (Header.jsx) so anyone using that search can see it.
--
-- Server/Database.js connects to Supabase with the anon key and no user
-- session (Express is a middleman, not a per-user client), so it can't read
-- operator_profiles directly -- RLS restricts that to the row's own owner
-- or an admin. get_order_operator_info() is SECURITY DEFINER so it can
-- resolve names/emails regardless, granted to anon + authenticated to match
-- the existing open grants on orders/order_items in schema.sql.
-- ============================================================================

alter table public.orders
  add column created_by uuid references auth.users(id) on delete set null,
  add column updated_by uuid references auth.users(id) on delete set null;

create or replace function public.get_order_operator_info(p_order_num integer)
returns table(
  created_by_name text,
  created_by_email text,
  updated_by_name text,
  updated_by_email text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    creator.display_name, creator.email,
    updater.display_name, updater.email
  from public.orders o
  left join public.operator_profiles creator on creator.id = o.created_by
  left join public.operator_profiles updater on updater.id = o.updated_by
  where o.order_num = p_order_num;
$$;

grant execute on function public.get_order_operator_info(integer) to anon, authenticated;

-- ============================================================================
-- Migration 8 (username_login): switch login/signup identity from email to
-- username. Operators sign up with a username (a synthetic email is
-- generated client-side since Supabase Auth requires one); login resolves
-- username -> email via a security-definer RPC before calling
-- signInWithPassword. The ultimate admin's username is 'nailfighter'.
-- ============================================================================

alter table public.operator_profiles
  add column username text;

update public.operator_profiles
  set username = 'nailfighter'
  where email = 'nailfighter000@gmail.com';

alter table public.operator_profiles
  alter column username set not null,
  add constraint operator_profiles_username_key unique (username);

create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select email from public.operator_profiles
  where lower(username) = lower(p_username)
  limit 1;
$$;

grant execute on function public.get_email_by_username(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_username text := new.raw_user_meta_data ->> 'username';
  is_ultimate_admin boolean := new.email = 'nailfighter000@gmail.com'
    or new_username = 'nailfighter';
begin
  insert into public.operator_profiles
    (id, email, username, display_name, role, approved, access_kiosk, access_dashboard, access_kitchen)
  values (
    new.id,
    new.email,
    new_username,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    case when is_ultimate_admin then 'super_admin' else 'operator' end,
    is_ultimate_admin,
    is_ultimate_admin,
    is_ultimate_admin,
    is_ultimate_admin
  );
  return new;
end;
$$;

-- ============================================================================
-- Migration 9 (order_operator_info_username): get_order_operator_info()
-- fell back to the operator's email when display_name was blank. Email is
-- now a synthetic, meaningless address (see username_login migration above),
-- so switch the fallback to username.
-- ============================================================================

drop function if exists public.get_order_operator_info(integer);

create function public.get_order_operator_info(p_order_num integer)
returns table(
  created_by_name text,
  created_by_username text,
  updated_by_name text,
  updated_by_username text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    creator.display_name, creator.username,
    updater.display_name, updater.username
  from public.orders o
  left join public.operator_profiles creator on creator.id = o.created_by
  left join public.operator_profiles updater on updater.id = o.updated_by
  where o.order_num = p_order_num;
$$;

grant execute on function public.get_order_operator_info(integer) to anon, authenticated;

-- ============================================================================
-- Migration 10 (harden_orders_rls_and_rpc_grants): orders/order_items RLS was
-- USING/WITH CHECK (true) for anon+authenticated because Server/Database.js
-- used the anon key with no per-operator session, so RLS couldn't discriminate
-- by identity. But the anon key is public (shipped in every frontend bundle),
-- so this let anyone bypass Express and write/update arbitrary orders directly
-- via PostgREST. Fix: Server/Database.js now connects with the service_role
-- key (bypasses RLS), and anon/authenticated lose all table privileges on
-- orders/order_items. Also drops clean_up_orders(), a SECURITY DEFINER RPC
-- with no caller check at all (dead code — no frontend called it;
-- admin_delete_all_data() is the supported, PIN + is_admin()-gated path), and
-- restricts get_order_operator_info()/same_role() execute grants to the
-- roles that actually need them.
-- ============================================================================

drop function if exists public.clean_up_orders();

revoke execute on function public.get_order_operator_info(integer) from anon, authenticated;
grant execute on function public.get_order_operator_info(integer) to service_role;

revoke execute on function public.same_role(uuid, text) from anon;

revoke select, insert, update, delete on public.orders, public.order_items from anon, authenticated;
grant select, insert, update, delete on public.orders, public.order_items to service_role;

revoke usage, select on sequence public.orders_order_num_seq from anon, authenticated;
revoke usage, select on sequence public.order_items_id_seq from anon, authenticated;
grant usage, select on sequence public.orders_order_num_seq to service_role;
grant usage, select on sequence public.order_items_id_seq to service_role;

drop policy if exists "orders_select" on public.orders;
drop policy if exists "orders_insert" on public.orders;
drop policy if exists "orders_update" on public.orders;
drop policy if exists "order_items_select" on public.order_items;
drop policy if exists "order_items_insert" on public.order_items;

-- ============================================================================
-- Migration 11 (fix_public_execute_grant_on_rpcs): the EXECUTE revokes in
-- migration 10 only revoked from anon/authenticated directly, but
-- get_order_operator_info()/same_role() still had EXECUTE granted to the
-- implicit PUBLIC role (Postgres' default for newly created functions),
-- which every role — including anon/authenticated — inherits regardless of
-- direct grants. Revoke from PUBLIC explicitly and re-grant only to the
-- roles that actually need it.
-- ============================================================================

revoke execute on function public.get_order_operator_info(integer) from public;
grant execute on function public.get_order_operator_info(integer) to service_role;

revoke execute on function public.same_role(uuid, text) from public;
grant execute on function public.same_role(uuid, text) to authenticated, service_role;

-- ============================================================================
-- Migration 12 (restore_anon_select_on_orders): migration 10 revoked SELECT
-- along with INSERT/UPDATE/DELETE, but Order-Kiosk's Danger_Zone.jsx reads
-- row counts directly from the browser (anon key) before the PIN-gated
-- delete-all-data confirmation, and that broke silently (counts showed 0).
-- Order/order_item contents aren't sensitive — the kitchen display and
-- dashboard already show all orders to anyone with access to those apps —
-- so restore read-only access while keeping write access revoked, which is
-- what actually mattered (anyone with the public anon key could otherwise
-- forge/edit orders directly via PostgREST).
-- ============================================================================

grant select on public.orders, public.order_items to anon, authenticated;

create policy "orders_select" on public.orders
  for select to anon, authenticated using (true);

create policy "order_items_select" on public.order_items
  for select to anon, authenticated using (true);
