---
name: wedding-website
description: Domain knowledge for the Forever Campbells wedding website project. Use when working on any aspect of this Next.js wedding website - pages, admin, API, database, theme, or deployment.
---

# Forever Campbells Wedding Website

## Project Overview
Jacob & Ashley Campbell's wedding website ("Forever Campbells").
- **Date:** November 13, 2026
- **Venue:** The Highland Manor, Apopka, Florida
- **Guest count:** Under 130
- **Wedding party:** 12 members + flower girl + 3 ring bearers

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3, Framer Motion |
| Database | SQLite (local) / Turso libSQL (production) |
| ORM | Prisma 6 (schema/migrations only) |
| Auth | NextAuth v5 (credentials) |
| Hosting | Vercel |
| Testing | Vitest + Testing Library, Playwright E2E |

## Color Palette (Celestial Theme)
```js
colors: {
  midnight: { DEFAULT: "#0B1D3A", light: "#122B54" },
  royal:    { DEFAULT: "#1E3A6E", light: "#2A4F8F" },
  gold:     { DEFAULT: "#D4A843", light: "#E8C76A", dark: "#C9952B" },
  forest:   { DEFAULT: "#2D5F3E", light: "#3A7A4F" },
  sage:     { DEFAULT: "#7A9E7E", light: "#9AB89D" },
  ivory:    { DEFAULT: "#FAF8F0" },
  cream:    { DEFAULT: "#F5F0E3" },
}
```

## Database Models (26)
**Core:** SiteSettings (singleton, ~49 fields), Guest, WeddingPartyMember, TimelineEvent
**Content:** FAQ, Photo, PhotoTag, Entertainment, Hotel, MealOption
**Interactive:** GuestBookEntry, SongRequest, DJList, ContactMessage, RegistryItem, RegistryContribution
**System:** FeatureFlag, EmailTemplate, EmailCampaign, EmailLog, WebhookLog, IntegrationConfig, AdminActivityLog
**Planning:** BudgetItem, Vendor, SeatingTable

## Public Pages
| Route | Description |
|-------|------------|
| `/` | Homepage with countdown, hero, starry sky |
| `/our-story` | Couple's story timeline |
| `/event-details` | Ceremony & reception details, calendar add |
| `/rsvp` | Multi-step RSVP form with meal/song request |
| `/gallery` | Wedding photo gallery |
| `/guest-book` | Digital guest messages |
| `/wedding-party` | Bridal party members |
| `/entertainment` | Reception activities lineup |
| `/registry` | Registry links |
| `/travel` | Hotels & travel info |
| `/faq` | Frequently asked questions |
| `/contact` | Contact form |

## Admin Pages
| Route | Description |
|-------|------------|
| `/admin/dashboard` | RSVP stats overview |
| `/admin/guests` | Guest list management, CSV import/export |
| `/admin/content` | Edit all page content sections |
| `/admin/wedding-party` | Manage party members & photos |
| `/admin/photos` | Upload/manage gallery photos |
| `/admin/music` | Song requests, love/hate lists |
| `/admin/meal-options` | Configure RSVP meal choices |
| `/admin/guest-book` | Moderate guest book entries |
| `/admin/communications` | Mass email campaigns |
| `/admin/settings` | Site settings, feature flags, integrations |

## Complexity Hotspots
1. **SiteSettings** - 49-field singleton, 30+ fields in PUT handler
2. **Weather API** - dual-mode (forecast vs historical), WMO code mapping
3. **Travel page** - hardcoded venue-specific content (~500 lines)
4. **Admin CRUD** - 15 nearly-identical route files with same pattern
5. **db-types.ts** - 300 lines manually duplicating Prisma schema
6. **Apple Music** - JWT token gen, playlist pagination

## Simplification Opportunities
- Admin API routes share 80%+ pattern -> generic CRUD handler
- db-types.ts could auto-generate from schema
- Two identical iTunes search endpoints (public + admin)
- toBool/toBoolAll pattern needed only because SQLite lacks booleans

## Key Commands
```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint
npm run typecheck     # TypeScript --noEmit
npm run seed          # Seed database with sample data
npm run db:push       # Push schema to local SQLite
npm run test          # Vitest run
npm run test:watch    # Vitest watch mode
npm run test:coverage # Vitest with coverage
npm run test:e2e      # Playwright E2E tests
npx prisma studio     # Visual database browser
npm run generate:types # Generate DB types from schema
```

## Development Workflow
1. `npm install` - Install dependencies
2. `cp .env.example .env` - Copy env vars
3. `npx prisma db push` - Push schema to local SQLite
4. `npm run seed` - Seed database
5. `npm run dev` - Start dev server

## CI/CD
- Push to `master` triggers Vercel auto-deploy
- GitHub Actions: lint + typecheck + build on push/PR
- Build command: `prisma generate && next build`

## Environment Variables
| Variable | Description |
|----------|------------|
| `TURSO_DATABASE_URL` | Turso database URL (production) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `NEXTAUTH_SECRET` | Random 32-byte base64 string |
| `NEXTAUTH_URL` | Production URL |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
