# DecaFlow Points & Rewards System

## Overview

DecaFlow's Points & Rewards System is designed to incentivize user engagement and reward active traders with cash prizes and airdrop eligibility for our upcoming token launch in 2026.

## Features

### ✨ Points Earning System
- **Swaps**: Earn 1x points per $1 traded
- **Bridges**: Earn 2x points per $1 bridged  
- **Liquidity Additions**: Earn 5x points per $1 liquidity added
- **Liquidity Removals**: Earn 0.5x points per $1 removed

### 🏆 Leaderboard & Rankings
- **All-Time Leaderboard**: Total points earned since launch
- **Weekly Leaderboard**: Points earned in the current week
- **Monthly Leaderboard**: Points earned in the current month
- Real-time ranking updates
- Top 100 performers displayed

### 💰 Cash Rewards

#### Weekly Rewards ($5,000 total)
- 🥇 1st Place: $2,000
- 🥈 2nd Place: $1,200
- 🥉 3rd Place: $800
- 4th-10th: $1,000 shared equally

#### Monthly Rewards ($20,000 total)
- 🥇 1st Place: $8,000
- 🥈 2nd Place: $5,000
- 🥉 3rd Place: $3,000
- 4th-20th: $4,000 shared equally

### 🎁 Airdrop Eligibility
To qualify for the 2026 token airdrop:
- Minimum 1,000 total points
- Minimum 5 completed transactions
- Active account (not flagged/banned)

### 🚀 Multiplier Events
Admins can create special multiplier events to boost engagement:
- Time-limited bonus points periods
- Specific transaction type multipliers
- Minimum amount requirements
- Stackable with base rewards

## Architecture

### Database Schema

#### Users Table
Stores user wallet information and point totals:
- `wallet_address`: Unique user identifier
- `total_points`: Lifetime points earned
- `weekly_points`: Points earned this week
- `monthly_points`: Points earned this month
- `total_volume_usd`: Total trading volume
- `transaction_count`: Number of transactions
- `referral_code`: Unique referral code
- `airdrop_eligible`: Boolean flag
- Ranks (calculated): `global_rank`, `weekly_rank`, `monthly_rank`

#### Transactions Table
Records all point-earning transactions:
- `tx_hash`: Blockchain transaction hash (unique)
- `wallet_address`: User who made the transaction
- `transaction_type`: swap, bridge, liquidity_add, liquidity_remove
- `amount_usd`: Transaction value in USD
- `points_earned`: Points awarded
- `multiplier`: Active multiplier applied
- `status`: pending, completed, failed

#### Rewards Table
Tracks reward distributions:
- `wallet_address`: Recipient
- `period_type`: weekly, monthly
- `period_start/end`: Reward period dates
- `rank`: User's rank in the period
- `points`: Points earned in period
- `reward_amount_usd`: Cash reward amount
- `reward_status`: pending, paid, cancelled
- `payment_tx_hash`: Blockchain payment proof

#### Point Multipliers Table
Defines active bonus events:
- `name`: Event name
- `multiplier`: Bonus multiplier (e.g., 2.0 = 2x points)
- `transaction_type`: Applies to specific type or all
- `min_amount_usd`: Minimum transaction size
- `start_date/end_date`: Active period
- `active`: Boolean flag

#### Leaderboard Cache Table
Optimized leaderboard queries:
- `period_type`: all, weekly, monthly
- `wallet_address`: User
- `rank`: Current rank
- `points`: Points in period
- `volume_usd`: Volume in period
- `transaction_count`: Number of transactions
- `last_updated`: Cache timestamp

#### Airdrop Snapshots Table
Historical snapshots for airdrop distribution:
- `wallet_address`: User
- `total_points`: Points at snapshot time
- `eligible`: Qualified for airdrop
- `allocation_percentage`: Share of token pool
- `snapshot_date`: When snapshot was taken

### Backend API Endpoints

#### Points Management
- `GET /v1/points/user/:walletAddress` - Get user points and stats
- `GET /v1/points/user/:walletAddress/transactions` - Get transaction history
- `GET /v1/points/user/:walletAddress/rewards` - Get rewards history
- `POST /v1/points/record` - Record a new transaction
- `GET /v1/points/top-performers` - Get top N performers

#### Leaderboard
- `GET /v1/leaderboard?period={all|weekly|monthly}` - Get leaderboard
- `POST /v1/leaderboard/refresh` - Refresh leaderboard cache

#### Webhooks
- `POST /v1/webhooks/transaction-confirmed` - Confirm transaction and award points

#### Admin Endpoints
- `POST /v1/points/admin/multiplier` - Create multiplier event
- `POST /v1/points/admin/airdrop/update-eligibility` - Update eligibility
- `POST /v1/points/admin/airdrop/snapshot` - Create airdrop snapshot
- `POST /v1/points/admin/reward` - Record reward distribution
- `PATCH /v1/points/admin/reward/:id` - Update reward status

### Frontend Components

#### Leaderboard Page (`/leaderboard`)
Full leaderboard display with:
- Period tabs (All Time, Weekly, Monthly)
- Top 100 rankings
- Reward information
- Airdrop eligibility criteria

#### Points Dashboard Component
Integrated into main app:
- User points overview
- Weekly/monthly/total points
- Current rankings
- Airdrop eligibility status
- Recent transaction history
- Referral code
- Points earning guide

#### Admin Dashboard (`/admin`)
Management interface for:
- Viewing top performers
- Creating multiplier events
- Distributing rewards
- Managing airdrop snapshots
- Refreshing leaderboard cache

### React Hook - usePointsTracking

Helper hook for tracking transactions:

```typescript
import { usePointsTracking } from '@/hooks/usePointsTracking';

const { trackSwap, trackBridge, trackLiquidityAdd } = usePointsTracking();

// After successful swap
await trackSwap(txHash, fromToken, toToken, amountUSD, chainId);

// After successful bridge
await trackBridge(txHash, fromChainId, toChainId, fromToken, toToken, amountUSD);

// After successful liquidity add
await trackLiquidityAdd(txHash, amountUSD, chainId, token0, token1);
```

## Setup & Deployment

### 1. Database Setup

Set up PostgreSQL database:

```bash
# Create database
createdb decaflow

# Set environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/decaflow"
```

The schema will auto-initialize on first server start.

### 2. Environment Variables

Backend `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/decaflow
ZEROX_API_KEY=your_0x_api_key
SOCKET_API_KEY=your_socket_api_key
NODE_ENV=production
PORT=3000
```

Frontend `.env`:
```env
VITE_API_BASE_URL=https://api.decaflow.xyz
```

### 3. Deploy Backend

```bash
cd affidexlab/new/backend
npm install
npm start
```

### 4. Deploy Frontend

```bash
cd affidexlab/new/app
npm install
npm run build
```

## Usage Guide

### For Users

1. **Connect Wallet**: Connect your wallet to the DecaFlow app
2. **Start Trading**: Make swaps, bridges, or add liquidity
3. **Earn Points**: Points are automatically awarded after each transaction
4. **Check Leaderboard**: Visit `/leaderboard` to see your ranking
5. **View Dashboard**: Check the "Points" tab in the app for detailed stats
6. **Get Rewards**: Top performers receive cash rewards weekly/monthly
7. **Qualify for Airdrop**: Reach 1,000 points and 5 transactions

### For Admins

1. **Access Admin Panel**: Navigate to `/admin`
2. **Create Multiplier Events**: Boost engagement with bonus periods
3. **Monitor Top Performers**: View weekly and monthly leaders
4. **Distribute Rewards**: Award cash prizes to top performers
5. **Manage Airdrop**: Update eligibility and create snapshots
6. **Refresh Cache**: Update leaderboard for real-time rankings

## Automated Tasks

### Weekly Reset
Reset weekly points every Monday at 00:00 UTC:

```sql
SELECT reset_weekly_points();
```

### Monthly Reset
Reset monthly points on the 1st of each month at 00:00 UTC:

```sql
SELECT reset_monthly_points();
```

Set up cron jobs or scheduled tasks to run these functions.

### Leaderboard Cache Refresh
Refresh every 5 minutes for real-time updates:

```bash
curl -X POST https://api.decaflow.xyz/v1/leaderboard/refresh
```

## Points Calculation Examples

### Example 1: Simple Swap
- Action: Swap $100 USDC to ETH
- Base Rate: 1x
- Points Earned: **100 points**

### Example 2: Bridge with Multiplier
- Action: Bridge $500 from Ethereum to Base
- Base Rate: 2x
- Active Multiplier: 1.5x (Weekend Bonus)
- Calculation: $500 × 2 × 1.5
- Points Earned: **1,500 points**

### Example 3: Large Liquidity Addition
- Action: Add $5,000 liquidity to ETH/USDC pool
- Base Rate: 5x
- Points Earned: **25,000 points**

## Security Considerations

1. **Transaction Verification**: All transactions should be verified on-chain
2. **Duplicate Prevention**: `tx_hash` is unique to prevent double-counting
3. **Admin Protection**: Admin endpoints should be protected with authentication
4. **Rate Limiting**: API rate limits prevent abuse
5. **SQL Injection**: Parameterized queries prevent SQL injection
6. **Input Validation**: All inputs validated before database insertion

## Monitoring & Analytics

Track key metrics:
- Total points distributed
- Active users per period
- Average points per transaction
- Top performers trends
- Airdrop eligible users
- Reward distribution totals

## Future Enhancements

- [ ] Referral bonus system
- [ ] Streak bonuses (consecutive days trading)
- [ ] Social sharing rewards
- [ ] Team/guild competitions
- [ ] NFT badge rewards for milestones
- [ ] Dynamic multipliers based on TVL
- [ ] Governance voting power from points

## Support

For issues or questions:
- Email: team@decaflow.tech
- Discord: [Join our community]
- Docs: https://docs.decaflow.xyz

---

**Launch Date**: December 2025  
**Token Airdrop**: 2026  
**Total Rewards Pool**: $25,000/month + token allocation
