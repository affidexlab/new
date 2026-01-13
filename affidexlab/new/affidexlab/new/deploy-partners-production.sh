#!/bin/bash

# Deploy Partners Dashboard (Production)
echo "🚀 Deploying Partners Dashboard (Production)..."
echo ""

cd partners

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Deploy to Vercel
echo ""
echo "🔄 Deploying to Vercel..."
echo ""
echo "Project Name: decaflow-partners"
echo "Environment: Production"
echo ""

vercel --prod \
  --name decaflow-partners \
  --yes \
  --force

echo ""
echo "✅ Partners Dashboard (Production) deployed!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard: https://vercel.com/dashboard"
echo "2. Find 'decaflow-partners' project"
echo "3. Settings → Domains → Add: partners.decaflow.xyz"
echo "4. Settings → Environment Variables → Add:"
echo "   - VITE_API_URL = https://api.decaflow.xyz"
echo "   - VITE_ENVIRONMENT = production"
echo "5. Redeploy after adding environment variables"
echo ""
