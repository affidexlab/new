#!/bin/bash

# Master Deployment Script for DecaFlow Partner Infrastructure
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  DecaFlow Partner Infrastructure - Vercel Deployment       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will deploy all 4 components to Vercel:"
echo "  1. Backend API (Production)"
echo "  2. Backend API (Sandbox)"
echo "  3. Partners Dashboard (Production)"
echo "  4. Partners Dashboard (Sandbox)"
echo ""
echo "⚠️  Make sure you're logged into Vercel CLI first!"
echo "    Run: vercel login"
echo ""
read -p "Press ENTER to continue or CTRL+C to cancel..."
echo ""

# Check if logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
  echo "❌ Error: Not logged into Vercel CLI"
  echo ""
  echo "Please run: vercel login"
  echo "Then run this script again."
  exit 1
fi

echo "✅ Vercel authentication confirmed"
echo ""

# Track deployment URLs
declare -A DEPLOYMENT_URLS

# Deploy Backend Production
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 1/4: Backend API (Production)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd affidexlab/new/backend
if [ ! -d "node_modules" ]; then
  npm install --silent
fi
echo "Deploying..."
DEPLOYMENT_URLS[backend_prod]=$(vercel --prod --name decaflow-api --yes 2>&1 | grep -o 'https://[^ ]*' | head -1)
echo "✅ Deployed: ${DEPLOYMENT_URLS[backend_prod]}"
cd ../../..
echo ""

# Deploy Backend Sandbox
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 2/4: Backend API (Sandbox)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd affidexlab/new/backend
echo "Deploying..."
DEPLOYMENT_URLS[backend_sandbox]=$(ENVIRONMENT=sandbox vercel --prod --name decaflow-api-sandbox --yes 2>&1 | grep -o 'https://[^ ]*' | head -1)
echo "✅ Deployed: ${DEPLOYMENT_URLS[backend_sandbox]}"
cd ../../..
echo ""

# Deploy Partners Production
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 3/4: Partners Dashboard (Production)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd partners
if [ ! -d "node_modules" ]; then
  npm install --silent
fi
echo "Deploying..."
DEPLOYMENT_URLS[partners_prod]=$(vercel --prod --name decaflow-partners --yes 2>&1 | grep -o 'https://[^ ]*' | head -1)
echo "✅ Deployed: ${DEPLOYMENT_URLS[partners_prod]}"
cd ..
echo ""

# Deploy Partners Sandbox
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 4/4: Partners Dashboard (Sandbox)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd partners
echo "Deploying..."
DEPLOYMENT_URLS[partners_sandbox]=$(VITE_ENVIRONMENT=sandbox vercel --prod --name decaflow-partners-sandbox --yes 2>&1 | grep -o 'https://[^ ]*' | head -1)
echo "✅ Deployed: ${DEPLOYMENT_URLS[partners_sandbox]}"
cd ..
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ ALL DEPLOYMENTS COMPLETE!                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend API (Production):       ${DEPLOYMENT_URLS[backend_prod]}"
echo "Backend API (Sandbox):          ${DEPLOYMENT_URLS[backend_sandbox]}"
echo "Partners Dashboard (Production):${DEPLOYMENT_URLS[partners_prod]}"
echo "Partners Dashboard (Sandbox):   ${DEPLOYMENT_URLS[partners_sandbox]}"
echo ""
echo "🎯 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Configure DNS in Hostinger:"
echo "    Add CNAME records:"
echo "    • api               → cname.vercel-dns.com"
echo "    • sandbox           → cname.vercel-dns.com"
echo "    • partners          → cname.vercel-dns.com"
echo "    • partners-sandbox  → cname.vercel-dns.com"
echo ""
echo "2️⃣  Add Custom Domains in Vercel:"
echo "    Go to: https://vercel.com/dashboard"
echo ""
echo "    For 'decaflow-api' project:"
echo "    Settings → Domains → Add: api.decaflow.xyz"
echo ""
echo "    For 'decaflow-api-sandbox' project:"
echo "    Settings → Domains → Add: sandbox.decaflow.xyz"
echo ""
echo "    For 'decaflow-partners' project:"
echo "    Settings → Domains → Add: partners.decaflow.xyz"
echo ""
echo "    For 'decaflow-partners-sandbox' project:"
echo "    Settings → Domains → Add: partners-sandbox.decaflow.xyz"
echo ""
echo "3️⃣  Add Environment Variables:"
echo ""
echo "    Backend Production (decaflow-api):"
echo "    • NODE_ENV = production"
echo "    • ENVIRONMENT = production"
echo "    • ALLOWED_ORIGINS = https://decaflow.xyz,https://partners.decaflow.xyz,https://tychiwallet.com,https://app.tychiwallet.com"
echo ""
echo "    Backend Sandbox (decaflow-api-sandbox):"
echo "    • NODE_ENV = production"
echo "    • ENVIRONMENT = sandbox"
echo "    • ALLOWED_ORIGINS = https://partners-sandbox.decaflow.xyz,https://test.tychiwallet.com,http://localhost:3000"
echo ""
echo "    Partners Production (decaflow-partners):"
echo "    • VITE_API_URL = https://api.decaflow.xyz"
echo "    • VITE_ENVIRONMENT = production"
echo ""
echo "    Partners Sandbox (decaflow-partners-sandbox):"
echo "    • VITE_API_URL = https://sandbox.decaflow.xyz"
echo "    • VITE_ENVIRONMENT = sandbox"
echo ""
echo "4️⃣  Redeploy each project after adding environment variables"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Full instructions: See DEPLOYMENT_GUIDE_PARTNERS.md"
echo ""
