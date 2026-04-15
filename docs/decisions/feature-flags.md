# Decision: Feature Flags

## Choice: 19 runtime-toggleable boolean flags stored in DB with hardcoded defaults

### Why

- Every public page can be independently enabled/disabled without a deploy.
- Post-wedding, pages like RSVP and music requests can be turned off while keeping the gallery and guestbook live.
- Admin dashboard has a Features page for toggling flags with immediate effect.

### Current Flags

| Flag | Default | Controls |
| ---- | ------- | -------- |
| rsvpEnabled | true | RSVP page + submission endpoint |
| guestBookEnabled | true | Guest book page + entry endpoint |
| photoUploadEnabled | true | Photo upload on gallery page |
| songRequestsEnabled | true | Song request form on music page |
| registrySyncEnabled | false | Registry auto-sync (unused) |
| musicPageEnabled | true | Entire music page |
| entertainmentPageEnabled | true | Entertainment page |
| ourStoryPageEnabled | true | Our Story page |
| eventDetailsPageEnabled | true | Event Details page |
| travelPageEnabled | true | Travel & Stay page |
| weddingPartyPageEnabled | true | Wedding Party page |
| galleryPageEnabled | true | Gallery page |
| registryPageEnabled | true | Registry page |
| faqPageEnabled | true | FAQ page |
| contactPageEnabled | true | Contact form page |
| photosOfUsPageEnabled | true | Photos of Us page |
| guestPhotoSharingEnabled | true | Guest photo sharing feature |
| liveGuestCountEnabled | false | Live guest count display |
| massEmailEnabled | false | Admin mass email campaigns |

### How It Works

1. Default flags defined in `lib/config/feature-flags.ts` as a typed object
2. `getFeatureFlags()` reads all from DB, merges with defaults (DB wins)
3. `getFeatureFlag(key)` reads single flag, returns default if not in DB
4. `setFeatureFlag(key, enabled)` upserts (INSERT OR UPDATE) to DB
5. Pages call `checkFeatureFlag("flagName")` — returns `<PageDisabled />` or `null`

### Tradeoffs Accepted

- **No caching**: Every page load queries the DB for flags. At this traffic level (wedding guests, not millions), this is fine.
- **14 of 19 flags are page toggles**: These could arguably be a simpler "enabled pages" list instead of individual flags.
- **registrySyncEnabled and massEmailEnabled** reference features that don't fully exist yet.

### Simplification Candidates

- Collapse the 14 `*PageEnabled` flags into a single `enabledPages: string[]` setting on SiteSettings. One field instead of 14 rows.
- Remove flags for unimplemented features (registrySync, massEmail) to reduce confusion.
- Add a `postWeddingDefaults` preset that bulk-toggles flags for after the wedding.
