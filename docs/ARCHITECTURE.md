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
│  │ api/   │ │ events/  │ │constants │                 │
│  │response│ │event-bus │ │          │                 │
│  │ratelim │ │          │ │          │                 │
│  └────────┘ └──────────┘ └──────────┘                 │
├─────────────────────────────────────────────────────────┤
│                  prisma/schema.prisma                   │
│                  20 models, SQLite                      │
└─────────────────────────────────────────────────────────┘
```

## Data Models (20)

**Core:** SiteSettings (singleton, ~49 fields), Guest, WeddingPartyMember, TimelineEvent
**Content:** FAQ, Photo, PhotoTag, Entertainment, Hotel, MealOption
**Interactive:** GuestBookEntry, SongRequest, DJList, ContactMessage, RegistryItem
**System:** FeatureFlag, EmailTemplate, EmailCampaign, WebhookLog, IntegrationConfig, AdminActivityLog

## Request Flow

```
Browser → middleware.ts
  ├─ /api/v1/admin/* → auth check (401) → API handler → db → response
  ├─ /api/v1/*       → rate limit → feature gate → handler → db → response
  ├─ /admin/*        → NextAuth callback (redirect to login) → page
  └─ /*              → site password cookie check → redirect or render page
```

## Feature Flag System

19 runtime toggles stored in DB, with hardcoded defaults. Every public page calls `checkFeatureFlag()` at the server component level — returns `<PageDisabled />` JSX if disabled, `null` if enabled.

## File Count Summary

| Directory         | Files | Purpose                    |
|-------------------|-------|----------------------------|
| lib/              | ~20   | Core logic, types, utils   |
| components/       | ~17   | Shared UI                  |
| app/(public)/     | ~26   | Public pages + clients     |
| app/admin/        | ~16   | Admin dashboard pages      |
| app/api/v1/       | ~25   | REST endpoints             |
| __tests__/        | ~35   | Test suite                 |
| prisma/           | ~3    | Schema + migrations        |
| scripts/          | ~5    | Seed, migrate, generate    |

## Complexity Hotspots

1. **SiteSettings** — 49-field singleton, 30+ fields in PUT handler
2. **Weather API** — dual-mode (forecast vs historical), WMO code mapping, hour parsing
3. **Travel page** — hardcoded venue-specific content (airports, theme parks, restaurants)
4. **Admin CRUD** — 15 nearly-identical route files with same GET/POST/PUT/DELETE pattern
5. **db-types.ts** — 300 lines manually duplicating Prisma schema as TS interfaces
6. **Apple Music** — JWT token gen, playlist pagination, two separate search proxies (public + admin)

## Simplification Signals

See `docs/decisions/` for reasoning. Key candidates:
- Admin API routes share 80%+ pattern → generic CRUD handler
- db-types.ts could auto-generate from schema
- Two identical iTunes search endpoints (public + admin)
- toBool/toBoolAll pattern needed only because SQLite lacks booleans
- Event bus has subscribers but unclear if any are wired up in prod
- Travel page has ~500 lines of hardcoded Orlando/FL content
