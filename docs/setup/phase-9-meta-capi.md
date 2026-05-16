# Phase 9 Meta CAPI

Phase 9 adds server-side Meta Conversions API events for public landing pages.

Browser Pixel and server CAPI now use the same `event_id` for the same visitor action:

- Public page view: one generated PageView ID is used by `fbq` and `/api/public/track`.
- Telegram CTA click: one generated click ID is used by `fbq` and `/api/public/track`.

The public tracking API sends a single CAPI attempt for PageView and CTA conversion events using the landing page's active Meta tracking profile:

- Pixel ID
- Encrypted CAPI token, decrypted only on the server
- Test Event Code, when configured
- Default PageView and CTA event names

No raw CAPI token or encrypted CAPI token is exposed to the browser.

`tracking_events` stores:

- `event_id`
- `meta_pixel_id`
- `capi_delivery_status`
- `capi_response`
- `capi_error`
- `capi_sent_at`

Duplicate `landing_page_id + event_id` requests return `duplicate: true` and do not send CAPI again.

## Testing

1. Create or edit a landing page with a valid Pixel ID and CAPI token.
2. Add a Meta `test_event_code` if you want to use Events Manager Test Events.
3. Set the page status to active.
4. Open `/p/[publicCode]`.
5. Click the Telegram CTA.
6. Check Meta Events Manager Test Events.
7. Check `public.tracking_events` in Supabase for `capi_delivery_status`.

## Status Meanings

- `sent`: Meta accepted the event.
- `failed`: Meta rejected the event or the request failed.
- `skipped`: Pixel ID or CAPI token was missing or invalid.
- `not_sent` / `pending`: reserved for future queue/retry flows.

Phase 9 does not add Ads Insights API, background retries, webhooks, lead forms, PII advanced matching, bot filtering, cloaking, or any fake events.
