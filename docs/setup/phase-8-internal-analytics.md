# Phase 8 — Internal Analytics Tracking

## Overview

Phase 8 implements Digifixx's own first-party analytics system for public landing pages. When visitors open a public page or click the Telegram CTA button, events are recorded directly into Supabase, giving admin users real visit and conversion data in the admin dashboards.

---

## What Is Tracked

| Event | When | Source |
|-------|------|--------|
| `PageView` | On page load | `PublicAnalyticsTracker` (browser) |
| `Lead` / `Contact` / etc. | On Telegram CTA click | `TelegramCtaButton` (browser) |

Events are sent via `POST /api/public/track` using `fetch` with `keepalive: true`.

---

## Cookies Used

| Cookie | Purpose | Max Age | HttpOnly |
|--------|---------|---------|----------|
| `dx_visitor_id` | Anonymous cross-session visitor identity | 180 days | Yes |
| `dx_session_id` | Session-level grouping | 2 hours | Yes |

Both cookies are `SameSite=Lax` and `Secure` in production.

---

## Data Captured

- **UTM Parameters**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_adset`, `utm_ad`
- **Referrer**: `document.referrer` from the browser
- **User Agent**: Browser, OS, and device type (mobile/tablet/desktop)
- **IP Hash**: SHA-256 hash of IP with `ENCRYPTION_SECRET` or `TRACKING_SALT` salt. If no salt exists, no IP is stored.
- **Event ID**: A random UUID per event for deduplication support in future phases.

---

## Privacy Rules

- ✅ **No raw IP stored** — Only SHA-256 hash using a server-side salt.
- ✅ **No PII collected** — No email, phone, or name.
- ✅ **No fingerprinting** — Standard cookies only.
- ✅ **No bot detection/cloaking** — Same content for everyone.
- ✅ **Anonymous visitor IDs** — Cannot be traced back to a person.

---

## Admin Pages Updated

| Page | What Changed |
|------|-------------|
| `/admin/landing-pages` | Table now shows real **Visits** and **Conversions** columns |
| `/admin/landing-pages/[id]` | Analytics summary row added at top (6 stat cards) |
| `/admin/analytics` | Full overview with stat cards, Top Landing Pages table, Recent Events stream |

---

## Meta Pixel Compatibility

Meta Pixel from Phase 7 continues to fire browser-side `PageView` and click events unchanged. Internal Digifixx tracking runs **in parallel** as a separate, independent system.

- Meta Pixel: fires `fbq('track', ...)` calls
- Internal Tracker: POSTs to `/api/public/track`
- Both use separate event IDs in Phase 8

> **Note:** Phase 9 will optionally unify event IDs for Meta CAPI deduplication.

---

## CAPI Status

**Not implemented in Phase 8.** Meta Conversions API server-side sending remains `not_sent` in the database. It will be implemented in a future phase.

---

## Testing Steps

1. Open an active public landing page: `https://yourdomain.in/p/[code]`
2. Check the browser Network tab for a `POST /api/public/track` request with `{"ok":true}`
3. Verify cookies `dx_visitor_id` and `dx_session_id` are set in the browser
4. Click the Telegram CTA button — confirm a second track request fires with `eventName: "Lead"`
5. Check Supabase > `tracking_events` table — should have new rows
6. Check Supabase > `visitor_sessions` table — should have a new row
7. Open `/admin/landing-pages` — Visits and Conversions columns should show non-zero values
8. Open `/admin/analytics` — Overview stats and recent events should appear

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ENCRYPTION_SECRET` | Required | Salt for SHA-256 IP hashing (also used for CAPI token encryption) |
| `TRACKING_SALT` | Optional | Alternative salt for IP hashing only |

If neither is set, IP hashing is skipped and `ip_hash` is stored as `null`.
