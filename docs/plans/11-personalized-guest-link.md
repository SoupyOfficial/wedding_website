# Plan: Personalized Guest Link

## What
Generate unique invite URLs per guest (e.g., `/?invite=abc123`) that pre-populate their name in the RSVP form and optionally greet them by name on the homepage. Makes the site feel personal and reduces RSVP lookup friction.

## Key Implementation Points
- Add `inviteToken` (unique string, e.g., nanoid) to the `Guest` model
- Token generated on guest creation or via a bulk "Generate Tokens" admin action
- URL: `/?invite=abc123` or `/rsvp?invite=abc123`
- Token stored in a session cookie or URL param, used to pre-fill RSVP lookup
- Homepage: if token present, show "Welcome, [Name]!" in the hero section
- Admin: show each guest's invite link on `/admin/guests` with a copy button
- Bulk export of all invite links (CSV) for mail merge with physical invitations

## Data Model Impact
Add `inviteToken String? @unique` to `Guest` model. Migration required.

## Complexity
**Low-Medium** — token generation and lookup are straightforward; the personalized greeting is a small UI touch.

## Decisions
- Token does not expire (RSVP is currently disabled; revisit expiry when RSVP re-enables)
- Personalization: pre-fills RSVP form + homepage hero greeting
- Hero: subtle personalized greeting text ("Welcome, [Name]!") within the existing hero design
