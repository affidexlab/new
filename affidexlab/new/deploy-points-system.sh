#!/bin/bash

# DecaFlow Points System - Quick Deployment Script

set -e

echo "🚀 DecaFlow Points & Rewards System - Deployment"
echo "=================================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it using:"
    echo "export DATABASE_URL=\"postgresql://username:password@host:5432/decaflow\""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/affidexlab/new/backend"

echo "📦 Installing backend dependencies..."
npm install

echo ""
echo "🗄️  Initializing database schema..."
npm run db:init

echo ""
echo "✅ Database initialized successfully!"
echo ""
echo "🔄 Refreshing leaderboard cache..."
npm run db:refresh-leaderboard

echo ""
echo "✅ Deployment complete!"
echo ""
echo "=================================================="
echo "🎉 Points & Rewards System is ready!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   cd affidexlab/new/backend && npm start"
echo ""
echo "2. Set up cron jobs for automation:"
echo "   - Weekly reset: Mondays at 00:00 UTC"
echo "   - Monthly reset: 1st of month at 00:00 UTC"
echo "   - Leaderboard refresh: Every 5 minutes"
echo ""
echo "3. Deploy frontend with API URL:"
echo "   cd affidexlab/new/app"
echo "   echo \"VITE_API_BASE_URL=https://api.decaflow.xyz\" > .env"
echo "   npm run build"
echo ""
echo "See CRON_SETUP.md for detailed automation setup."
echo ""
