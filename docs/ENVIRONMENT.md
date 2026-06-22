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
| `STORAGE_PROVIDER` | Yes | `cloudinary` | Which storage backend to use. Options: `local`, `cloudinary`, `s3`. |
| `CLOUDINARY_CLOUD_NAME` | If Cloudinary | — | Your Cloudinary cloud name (visible in the Cloudinary dashboard). |
| `CLOUDINARY_API_KEY` | If Cloudinary | — | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | If Cloudinary | — | Cloudinary API secret. |
| `S3_BUCKET` | If S3 | — | S3 bucket name. |
| `S3_REGION` | If S3 | — | AWS region (e.g. `us-east-1`). |
| `S3_ACCESS_KEY_ID` | If S3 | — | AWS access key ID. |
| `S3_SECRET_ACCESS_KEY` | If S3 | — | AWS secret access key. |

**Notes:**
- `local` storage writes to the filesystem. This does **not** work on Vercel (read-only filesystem). Use `cloudinary` in production.
- `s3` storage is defined in the provider pattern but not fully implemented.

---

## Email

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_PROVIDER` | No | `noop` | Which email provider to use. Options: `noop` (no emails sent), `resend`. |
| `RESEND_API_KEY` | If Resend | — | API key from resend.com. The Resend integration is not yet implemented in the codebase. |

---

## Google Maps

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Google Maps JavaScript API key. Used for the map embed on the Travel page. Without this key, the map widget is not shown. |
| `NEXT_PUBLIC_VENUE_ADDRESS` | No | Full venue address string passed to the Maps embed (e.g. `"123 Wedding Ln, Apopka, FL 32712"`). |

These are `NEXT_PUBLIC_*` variables — they are embedded in the client-side bundle and visible to users. Do not put secrets in `NEXT_PUBLIC_` variables.

---

## Apple Music (optional)

Required only for the Apple Music playlist import feature in the admin Music panel. The iTunes Search API (public song search for guests) does **not** require these.

| Variable | Required | Description |
|----------|----------|-------------|
| `APPLE_MUSIC_TEAM_ID` | If Apple Music | Your Apple Developer Team ID. Found at developer.apple.com → Membership. |
| `APPLE_MUSIC_KEY_ID` | If Apple Music | The Key ID of your MusicKit API key. Generated at developer.apple.com → Certificates → Keys. |
| `APPLE_MUSIC_PRIVATE_KEY` | If Apple Music | The full content of the `.p8` private key file (including `-----BEGIN PRIVATE KEY-----` header). |

**Getting Apple Music credentials:**
1. Enroll in the Apple Developer Program ($99/year) if not already enrolled
2. developer.apple.com → Certificates, Identifiers & Profiles → Keys
3. Create a new key with "MusicKit" capability enabled
4. Download the `.p8` file (only downloadable once)
5. Note the Key ID shown after creation
6. Your Team ID is in the top-right of the developer portal

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

Features that need external services (Google Maps embed, Apple Music import, Cloudinary photos) will be absent or show degraded states locally.

---

## Variable precedence

Next.js loads env files in this order (later files win):

1. `.env` (committed defaults — not present in this repo)
2. `.env.local` (your local overrides — gitignored)
3. `.env.development` / `.env.production` (environment-specific — not present)
4. `.env.development.local` / `.env.production.local` (not present)

For local dev, put all values in `.env.local`. Never commit `.env.local` or any file containing real secrets.
