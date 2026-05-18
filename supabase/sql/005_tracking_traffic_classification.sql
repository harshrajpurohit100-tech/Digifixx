-- Phase 10: Bot/system traffic classification for analytics accuracy.
-- This migration is intentionally non-destructive and does not block any traffic.

alter table public.tracking_events
  add column if not exists traffic_type text not null default 'unknown',
  add column if not exists is_bot boolean not null default false,
  add column if not exists bot_reason text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tracking_events_traffic_type_check'
      and conrelid = 'public.tracking_events'::regclass
  ) then
    alter table public.tracking_events
      add constraint tracking_events_traffic_type_check
      check (traffic_type in ('human', 'bot', 'system', 'unknown'));
  end if;
end $$;

create index if not exists tracking_events_landing_page_traffic_type_idx
  on public.tracking_events (landing_page_id, traffic_type);

create index if not exists tracking_events_is_bot_idx
  on public.tracking_events (is_bot);

comment on column public.tracking_events.traffic_type is
  'Analytics-only traffic classification: human, bot, system, or unknown. Does not affect page rendering.';

comment on column public.tracking_events.is_bot is
  'True for bot and system/platform preview traffic. Used for analytics separation only.';

comment on column public.tracking_events.bot_reason is
  'Transparent classifier reason such as social_or_platform_preview, search_or_seo_crawler, or generic_bot_pattern.';
