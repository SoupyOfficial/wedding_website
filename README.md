# Forever Campbells — Wedding Website

Jacob & Ashley's wedding website. Built with Next.js 14, Tailwind CSS, Prisma, and Turso.

**Live:** Deployed via Vercel (auto-deploys on push to `master`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3, Framer Motion |
| Database | SQLite (local) / Turso libSQL (production) |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (credentials) |
| Hosting | Vercel |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in ADMIN_EMAIL and ADMIN_PASSWORD at minimum

# 3. Push schema to local SQLite & seed
npx prisma db push
npm run seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> Local dev uses SQLite automatically. Turso is only used when `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set.

---

## Project Structure

```
app/
├── (public)/          # Guest-facing pages (home, RSVP, gallery, etc.)
├── admin/             # Admin dashboard & management pages
├── api/v1/            # API routes (public + admin)
├── site-password/     # Password gate page
├── layout.tsx         # Root layout (fonts, metadata)
├── error.tsx          # Error boundary
└── not-found.tsx      # 404 page

components/            # Shared UI components (StarrySky, Navigation, etc.)
lib/                   # Auth config, DB client, providers, utilities
prisma/
├── schema.prisma      # Database schema (20 models)
└── seed.ts            # Seed script with sample data
middleware.ts          # Auth + site password middleware
```

---

## Key Pages

| Route | Description |
|-------|------------|
| `/` | Homepage with countdown, hero, navigation |
| `/our-story` | Couple's story timeline |
| `/event-details` | Ceremony & reception details |
| `/rsvp` | Multi-step RSVP form |
| `/gallery` | Photo gallery |
| `/guest-book` | Guest messages |
| `/wedding-party` | Bridal party members |
| `/entertainment` | Entertainment lineup |
| `/registry` | Registry links |
| `/travel` | Hotels & travel info |
| `/faq` | Frequently asked questions |
| `/contact` | Contact form |
| `/admin` | Admin dashboard (login required) |

---

## Deployment

Deployment is handled automatically via the **Vercel ↔ GitHub integration**.

### How it works

1. Push to `master` → Vercel auto-builds and deploys
2. Build runs: `prisma generate && next build`
3. Environment variables are set in Vercel project settings

### Environment Variables (set in Vercel)

| Variable | Description |
|----------|------------|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `NEXTAUTH_SECRET` | Random 32-byte base64 string |
| `NEXTAUTH_URL` | Production URL (e.g. `https://forevercampbells.com`) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |

See [.env.example](.env.example) for the full list.

### Domain Setup

In Vercel → Project Settings → Domains, add your domain. Then in GoDaddy (or your registrar):

**Option A — Vercel nameservers (simplest):**
- Change nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`

**Option B — Keep current DNS:**
- A record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`

---

## Database

- **Local:** SQLite at `prisma/dev.db` (auto-created by `prisma db push`)
- **Production:** Turso libSQL (configured via env vars)
- **Schema changes:** Edit `prisma/schema.prisma`, then `npx prisma db push` locally. Production schema must be updated separately via Turso.

### Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run seed         # Seed database
npm run db:push      # Push schema to local SQLite
npx prisma studio    # Visual database browser
```
