# Feature Reference

## Guest-facing features

### Home (`/`)

The landing page. Shows:
- Couple names and wedding date
- Live countdown timer (client-side, updates every second)
- Hero tagline (configurable via admin Settings)
- CTA buttons to RSVP and event details
- Animated starfield canvas background

The hero tagline automatically swaps to `heroTaglinePostWedding` after the wedding date passes.

---

### RSVP (`/rsvp`)

Multi-step form controlled by the `rsvpEnabled` feature flag and an optional `rsvpDeadline` date.

**Flow:**
1. Guest enters first + last name → looked up in the Guests table by the `/api/v1/rsvp/lookup` endpoint
2. Guest confirms attendance (attending / declining)
3. If attending: selects a meal option from the available `MealOption` records
4. Guest can add dietary needs and optionally request a song
5. If the guest has `plusOneAllowed = true`, they can add a plus-one name and meal choice
6. On submit, the `Guest` record is updated: `rsvpStatus`, `mealPreference`, `dietaryNeeds`, `songRequest`, plus-one fields

**Edge cases:**
- Name not found → error message, guest told to contact the couple
- RSVP deadline passed → form is replaced with a message
- `rsvpEnabled` flag is off → `<PageDisabled />` shown instead of page
- If the guest already responded → their existing answers are pre-filled

---

### Music / Song Requests (`/music`)

Controlled by `musicPageEnabled` and `songRequestsEnabled` feature flags.

**Guest view:**
- Search bar using the iTunes Search API proxy (`/api/v1/music/search`)
- Results shown as cards with album art, artist, track name
- Guest selects a track and enters their name, then submits via `/api/v1/music/requests`
- Approved song requests are listed on the page (DJ view for guests)
- DJ playlist "must-play" and "do-not-play" lists are visible to guests via `/api/v1/music/dj-playlist`

---

### Event Details (`/event-details`)

Controlled by `eventDetailsPageEnabled`.

Shows:
- Ceremony time, venue name, address
- Reception information
- Dress code
- Children policy (from `SiteSettings.childrenPolicy`)
- Parking information
- Live weather widget (calls `/api/v1/weather`):
  - If ≤16 days to wedding: real hourly forecast from Open-Meteo
  - Otherwise: averaged historical climate data from the same date in the past 5 years
  - Fallback: generic Central Florida summer averages

---

### Travel & Stay (`/travel`)

Controlled by `travelPageEnabled`.

Shows:
- Hotel recommendations (from `Hotel` table, admin-managed)
- Airports and car rental tips (static, Orlando-area content from `lib/config/travel-content.data.json`)
- Theme parks and local restaurants (static, Orlando-area)
- Traffic tips
- Google Maps embed of venue location (`NEXT_PUBLIC_VENUE_ADDRESS`)

The hotel section is dynamic (admin-managed). The rest of the travel content is static JSON.

---

### Wedding Party (`/wedding-party`)

Controlled by `weddingPartyPageEnabled`.

Shows all `WeddingPartyMember` records where `confirmed = true` (unless admin has disabled the filter). Members are grouped by side (bride vs groom) and sorted by `sortOrder`. Each card shows photo, name, role, and relationship to bride/groom.

---

### Entertainment (`/entertainment`)

Controlled by `entertainmentPageEnabled`.

Lists all `Entertainment` records where `isVisible = true`, sorted by `sortOrder`. Each item shows a name, icon, and description.

---

### Registry (`/registry`)

Controlled by `registryPageEnabled`.

Lists all `RegistryItem` records with `status = "active"`. Items link out to external store/fund URLs. Fund-type items show a contribution progress bar (raised vs goal). Guests can contribute via `/api/v1/registry/contribute`.

---

### FAQ (`/faq`)

Controlled by `faqPageEnabled`.

Lists all `FAQ` records where `isVisible = true`, sorted by `sortOrder`. Includes a client-side search/filter bar.

---

### Gallery (`/gallery`)

Controlled by `galleryPageEnabled`.

Shows all `Photo` records where `approved = true`. Supports tag-based filtering via `PhotoTag` records. If `photoUploadEnabled` is on, guests can upload photos from the gallery page.

---

### Photos of Us (`/photos-of-us`)

Controlled by `photosOfUsPageEnabled`.

A curated set of couple photos managed by the admin (separate from the guest-upload gallery).

---

### Our Story (`/our-story`)

Controlled by `ourStoryPageEnabled`.

Displays `TimelineEvent` records sorted by `sortOrder`, rendered as an animated vertical timeline. Timeline display can also be toggled independently via the `timelineEnabled` flag.

---

### Guest Book (`/guest-book`)

Controlled by `guestBookEnabled`.

Guests submit a name and message. Entries require admin approval before appearing publicly. Approved entries (`isVisible = true`) are shown on the page.

---

### Contact (`/contact`)

Controlled by `contactPageEnabled`.

A simple form that stores submissions in the `ContactMessage` table. The admin can read messages and mark them as read at `/admin/communications`. No email routing is currently implemented.

---

## Admin features

All admin pages require login at `/admin/login` with the credentials set by `ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables.

### Dashboard (`/admin`)

Summary cards:
- Total guests, attending, declined, pending
- RSVP progress bar
- Days until wedding
- Pending photo approvals
- Unread contact messages
- Guest book entries awaiting approval
- Unapproved song requests

### Guests (`/admin/guests`)

Full CRUD on the `Guest` table:
- Add guests individually or import a list
- Filter by RSVP status, group, or meal choice
- Edit any field (name, email, plus-one allowed, table number, notes)
- Delete guests
- View dietary needs summary

### Content

**Timeline** (`/admin/content/timeline`) — Our Story events  
**FAQs** (`/admin/faqs`) — FAQ entries (question, answer, visibility, sort order)

### Wedding Party (`/admin/wedding-party`)

Manage `WeddingPartyMember` records:
- Add/edit/remove members
- Upload or link a photo
- Set bio, role, side (bride/groom), sort order
- Toggle `confirmed` status (unconfirmed members can be hidden on the public page)

### Photos (`/admin/photos`)

- View all uploaded photos (pending + approved)
- Approve or reject individual photos
- Add/edit captions
- Manage `PhotoTag` records and assign tags to photos
- Set sort order

### Registry (`/admin/registry`)

- Add/edit/remove `RegistryItem` records
- Set item type (store link, product, or fund)
- For funds: track goal amount vs raised amount
- View contributions per item

### Hotels (`/admin/hotels`)

Manage hotel recommendations shown on the Travel page:
- Name, address, phone, website, booking link
- Block code + deadline, price range, amenities, distance from venue

### Entertainment (`/admin/entertainment`)

Manage the entertainment lineup shown on the Entertainment page:
- Name, icon (emoji or image), description, visibility, sort order

### Music & DJ (`/admin/music`)

- **Song requests:** Approve, reject, or hide guest-submitted requests
- **DJ list:** Add songs to Must-Play or Do-Not-Play lists with optional play time slot
- **Apple Music import:** Paste an Apple Music playlist URL to import all tracks
- **Search:** Search iTunes to find and add songs directly

### Meals (`/admin/meals`)

Manage `MealOption` records presented to guests during RSVP:
- Name, description, dietary flags (vegetarian, vegan, gluten-free)
- Sort order and availability toggle

### Guest Book (`/admin/guest-book`)

Review and approve/reject guest book submissions before they appear publicly.

### Communications (`/admin/communications`)

View all contact form submissions. Mark messages as read. No reply capability (email not yet wired up).

### Features (`/admin/features`)

Toggle any of the 21 feature flags on or off with immediate effect — no deploy required. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full flag list.

### Settings (`/admin/settings`)

The master configuration panel. Covers ~49 fields:

| Group | Fields |
|-------|--------|
| Identity | Couple name, wedding date, ceremony time, venue name & address |
| Hero | Pre-wedding tagline, post-wedding tagline |
| Content | Children policy, parking info, travel notes, FAQ intro, weather info |
| Contact | Joint email, bride email, groom email, notification email |
| Social | Instagram, Facebook, TikTok |
| RSVP | RSVP enabled toggle, deadline date, notify on RSVP |
| Site security | Site password (bcrypt-stored), enable/disable password gate |
| SEO | OG description, OG image URL |
| Banner | Text, link URL, background color, active toggle |
| Registry | Registry notes block, entertainment notes block |
| Wedding party | Hide unconfirmed members toggle |
| Post-wedding | Post-wedding content block (markdown/HTML) |

---

## Feature flags reference

| Flag key | Default | Controls |
|----------|---------|----------|
| `rsvpEnabled` | on | RSVP page + `/api/v1/rsvp/*` |
| `guestBookEnabled` | on | Guest book page + submission |
| `photoUploadEnabled` | **off** | Upload button on gallery page |
| `songRequestsEnabled` | on | Song request form on music page |
| `registrySyncEnabled` | **off** | Registry auto-sync (not yet built) |
| `musicPageEnabled` | on | Entire music page |
| `entertainmentPageEnabled` | on | Entertainment page |
| `ourStoryPageEnabled` | on | Our Story page |
| `eventDetailsPageEnabled` | on | Event Details page |
| `travelPageEnabled` | on | Travel & Stay page |
| `weddingPartyPageEnabled` | on | Wedding Party page |
| `galleryPageEnabled` | on | Gallery page |
| `registryPageEnabled` | on | Registry page |
| `faqPageEnabled` | on | FAQ page |
| `contactPageEnabled` | on | Contact page |
| `photosOfUsPageEnabled` | on | Photos of Us page |
| `timelineEnabled` | on | Timeline component within Our Story |
| `guestPhotoSharingEnabled` | **off** | Shared album link (not yet built) |
| `liveGuestCountEnabled` | **off** | Live RSVP count (not yet built) |
| `massEmailEnabled` | on | Admin email campaigns (not yet built) |

Flags marked **off** are either not yet implemented or intentionally disabled by default.

---

## Planned / not-yet-built features

These have database schema and/or feature flags but no implementation:

- **Mass email campaigns** — `EmailTemplate`, `EmailCampaign`, `EmailLog` tables exist; email provider is `noop` stub
- **Registry auto-sync** — `registrySyncEnabled` flag exists; no sync logic implemented
- **Guest photo sharing** — `guestPhotoSharingEnabled` flag exists; shared album link UI not built
- **Live guest count** — `liveGuestCountEnabled` flag exists; display component not built
- **Admin activity log** — `AdminActivityLog` table exists but not written to by CRUD handlers
