# Phase 3 Core Schema Setup

Phase 3 adds the core Digifixx database architecture for clients, landing pages, Meta tracking profiles, visitor sessions, tracking events, leads, and audit logs.

## SQL File

Run this file in the Supabase SQL Editor:

```text
supabase/sql/002_core_schema.sql
```

Open Supabase Dashboard -> SQL Editor, paste the full file, and run it after the Phase 2 `admin_profiles` SQL has already been applied.

## Security Notes

- CAPI tokens are encrypted by server-side code before being stored in `meta_tracking_profiles.capi_access_token_encrypted`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code or client components.
- Browser/client components must never select `capi_access_token_encrypted`.
- Public landing page read policies are not enabled yet.
- Public tracking insert policies and tracking API routes are not enabled yet.
- No anonymous access policies are created in this phase.

## Manual Verification Queries

```sql
select * from public.clients;
select * from public.landing_pages;
select * from public.meta_tracking_profiles;
```

These should only return data for authenticated active admins through the Data API. In SQL Editor, you are running with elevated database access, so RLS behavior should also be checked through the app or Supabase policy tester.
