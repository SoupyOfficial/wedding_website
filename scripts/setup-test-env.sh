#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Forever Campbells — Test Env Setup${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "This script will:"
echo -e "  1. Check prerequisites (turso, vercel, git branch)"
echo -e "  2. Create a test Turso database"
echo -e "  3. Deploy migrations and seed the test DB"
echo -e "  4. Configure Vercel Preview environment variables"
echo -e "  5. Push the staging branch and trigger a deploy"
echo ""
read -p "Press Enter to begin..."

# ── Section 1: Prerequisites Check ──────────────────────────────────────────

echo ""
echo -e "${CYAN}── Section 1: Prerequisites Check${NC}"
echo ""

echo -n "Checking turso CLI... "
if command -v turso &>/dev/null; then
  echo -e "${GREEN}found ($(turso --version 2>&1 | head -1))${NC}"
else
  echo -e "${RED}NOT FOUND${NC}"
  echo -e "${YELLOW}Install with: curl -sSfL https://get.turso.tech/install.sh | bash${NC}"
  exit 1
fi

echo -n "Checking vercel CLI... "
if command -v vercel &>/dev/null; then
  echo -e "${GREEN}found ($(vercel --version))${NC}"
else
  echo -e "${RED}NOT FOUND${NC}"
  echo -e "${YELLOW}Install with: npm i -g vercel${NC}"
  exit 1
fi

echo -n "Checking git branch... "
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "staging" ]; then
  echo -e "${GREEN}on staging${NC}"
else
  echo -e "${RED}on '$BRANCH' (expected 'staging')${NC}"
  echo -e "${YELLOW}Switch with: git checkout staging${NC}"
  exit 1
fi

echo -n "Checking vercel project link... "
if vercel project ls 2>/dev/null | grep -q "wedding-website"; then
  echo -e "${GREEN}linked${NC}"
else
  echo -e "${YELLOW}not linked — run: vercel link${NC}"
fi

read -p "Press Enter to continue..."

# ── Section 2: Create Test Turso Database ────────────────────────────────────

echo ""
echo -e "${CYAN}── Section 2: Create Test Turso Database${NC}"
echo ""

echo -e "${YELLOW}First, log in to Turso if needed:${NC}"
turso auth whoami 2>/dev/null || turso auth login

read -p "Turso group name [default]: " GROUP
GROUP=${GROUP:-default}

echo ""
echo -n "Creating database forevercampbells-test (group: $GROUP)... "
if turso db show forevercampbells-test &>/dev/null; then
  echo -e "${YELLOW}already exists${NC}"
else
  turso db create forevercampbells-test --group "$GROUP"
  echo -e "${GREEN}created${NC}"
fi

echo ""
echo -n "Fetching database URL... "
TURSO_URL=$(turso db show forevercampbells-test --url 2>/dev/null)
echo -e "${GREEN}$TURSO_URL${NC}"

echo ""
echo -n "Creating auth token... "
TURSO_TOKEN=$(turso db tokens create forevercampbells-test 2>/dev/null)
echo -e "${GREEN}done${NC}"

echo ""
echo -e "${YELLOW}──────────────────────────────────────────────${NC}"
echo -e "  URL:   ${GREEN}$TURSO_URL${NC}"
echo -e "  Token: ${GREEN}$TURSO_TOKEN${NC}"
echo -e "${YELLOW}──────────────────────────────────────────────${NC}"
echo -e "${RED}Copy these now — the token won't be shown again.${NC}"

read -p "Press Enter to continue..."

# ── Section 3: Deploy Migrations to Test DB ─────────────────────────────────

echo ""
echo -e "${CYAN}── Section 3: Deploy Migrations to Test DB${NC}"
echo ""

echo -n "Running db:deploy... "
TURSO_DATABASE_URL="$TURSO_URL" TURSO_AUTH_TOKEN="$TURSO_TOKEN" npm run db:deploy
echo -e "${GREEN}done${NC}"

echo -n "Running seed... "
TURSO_DATABASE_URL="$TURSO_URL" TURSO_AUTH_TOKEN="$TURSO_TOKEN" SEED_ALLOW_PRODUCTION=true npm run seed
echo -e "${GREEN}done${NC}"

echo ""
echo -e "${GREEN}Test database is ready with schema and seed data.${NC}"

read -p "Press Enter to continue..."

# ── Section 4: Configure Vercel Preview Environment ─────────────────────────

echo ""
echo -e "${CYAN}── Section 4: Configure Vercel Preview Environment${NC}"
echo ""

echo -e "${YELLOW}You'll need to provide the Vercel preview URL.${NC}"
echo -e "${YELLOW}Format: https://<project>-<hash>-<scope>.vercel.app${NC}"
echo -e "${YELLOW}Or a custom domain if configured for previews.${NC}"
echo ""
read -p "Preview URL: " PREVIEW_URL

NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo ""
echo -e "${YELLOW}Adding Vercel Preview environment variables...${NC}"
echo ""

echo -n "  TURSO_DATABASE_URL... "
echo "$TURSO_URL" | vercel env add TURSO_DATABASE_URL preview --force 2>/dev/null
echo -e "${GREEN}done${NC}"

echo -n "  TURSO_AUTH_TOKEN... "
echo "$TURSO_TOKEN" | vercel env add TURSO_AUTH_TOKEN preview --force 2>/dev/null
echo -e "${GREEN}done${NC}"

echo -n "  NEXTAUTH_URL... "
echo "$PREVIEW_URL" | vercel env add NEXTAUTH_URL preview --force 2>/dev/null
echo -e "${GREEN}done${NC}"

echo -n "  NEXTAUTH_SECRET... "
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET preview --force 2>/dev/null
echo -e "${GREEN}done${NC}"

echo -n "  NEXT_PUBLIC_SITE_URL... "
echo "$PREVIEW_URL" | vercel env add NEXT_PUBLIC_SITE_URL preview --force 2>/dev/null
echo -e "${GREEN}done${NC}"

echo -n "  EMAIL_PROVIDER... "
echo "noop" | vercel env add EMAIL_PROVIDER preview --force 2>/dev/null
echo -e "${GREEN}done${NC}"

echo ""
echo -e "${YELLOW}──────────────────────────────────────────────${NC}"
echo -e "  Summary of Preview env vars:"
echo -e "  TURSO_DATABASE_URL   = $TURSO_URL"
echo -e "  TURSO_AUTH_TOKEN     = (set from token above)"
echo -e "  NEXTAUTH_URL         = $PREVIEW_URL"
echo -e "  NEXTAUTH_SECRET      = $NEXTAUTH_SECRET"
echo -e "  NEXT_PUBLIC_SITE_URL = $PREVIEW_URL"
echo -e "  EMAIL_PROVIDER       = noop"
echo -e "${YELLOW}──────────────────────────────────────────────${NC}"

read -p "Press Enter to continue..."

# ── Section 5: Push and Deploy ──────────────────────────────────────────────

echo ""
echo -e "${CYAN}── Section 5: Push and Deploy${NC}"
echo ""

echo -e "${YELLOW}Ready to push staging branch to trigger Vercel deploy.${NC}"
read -p "Press Enter to push, or Ctrl+C to abort..."

echo ""
echo -n "Pushing staging... "
git push origin staging
echo -e "${GREEN}done${NC}"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  Preview URL: ${CYAN}$PREVIEW_URL${NC}"
echo -e "  Admin login: Use your ADMIN_EMAIL / ADMIN_PASSWORD from .env"
echo ""
echo -e "${YELLOW}Note: Vercel Preview env vars take effect on the NEXT deploy.${NC}"
echo -e "${YELLOW}Since we pushed after adding them, they should be active.${NC}"
echo ""
