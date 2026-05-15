-- Digifixx Phase 5 Telegram landing page fields and logo asset bucket.
-- Run this after supabase/sql/002_core_schema.sql.
--
-- Future public renderer design direction:
-- - Background: #F3F6FA or #F8FAFC
-- - Top Telegram bar: #0EA5E9
-- - CTA button: #0284C7, hover #0369A1
-- - Main text: #0F172A, muted text #64748B
-- - Circular logo: 96px
-- - Card max width: 560px
-- - Short, centered, trustworthy, and free of fake urgency or profit claims.

alter table public.landing_pages
add column if not exists channel_name text,
add column if not exists logo_url text,
add column if not exists logo_path text,
add column if not exists subscriber_count integer,
add column if not exists top_notice_text text not null default 'Don''t have Telegram yet? Try it now!',
add column if not exists support_line_1 text,
add column if not exists support_line_2 text,
add column if not exists urgency_text text,
add column if not exists is_countdown_enabled boolean not null default false,
add column if not exists countdown_seconds integer not null default 0,
add column if not exists footer_note text,
add column if not exists maintained_by_text text,
add column if not exists cta_button_text text not null default 'VIEW IN TELEGRAM';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'landing_pages_subscriber_count_non_negative'
  ) then
    alter table public.landing_pages
    add constraint landing_pages_subscriber_count_non_negative
    check (subscriber_count is null or subscriber_count >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'landing_pages_countdown_seconds_non_negative'
  ) then
    alter table public.landing_pages
    add constraint landing_pages_countdown_seconds_non_negative
    check (countdown_seconds >= 0);
  end if;
end
$$;

create index if not exists landing_pages_channel_name_idx
on public.landing_pages (lower(channel_name));

create index if not exists landing_pages_template_status_idx
on public.landing_pages (template, status);

-- Supabase Storage bucket for public landing page logos.
-- If this insert fails because the storage schema differs in your project,
-- create the bucket manually from the Supabase dashboard:
-- Storage -> New bucket -> landing-assets -> Public bucket.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'landing-assets',
  'landing-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read landing assets" on storage.objects;
create policy "Public can read landing assets"
on storage.objects
for select
to public
using (bucket_id = 'landing-assets');

drop policy if exists "Active admins can upload landing assets" on storage.objects;
create policy "Active admins can upload landing assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'landing-assets'
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
      and status = 'active'
  )
);

drop policy if exists "Active admins can update landing assets" on storage.objects;
create policy "Active admins can update landing assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'landing-assets'
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
      and status = 'active'
  )
)
with check (
  bucket_id = 'landing-assets'
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
      and status = 'active'
  )
);
