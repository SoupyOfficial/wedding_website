# Architecture Overview

## Tech Stack

| Layer        | Tech                      | Purpose                          |
|-------------|---------------------------|----------------------------------|
| Framework   | Next.js 14 (App Router)   | SSR + API routes + file routing  |
| Auth        | NextAuth 5 (Credentials)  | Admin-only JWT sessions          |
| Database    | SQLite / Turso (libsql)   | Data storage, raw SQL queries    |
| Schema      | Prisma                    | Migration management only        |
| Styling     | Tailwind CSS              | Utility-first, custom theme      |
| Animation   | Framer Motion + Canvas    | Page transitions, starfield      |
| Testing     | Vitest + Testing Library  | Unit + integration (jsdom)       |
| Hosting     | Vercel                    | Edge deployment + analytics      |

## Layer Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    middleware.ts                         │
│              (auth gate + site password)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  app/(public)/          app/admin/         app/api/v1/  │
│  ┌──────────┐          ┌──────────┐       ┌──────────┐ │
│  │ 4 pages  │          │ 5 pages  │       │ public/  │ │
│  │ server + │          │ client   │       │ admin/   │ │
│  │ client   │          │ CRUD     │       │ ~15 route│ │
│  └────┬─────┘          └────┬─────┘       └────┬─────┘ │
│       │                     │                   │       │
├───────┴─────────────────────┴───────────────────┴───────┤
│                    components/                          │
│         9 shared + 8 UI primitives                      │
├─────────────────────────────────────────────────────────┤
│                       lib/                              │
│  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ db.ts  │ │ config/  │ │providers/│ │  hooks/     │ │
│  │db-types│ │feat-flags│ │storage   │ │useAdminFetch│ │
│  │sanitize│ │          │ │email     │ │useSettings  │ │
│  │  auth  │ │          │ │          │ │             │ │
│  └────────┘ └──────────┘ └──────────┘ └─────────────┘ │
│  ┌────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ api/   │ │services/ │ │constants │                 │
│  │response│ │  guest-  │ │          │                 │
│  │ratelim │ │  book    │ │          │                 │
│  └────────┘ └──────────┘ └──────────┘                 │
├─────────────────────────────────────────────────────────┤
│                  prisma/schema.prisma                   │
│                  25 models, SQLite                      │
└─────────────────────────────────────────────────────────┘
```

## Data Models (25)

**Core:** SiteSettings (singleton, ~49 fields), Guest, WeddingPartyMember, TimelineEvent
**Content:** FAQ, Photo, PhotoTag, Entertainment, Hotel
**Interactive:** GuestBookEntry, SongRequest, DJList, ContactMessage, RegistryItem, RegistryContribution
**System:** FeatureFlag, EmailTemplate, EmailCampaign, EmailLog, WebhookLog, IntegrationConfig, AdminActivityLog
**Planning:** BudgetItem, Vendor, SeatingTable

## Request Flow

```
Browser → middleware.ts
  ├─ /api/v1/admin/* → auth check (401) → API handler → db → response
  ├─ /api/v1/*       → rate limit → feature gate → handler → db → response
  ├─ /admin/*        → NextAuth callback (redirect to login) → page
  └─ /*              → site password cookie check → redirect or render page
```

## Feature Flag System

5 runtime toggles stored in DB, with hardcoded defaults. Every public page calls `checkFeatureFlag()` at the server component level — returns `<PageDisabled />` JSX if disabled, `null` if enabled.

## File Count Summary

| Directory         | Files | Purpose                    |
|-------------------|-------|----------------------------|
| lib/              | ~30   | Core logic, types, utils   |
| components/       | ~13   | Shared UI                  |
| app/(public)/     | ~14   | Public pages + clients     |
| app/admin/        | ~10   | Admin dashboard pages      |
| app/api/v1/       | ~16   | REST endpoints             |
| __tests__/        | ~25   | Test suite                 |
| prisma/           | ~3    | Schema + migrations        |
| scripts/          | ~7    | Seed, migrate, generate    |

## Complexity Hotspots

1. **SiteSettings** — 49-field singleton, 30+ fields in PUT handler
2. **Photo upload pipeline** — client compression (canvas + HEIC→JPEG conversion) → chunked multi-file API → storage provider (Vercel Blob) → approval workflow

## Resolved Simplifications

These hotspots identified in the May 2026 audit have been addressed:
- ✅ **Pre-wedding content removed** — RSVP, travel, registry, music, and 7 other pages deleted post-wedding (see "Post-Wedding" note)
- ✅ **Apple Music / travel / admin CRUD** — all removed with their feature pages
- ✅ **db-types.ts auto-generated** — Run `npm run generate:types` after schema changes
- ✅ **Admin settings decomposed** — settings page split into section components under 150 lines each

## Remaining Complexity Hotspots

- SiteSettings 49-field singleton with flat PUT handler
- toBool/toBoolAll pattern needed because SQLite lacks native booleans
