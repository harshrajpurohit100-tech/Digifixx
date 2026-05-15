# Phase 6 Public Renderer

Phase 6 adds the public Telegram landing page route:

```text
/p/[publicCode]
```

Only landing pages with `status = 'active'` render publicly. Missing pages and pages in `draft`, `paused`, or `archived` status return the app-level 404 page.

Public page data is fetched server-side through a server-only repository. The browser does not query Supabase for landing page records, and no anonymous public Supabase table policy is required in this phase.

The public renderer only selects fields needed for the Telegram page. It does not return client private data, admin profile data, audit logs, Meta tracking profiles, raw CAPI tokens, or encrypted CAPI tokens.

The generated public page is mobile responsive. The private admin panel remains desktop-only.

Meta Pixel, Meta Conversions API, visitor sessions, tracking events, analytics, and button click tracking are intentionally not implemented in this phase.
