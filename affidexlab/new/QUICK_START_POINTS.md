# DecaFlow Points System - Quick Start Guide

## 🚀 Quick Deployment with Docker

The fastest way to get the Points & Rewards System running:

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL (or use included Docker setup)

### Option 1: Docker Compose (Recommended)

1. **Copy environment file**:
   ```bash
   cd affidexlab/new
   cp .env.docker.example .env
   ```

2. **Edit .env with your values**:
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **Start all services**:
   ```bash
   docker-compose -f docker-compose.points.yml up -d
   ```

4. **Check status**:
   ```bash
   docker-compose -f docker-compose.points.yml ps
   docker-compose -f docker-compose.points.yml logs -f backend
   ```

This will start:
- PostgreSQL database with schema auto-initialized
- Backend API server on port 3000
- Cron jobs for weekly/monthly resets and leaderboard refresh

### Option 2: Manual Deployment

1. **Set up database**:
   ```bash
   export DATABASE_URL="postgresql://user:pass@localhost:5432/decaflow"
   ```

2. **Run deployment script**:
   ```bash
   cd affidexlab/new
   ./deploy-points-system.sh
   ```

3. **Start backend**:
   ```bash
   cd backend
   npm start
   ```

4. **Set up cron jobs** (see CRON_SETUP.md for details)

### Option 3: Cloud Platform Deployment

#### Render.com
1. Create PostgreSQL database
2. Create Web Service for backend
3. Add Cron Jobs (weekly reset, monthly reset, leaderboard refresh)
4. Set environment variables

#### Railway
1. Add PostgreSQL database
2. Deploy backend service
3. Configure cron jobs in railway.json
4. Set environment variables

#### Vercel + Supabase
1. Create Supabase project (PostgreSQL)
2. Deploy backend to Vercel
3. Set up Vercel Cron jobs
4. Configure environment variables

See `CRON_SETUP.md` for detailed platform-specific instructions.

## 🎯 Quick Test

Once deployed, test the API:

```bash
# Health check
curl http://localhost:3000/health

# Get API info
curl http://localhost:3000/v1

# Get leaderboard
curl http://localhost:3000/v1/leaderboard?period=weekly
```

## 📱 Frontend Deployment

1. **Set API URL**:
   ```bash
   cd affidexlab/new/app
   echo "VITE_API_BASE_URL=https://api.decaflow.xyz" > .env
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Deploy** to Vercel/Netlify/your hosting platform

## 🔧 Integrate Transaction Tracking

In your swap/bridge components:

```typescript
import { usePointsTracking } from '@/hooks/usePointsTracking';

const { trackSwap, trackBridge, trackLiquidityAdd } = usePointsTracking();

// After successful transaction
await trackSwap(txHash, fromToken, toToken, amountUSD, chainId);
```

## 📊 Admin Access

Navigate to `/admin` to:
- Create multiplier events
- View top performers
- Distribute rewards
- Manage airdrop snapshots

## 🆘 Troubleshooting

**Database connection issues**:
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs decaflow-postgres
```

**Backend not starting**:
```bash
# Check logs
docker logs decaflow-backend

# Restart service
docker-compose -f docker-compose.points.yml restart backend
```

**Cron jobs not running**:
```bash
# Check cron container logs
docker logs decaflow-cron-weekly
docker logs decaflow-cron-monthly
docker logs decaflow-cron-leaderboard
```

## 📚 Full Documentation

- **POINTS_REWARDS_SYSTEM.md** - Complete system documentation
- **CRON_SETUP.md** - Automation setup guide
- **POINTS_SYSTEM_IMPLEMENTATION.md** - Implementation details

## 🎉 You're Ready!

The Points & Rewards System is now live:
- ✅ Database initialized
- ✅ API endpoints active
- ✅ Cron jobs scheduled
- ✅ Frontend integrated

Users can now:
- Earn points on every transaction
- View leaderboard rankings
- Track their progress
- Qualify for rewards and airdrops

**Total Rewards Pool**: $25,000/month + 2026 token airdrop

Happy trading! 🚀
