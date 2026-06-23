# Plan: QR Code Generator

## What
Auto-generate QR codes in the admin panel that guests can scan from physical invitations. Links can go to the homepage, the site password entry page, or a pre-filled RSVP lookup (for when RSVP is re-enabled).

## Key Implementation Points
- New section on `/admin/settings` or a dedicated `/admin/qr-codes` page
- QR generation using `qrcode` npm package (lightweight, no server needed — runs client-side)
- Configurable target URL: homepage, site password page, specific guest RSVP link (via guest name param)
- Downloadable as PNG or SVG
- Bulk mode: generate one QR per guest with their name pre-filled in the URL, downloadable as a ZIP
- Styling: optionally embed the wedding monogram/logo in the center of the QR

## Data Model Impact
None — QR codes are generated on-demand, not stored.

## Complexity
**Low** — `qrcode` library handles generation; bulk download with ZIP requires `jszip`.

## Decisions
- Both: site-wide QR code (for signage/invitations) + per-guest QR codes (bulk ZIP download)
- Optional monogram embed: yes, if an image is configured
- Format: PNG download; bulk = ZIP of PNGs
