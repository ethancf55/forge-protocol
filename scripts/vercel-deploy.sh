#!/usr/bin/env bash
# Deploy Forge Protocol as a new Vercel project (separate from forge-coaching).
# Prerequisites: `npx vercel login` completed once.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: npx vercel login"
  echo "Then re-run this script."
  exit 1
fi

# Load local env (not committed)
set -a
# shellcheck disable=SC1091
source .env
set +a

: "${DATABASE_URL:?DATABASE_URL missing in .env}"
: "${AUTH_SECRET:?AUTH_SECRET missing in .env}"
: "${GOOGLE_GENERATIVE_AI_API_KEY:?GOOGLE_GENERATIVE_AI_API_KEY missing in .env}"

echo "Linking / creating project forge-protocol (not forge-coaching)..."
npx vercel link --yes --project forge-protocol || true

echo "Setting production env vars..."
# Avoid printing secrets
printf '%s' "$DATABASE_URL" | npx vercel env add DATABASE_URL production --force 2>/dev/null || \
  printf '%s' "$DATABASE_URL" | npx vercel env add DATABASE_URL production
printf '%s' "$AUTH_SECRET" | npx vercel env add AUTH_SECRET production --force 2>/dev/null || \
  printf '%s' "$AUTH_SECRET" | npx vercel env add AUTH_SECRET production
printf '%s' "$GOOGLE_GENERATIVE_AI_API_KEY" | npx vercel env add GOOGLE_GENERATIVE_AI_API_KEY production --force 2>/dev/null || \
  printf '%s' "$GOOGLE_GENERATIVE_AI_API_KEY" | npx vercel env add GOOGLE_GENERATIVE_AI_API_KEY production
printf '%s' "${GEMINI_MODEL:-gemini-2.0-flash}" | npx vercel env add GEMINI_MODEL production --force 2>/dev/null || \
  printf '%s' "${GEMINI_MODEL:-gemini-2.0-flash}" | npx vercel env add GEMINI_MODEL production
printf '%s' "false" | npx vercel env add OTP_DEV_REVEAL production --force 2>/dev/null || \
  printf '%s' "false" | npx vercel env add OTP_DEV_REVEAL production

echo "Deploying production..."
npx vercel --prod --yes

echo "Done. After deploy, set AUTH_URL / AUTH_TRUST_HOST if Auth.js requires them:"
echo "  AUTH_URL=https://YOUR-deployment.vercel.app"
echo "  AUTH_TRUST_HOST=true"
echo "Then redeploy once."
echo ""
echo "Claim temporary DB for permanent use:"
echo "  https://create-db.prisma.io/claim?projectID=proj_t1vr7ezeneg3nw61k4s3p98n"
