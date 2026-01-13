#!/bin/bash

# Deploy Partners Dashboard (Sandbox)
echo "🚀 Deploying Partners Dashboard (Sandbox)..."
echo ""

cd partners

# Deploy to Vercel with sandbox environment
echo ""
echo "🔄 Deploying to Vercel..."
echo ""
echo "Project Name: decaflow-partners-sandbox"
echo "Environment: Sandbox"
echo ""

VITE_ENVIRONMENT=sandbox vercel --prod \
  --name decaflow-partners-sandbox \
  --yes \
  --force

echo ""
echo "✅ Partners Dashboard (Sandbox) deployed!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard: https://vercel.com/dashboard"
echo "2. Find 'decaflow-partners-sandbox' project"
echo "3. Settings → Domains → Add: partners-sandbox.decaflow.xyz"
echo "4. Settings → Environment Variables → Add:"
echo "   - VITE_API_URL = https://sandbox.decaflow.xyz"
echo "   - VITE_ENVIRONMENT = sandbox"
echo "5. Redeploy after adding environment variables"
echo ""
