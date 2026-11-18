# Environment Variables

Copy `.env.example` to `.env.local` for local development. Production values are set in Vercel → Project Settings → Environment Variables.

---

## Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes (local) | `file:./prisma/dev.db` | SQLite connection string for local dev. Not needed in production when Turso vars are set. |
| `TURSO_DATABASE_URL` | Yes (prod) | — | Turso libSQL URL. Format: `libsql://your-db-name.turso.io`. When set, takes precedence over `DATABASE_URL`. |
| `TURSO_AUTH_TOKEN` | Yes (prod) | — | Turso authentication token. Generate with `turso db tokens create <db-name>`. |

The database client (`lib/db/client.ts`) uses Turso if `TURSO_DATABASE_URL` is set; otherwise falls back to local SQLite via `DATABASE_URL`.

---

## Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_SECRET` | Yes | Secret used to sign JWT session tokens. Generate: `openssl rand -base64 32`. Must be stable — changing it invalidates all existing sessions. |
| `NEXTAUTH_URL` | Yes | Full URL of the site. `http://localhost:3000` locally, `https://forevercampbells.com` in production. Required by NextAuth v5. |
| `ADMIN_EMAIL` | Yes | Email address used to log in to the admin panel. |
| `ADMIN_PASSWORD` | Yes | Admin password. Locally: plain text is fine. Production: use a bcrypt hash (`$2b$...`). The server auto-detects hashed vs plain text by checking the `$2` prefix. |

**Generating a bcrypt hash for production:**
```bash
node -e "const b = require('bcryptjs'); b.hash('your-password', 12).then(h => console.log(h))"
```

---

## Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BLOB_READ_WRITE_TOKEN` | Yes (prod) | — | Vercel Blob read/write token. Generate in Vercel → Storage → Blob → Create Store. When present, Vercel Blob is used automatically. |
| `STORAGE_PROVIDER` | No | auto | Override the storage backend. Options: `local`, `vercel-blob`. Defaults to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, otherwise `local`. |

**Notes:**
- `local` storage writes to the filesystem and is only for local dev — it does **not** work on Vercel (read-only filesystem).
- Production uses **Vercel Blob** — enable the Blob store in Vercel and set `BLOB_READ_WRITE_TOKEN`. Guest photos are stored publicly and served via direct URLs.

---

## Email

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_PROVIDER` | No | `noop` | Which email provider to use. Options: `noop` (no emails sent), `resend`. |
| `RESEND_API_KEY` | If Resend | — | API key from resend.com. The Resend integration is not yet implemented in the codebase. |

---

## Local dev — minimal setup

For local development without external services:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="any-string-works-locally"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password"
STORAGE_PROVIDER="local"
EMAIL_PROVIDER="noop"
```

Guest photo uploads need Vercel Blob in production (set `BLOB_READ_WRITE_TOKEN`). HEIC (iPhone) photos are converted to JPEG in the browser before upload, so no server-side conversion is required.

---

## Variable precedence

Next.js loads env files in this order (later files win):

1. `.env` (committed defaults — not present in this repo)
2. `.env.local` (your local overrides — gitignored)
3. `.env.development` / `.env.production` (environment-specific — not present)
4. `.env.development.local` / `.env.production.local` (not present)

For local dev, put all values in `.env.local`. Never commit `.env.local` or any file containing real secrets.
