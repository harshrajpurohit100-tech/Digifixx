# Phase 6.2: Public Copy Defaults

## Overview
This phase updates the default copy for public landing pages to optimize conversions, introducing a new default CTA instruction line to improve the click-through rate.

## Changes Implemented

### New Default Support Lines
- **Support Line 1:** `📈 Get Daily 4–5 Nifty & Bank Nifty Trading Calls Absolutely Free`
- **Support Line 2:** `🚀 Join India’s Fast Growing Trading Community Before Access Closes.`

### New CTA Instruction Line
- **Line Text:** `👇🏻 Click Below To Join Free Telegram Channel 👇🏻`
- This is a globally shared fallback line. It does not have a dedicated database field yet, so it is rendered from a shared constant on all public pages, existing and new.
- It appears just above the Telegram button, after the countdown and support lines.

### Database Interaction
- New landing pages created via the admin dashboard will save the new support lines by default.
- Existing pages will retain their currently saved support lines unless they are manually edited.
- The CTA instruction line appears across all pages universally due to its implementation as a shared default on the public layout.
