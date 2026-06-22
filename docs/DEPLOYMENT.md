# Deployment Guide

The site is deployed on Vercel and auto-deploys on every push to `master`. The production database is Turso (a hosted SQLite fork).

---

## First-time production setup

### 1. Turso database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create a database
turso db create forevercampbells

# Get the connection URL
turso db show forevercampbells --url

# Create an auth token
turso db tokens create forevercampbells
```

Keep both values — you'll need them as environment variables.

### 2. Run migrations on Turso

```bash
# Set env vars locally for the migration script
TURSO_DATABASE_URL="libsql://..." \
TURSO_AUTH_TOKEN="..." \
npm run db:deploy
```

The `db:deploy` script (`scripts/migrate-turso.ts`) applies all pending Prisma SQL migrations to the Turso database.

### 3. Seed initial data (optional)

If you want to seed a starting `SiteSettings` row and default data:

```bash
TURSO_DATABASE_URL="libsql://..." \
TURSO_AUTH_TOKEN="..." \
npx tsx prisma/seed.ts
```

You can also set up the initial data manually via the admin panel after the site is live.

### 4. Cloudinary setup

1. Create a free Cloudinary account at cloudinary.com
2. From the Cloudinary dashboard note: Cloud Name, API Key, API Secret
3. Add these as Vercel environment variables (see section below)

### 5. Vercel project setup

1. Push the repo to GitHub (or GitLab / Bitbucket)
2. Create a new Vercel project and connect the repo
3. Set the build command to `next build` (default)
4. Set the pre-build command to `npm run generate:types` (runs automatically via `prebuild` script)
5. Add all environment variables (see [ENVIRONMENT.md](ENVIRONMENT.md))
6. Deploy

### 6. Custom domain

In Vercel → Project Settings → Domains, add your domain. Then in your DNS registrar:
- Add A record: `@` → `76.76.21.21`
- Add CNAME: `www` → `cname.vercel-dns.com`

Or point your domain's nameservers to Vercel's nameservers for full DNS control.

---

## Ongoing deploys

Every `git push origin master` triggers a Vercel build and deploy. No manual steps needed.

The build pipeline:
1. `npm ci`
2. `npm run prebuild` (runs `generate:types`)
3. `npx prisma generate`
4. `next build`

---

## Database migrations

When you change `prisma/schema.prisma`:

```bash
# 1. Create migration (updates local SQLite)
npx prisma migrate dev --name describe-your-change

# 2. Regenerate TypeScript types
npm run generate:types

# 3. Deploy migration to Turso
npm run db:deploy
```

The `db:deploy` script picks up `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from your environment. Make sure these are set locally (copy from Vercel env vars) when running manually.

---

## Production environment variables

Set all of these in Vercel → Project Settings → Environment Variables.

**Required:**

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `NEXTAUTH_SECRET` | 32-byte random string (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://forevercampbells.com` |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | bcrypt-hashed admin password (see below) |
| `STORAGE_PROVIDER` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

**Optional:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Leave unset in production; Turso URL takes precedence |
| `EMAIL_PROVIDER` | `resend` (when email is implemented) |
| `RESEND_API_KEY` | Resend API key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key for travel page |
| `NEXT_PUBLIC_VENUE_ADDRESS` | Venue address string for Maps embed |
| `APPLE_MUSIC_TEAM_ID` | Apple Developer Team ID |
| `APPLE_MUSIC_KEY_ID` | Apple Music API key ID |
| `APPLE_MUSIC_PRIVATE_KEY` | Apple Music private key content |

---

## Generating a bcrypt admin password

```bash
node -e "const b = require('bcryptjs'); b.hash('your-password', 12).then(h => console.log(h))"
```

Use the output as `ADMIN_PASSWORD`. The prefix `$2b$` tells the auth system it's already hashed.

---

## Security headers

Security headers are set in `next.config.mjs` and applied to all responses:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Camera, microphone, geolocation: none |
| `Content-Security-Policy` | `self` + Open-Meteo + iTunes + Apple Music CDN |

---

## Monitoring

- **Vercel Analytics** — page view and performance data in the Vercel dashboard
- **Vercel Speed Insights** — Core Web Vitals tracked automatically
- **Vercel Logs** — Function logs (API route errors) in the Vercel dashboard → Deployments → Functions

---

## CI/CD pipeline (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and pull request to `master`:

| Job | Steps |
|-----|-------|
| Lint & typecheck | `npm run lint` + `tsc --noEmit` |
| Test (depends on lint) | Create `.env`, `npm run test` |
| Build (depends on lint + test) | `npm ci` + `prisma generate` + `next build` |

The Vercel deploy is triggered separately by Vercel's GitHub integration after CI passes (or in parallel — Vercel does not wait for GitHub Actions by default; configure branch protection rules to enforce this if needed).

---

## Rollback

In Vercel → Project → Deployments, click any previous deployment → "Promote to Production". This instantly switches production traffic back to that build. No re-deploy needed.

---

## E2E test database sync

The E2E test suite (`npx playwright test`) uses a local SQLite snapshot synced from production. To refresh it:

```bash
npm run test:e2e:sync
```

This runs `e2e/sync-test-db.ts`, which exports from Turso and imports into a local SQLite file used by the Playwright tests.
