# Phase 10 Traffic Classification

Phase 10 separates human traffic from bot, crawler, and platform preview traffic for cleaner analytics.

## SQL migration

Run this file in the Supabase SQL Editor before deploying the Phase 10 code:

```sql
supabase/sql/005_tracking_traffic_classification.sql
```

It adds these analytics-only fields to `public.tracking_events`:

- `traffic_type`: `human`, `bot`, `system`, or `unknown`
- `is_bot`: true for bot and system preview traffic
- `bot_reason`: transparent classifier reason

## Classification behavior

Digifixx classifies each tracking event from request headers, mainly the user-agent:

- `human`: common browser/mobile user-agents
- `system`: social/platform preview agents such as Meta, WhatsApp, Telegram, Twitter/X, LinkedIn, Discord, Slack, and Pinterest
- `bot`: search or SEO crawlers such as Googlebot, Bingbot, DuckDuckBot, AhrefsBot, SemrushBot, and generic bot/crawler patterns
- `unknown`: missing or unrecognized user-agent

This classification is for analytics only.

## What this does not do

Digifixx does not block bots, redirect bots, hide content, or show different public page content to different visitors. Meta, Facebook, Google, Telegram, and other crawlers can still view the same public page as everyone else.

## Analytics behavior

Main selected-page analytics use human traffic by default:

- Total visits
- Unique visitors
- Conversions
- Conversion rate
- Source, device, and event breakdowns

The Analytics page also shows a Traffic Quality card with:

- Human visits
- Bot views
- System views
- Unknown views
- Raw total views

Recent Events includes a traffic type badge so every recorded event remains transparent.

Dashboard totals and Landing Pages directory visit/conversion counts also use human traffic after this phase.

## Notes

- Existing historical events are marked `unknown` by the SQL default unless backfilled separately.
- Raw IP addresses are not stored.
- Meta Pixel and Meta CAPI behavior remains unchanged.
- No paid bot detection service or ML classifier is used in this phase.
