# Database Setup Guide

## Supabase Database Configuration

### Database Connection
- **Database URL**: `postgresql://postgres:0813062Aa@@db.rmeclajecgduwhhmekyi.supabase.co:5432/postgres`
- **Environment Variable**: `DATABASE_URL` (already added to Render)

### Schema Initialization

The database schema will be automatically initialized when the backend server starts, provided the `DATABASE_URL` environment variable is set.

#### Schema Tables
1. **users** - User wallet information and points
2. **transactions** - All swap/bridge/liquidity transactions
3. **rewards** - Weekly/monthly reward distributions
4. **point_multipliers** - Dynamic point multiplier configurations
5. **leaderboard_cache** - Cached leaderboard data
6. **airdrop_snapshots** - Periodic snapshots for airdrop eligibility

### Manual Initialization (if needed)

If you need to manually initialize the database:

```bash
# From backend directory
cd backend
DATABASE_URL="postgresql://postgres:0813062Aa@@db.rmeclajecgduwhhmekyi.supabase.co:5432/postgres" node src/scripts/init-database.js
```

### Verification

After deployment, verify the database setup:

1. **Check Health Endpoint**
   ```bash
   curl https://api.decaflow.xyz/health
   ```
   
   Expected response should include:
   ```json
   {
     "status": "ok",
     "database": {
       "healthy": true
     },
     ...
   }
   ```

2. **Test Points System**
   ```bash
   # Get user points (should return empty user if new)
   curl https://api.decaflow.xyz/v1/points/user/0xYourWalletAddress
   ```

3. **Check Leaderboard**
   ```bash
   curl https://api.decaflow.xyz/v1/leaderboard?period=all&limit=10
   ```

### Points System Integration

The points system is now integrated into:
- ✅ **Swap Page** - Tracks all swap transactions
- ✅ **Bridge Page** - Tracks all bridge transactions
- ✅ **Backend Webhook** - `/v1/webhooks/transaction-confirmed` endpoint

Each transaction automatically:
1. Records in the `transactions` table
2. Updates user stats in the `users` table
3. Awards points based on transaction volume
4. Updates leaderboard cache

### Transaction Tracking Flow

1. User completes swap/bridge transaction
2. Frontend calls `usePointsTracking` hook
3. Hook sends POST to `/v1/webhooks/transaction-confirmed`
4. Backend validates transaction and awards points
5. Database triggers update user stats automatically
6. User sees points notification

### Points Calculation

- **Base Points**: 1 point per $1 USD transaction volume
- **Swap**: 1x multiplier
- **Bridge**: 1.5x multiplier (cross-chain complexity)
- **Liquidity Add**: 2x multiplier (liquidity provision)
- **Liquidity Remove**: 0.5x multiplier

### Admin Operations

#### Create Point Multiplier Campaign
```bash
curl -X POST https://api.decaflow.xyz/v1/points/admin/multiplier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend Boost",
    "description": "2x points on all swaps this weekend",
    "multiplier": 2.0,
    "transactionType": "swap",
    "startDate": "2025-12-13T00:00:00Z",
    "endDate": "2025-12-15T23:59:59Z",
    "active": true
  }'
```

#### Update Airdrop Eligibility
```bash
curl -X POST https://api.decaflow.xyz/v1/points/admin/airdrop/update-eligibility
```

#### Create Airdrop Snapshot
```bash
curl -X POST https://api.decaflow.xyz/v1/points/admin/airdrop/snapshot
```

#### Refresh Leaderboard Cache
```bash
curl -X POST https://api.decaflow.xyz/v1/leaderboard/refresh
```

### Scheduled Tasks

Set up these cron jobs on Render:

1. **Weekly Leaderboard Reset** (Every Monday at 00:00 UTC)
   ```bash
   0 0 * * 1 node /app/src/scripts/weekly-reset.js
   ```

2. **Monthly Leaderboard Reset** (1st of each month at 00:00 UTC)
   ```bash
   0 0 1 * * node /app/src/scripts/monthly-reset.js
   ```

3. **Leaderboard Cache Refresh** (Every 5 minutes)
   ```bash
   */5 * * * * curl -X POST https://api.decaflow.xyz/v1/leaderboard/refresh
   ```

### Monitoring

Monitor the following metrics:
- Transaction recording success rate
- Points calculation accuracy
- Leaderboard update latency
- Database connection health

### Troubleshooting

#### Database Connection Issues
- Verify `DATABASE_URL` is set correctly in Render environment variables
- Check Supabase firewall rules (should allow Render IP addresses)
- Verify SSL is enabled for production connections

#### Points Not Tracking
1. Check browser console for errors
2. Verify transaction hash is valid
3. Check backend logs for webhook errors
4. Test webhook endpoint directly

#### Leaderboard Not Updating
- Run manual leaderboard refresh: `curl -X POST https://api.decaflow.xyz/v1/leaderboard/refresh`
- Check if cron job is configured on Render
- Verify database trigger is working

### Database Backup

Supabase automatically handles backups. To create manual snapshot:
1. Go to Supabase dashboard
2. Navigate to Database → Backups
3. Create new backup

### Migration Notes

- Schema uses PostgreSQL-specific features (triggers, functions)
- All timestamps are in UTC
- Wallet addresses are case-sensitive
- Transaction hashes must be unique
