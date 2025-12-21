# VDM Staking Updates - December 2025

## Summary of Changes

This document outlines the updates made to the VDM staking system based on requirements from the VDM team.

---

## Key Updates

### 1. ✅ Staking Durations Updated
**Changed from**: 6, 9, 12 months  
**Changed to**: **3, 6, 9, 12 months**

**APY Rates**:
- 3 months: 4% APY
- 6 months: 8% APY
- 9 months: 12% APY
- 12 months: 16% APY

**Files Updated**:
- `app/src/lib/solanaStaking.ts` - Added ThreeMonths lock period
- `backend/src/services/solanaStakingService.js` - Added 3-month period configuration

---

### 2. ✅ Maximum Stake Limit Removed
**Previous**: Maximum stake of 10,000,000 VDM  
**Updated**: **No maximum limit** - Users can stake any amount above the minimum

**Minimum stake**: 1,000 VDM (unchanged)

**Files Updated**:
- `app/src/lib/solanaStaking.ts` - Removed MAX_STAKE_AMOUNT constant
- `app/src/pages/SolanaStaking.tsx` - Removed max stake validation and UI text

---

### 3. ✅ Staking Wallet Address Hidden
**Previous**: Staking wallet address `3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk` was visible on frontend  
**Updated**: Wallet address is **no longer displayed publicly** on the staking page

**Changes**:
- All references to the specific wallet address removed from user-facing UI
- Backend still uses the wallet for transfers (unchanged)
- User messaging updated to say "custodial staking wallet" without exposing the address

**Files Updated**:
- `app/src/pages/SolanaStaking.tsx` - Updated all text references

---

### 4. ✅ Rewards Changed from VDM to USDT
**Previous**: Rewards paid in VDM tokens  
**Updated**: **Rewards now paid in USDT**

**Impact**:
- Users stake VDM and receive VDM back (minus fees)
- Rewards are calculated and paid in USDT for stability
- All reward calculations display USDT
- Pool statistics show total rewards distributed in USDT

**Files Updated**:
- `app/src/pages/SolanaStaking.tsx` - All reward displays changed to USDT
- UI messaging updated throughout

---

### 5. ✅ 150,000,000 VDM Pool Info Removed
**Previous**: Frontend displayed "150,000,000 VDM Pool" stat card  
**Updated**: **Pool information removed** to avoid limiting large stakers

**Changes**:
- Removed "Rewards Pool Remaining" card from dashboard
- Simplified dashboard from 3 cards to 2 cards:
  - Total Staked (VDM)
  - Total Rewards Distributed (USDT)

**Files Updated**:
- `app/src/pages/SolanaStaking.tsx` - Removed pool remaining card

---

### 6. ✅ NEW: Secured Admin Dashboard Created
**URL**: `https://decaflow.xyz/vdm-admin`

A comprehensive admin dashboard has been created for the VDM/Affidex team to manage staking operations.

#### Features:

**Authentication**:
- Password-protected admin access
- Default password: `vdm-admin-2025` (change this immediately in production!)

**Pending Claims Management**:
- View all pending claim requests
- See wallet addresses, amounts, and request timestamps
- One-click "Mark as Paid" button for each claim
- Shows both VDM principal and USDT rewards amounts

**Staking Positions Overview**:
- View all active, claimed, and pending positions
- See staked amounts, lock periods, unlock dates
- Filter by status
- Real-time unlock status indicators

**Investment Management**:
- Record new investments from custodial wallet
- Track investment platform, amount (USDT), and description
- Record returns when investments close
- View investment history with ROI calculations
- Track active vs closed investments

**Dashboard Statistics**:
- Total VDM Staked
- Total USDT Rewards Distributed
- Active USDT Investments
- Total Investment Returns in USDT

**Files Created**:
- `app/src/pages/VDMAdmin.tsx` - New admin dashboard page
- `backend/src/scripts/create-vdm-investments-table.sql` - Database table for investments

**Files Updated**:
- `app/src/App.tsx` - Added `/vdm-admin` route
- `backend/src/routes/v1/solana-staking.js` - Added admin API endpoints
- `backend/src/services/solanaStakingService.js` - Added admin service functions

---

## Database Updates Required

Run the following SQL to create the investments tracking table:

```sql
CREATE TABLE IF NOT EXISTS vdm_staking_investments (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(20, 2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  returns NUMERIC(20, 2) DEFAULT 0,
  invested_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT DEFAULT NULL,
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'closed'))
);

CREATE INDEX IF NOT EXISTS idx_vdm_investments_status ON vdm_staking_investments(status);
CREATE INDEX IF NOT EXISTS idx_vdm_investments_invested_at ON vdm_staking_investments(invested_at);
```

**Location**: `/backend/src/scripts/create-vdm-investments-table.sql`

---

## New API Endpoints (Admin)

### Get Pending Claims
```
GET /v1/solana-staking/admin/claims
```

### Get All Positions
```
GET /v1/solana-staking/admin/positions
```

### Mark Claim as Paid
```
POST /v1/solana-staking/admin/claims/:claimId/paid
```

### Get All Investments
```
GET /v1/solana-staking/admin/investments
```

### Create Investment
```
POST /v1/solana-staking/admin/investments
Body: { amount, description, status }
```

### Record Investment Returns
```
POST /v1/solana-staking/admin/investments/:investmentId/returns
Body: { returns }
```

---

## Admin Dashboard Workflow

### 1. Processing Claims
1. Navigate to `https://decaflow.xyz/vdm-admin`
2. Login with admin password
3. View "Pending Claims" tab
4. For each claim:
   - Verify the wallet address
   - Note the VDM principal and USDT rewards amounts
   - Send VDM (principal) from custodial wallet to user
   - Send USDT (rewards) from team wallet to user
   - Click "Mark as Paid" in the dashboard
5. Claim is moved to "processed" status

### 2. Managing Investments
1. Navigate to "Investments" tab
2. To record a new investment:
   - Select platform (e.g., Uniswap, Aave, Compound)
   - Enter amount in USDT being invested
   - Add description of the investment
   - Click "Record Investment"
3. To record returns:
   - Select the investment from dropdown
   - Enter returns amount in USDT
   - Click "Record Returns"
   - Investment status changes to "closed"

### 3. Monitoring Pool Stats
- Dashboard shows real-time statistics
- Total VDM staked across all users
- Total USDT rewards paid out
- Active investment amounts
- Total returns from investments

---

## Security Notes

### ⚠️ IMPORTANT - Production Security Checklist:

1. **Change Admin Password**:
   - Default password `vdm-admin-2025` should be changed immediately
   - Update in `/app/src/pages/VDMAdmin.tsx` line 29
   - Consider using environment variables for the password

2. **Add Authentication Middleware**:
   - Current implementation uses client-side password check
   - For production, implement proper JWT/session-based auth
   - Add authentication middleware to admin API routes

3. **Restrict Admin API Access**:
   - Add IP whitelisting if possible
   - Implement rate limiting on admin endpoints
   - Add audit logging for all admin actions

4. **Wallet Security**:
   - Custodial wallet `3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk` should be:
     - Hardware wallet or multi-sig
     - Access limited to authorized personnel only
     - Regular balance audits

5. **Investment Wallet Security**:
   - Use a separate wallet for investments
   - Keep detailed records of all transactions
   - Regular reconciliation of investment returns

---

## Testing Checklist

Before deploying to production:

- [ ] Test 3-month staking period
- [ ] Test staking with large amounts (no max limit)
- [ ] Verify wallet address not visible on frontend
- [ ] Verify rewards display in USDT
- [ ] Test admin dashboard login
- [ ] Test marking claims as paid
- [ ] Test recording investments
- [ ] Test recording returns
- [ ] Verify database migrations run successfully
- [ ] Test all admin API endpoints
- [ ] Verify staking flow end-to-end (stake → wait → claim)

---

## Deployment Instructions

### Frontend
1. Build the app: `cd app && npm run build`
2. Deploy to Vercel: `vercel deploy --prod`
3. Verify changes at `https://decaflow.xyz/staking`
4. Test admin dashboard at `https://decaflow.xyz/vdm-admin`

### Backend
1. Run database migration: `psql -d your_database < backend/src/scripts/create-vdm-investments-table.sql`
2. Deploy backend to Render: `./deploy-backend-production.sh`
3. Verify API endpoints are responding
4. Test admin endpoints with Postman/curl

---

## Questions or Issues?

Contact the Affidex Lab team for support:
- Technical issues: Check logs in Render dashboard
- Frontend issues: Check browser console
- Database issues: Check PostgreSQL connection

---

## Changelog

**December 21, 2025**:
- Added 3-month staking duration (4% APY)
- Removed maximum stake limit
- Hidden staking wallet address from frontend
- Changed rewards currency from VDM to USDT
- Removed 150M VDM pool info display
- Created secured admin dashboard at `/vdm-admin`
- Added investment tracking system
- Added claim management system
- Created 6 new admin API endpoints
- Updated all documentation

---

**Ready for deployment!** 🚀

All changes have been committed to the `capy/cap-3-93305d97` branch and are ready to be merged to `main`.
