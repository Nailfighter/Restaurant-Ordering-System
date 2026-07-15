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
