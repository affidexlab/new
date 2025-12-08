#!/bin/bash

# Deploy Backend API (Production)
echo "🚀 Deploying Backend API (Production)..."
echo ""

cd affidexlab/new/backend

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Deploy to Vercel
echo ""
echo "🔄 Deploying to Vercel..."
echo ""
echo "Project Name: decaflow-api"
echo "Environment: Production"
echo ""

vercel --prod \
  --name decaflow-api \
  --yes \
  --force

echo ""
echo "✅ Backend API (Production) deployed!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard: https://vercel.com/dashboard"
echo "2. Find 'decaflow-api' project"
echo "3. Settings → Domains → Add: api.decaflow.xyz"
echo "4. Settings → Environment Variables → Add:"
echo "   - NODE_ENV = production"
echo "   - ENVIRONMENT = production"
echo "   - ALLOWED_ORIGINS = https://decaflow.xyz,https://partners.decaflow.xyz,https://tychiwallet.com,https://app.tychiwallet.com"
echo "5. Redeploy after adding environment variables"
echo ""
