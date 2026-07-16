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
