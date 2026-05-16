# Digifixx Production Environment Setup

Use these values in Vercel Project Settings -> Environment Variables before
deploying the production build.

## Required variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

APP_NAME=Digifixx
APP_URL=https://digifixx.in
NEXT_PUBLIC_APP_URL=https://digifixx.in

ENCRYPTION_SECRET=
TRACKING_SALT=
```

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` must only be configured as a server-side Vercel
  environment variable. Never expose it with a `NEXT_PUBLIC_` prefix.
- `ENCRYPTION_SECRET` must be a 64-character hex string. It is used to encrypt
  Meta Conversions API tokens before storage.
- `TRACKING_SALT` should be a long random value. It is used to hash visitor IP
  addresses before saving analytics rows. If it is missing, the app falls back
  to `ENCRYPTION_SECRET`; if both are missing, no IP hash is stored.
- `APP_URL` and `NEXT_PUBLIC_APP_URL` should both be set to
  `https://digifixx.in` in production so generated public URLs use the live
  domain.
- The Supabase Storage bucket `landing-assets` must exist and be public for
  uploaded landing page logos to render publicly.
- Public landing pages are server-rendered through trusted server code. Do not
  add anonymous table select policies for `landing_pages` unless a future phase
  explicitly changes that architecture.
