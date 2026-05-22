# Phase 10.1 Advanced Analytics Reporting

Phase 10.1 adds reporting controls to the existing analytics system without changing public tracking, Meta Pixel, Meta CAPI, authentication, or landing page rendering.

## Date filtering

The Analytics page supports URL-backed reporting windows:

- `preset=today`
- `preset=yesterday`
- `preset=last7`
- `preset=last30`
- `preset=thisMonth`
- `preset=lastMonth`
- `preset=custom&from=YYYY-MM-DD&to=YYYY-MM-DD`

Example:

```text
/admin/analytics?pageId=LANDING_PAGE_ID&preset=custom&from=2026-05-01&to=2026-05-15
```

Date boundaries use IST (`Asia/Kolkata`) so reporting matches the admin panel timing.

## Source links

Source Breakdown rows now include an Open button when the source can be safely mapped to a public URL.

Examples:

- `facebook.com` opens `https://facebook.com`
- `instagram.com` opens `https://instagram.com`
- `youtube.com` opens `https://youtube.com`
- `reddit.com` opens `https://reddit.com`
- `x.com` opens `https://x.com`
- `linkedin.com` opens `https://linkedin.com`
- `telegram` opens `https://telegram.org`

Direct and unknown sources do not show an Open button.

## Event Explorer

The old limited Recent Events table is replaced with a server-paginated Event Explorer for selected landing pages.

Supported filters:

- Search: event id, event name, source, referrer, event source URL, or landing page code/name
- Event Type: All, PageView, Lead, Purchase, CompleteRegistration, Custom Events
- Traffic Type: All, Human, Bot, System, Unknown
- CAPI Status: All, Sent, Failed, Skipped, Pending
- Date range: inherited from the global reporting window

Pagination is server-side with page size options:

- 50
- 100
- 200

## CSV export

The Export CSV button downloads the current filtered Event Explorer result.

CSV columns:

- Timestamp
- Event Name
- Traffic Type
- CAPI Status
- Source
- Landing Page
- Event ID
- Visitor ID
- Session ID

The export route is admin-authenticated and does not expose CAPI tokens, IP hashes, raw user agents, or secrets.

## URL parameters

Event Explorer filters are stored in URL parameters:

- `q`
- `eventType`
- `trafficType`
- `capiStatus`
- `eventsPage`
- `pageSize`

The URL can be refreshed or shared with another authenticated admin without losing filter state.

## Production notes

- No database schema change is required for Phase 10.1.
- No tracking behavior changes are included.
- No Meta Pixel or Meta CAPI behavior changes are included.
- Events are never fetched without pagination in the UI.
