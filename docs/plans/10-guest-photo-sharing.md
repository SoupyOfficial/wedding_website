# Plan: Guest Photo Sharing

## What
Allow wedding guests to upload their own photos to a shared gallery. The feature flag (`guestPhotoSharingEnabled`) and upload infrastructure already exist but the guest-facing upload UI and approval workflow need to be fully built out and polished.

## Key Implementation Points
- Enable and polish the guest-facing upload UI (currently gated but not fully implemented)
- Upload flow: select photo → optional caption → submit for admin approval
- Admin approval queue on `/admin/photos`: approve/reject with one click, batch actions
- Approved photos appear in the public `/gallery` page tagged with a "Guest Photo" label
- Rate limiting per IP/session to prevent abuse
- File validation: type (jpg/png/heic), size limit, dimension check
- Cloudinary or local storage provider (already abstracted)
- Mobile-optimized: allow direct camera capture on iOS/Android via `input[capture]`

## Data Model Impact
Minimal — `Photo` model and `PhotoTag` already exist. May add a `submittedBy` (guest name) field.

## Complexity
**Medium** — infrastructure is in place; polish + the approval UI + mobile UX are the main work.

## Decisions
- Name: optional (not required; shown as attribution if provided)
- No public pending state; just a "thanks, under review" confirmation message
- No per-guest photo cap in v1
- Same gallery as admin photos, tagged with "Guest Photo" label
