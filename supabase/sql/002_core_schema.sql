-- Digifixx Phase 3 core schema.
-- Run this file in the Supabase SQL Editor after Phase 2 admin_profiles exists.
--
-- Security notes:
-- - RLS is enabled on every table created here.
-- - No anon grants or anon policies are created in Phase 3.
-- - Public landing-page read policies and tracking insert APIs will be added later.
-- - capi_access_token_encrypted must never be selected in browser/client code.
--   The app should access it only through trusted server-side repository helpers.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_status') then
    create type public.client_status as enum ('active', 'paused', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'landing_page_status') then
    create type public.landing_page_status as enum ('draft', 'active', 'paused', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'landing_page_template') then
    create type public.landing_page_template as enum (
      'telegram_join',
      'whatsapp_lead',
      'simple_lead_form',
      'custom_basic'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'tracking_event_name') then
    create type public.tracking_event_name as enum (
      'PageView',
      'ViewContent',
      'Lead',
      'Contact',
      'Subscribe',
      'CompleteRegistration',
      'ButtonClick',
      'FormSubmit',
      'Custom'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'capi_delivery_status') then
    create type public.capi_delivery_status as enum (
      'not_sent',
      'pending',
      'sent',
      'failed',
      'skipped'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum (
      'new',
      'contacted',
      'qualified',
      'rejected',
      'converted'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'audit_action') then
    create type public.audit_action as enum (
      'create',
      'update',
      'delete',
      'archive',
      'publish',
      'pause',
      'regenerate_code',
      'login',
      'logout',
      'config_change',
      'token_update'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  internal_code text unique,
  contact_name text,
  contact_email text,
  contact_phone text,
  status public.client_status not null default 'active',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_name_not_empty check (length(btrim(name)) > 0),
  constraint clients_internal_code_not_empty check (internal_code is null or length(btrim(internal_code)) > 0)
);

create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  internal_name text not null,
  public_code text not null unique,
  template public.landing_page_template not null default 'telegram_join',
  status public.landing_page_status not null default 'draft',
  page_title text,
  headline text not null,
  subheadline text,
  description text,
  primary_button_text text not null default 'Continue',
  primary_button_url text not null,
  secondary_button_text text,
  secondary_button_url text,
  disclaimer text,
  background_style text not null default 'default',
  custom_css text,
  default_event_name public.tracking_event_name not null default 'Lead',
  utm_source_default text,
  utm_campaign_default text,
  published_at timestamptz,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint landing_pages_public_code_length check (char_length(public_code) between 8 and 32),
  constraint landing_pages_public_code_format check (public_code ~ '^[A-Za-z0-9_-]+$'),
  constraint landing_pages_internal_name_not_empty check (length(btrim(internal_name)) > 0),
  constraint landing_pages_headline_not_empty check (length(btrim(headline)) > 0),
  constraint landing_pages_primary_button_text_not_empty check (length(btrim(primary_button_text)) > 0),
  constraint landing_pages_primary_button_url_not_empty check (length(btrim(primary_button_url)) > 0)
);

create table if not exists public.meta_tracking_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  landing_page_id uuid references public.landing_pages(id) on delete cascade,
  profile_name text not null,
  meta_business_id text,
  meta_ad_account_id text,
  pixel_id text not null,
  capi_access_token_encrypted text,
  capi_token_last4 text,
  test_event_code text,
  default_pageview_event public.tracking_event_name not null default 'PageView',
  default_click_event public.tracking_event_name not null default 'Lead',
  is_active boolean not null default true,
  last_verified_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meta_tracking_profiles_profile_name_not_empty check (length(btrim(profile_name)) > 0),
  constraint meta_tracking_profiles_pixel_id_not_empty check (length(btrim(pixel_id)) > 0)
);

create table if not exists public.visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages(id) on delete cascade,
  visitor_id text not null,
  session_id text not null,
  ip_hash text,
  user_agent text,
  browser text,
  os text,
  device_type text,
  country text,
  region text,
  city text,
  referrer text,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_utm_content text,
  first_utm_term text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint visitor_sessions_visitor_id_not_empty check (length(btrim(visitor_id)) > 0),
  constraint visitor_sessions_session_id_not_empty check (length(btrim(session_id)) > 0),
  constraint visitor_sessions_landing_page_session_unique unique (landing_page_id, session_id)
);

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  landing_page_id uuid not null references public.landing_pages(id) on delete cascade,
  visitor_session_id uuid references public.visitor_sessions(id) on delete set null,
  event_name public.tracking_event_name not null,
  custom_event_name text,
  event_id text not null,
  event_source_url text,
  action_source text not null default 'website',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  utm_adset text,
  utm_ad text,
  referrer text,
  ip_hash text,
  user_agent text,
  browser text,
  os text,
  device_type text,
  country text,
  region text,
  city text,
  meta_pixel_id text,
  capi_delivery_status public.capi_delivery_status not null default 'not_sent',
  capi_response jsonb,
  capi_error text,
  capi_sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint tracking_events_event_id_not_empty check (length(btrim(event_id)) > 0),
  constraint tracking_events_landing_page_event_unique unique (landing_page_id, event_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  landing_page_id uuid not null references public.landing_pages(id) on delete cascade,
  visitor_session_id uuid references public.visitor_sessions(id) on delete set null,
  tracking_event_id uuid references public.tracking_events(id) on delete set null,
  status public.lead_status not null default 'new',
  name text,
  email text,
  phone text,
  message text,
  form_data jsonb not null default '{}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action public.audit_action not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_logs_entity_type_not_empty check (length(btrim(entity_type)) > 0)
);

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_landing_pages_updated_at on public.landing_pages;
create trigger set_landing_pages_updated_at before update on public.landing_pages
for each row execute function public.set_updated_at();

drop trigger if exists set_meta_tracking_profiles_updated_at on public.meta_tracking_profiles;
create trigger set_meta_tracking_profiles_updated_at before update on public.meta_tracking_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at before update on public.leads
for each row execute function public.set_updated_at();

create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_created_at_idx on public.clients (created_at desc);
create index if not exists clients_name_idx on public.clients (lower(name));

create index if not exists landing_pages_client_id_idx on public.landing_pages (client_id);
create unique index if not exists landing_pages_public_code_idx on public.landing_pages (public_code);
create index if not exists landing_pages_status_idx on public.landing_pages (status);
create index if not exists landing_pages_created_at_idx on public.landing_pages (created_at desc);
create index if not exists landing_pages_client_status_idx on public.landing_pages (client_id, status);

create index if not exists meta_tracking_profiles_client_id_idx on public.meta_tracking_profiles (client_id);
create index if not exists meta_tracking_profiles_landing_page_id_idx on public.meta_tracking_profiles (landing_page_id);
create index if not exists meta_tracking_profiles_pixel_id_idx on public.meta_tracking_profiles (pixel_id);
create index if not exists meta_tracking_profiles_active_idx on public.meta_tracking_profiles (is_active);
create index if not exists meta_tracking_profiles_client_active_idx on public.meta_tracking_profiles (client_id, is_active);

create index if not exists visitor_sessions_landing_page_id_idx on public.visitor_sessions (landing_page_id);
create index if not exists visitor_sessions_visitor_id_idx on public.visitor_sessions (visitor_id);
create index if not exists visitor_sessions_session_id_idx on public.visitor_sessions (session_id);
create index if not exists visitor_sessions_first_seen_idx on public.visitor_sessions (first_seen_at desc);
create index if not exists visitor_sessions_landing_session_idx on public.visitor_sessions (landing_page_id, session_id);

create index if not exists tracking_events_client_id_idx on public.tracking_events (client_id);
create index if not exists tracking_events_landing_page_id_idx on public.tracking_events (landing_page_id);
create index if not exists tracking_events_event_name_idx on public.tracking_events (event_name);
create index if not exists tracking_events_created_at_idx on public.tracking_events (created_at desc);
create index if not exists tracking_events_landing_created_idx on public.tracking_events (landing_page_id, created_at desc);
create index if not exists tracking_events_capi_status_idx on public.tracking_events (capi_delivery_status);
create index if not exists tracking_events_event_id_idx on public.tracking_events (event_id);
create index if not exists tracking_events_utm_campaign_idx on public.tracking_events (utm_campaign);

create index if not exists leads_client_id_idx on public.leads (client_id);
create index if not exists leads_landing_page_id_idx on public.leads (landing_page_id);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_landing_created_idx on public.leads (landing_page_id, created_at desc);

create index if not exists audit_logs_actor_user_id_idx on public.audit_logs (actor_user_id);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.clients enable row level security;
alter table public.landing_pages enable row level security;
alter table public.meta_tracking_profiles enable row level security;
alter table public.visitor_sessions enable row level security;
alter table public.tracking_events enable row level security;
alter table public.leads enable row level security;
alter table public.audit_logs enable row level security;

grant usage on schema public to authenticated, service_role;
grant usage on type public.client_status to authenticated, service_role;
grant usage on type public.landing_page_status to authenticated, service_role;
grant usage on type public.landing_page_template to authenticated, service_role;
grant usage on type public.tracking_event_name to authenticated, service_role;
grant usage on type public.capi_delivery_status to authenticated, service_role;
grant usage on type public.lead_status to authenticated, service_role;
grant usage on type public.audit_action to authenticated, service_role;

grant select, insert, update on public.clients to authenticated;
grant select, insert, update on public.landing_pages to authenticated;
grant select, insert, update on public.meta_tracking_profiles to authenticated;
grant select, insert, update on public.visitor_sessions to authenticated;
grant select, insert, update on public.tracking_events to authenticated;
grant select, insert, update on public.leads to authenticated;
grant select, insert on public.audit_logs to authenticated;

grant all privileges on public.clients to service_role;
grant all privileges on public.landing_pages to service_role;
grant all privileges on public.meta_tracking_profiles to service_role;
grant all privileges on public.visitor_sessions to service_role;
grant all privileges on public.tracking_events to service_role;
grant all privileges on public.leads to service_role;
grant all privileges on public.audit_logs to service_role;

drop policy if exists "Active admins can select clients" on public.clients;
drop policy if exists "Active admins can insert clients" on public.clients;
drop policy if exists "Active admins can update clients" on public.clients;
drop policy if exists "Super admins can delete clients" on public.clients;
drop policy if exists "Active admins can select landing pages" on public.landing_pages;
drop policy if exists "Active admins can insert landing pages" on public.landing_pages;
drop policy if exists "Active admins can update landing pages" on public.landing_pages;
drop policy if exists "Super admins can delete landing pages" on public.landing_pages;
drop policy if exists "Active admins can select meta tracking profiles" on public.meta_tracking_profiles;
drop policy if exists "Active admins can insert meta tracking profiles" on public.meta_tracking_profiles;
drop policy if exists "Active admins can update meta tracking profiles" on public.meta_tracking_profiles;
drop policy if exists "Super admins can delete meta tracking profiles" on public.meta_tracking_profiles;
drop policy if exists "Active admins can select visitor sessions" on public.visitor_sessions;
drop policy if exists "Active admins can insert visitor sessions" on public.visitor_sessions;
drop policy if exists "Active admins can update visitor sessions" on public.visitor_sessions;
drop policy if exists "Super admins can delete visitor sessions" on public.visitor_sessions;
drop policy if exists "Active admins can select tracking events" on public.tracking_events;
drop policy if exists "Active admins can insert tracking events" on public.tracking_events;
drop policy if exists "Active admins can update tracking events" on public.tracking_events;
drop policy if exists "Super admins can delete tracking events" on public.tracking_events;
drop policy if exists "Active admins can select leads" on public.leads;
drop policy if exists "Active admins can insert leads" on public.leads;
drop policy if exists "Active admins can update leads" on public.leads;
drop policy if exists "Super admins can delete leads" on public.leads;
drop policy if exists "Active admins can select audit logs" on public.audit_logs;
drop policy if exists "Active admins can insert audit logs" on public.audit_logs;

create policy "Active admins can select clients" on public.clients for select to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can insert clients" on public.clients for insert to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can update clients" on public.clients for update to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'))
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Super admins can delete clients" on public.clients for delete to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and role = 'super_admin' and status = 'active'));

create policy "Active admins can select landing pages" on public.landing_pages for select to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can insert landing pages" on public.landing_pages for insert to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can update landing pages" on public.landing_pages for update to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'))
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Super admins can delete landing pages" on public.landing_pages for delete to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and role = 'super_admin' and status = 'active'));

create policy "Active admins can select meta tracking profiles" on public.meta_tracking_profiles for select to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can insert meta tracking profiles" on public.meta_tracking_profiles for insert to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can update meta tracking profiles" on public.meta_tracking_profiles for update to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'))
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Super admins can delete meta tracking profiles" on public.meta_tracking_profiles for delete to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and role = 'super_admin' and status = 'active'));

create policy "Active admins can select visitor sessions" on public.visitor_sessions for select to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can insert visitor sessions" on public.visitor_sessions for insert to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can update visitor sessions" on public.visitor_sessions for update to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'))
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Super admins can delete visitor sessions" on public.visitor_sessions for delete to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and role = 'super_admin' and status = 'active'));

create policy "Active admins can select tracking events" on public.tracking_events for select to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can insert tracking events" on public.tracking_events for insert to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can update tracking events" on public.tracking_events for update to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'))
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Super admins can delete tracking events" on public.tracking_events for delete to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and role = 'super_admin' and status = 'active'));

create policy "Active admins can select leads" on public.leads for select to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can insert leads" on public.leads for insert to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can update leads" on public.leads for update to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'))
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Super admins can delete leads" on public.leads for delete to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and role = 'super_admin' and status = 'active'));

create policy "Active admins can select audit logs" on public.audit_logs for select to authenticated
using (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));
create policy "Active admins can insert audit logs" on public.audit_logs for insert to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and status = 'active'));

-- Example seed shape only; do not run with placeholder values.
-- insert into public.clients (name, internal_code, created_by)
-- values ('Example Client', 'EXAMPLE', 'PASTE_AUTH_USER_UUID_HERE');
--
-- insert into public.landing_pages (
--   client_id,
--   internal_name,
--   public_code,
--   headline,
--   primary_button_text,
--   primary_button_url,
--   created_by
-- )
-- values (
--   'PASTE_CLIENT_UUID_HERE',
--   'Example Telegram Join Page',
--   'A8xK92LmQ',
--   'Join the private channel',
--   'Continue',
--   'https://example.com',
--   'PASTE_AUTH_USER_UUID_HERE'
-- );
