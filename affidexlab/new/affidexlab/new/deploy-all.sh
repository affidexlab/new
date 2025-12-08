#!/bin/bash

set -e

echo "🚀 DecaFlow Complete Deployment Script"
echo "========================================"
echo ""

VERCEL_TOKEN="${VERCEL_TOKEN:-$1}"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN not provided"
  echo "Usage: ./deploy-all.sh <VERCEL_TOKEN>"
  echo "Or set VERCEL_TOKEN environment variable"
  exit 1
fi

echo "📦 Installing Vercel CLI..."
npm install -g vercel

echo ""
echo "1️⃣ Deploying Backend API (Production)..."
echo "=========================================="
cd backend
npm install
vercel --token="$VERCEL_TOKEN" --prod --yes \
  --env NODE_ENV=production \
  --env ENVIRONMENT=production \
  --name decaflow-api-production

echo ""
echo "2️⃣ Deploying Backend API (Sandbox)..."
echo "======================================="
vercel --token="$VERCEL_TOKEN" --prod --yes \
  --env NODE_ENV=production \
  --env ENVIRONMENT=sandbox \
  --name decaflow-api-sandbox

cd ..

echo ""
echo "3️⃣ Deploying Partners Dashboard (Production)..."
echo "================================================"
cd partners
npm install
vercel --token="$VERCEL_TOKEN" --prod --yes \
  --env VITE_API_URL=https://api.decaflow.xyz \
  --env VITE_ENVIRONMENT=production \
  --name decaflow-partners-production

echo ""
echo "4️⃣ Deploying Partners Dashboard (Sandbox)..."
echo "=============================================="
vercel --token="$VERCEL_TOKEN" --prod --yes \
  --env VITE_API_URL=https://sandbox.decaflow.xyz \
  --env VITE_ENVIRONMENT=sandbox \
  --name decaflow-partners-sandbox

cd ..

echo ""
echo "✅ All deployments complete!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Configure DNS records:"
echo "   - api.decaflow.xyz → decaflow-api-production.vercel.app"
echo "   - sandbox.decaflow.xyz → decaflow-api-sandbox.vercel.app"
echo "   - partners.decaflow.xyz → decaflow-partners-production.vercel.app"
echo "   - partners-sandbox.decaflow.xyz → decaflow-partners-sandbox.vercel.app"
echo ""
echo "2. Add domain to Vercel projects"
echo "3. SSL certificates will be automatically provisioned"
echo ""
echo "📝 Partner API Keys:"
echo "==================="
echo "Production: tychi_prod_pk_live_8x9y2z3a4b5c6d7e"
echo "Sandbox: tychi_test_pk_sandbox_1a2b3c4d5e6f7g8h"
echo ""
