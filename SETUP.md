# One-Time Setup Guide

Everything below only needs to be done **once**. After this, every push to `main` automatically deploys to production.

---

## 1. Create the Turso Database

You already have a Turso account. Now create the database and get credentials.

### Install the CLI

**Windows (PowerShell — run as admin):**

```powershell
irm https://get.tur.so/install.ps1 | iex
```

Or via Scoop:

```powershell
scoop install turso
```

**macOS:**

```bash
brew install tursodatabase/tap/turso
```

### Create the database

```bash
turso auth login
turso db create wedding-website
```

### Get your credentials

```bash
# Database URL
turso db show wedding-website --url
# → libsql://wedding-website-YOURUSERNAME.turso.io   (copy this)

# Auth token
turso db tokens create wedding-website
# → eyJhbGciOiJFZERTQ...   (copy this — it's long)
```

Keep both values handy for the next steps.

---

## 2. Link Your Vercel Project

You already have a Vercel account. Now connect the repo and get project IDs.

### Option A: Via Vercel Dashboard (easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import"** next to your `wedding_website` GitHub repo
3. **IMPORTANT:** Before deploying, go to **Settings → Git** and **disable** the automatic Vercel-GitHub integration (since we're using GitHub Actions instead):
   - In your Vercel project → **Settings → Git → Connected Git Repository**
   - Under **"Ignored Build Step"** enter: `exit 0`
   - This tells Vercel to skip its own builds — GitHub Actions handles it
4. Click **Deploy** (the first build may fail — that's fine, we'll deploy via CI)

### Option B: Via CLI

```bash
npm install -g vercel
vercel login
vercel link
```

This creates a `.vercel/project.json` file with your org and project IDs.

### Get your project IDs

You need three values for GitHub Actions:

| Secret | Where to find it |
|--------|-----------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create a new token |
| `VERCEL_ORG_ID` | [vercel.com/account](https://vercel.com/account) → Your **Account ID** (under General) |
| `VERCEL_PROJECT_ID` | [vercel.com](https://vercel.com) → Your project → **Settings → General** → **Project ID** |

**Alternative:** If you ran `vercel link`, both IDs are in `.vercel/project.json`:

```json
{
  "orgId": "...",      ← VERCEL_ORG_ID
  "projectId": "..."   ← VERCEL_PROJECT_ID
}
```

---

## 3. Set Vercel Environment Variables

Go to your Vercel project → **Settings → Environment Variables** and add:

| Variable | Value | Environments |
|----------|-------|-------------|
| `DATABASE_URL` | `libsql://wedding-website-YOURUSERNAME.turso.io` | Production, Preview |
| `TURSO_AUTH_TOKEN` | *(your token from step 1)* | Production, Preview |
| `NEXTAUTH_SECRET` | *(generate — see below)* | Production, Preview |
| `NEXTAUTH_URL` | `https://forevercampbells.com` | Production |
| `ADMIN_EMAIL` | Your admin login email | Production, Preview |
| `ADMIN_PASSWORD` | Your admin password | Production, Preview |
| `RESEND_API_KEY` | *(optional — add later)* | Production |

### Generate NEXTAUTH_SECRET

Run this in your terminal:

```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

```bash
# Bash / macOS / Linux
openssl rand -base64 32
```

Copy the output and paste it as the `NEXTAUTH_SECRET` value.

---

## 4. Add GitHub Repository Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these three secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | Your Vercel API token (from step 2) |
| `VERCEL_ORG_ID` | Your Vercel Account/Org ID (from step 2) |
| `VERCEL_PROJECT_ID` | Your Vercel Project ID (from step 2) |

These are the only GitHub secrets needed. All app-level env vars (database, auth, etc.) live in Vercel.

---

## 5. Push Schema & Seed the Production Database

Before the first deploy goes live, push the Prisma schema to Turso and seed it with initial data.

**From your local machine:**

```powershell
# Set production env vars temporarily
$env:DATABASE_URL = "libsql://wedding-website-YOURUSERNAME.turso.io"
$env:TURSO_AUTH_TOKEN = "your-turso-token"

# Push schema to Turso
npx prisma db push

# Seed with wedding data
npx tsx prisma/seed.ts
```

**Verify it worked:**

```bash
turso db shell wedding-website "SELECT coupleName FROM SiteSettings"
# Should output: Jacob & Ashley
```

After this, schema updates are automatic — the build command includes `prisma db push`.

---

## 6. Connect Your GoDaddy Domain

### In Vercel

1. Go to your project → **Settings → Domains**
2. Add: `forevercampbells.com`
3. Add: `www.forevercampbells.com`

Vercel will show you the DNS records to configure.

### In GoDaddy

**Simplest approach — change nameservers:**

1. Log in to [GoDaddy](https://dcc.godaddy.com/) → **My Products** → click your domain
2. Scroll to **Nameservers** → **Change Nameservers**
3. Select **"Enter my own nameservers (advanced)"**
4. Enter the nameservers Vercel gave you (typically `ns1.vercel-dns.com` and `ns2.vercel-dns.com`)
5. Save

**OR — keep GoDaddy DNS (add records manually):**

1. In **GoDaddy DNS Manager**, add/edit:
   - **A Record:** Name `@`, Value `76.76.21.21`, TTL 600
   - **CNAME Record:** Name `www`, Value `cname.vercel-dns.com`, TTL 1 Hour
2. Back in Vercel, click **Verify**

DNS propagation takes **15 minutes to 48 hours** (usually under 1 hour).

### Verify

- Visit `https://forevercampbells.com` — site should load with HTTPS
- Visit `https://www.forevercampbells.com` — should redirect to the apex domain
- Check the padlock icon for valid SSL

---

## 7. Disable Vercel's Auto-Deploy (Important!)

Since GitHub Actions handles deployments, you need to prevent Vercel from also deploying on every push (which would cause double deployments).

1. In Vercel → your project → **Settings → Git**
2. Find **"Ignored Build Step"**
3. Set it to: `exit 0`

This makes Vercel skip its own builds while still accepting deployments from the CLI (via GitHub Actions).

---

## You're Done!

After completing these steps, the workflow is:

1. **Develop locally** — `npm run dev` (uses local SQLite)
2. **Push to a branch** — CI runs lint + type checks on the PR
3. **Merge to `main`** — GitHub Actions deploys to Vercel automatically
4. **Site updates live** at `https://forevercampbells.com` within ~60 seconds

### Useful commands

```bash
# Check Turso database
turso db shell wedding-website

# View deployment logs
# → github.com/YOUR-USERNAME/wedding_website/actions

# Re-seed production (if needed)
$env:DATABASE_URL = "libsql://..."; $env:TURSO_AUTH_TOKEN = "..."; npx tsx prisma/seed.ts
```
