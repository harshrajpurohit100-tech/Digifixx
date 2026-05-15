-- Digifixx Phase 2 admin profile foundation.
-- Run this in the Supabase SQL Editor after creating the first auth user.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'admin_role') then
    create type public.admin_role as enum (
      'super_admin',
      'admin',
      'analyst',
      'client_viewer'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'admin_status') then
    create type public.admin_status as enum (
      'active',
      'suspended',
      'invited'
    );
  end if;
end
$$;

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.admin_role not null default 'admin',
  status public.admin_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;

create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row
execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;

drop policy if exists "Admin users can read their own profile" on public.admin_profiles;
create policy "Admin users can read their own profile"
on public.admin_profiles
for select
to authenticated
using (auth.uid() = user_id);

-- Safe Phase 2 starter policy posture:
-- - Authenticated users can only read their own admin profile.
-- - No client-side insert policy is created, so users cannot insert their own
--   admin profile from the browser.
-- - No client-side update policy is created yet.
-- - Supabase service role bypasses RLS and can manage records from trusted
--   server operations or the SQL Editor.
-- - Super-admin read/update policies will be expanded later once the full
--   role-management workflow exists.
