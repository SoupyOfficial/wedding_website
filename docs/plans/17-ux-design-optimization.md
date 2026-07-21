# UX/Design Optimization Plan — July 2026

Based on comprehensive competitor research (20+ wedding websites across Aisle, The Knot, Zola, Joy), thorough codebase audit, and cross-referencing with industry best practices for 2025-2026.

## Research Summary

### Universal Wedding Website Best Practices (from competitor analysis)
1. Homepage immediately communicates: WHO, WHEN, WHERE, HOW TO RSVP — within first 30 seconds
2. Six core pages: Home, Our Story, Schedule/Timeline, RSVP, Registry, FAQ
3. For destination weddings: add Travel and Accommodations as distinct pages
4. Navigation: 4-6 primary links max; secondary pages linked from within primary pages
5. Mobile-first design with thumb-sized buttons and minimal scrolling
6. Clear CTAs at every decision point
7. FAQ is the most-visited page — make it searchable and shareable
8. Personal voice — reads like the couple, not a template

### Current State Assessment

**Strengths:**
- Clean celestial theme (navy/gold/forest/sage/ivory) with cohesive design system
- Robust feature flag system (21 runtime toggles)
- Framer Motion animations, starfield canvas backdrop
- Good dev practices: TypeScript strict, print stylesheet, reduced-motion support, skip-to-content
- Feature-rich admin dashboard with 16+ management pages
- Multi-step RSVP with meal selection and song requests
- Weather widget, Google Maps embed, Add-to-Calendar

**Key UX Issues Found:**
1. Homepage is hero-only — nothing below the fold
2. 14 navigation items overwhelms guests (best practice: 4-6)
3. No dedicated Schedule page in the 6 core wedding website pages
4. "Photos of Us" vs "Gallery" naming confusion
5. FAQ not shareable (no per-question anchor links)
6. Dress code is text-only (competitors use visual examples)
7. No venue accessibility details
8. Countdown only to wedding date (not to actionable deadlines)
9. Unplugged ceremony notice is hardcoded (not admin-editable)
10. Travel page has 600 lines of mostly hardcoded content

**Documentation Drift:**
- ARCHITECTURE.md: said "20 models" (actual: 26), now fixed
- FEATURES.md: title says "20 feature flags" (actual: 21)
- feature-flags.md: says "20 runtime-toggleable"

---

## Phase 1: Documentation Fixes (High Priority — Quick Wins)

### 1.1: Fix ARCHITECTURE.md
**Target:** `docs/ARCHITECTURE.md`
- Change model count → 26 models ✓ (completed)
- Add missing models: EmailLog, RegistryContribution, PhotoTag
- Remove all references to event bus at `lib/events/` (doesn't exist)
- Update file counts to actuals (23 models, 21 feature flags, ~65 API routes)

### 1.2: Fix FEATURES.md
**Target:** `docs/FEATURES.md`
- Change "20 feature flags" → "21 feature flags"
- Verify all 21 flags listed in the table match `feature-flag-defaults.json`
- Add any missing flags

### 1.3: Fix feature-flags.md
**Target:** `docs/decisions/feature-flags.md`
- Change title from "20 runtime-toggleable" → "21 runtime-toggleable"
- Verify flag table is complete

**Acceptance Criteria:**
- All counts match actual codebase
- Zero references to non-existent event bus
- `grep -r "event bus" docs/` returns nothing

---

## Phase 2: Homepage Below-Fold Content (High Priority)

### Problem
The homepage hero is beautiful, but guests who scroll below the fold see… nothing. The scroll indicator at the bottom points to empty space. Competitors use the homepage as a command center with all critical info in a single scroll.

### Solution
Add a below-fold section to the homepage that appears after the hero:

```
Hero (existing)
  ├── Countdown to wedding
  ├── Couple names
  ├── Tagline
  ├── Venue & date
  ├── CTA buttons (RSVP, Our Story)
  └── Scroll indicator
─────────────────────── (new content below)
Section: "The Weekend" (quick schedule summary)
  ├── Ceremony: Friday, Nov 13, 5:00 PM
  ├── Reception: Friday, Nov 13, 6:30 PM
  ├── Day-After Brunch: Saturday, Nov 14, 10:00 AM (if set)
  └── Link: "Full Schedule →"

Section: Quick Links (grid of 6 tiles)
  ├── 📅 Event Details
  ├── ✈️ Travel & Stay
  ├── 💒 Wedding Party
  ├── 🎵 Song Requests
  ├── 📸 Gallery
  └── ❓ FAQ

Section: "Our Story" preview (2-3 sentences + link)

Section: Recent FAQ (top 3 questions + link)
```

### Implementation
- **Target:** `app/(public)/page.tsx` — add sections after the hero
- **New component:** `components/HomeSections.tsx` — encapsulates all below-fold content
- **Feature-flag aware:** Each section respects its corresponding feature flag
- **Post-wedding mode:** Replace schedule with photo gallery link, swap quick-links

### Design Notes
- Subtle background transitions between sections (darken slightly, subtle gold dividers)
- Maintain the starfield background throughout
- Gold-dotted section dividers for visual rhythm

### Acceptance Criteria:
- Homepage has visible content below the hero fold
- Quick-link grid has 6 visually distinct, tappable tiles
- Weekend schedule summary pulls from SiteSettings
- All content respects feature flags
- Post-wedding mode shows appropriate alternative content

---

## Phase 3: Navigation Restructuring (High Priority)

### Problem
14 navigation links overwhelms guests. On mobile, the full-screen overlay shows 14 items crammed together with tiny touch targets. Competitor research says 4-6 primary links is optimal. Critical pages (Event Details, RSVP, Travel) are buried in the middle of a long list.

### Proposed Navigation Structure

**Primary (always visible):**
1. Home
2. Our Story
3. Schedule (NEW — merges event details timeline + weekend events)
4. RSVP (hidden post-wedding)
5. Registry
6. FAQ

**Secondary (linked from homepage tiles or footer):**
- Travel & Stay
- Wedding Party
- Entertainment
- Song Requests
- Gallery
- Photos of Us (renamed — see Phase 4)
- Guest Book
- Contact

### Implementation
- **Target:** `lib/config/navigation.ts` — add `primary` flag to PublicNavLink
- **Target:** `components/Navigation.tsx` — render primary links in nav bar, secondary in footer
- **Target:** `components/Footer.tsx` — ensure secondary links are present in footer
- Keep all links available via homepage quick-link tiles

### Acceptance Criteria:
- Desktop nav shows 5-6 links (Home, Our Story, Schedule, RSVP, Registry, FAQ)
- Mobile nav shows same 5-6 primary links with clear visual hierarchy
- All other pages remain accessible via homepage tiles and footer
- Feature flags still respected for conditional visibility
- Current-path highlighting works correctly

---

## Phase 4: Photo Page Naming Clarification (High Priority)

### Problem
"Photos of Us" and "Gallery" are two separate pages with confusing differentiation. Guests don't know which to browse. Complicating factor: `photosOfUsPageEnabled` and `galleryPageEnabled` are separate feature flags.

### Analysis
- **Gallery** (`/gallery`): Guest-uploaded and admin-uploaded photos, tag-based filtering
- **Photos of Us** (`/photos-of-us`): Curated couple photos managed by admin

### Options
**Option A: Merge into Gallery with tabs** — Single `/gallery` page with "Our Photos" and "Guest Photos" tabs. Clean, reduces confusion, one URL. 
- Risk: Larger refactor, two feature flags need consolidation

**Option B: Rename Photos of Us → "Our Photos"** — Clearer naming, minimal code change
- `/photos-of-us` → `/our-photos` with redirect
- "Photos of Us" → "Our Photos" in nav

**Recommendation: Option B** — least risk, immediate clarity improvement. Option A can follow later.

### Implementation (Option B)
- **Target:** `lib/config/navigation.ts` — change label from "Photos of Us" to "Our Photos"
- **Target:** Feature flag: Keep `photosOfUsPageEnabled` as is (no rename needed)
- **Target:** Page metadata — update title

### Acceptance Criteria:
- Nav link says "Our Photos" (not "Photos of Us")
- Page title says "Our Photos"
- No broken links or redirects needed (URL stays same for now)
- Clear mental model: "Gallery = everyone's photos", "Our Photos = couple's curated photos"

---

## Phase 5: Dedicated Schedule/Timeline Page (Medium Priority)

### Problem
The day-of timeline is buried inside Event Details (line 232-260 of event-details/page.tsx). Wedding website best practices list Schedule as one of the 6 core pages. No single page shows the full weekend timeline (ceremony, reception, rehearsal dinner, day-after brunch).

### Solution
Create a new `/schedule` page that consolidates:
1. Weekend overview (ceremony, reception, rehearsal dinner, day-after brunch) — all from SiteSettings
2. Day-of timeline (from TimelineEvent table, eventType = "wedding-day")
3. Clean timeline infographic with icons, times, and color-coded event types
4. Add-to-Calendar buttons for each event

### Implementation
- **New file:** `app/(public)/schedule/page.tsx`
- **Feature flag:** Reuse existing `eventDetailsPageEnabled` or add new `schedulePageEnabled`
- **Source data:** TimelineEvent table + SiteSettings rehearsal/reception/brunch fields
- **Existing content:** Move the day-of timeline rendering from event-details/page.tsx to shared component
- **Navigation:** Add "Schedule" as primary nav link (Phase 3), replacing "Event Details" in primary nav

### Acceptance Criteria:
- `/schedule` page shows full weekend timeline at a glance
- Color-coded events (ceremony = gold, reception = gold, optional = sage, etc.)
- Each event has Add-to-Calendar button
- Day-of timeline rendered from TimelineEvent table
- Rehearsal dinner and day-after brunch only shown if configured in SiteSettings
- Mobile-responsive timeline layout

---

## Phase 6: FAQ Anchor Links (Medium Priority)

### Problem
FAQ is the most-visited page on wedding websites (per competitor analytics). Our FAQ has search but no way to share a specific answer. Competitors implement per-question URLs so guests can share: "Check question #5 at ourfaq.com/faq#what-to-wear"

### Solution
Add `id` anchors to each FAQ entry based on a slugified version of the question text. Add a "copy link" button or visible anchor icon on hover.

### Implementation
- **Target:** `app/(public)/faq/page.tsx` — add `id={slugify(faq.question)}` to each FAQ card
- **New utility:** `lib/slugify.ts` — convert question text to URL-safe anchor
- **UI:** Add a small link icon (🔗) on each FAQ card that copies `#slug` to clipboard
- **Scroll behavior:** Use `scroll-margin-top` to account for fixed nav height

### Acceptance Criteria:
- Each FAQ question has a unique, stable URL anchor (e.g., `/faq#what-should-i-wear`)
- Clicking anchor icon copies the URL to clipboard
- Page scrolls to correct question on direct navigation
- Anchors survive FAQ reordering (based on question text, not sortOrder)

---

## Phase 7: Dress Code + Accessibility Cards (Medium Priority)

### Problem
Dress code is a single text field: "Formal / Semi-Formal attire". Competitors use visual references (classical paintings, photo examples) to illustrate dress codes. Venue accessibility details are missing entirely.

### Solution
Enhance the Event Details (or Schedule) page with:
1. **Dress Code section**: Admin-uploadable reference images or mood board
2. **Venue Accessibility card**: New SiteSettings fields for accessibility details

### Implementation
- **Target:** `prisma/schema.prisma` — add to SiteSettings:
  - `dressCodeImages` String? (JSON array of URLs)
  - `venueAccessibility` String? (free text)
- **Target:** `app/(public)/event-details/page.tsx` — add Accessibility card if `venueAccessibility` is set
- **Target:** Admin settings page — add fields for new SiteSettings columns
- **UI:** Dress code text + optional image grid below it

### Acceptance Criteria:
- Venue accessibility info displayed on Event Details page when configured
- Dress code section supports optional reference images
- Both fields editable in admin Settings
- Accessibility card includes: parking, level paths, restrooms, seating accommodations info

---

## Phase 8: Admin-Editable Unplugged Ceremony Notice (Low Priority)

### Problem
The unplugged ceremony notice is hardcoded in `app/(public)/event-details/page.tsx` (lines 210-222). It should be admin-configurable through SiteSettings.

### Solution
Add `unpluggedCeremonyNotice` field to SiteSettings with a default value matching the current hardcoded text. Render it conditionally based on whether the field is populated.

### Implementation
- **Target:** `prisma/schema.prisma` — add `unpluggedCeremonyNotice` String? to SiteSettings
- **Target:** `app/(public)/event-details/page.tsx` — replace hardcoded text with `settings.unpluggedCeremonyNotice`
- **Target:** `lib/services/settings.service.ts` — add field to selectable fields
- **Target:** Admin settings page — add textarea field

### Acceptance Criteria:
- Unplugged ceremony notice text comes from SiteSettings
- Default value matches current hardcoded text
- Admin can edit or clear the notice (clearing = hidden)
- Notice hidden entirely when field is empty

---

## Phase 9: RSVP Deadline Countdown (Low Priority)

### Problem
The homepage countdown only counts to the wedding date. Competitors add countdowns to actionable deadlines: RSVP deadline, hotel block deadline. This creates useful urgency.

### Solution
Add a secondary countdown component that shows days remaining until the RSVP deadline, only when an RSVP deadline is set AND the deadline is in the future.

### Implementation
- **Target:** `components/CountdownTimer.tsx` — add optional `label` and `deadlineLabel` props
- **Target:** `app/(public)/page.tsx` — pass `rsvpDeadline` to a second CountdownTimer instance
- **UI:** Smaller countdown below the wedding countdown with label "Days to RSVP"

### Acceptance Criteria:
- RSVP deadline countdown visible only when `rsvpDeadline` is in the future
- Countdown disappears automatically after deadline passes
- Styled consistently with the wedding countdown but visually subordinate
- Feature-flag aware (hidden if RSVP page is disabled)

---

## Phase 10: Additional Polish Items

### 10.1: Consolidate Travel Content
- **Status:** Already planned (AUDIT-REMEDIATION-PLAN.md Issue 5)
- Move 600 lines of hardcoded Orlando content from `lib/config/travel-content.ts` to JSON data file
- Reduces file size, separates data from logic, enables future DB migration

### 10.2: Mobile Nav Footer Link
- **Target:** `components/Navigation.tsx` mobile overlay
- Add footer links in mobile nav overlay for secondary pages
- Currently mobile overlay only shows primary links

### 10.3: Post-Wedding Homepage Variant
- **Target:** `app/(public)/page.tsx`
- After wedding date: replace schedule with "Thank You" message, swap RSVP CTA for "View Photos" CTA
- Quick-link tiles adjust to post-wedding relevant pages

---

## Execution Order & Dependencies

```
Phase 1: Documentation Fixes (no dependencies, quick wins)
    ↓
Phase 2: Homepage Below-Fold (depends on Phase 1 for accurate docs)
    ↓
Phase 3: Navigation Restructuring (depends on Phase 2 homepage tiles as link targets)
    ↓
Phase 4: Photo Page Naming (independent, can run parallel with 3)
    ↓
Phase 5: Schedule Page (depends on Phase 3 nav restructuring)
    ↓
Phase 6: FAQ Anchors (independent)
    ↓
Phase 7: Dress Code + Accessibility (depends on Phase 5 Schedule page location)
    ↓
Phase 8: Unplugged Notice (independent, low risk)
    ↓
Phase 9: RSVP Countdown (independent, low risk)
    ↓
Phase 10: Polish (cleanup, dependent on prior phases)
```

### Parallelization Opportunities
- Phase 4, 6, and 9 can run independently after Phase 1-3
- Phase 8 is fully independent
- Phase 7 depends on Phase 5 for deciding where dress code content lives

---

## Risk Assessment

| Risk | Probability | Mitigation |
|------|------------|------------|
| Navigation change disorients returning visitors | Medium | Keep all links accessible via homepage and footer; add redirects for moved pages |
| Photo page rename breaks shared links | Low | Keep URL path; only rename labels |
| Schedule page duplicates event-details content | Medium | Remove timeline from event-details, keep only venue/map/dress code/parking |
| Feature flag consolidation breaks admin UI | Low | Test all flag-dependent pages after changes |
| Below-fold content increases page load | Low | Server-render all sections; lazy-load only the starfield canvas |
