# Phase 5 Landing Pages Setup

Phase 5 adds Telegram landing page fields and the logo upload foundation.

## Run SQL

Run this file in the Supabase SQL Editor:

```text
supabase/sql/003_landing_page_telegram_fields.sql
```

## Verify Storage

Verify the Storage bucket exists:

```text
landing-assets
```

If the SQL bucket insert does not work in your project, create it manually:

1. Supabase Dashboard -> Storage -> New bucket
2. Bucket name: `landing-assets`
3. Enable: Public bucket
4. Allowed files: PNG, JPG, JPEG, WEBP
5. Max size: 5 MB

Logo uploads are performed server-side by Digifixx. The service role key must stay server-only and must never be exposed to browser code.
