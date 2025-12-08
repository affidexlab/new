#!/bin/bash

# Deploy Backend API (Sandbox)
echo "🚀 Deploying Backend API (Sandbox)..."
echo ""

cd affidexlab/new/backend

# Deploy to Vercel with sandbox environment
echo ""
echo "🔄 Deploying to Vercel..."
echo ""
echo "Project Name: decaflow-api-sandbox"
echo "Environment: Sandbox"
echo ""

ENVIRONMENT=sandbox vercel --prod \
  --name decaflow-api-sandbox \
  --yes \
  --force

echo ""
echo "✅ Backend API (Sandbox) deployed!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard: https://vercel.com/dashboard"
echo "2. Find 'decaflow-api-sandbox' project"
echo "3. Settings → Domains → Add: sandbox.decaflow.xyz"
echo "4. Settings → Environment Variables → Add:"
echo "   - NODE_ENV = production"
echo "   - ENVIRONMENT = sandbox"
echo "   - ALLOWED_ORIGINS = https://partners-sandbox.decaflow.xyz,https://test.tychiwallet.com,http://localhost:3000"
echo "5. Redeploy after adding environment variables"
echo ""
