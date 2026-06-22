# Forever Campbells — Documentation Index

A full-stack wedding website built with Next.js 14. Couples manage their wedding content through an admin dashboard; guests interact with public-facing pages for RSVPs, music requests, the gallery, and more.

## Documents

| File | Contents |
|------|----------|
| [GETTING-STARTED.md](GETTING-STARTED.md) | Local dev setup, prerequisites, first run |
| [FEATURES.md](FEATURES.md) | Every guest-facing and admin feature explained |
| [API-REFERENCE.md](API-REFERENCE.md) | All REST endpoints with request/response shapes |
| [DATABASE.md](DATABASE.md) | All 23 data models, field descriptions, relations |
| [ADMIN-GUIDE.md](ADMIN-GUIDE.md) | Non-technical guide for managing the site |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel deploy, Turso setup, production checklist |
| [ENVIRONMENT.md](ENVIRONMENT.md) | Every environment variable, what it does, required vs optional |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Layer diagram, request flow, complexity hotspots |

## Quick facts

- **Framework:** Next.js 14 App Router
- **Database:** SQLite (local) / Turso libSQL (production)
- **Auth:** NextAuth v5 — single admin credential
- **Hosting:** Vercel (auto-deploys on `master` push)
- **Photo storage:** Cloudinary
- **Testing:** Vitest + Playwright

## Useful commands

```bash
npm run dev              # Start local dev server
npm run test             # Run unit tests
npm run test:coverage    # Run tests with coverage report
npm run seed             # Seed the local database
npm run db:deploy        # Migrate production Turso database
npm run generate:types   # Regenerate lib/db-types.ts from Prisma schema
npm run lint             # ESLint
npm run typecheck        # TypeScript type check
```
