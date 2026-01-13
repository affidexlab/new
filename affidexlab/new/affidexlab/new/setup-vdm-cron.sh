#!/bin/bash

# VDM Staking Reward Distribution Cron Job Setup

echo "🎯 VDM Staking - Daily Reward Distribution Setup"
echo ""
echo "This script helps you set up the daily cron job for distributing"
echo "staking rewards to VDM token holders."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get backend URL
read -p "Enter your backend URL (e.g., https://api.decaflow.xyz): " BACKEND_URL

# Remove trailing slash if present
BACKEND_URL=${BACKEND_URL%/}

echo ""
echo "✅ Backend URL: $BACKEND_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Testing connection to backend..."
echo ""

# Test backend health
HEALTH_CHECK=$(curl -s "$BACKEND_URL/health")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
  echo "✅ Backend is reachable"
else
  echo "❌ Backend health check failed"
  echo "Response: $HEALTH_CHECK"
  echo ""
  echo "Please verify your backend URL and try again."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Testing reward update endpoint..."
echo ""

# Test reward endpoint
REWARD_TEST=$(curl -s -X POST "$BACKEND_URL/v1/solana-staking/admin/update-rewards" -H "Content-Type: application/json")
if echo "$REWARD_TEST" | grep -q "success"; then
  echo "✅ Reward endpoint is working"
  echo "Response: $REWARD_TEST"
else
  echo "⚠️  Reward endpoint test returned:"
  echo "$REWARD_TEST"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 CRON JOB SETUP OPTIONS"
echo ""
echo "Choose your preferred method:"
echo ""
echo "1️⃣  Render Cron Jobs (Recommended)"
echo "   → Go to https://dashboard.render.com"
echo "   → New + → Cron Job"
echo "   → Name: decaflow-reward-distribution"
echo "   → Command:"
echo "      curl -X POST $BACKEND_URL/v1/solana-staking/admin/update-rewards"
echo "   → Schedule: 0 0 * * * (Daily at midnight UTC)"
echo ""
echo "2️⃣  cron-job.org (External Service)"
echo "   → Go to https://cron-job.org"
echo "   → Create account → New Cron Job"
echo "   → URL: $BACKEND_URL/v1/solana-staking/admin/update-rewards"
echo "   → Method: POST"
echo "   → Schedule: Daily at 00:00 UTC"
echo ""
echo "3️⃣  Vercel Cron (If backend on Vercel)"
echo "   → Add to backend/vercel.json:"
echo '   {
     "crons": [{
       "path": "/v1/solana-staking/admin/update-rewards",
       "schedule": "0 0 * * *"
     }]
   }'
echo "   → Redeploy: vercel --prod"
echo ""
echo "4️⃣  Server Crontab (If you have SSH access)"
echo "   → Run: crontab -e"
echo "   → Add line:"
echo "      0 0 * * * curl -X POST $BACKEND_URL/v1/solana-staking/admin/update-rewards"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏰ SCHEDULE EXPLAINED"
echo ""
echo "Cron format: 0 0 * * *"
echo "             │ │ │ │ │"
echo "             │ │ │ │ └─ Day of week (0-7)"
echo "             │ │ │ └─── Month (1-12)"
echo "             │ │ └───── Day of month (1-31)"
echo "             │ └─────── Hour (0-23)"
echo "             └───────── Minute (0-59)"
echo ""
echo "• 0 0 * * * = Every day at midnight UTC"
echo "• 0 12 * * * = Every day at noon UTC"
echo "• 0 */6 * * * = Every 6 hours"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 MONITORING TIPS"
echo ""
echo "• Set up email notifications in your cron service"
echo "• Check logs daily for first week"
echo "• Verify reward updates with:"
echo "  curl '$BACKEND_URL/v1/solana-staking/pool-stats?poolId=vdm-sol'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Setup information saved!"
echo ""
echo "Next steps:"
echo "1. Choose a cron method above"
echo "2. Set up the cron job"
echo "3. Test it runs successfully"
echo "4. Monitor for first few days"
echo ""
echo "🚀 Ready to distribute rewards!"
echo ""
