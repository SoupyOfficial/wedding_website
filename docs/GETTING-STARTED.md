# Getting Started

## Prerequisites

- Node.js 20+
- npm 10+
- Git

No Docker or external services are required for local development. The site runs entirely on SQLite by default.

## First-time setup

```bash
# 1. Clone and install
git clone <repo-url>
cd wedding_website
npm install

# 2. Copy the example env file
cp .env.example .env.local

# 3. Fill in the minimum required values (see Environment section below)

# 4. Run Prisma migrations to create the local SQLite DB
npx prisma migrate dev

# 5. Seed the database with sample data
npm run seed

# 6. Generate TypeScript types from the Prisma schema
npm run generate:types

# 7. Start the dev server
npm run dev
```

The site will be available at http://localhost:3000.

Admin panel: http://localhost:3000/admin/login

## Minimum .env.local values for local dev

```env
# SQLite path (already the default, no Turso needed locally)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth — generate a random string: openssl rand -base64 32
NEXTAUTH_SECRET="any-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Admin login credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="yourpassword"

# Storage — "local" avoids needing Cloudinary keys locally
STORAGE_PROVIDER="local"

# Email — "noop" disables email sending locally
EMAIL_PROVIDER="noop"
```

All other variables (Cloudinary, Google Maps, Apple Music) are optional locally — those features will degrade gracefully or show placeholders.

## Installing git hooks

The repo ships a `pre-push` hook that runs lint, type-check, and tests before every push:

```bash
npm run hooks:install
```

## Database workflow

### Local SQLite

Changes to `prisma/schema.prisma` need a migration:

```bash
npx prisma migrate dev --name describe-your-change
npm run generate:types        # keep db-types.ts in sync
```

### Seeding

The seed script (`prisma/seed.ts`) inserts a realistic dataset including:
- Default `SiteSettings` (couple name, wedding date, venue)
- Sample guests at various RSVP states
- Wedding party members (bridesmaids and groomsmen)
- FAQ entries, hotel recommendations, meal options
- Timeline events for "Our Story"
- Feature flags set to their defaults

Run it any time to reset to a known good state:

```bash
npm run seed
```

### Inspecting the DB

```bash
npx prisma studio    # Opens a GUI at localhost:5555
```

## Running tests

```bash
npm run test             # Single run
npm run test:watch       # Re-run on file save
npm run test:coverage    # Coverage report in coverage/
```

### E2E tests (Playwright)

E2E tests talk to a local DB copy synced from production:

```bash
# Sync a snapshot of the remote DB for E2E testing
npm run test:e2e:sync

# Run E2E tests
npm run test:e2e

# Open the Playwright UI
npm run test:e2e:ui
```

## Project structure overview

```
wedding_website/
├── app/
│   ├── (public)/         # 14 guest-facing pages
│   ├── admin/            # 15 authenticated admin pages
│   ├── api/v1/           # REST API routes
│   └── site-password/    # Password gate page
├── components/           # 17 shared React components
├── lib/
│   ├── db/               # Database client + query helpers
│   ├── config/           # Feature flags, navigation, constants
│   ├── providers/        # Storage + email providers
│   ├── services/         # Business logic (RSVP, guestbook, etc.)
│   ├── hooks/            # React hooks
│   ├── api/              # Response builders + rate limiter
│   └── middleware/       # Auth + site password middleware
├── prisma/
│   ├── schema.prisma     # 23 data models
│   ├── seed.ts           # Sample data
│   └── migrations/       # SQL migration history
├── __tests__/            # 35+ test files
├── scripts/              # DB migrate, type-gen utilities
├── docs/                 # This folder
└── middleware.ts         # Root middleware (auth + site password)
```

## Common dev tasks

### Add a new public page

1. Create `app/(public)/your-page/page.tsx`
2. Add a feature flag entry to `lib/config/feature-flag-defaults.json`
3. Call `checkFeatureFlag("yourPageEnabled")` at the top of the page server component
4. Add the nav link to `lib/config/navigation.ts`

### Add a new admin CRUD resource

1. Create `app/api/v1/admin/your-resource/route.ts` using `createListHandlers()` from `lib/api/crud-handler.ts`
2. Create `app/api/v1/admin/your-resource/[id]/route.ts` using `createItemHandlers()`
3. Add the Prisma model to `prisma/schema.prisma`, run `npx prisma migrate dev`
4. Run `npm run generate:types`
5. Add the admin nav link to `lib/config/navigation.ts`

### Change the admin password

In production: Update `ADMIN_PASSWORD` in Vercel with a bcrypt hash:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('newpassword', 12).then(h => console.log(h))"
```

Set the output as `ADMIN_PASSWORD` in Vercel and redeploy.
