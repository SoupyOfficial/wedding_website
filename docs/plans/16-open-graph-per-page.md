# Plan: Open Graph / Social Sharing per Page

## What
Improve how the website previews when shared on social media (iMessage, Instagram, Facebook, Twitter/X). Each major page gets a tailored title, description, and preview image instead of using the global fallback.

## Key Implementation Points
- Audit current OG metadata in `app/layout.tsx` and per-page `metadata` exports
- Dynamic metadata via Next.js `generateMetadata()` for pages that pull from the database (e.g., Our Story, Event Details)
- Static metadata for fixed pages (Travel, Wedding Party, Registry, FAQ, Gallery)
- `og:image`: use the existing `SiteSettings.ogImage` as the global fallback; per-page images for key pages
- Recommended page-specific metadata:
  - Home: couple name + wedding date
  - Our Story: "Meet [Couple] — their story"
  - Event Details: venue name + date + time
  - Wedding Party: "Meet the wedding party"
  - Registry: "Help [Couple] celebrate"
- Twitter/X card support (`twitter:card`, `twitter:image`)
- Validate with OpenGraph debugger after deployment

## Data Model Impact
None — reads from `SiteSettings`.

## Complexity
**Low** — mostly adding `metadata` exports to page files; no new API routes needed.

## Decisions
- Dynamic OG image generator: auto-generate images with couple name + wedding date overlaid
- Use Next.js ImageResponse (built-in, no extra deps) via `app/opengraph-image.tsx` pattern
- Per-page descriptions: auto-generated from page content in v1; manual override can come later
- Global fallback: existing SiteSettings.ogImage if configured
