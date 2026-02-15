# Deployment Guide: Vercel + GoDaddy Domain

This guide walks through deploying the wedding website to **Vercel** (free) and connecting your **GoDaddy domain**.

---

## Prerequisites

- GitHub account (repo pushed — private is fine)
- GoDaddy account with your domain (e.g., `forevercampbells.com`)
- [Turso](https://turso.tech) account (free — sign in with GitHub)

---

## 1. Set Up Turso Database

Vercel's serverless functions have an ephemeral filesystem, so SQLite files don't persist between requests. Turso provides a free hosted SQLite-compatible database.

### Install the Turso CLI

```bash
# macOS
brew install tursodatabase/tap/turso

# Linux/WSL
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (via Scoop)
scoop install turso
```

### Create a Database

```bash
turso auth login          # Opens browser to sign in with GitHub
turso db create wedding-website

# Get your database URL
turso db show wedding-website --url
# Example output: libsql://wedding-website-yourusername.turso.io

# Create an auth token
turso db tokens create wedding-website
# Example output: eyJhbGciOiJFZERTQ... (long token)
```

Save both values — you'll need them for Vercel environment variables.

---

## 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/in with GitHub
2. Click **"Add New Project"** → **Import** your wedding website repository
3. Vercel auto-detects it as a Next.js project

### Set Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `libsql://wedding-website-yourusername.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGciOiJFZERTQ...` (your token) |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://forevercampbells.com` (your domain) |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Your admin password (or bcrypt hash) |
| `RESEND_API_KEY` | *(optional)* Your Resend API key for email notifications |

### Deploy

4. Click **"Deploy"** — Vercel will build and deploy the site
5. You'll get a preview URL like `wedding-website-xyz.vercel.app`

### Seed the Production Database

After the first deployment, seed your Turso database with initial data:

```bash
# Set production environment variables locally (temporarily)
export DATABASE_URL="libsql://wedding-website-yourusername.turso.io"
export TURSO_AUTH_TOKEN="your-token"

# Run the seed script
npx tsx prisma/seed.ts
```

Or use the Vercel CLI:
```bash
npx vercel env pull .env.production.local   # Pull env vars from Vercel
npx tsx prisma/seed.ts                       # Seed with production vars
```

---

## 3. Connect Your GoDaddy Domain

You have two options. **Option 1 is simpler.**

### Option 1: Use Vercel Nameservers (Recommended)

This hands all DNS management to Vercel. Simplest setup.

1. In **Vercel Dashboard** → your project → **Settings → Domains**
2. Add your domain: `forevercampbells.com`
3. Vercel shows you nameservers (e.g., `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
4. Log in to **GoDaddy** → **My Products** → click **DNS** next to your domain
5. Scroll to **Nameservers** → click **Change Nameservers**
6. Select **"Enter my own nameservers (advanced)"**
7. Replace GoDaddy's nameservers with the Vercel ones
8. Save

**DNS propagation takes 1–48 hours** (usually under 1 hour). Vercel auto-provisions a free SSL certificate.

> **Note:** With this option, ALL DNS records for the domain are managed in Vercel's dashboard. If you have GoDaddy email, you'll need to add MX records in Vercel (see Email section below).

### Option 2: Keep GoDaddy DNS

Keep GoDaddy as your DNS provider and just point traffic to Vercel.

1. In **Vercel Dashboard** → your project → **Settings → Domains** → add `forevercampbells.com`
2. In **GoDaddy DNS Manager**, add/edit these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `@` | `76.76.21.21` | 600 |
| **CNAME** | `www` | `cname.vercel-dns.com` | 1 Hour |

3. Back in Vercel, click **Verify** next to your domain
4. Vercel auto-provisions SSL

**Pros:** Email and other DNS services stay in GoDaddy.  
**Cons:** Slightly more manual.

---

## 4. GoDaddy Email Setup (If Applicable)

If you have a GoDaddy email plan (e.g., `hello@forevercampbells.com`):

### If Using Vercel Nameservers (Option 1)

Add GoDaddy's MX records in the **Vercel DNS dashboard**:

| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | `@` | `mailstore1.secureserver.net` | 10 |
| MX | `@` | `smtp.secureserver.net` | 0 |

Also add any TXT records GoDaddy requires for SPF/DKIM (check GoDaddy's email settings).

### If Using GoDaddy DNS (Option 2)

No changes needed — email records are already in place.

---

## 5. Verify Everything Works

1. Visit `https://forevercampbells.com` — should show your wedding site
2. Visit `https://www.forevercampbells.com` — should redirect to the apex domain
3. Check the padlock icon — SSL should be active
4. Visit `/admin/login` — sign in with your admin credentials
5. Test RSVP, guest book, and other features

---

## 6. Ongoing Deployments

Every time you push to `main` on GitHub, Vercel automatically:
- Builds the project
- Runs `npx prisma generate && npx prisma db push && next build`
- Deploys to production

Pull requests get automatic **preview deployments** with unique URLs for testing.

---

## 7. Database Management

### Backups

Turso provides automatic backups, but you can also export manually:

```bash
turso db shell wedding-website ".dump" > backup.sql
```

### Local Development

Local development continues to use SQLite (no Turso needed):

```bash
# .env (local)
DATABASE_URL="file:./prisma/dev.db"

npm run dev
```

### Push Schema Changes to Production

After modifying `prisma/schema.prisma`:

```bash
export DATABASE_URL="libsql://wedding-website-yourusername.turso.io"
export TURSO_AUTH_TOKEN="your-token"
npx prisma db push
```

Or just push to GitHub — the build command includes `prisma db push`.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Site shows Vercel 404 | Check that the domain is verified in Vercel Settings → Domains |
| DNS not propagating | Wait up to 48 hours. Check with `nslookup forevercampbells.com` |
| Database errors on Vercel | Verify `DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel env vars |
| Admin login fails | Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars in Vercel |
| SSL not working | Vercel provisions SSL automatically — check domain verification status |
| Build fails | Check Vercel build logs — likely a missing env var or Prisma issue |

---

## Cost Summary

| Service | Cost |
|---------|------|
| **Vercel** (Hobby) | Free |
| **Turso** (Starter) | Free (500 DBs, 9 GB, 25M reads/mo) |
| **GoDaddy Domain** | ~$12–20/year (already purchased) |
| **Resend** (email) | Free tier (100 emails/day) |
| **Total** | **~$0/month** + domain renewal |
