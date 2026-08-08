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
│  │ 13 pages │          │ 15 pages │       │ public/  │ │
│  │ server + │          │ client   │       │ admin/   │ │
│  │ client   │          │ CRUD     │       │ 25+route │ │
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
│                  26 models, SQLite                      │
└─────────────────────────────────────────────────────────┘
```

## Data Models (26)

**Core:** SiteSettings (singleton, ~49 fields), Guest, WeddingPartyMember, TimelineEvent
**Content:** FAQ, Photo, PhotoTag, Entertainment, Hotel, MealOption
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

20 runtime toggles stored in DB, with hardcoded defaults. Every public page calls `checkFeatureFlag()` at the server component level — returns `<PageDisabled />` JSX if disabled, `null` if enabled.

## File Count Summary

| Directory         | Files | Purpose                    |
|-------------------|-------|----------------------------|
| lib/              | ~40   | Core logic, types, utils   |
| components/       | ~19   | Shared UI                  |
| app/(public)/     | ~26   | Public pages + clients     |
| app/admin/        | ~16   | Admin dashboard pages      |
| app/api/v1/       | ~65   | REST endpoints             |
| __tests__/        | ~35   | Test suite                 |
| prisma/           | ~3    | Schema + migrations        |
| scripts/          | ~5    | Seed, migrate, generate    |

## Complexity Hotspots

1. **SiteSettings** — 49-field singleton, 30+ fields in PUT handler
2. **Weather API** — dual-mode (forecast vs historical), WMO code mapping, hour parsing
3. **Admin CRUD** — 15 nearly-identical route files with same GET/POST/PUT/DELETE pattern

## Resolved Simplifications

These hotspots identified in the May 2026 audit have been addressed:
- ✅ **Apple Music search consolidated** — Public and admin endpoints share `lib/itunes-search.ts`
- ✅ **Travel content extracted** — Data in `lib/config/travel-content.data.json`, types only in `.ts`
- ✅ **db-types.ts auto-generated** — Run `npm run generate:types` after schema changes
- ✅ **Travel page decomposed** — 600-line page split into 4 sub-components under 200 lines each
- ✅ **Admin settings decomposed** — 631-line page split into 8 section components under 150 lines each
- ✅ **Event bus references removed** — `lib/events/` never existed; decision doc updated to "Deferred"

## Remaining Complexity Hotspots

- Admin API routes share 80%+ pattern → generic CRUD handler (`lib/api/crud-handler.ts`) partially addresses this
- SiteSettings 49-field singleton with flat PUT handler
- toBool/toBoolAll pattern needed because SQLite lacks native booleans
