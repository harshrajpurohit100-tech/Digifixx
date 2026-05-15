# Phase 7: Meta Pixel Browser Tracking

## Overview
This phase introduces per-page client-side tracking using the Meta Pixel. It ensures that when a visitor lands on a public landing page (`/p/[publicCode]`), only the tracking pixel connected to that specific page is loaded.

## Features Implemented
- **Public-Safe Tracking Fetch**: Enhanced `getActivePublicLandingPageByCode` to securely fetch the `pixel_id`, `default_pageview_event`, and `default_click_event` from the active tracking profile without exposing CAPI tokens or admin-level data.
- **PageView Tracking**: Injects the Meta Pixel base code dynamically on the client side and fires a PageView event exactly once per page load.
- **CTA Click Tracking**: Converts the Telegram CTA link into a new `TelegramCtaButton` component. On click, it normalizes and fires the configured conversion event (defaulting to "Lead") before opening Telegram.
- **Event IDs**: Generates an `eventID` (`crypto.randomUUID()` with safe fallback) for each browser event. This lays the foundation for Phase 9, where CAPI events will use identical IDs to achieve server-side deduplication.
- **Safe Validation**: Only valid numeric Pixel IDs trigger script initialization. Invalid IDs are ignored, preserving functionality.

## What is NOT Implemented (Future Phases)
- **Meta Conversions API (CAPI)**: No server-side tracking is sent yet.
- **Internal Analytics/Session Tracking**: Database records for `tracking_events` and `visitor_sessions` are not created.
- **Admin Testing UI**: The admin dashboard is unmodified.

## Testing Guidelines
1. Log in to the Admin Dashboard.
2. Create or update a landing page and ensure a valid Meta Tracking Profile with a `pixel_id` is connected and active.
3. Open the public URL (`/p/[publicCode]`) in a browser with the **Meta Pixel Helper** extension installed.
4. Verify that `PageView` fires automatically.
5. Click the "View in Telegram" button and verify that the defined click event (e.g., `Lead`) fires with the same configuration.
6. Open the Network tab or Pixel Helper to ensure an `eventID` is attached to all outbound Meta requests.

## Security & Compliance
- **No CAPI Token Exposure**: The frontend never receives or handles the `raw_capi_access_token`.
- **Bot Safety**: Meta scripts are not conditionally hidden based on user-agent spoofing; the exact same DOM is served to all users.
