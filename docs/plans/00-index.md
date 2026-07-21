# Wedding Website Improvement Plans

All plans are in this directory. Decisions captured from planning session on 2026-06-22.

## Admin / Personal Management

| # | Plan | Key Decisions | Complexity |
|---|------|--------------|------------|
| 01 | [Visual Seating Chart](01-visual-seating-chart.md) | Grid of table cards + drag-and-drop; printable place cards included | Medium-High |
| 02 | [Dashboard Analytics](02-dashboard-analytics.md) | All four: RSVP rate, meal breakdown, trend chart, countdowns | Low-Medium |
| 03 | [Guest List Export](03-guest-list-export.md) | CSV only | Low |
| 04 | [Budget Tracker](04-budget-tracker.md) | Optional ceiling (defaults to unset), line items only without it | Low-Medium |
| 05 | [Vendor Manager](05-vendor-contact-manager.md) | Linked to budget line items | Low |
| 06 | [QR Code Generator](06-qr-code-generator.md) | Both site-wide and per-guest codes (bulk ZIP) | Low |
| 07 | [Duplicate Guest Detection](07-duplicate-guest-detection.md) | Exact match only (email + name) for v1 | Medium |
| 08 | [Bulk Email Non-Responders](08-bulk-email-non-responders.md) | Both manual trigger and auto-schedule | Low |
| 09 | [Admin Activity Log Viewer](09-admin-activity-log-viewer.md) | UI for existing AdminActivityLog model | Low-Medium |

## Guest-Facing

| # | Plan | Key Decisions | Complexity |
|---|------|--------------|------------|
| 10 | [Guest Photo Sharing](10-guest-photo-sharing.md) | Same gallery tagged as Guest Photo; name optional | Medium |
| 11 | [Personalized Guest Link](11-personalized-guest-link.md) | Token pre-fills RSVP + homepage hero greeting | Low-Medium |
| 12 | [Print-Friendly Itinerary](12-print-friendly-itinerary.md) | Print button on existing page (no dedicated URL) | Low |
| 13 | [Add to Calendar](13-add-to-calendar.md) | All four events: ceremony, reception, rehearsal dinner, day-after brunch | Low |
| 14 | [Mobile Nav Improvement](14-mobile-nav-improvement.md) | Full-screen overlay animation | Low-Medium |
| 15 | [Skeleton Loaders + Error States](15-skeleton-loaders.md) | Both loading skeletons and error states with retry | Low |
| 16 | [Open Graph per Page](16-open-graph-per-page.md) | Dynamic generated OG image with couple name/date overlaid | Low-Medium |
| 17 | [UX/Design Optimization](17-ux-design-optimization.md) | Homepage below-fold, nav restructure, schedule page, FAQ anchors, RSVP countdown, documentation fixes | Medium-High |

## Deferred

- **RSVP Confirmation Page** — RSVP is intentionally disabled. Revisit when RSVP is re-enabled closer to the wedding.
- **Phase 8 (Unplugged Ceremony Notice)** — Requires Prisma schema change to add `unpluggedCeremonyNotice` field to SiteSettings
- **Phase 7 dress code images** — Requires Prisma schema change to add `dressCodeImages` field to SiteSettings
