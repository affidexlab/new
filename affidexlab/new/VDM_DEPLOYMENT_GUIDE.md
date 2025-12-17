# VDM Staking Deployment Guide

## Quick Deployment Steps

Follow these steps to deploy the VDM Solana staking integration to production.

---

## 1️⃣ Backend Deployment

### Option A: Automatic Deployment (Recommended if auto-deploy is enabled)

If you have Vercel connected to GitHub with auto-deploy:
1. ✅ **Already deployed!** Your merge to `main` will automatically trigger deployment
2. Go to https://vercel.com/dashboard
3. Check that `decaflow-api` project shows the latest deployment
4. Verify database schema was created by checking logs

### Option B: Manual Deployment via Vercel CLI

```bash
cd affidexlab/new/backend
vercel --prod --yes
```

### Database Migration

The backend will automatically run schema migrations on startup. To verify:

1. Check Render/Vercel backend logs for:
   ```
   ✅ Database schema initialized successfully
   ```

2. Or manually run the migration:
   ```bash
   # SSH into your backend server or run locally with production DATABASE_URL
   node -e "import('./src/db/connection.js').then(m => m.initializeDatabase())"
   ```

3. Verify tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'solana_%';
   ```

   Should return:
   - `solana_staking_positions`
   - `solana_staking_transactions`
   - `solana_pool_stats`
   - `solana_staking_fees`

---

## 2️⃣ Cron Job Setup (Daily Rewards Distribution)

### Option A: Render Cron Jobs (Recommended)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Cron Job"**
3. Configure:
   - **Name**: `decaflow-reward-distribution`
   - **Command**: 
     ```bash
     curl -X POST https://api.decaflow.xyz/v1/solana-staking/admin/update-rewards -H "Content-Type: application/json"
     ```
   - **Schedule**: `0 0 * * *` (Every day at midnight UTC)
   - **Region**: Same as your backend
4. Click **"Create Cron Job"**

### Option B: External Cron Service (cron-job.org)

1. Go to https://cron-job.org/en/ and sign up
2. Create new cron job:
   - **Title**: DecaFlow VDM Rewards
   - **URL**: `https://api.decaflow.xyz/v1/solana-staking/admin/update-rewards`
   - **Method**: POST
   - **Schedule**: Daily at 00:00 UTC
   - **Time zone**: UTC
3. Save and activate

### Option C: Vercel Cron (if backend is on Vercel)

Add to `backend/vercel.json`:
```json
{
  "crons": [{
    "path": "/v1/solana-staking/admin/update-rewards",
    "schedule": "0 0 * * *"
  }]
}
```

Then redeploy:
```bash
cd affidexlab/new/backend
vercel --prod --yes
```

### Verify Cron Job

Test manually first:
```bash
curl -X POST https://api.decaflow.xyz/v1/solana-staking/admin/update-rewards \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "updated": 0,
    "timestamp": 1734480000000
  }
}
```

---

## 3️⃣ Frontend Deployment

### Option A: Automatic Deployment (Recommended)

If Vercel auto-deploy is enabled for your frontend:
1. ✅ **Already deployed!** Your merge to `main` triggered deployment
2. Go to https://vercel.com/dashboard
3. Find your main DecaFlow project
4. Verify deployment includes Solana dependencies
5. Check build logs for any errors

### Option B: Manual Deployment via Vercel CLI

```bash
cd affidexlab/new/app
bun install  # Install new Solana packages
vercel --prod --yes
```

### Frontend Environment Variables

Verify these are set in Vercel dashboard:

1. Go to https://vercel.com/dashboard
2. Select your DecaFlow project
3. Settings → Environment Variables
4. Ensure these exist:
   - `VITE_API_BASE_URL` = `https://api.decaflow.xyz`
   - `VITE_WALLETCONNECT_PROJECT_ID` = (your WalletConnect ID)
   - `VITE_SOCKET_API_KEY` = (your Socket API key)

If missing, add them and redeploy.

---

## 4️⃣ Testing on Mainnet

### Pre-Flight Checks

1. **Backend Health Check**:
   ```bash
   curl https://api.decaflow.xyz/health
   ```
   Expected: `{"status":"ok"}`

2. **Database Check**:
   ```bash
   curl "https://api.decaflow.xyz/v1/solana-staking/pool-stats?poolId=vdm-sol"
   ```
   Expected:
   ```json
   {
     "success": true,
     "data": {
       "poolId": "vdm-sol",
       "tvl": 0,
       "totalStakers": 0,
       "totalStaked": 0,
       "baseApy": 18.5
     }
   }
   ```

3. **Frontend Check**:
   - Visit https://decaflow.xyz
   - Check for "VDM Staking" link in navigation (with orange "NEW" badge)
   - Click it → should go to `/staking` page

### Mainnet Test Flow

**⚠️ Use small amounts for first test!**

1. **Visit Staking Page**:
   - Go to https://decaflow.xyz/staking

2. **Connect Solana Wallet**:
   - Click "Connect Wallet" (top right)
   - Should see Phantom/Solflare/Backpack options
   - Connect your test wallet

3. **Verify Balance Display**:
   - Should show your VDM balance
   - Should show your SOL balance

4. **Test Stake (Small Amount)**:
   - Select VDM/SOL pool
   - Enter: `0.1 VDM` and `0.001 SOL` (or smaller)
   - Verify fee breakdown shows:
     - Deposit fee: 0.0025 VDM (2.5%)
     - Net APY: ~14-16%
   - Click "Stake Tokens"
   - Approve in wallet
   - Wait for confirmation

5. **Verify Position**:
   - Click "My Positions" tab
   - Should see your new position with:
     - Staked amount: 0.0975 VDM (after 2.5% fee)
     - Pending rewards: 0.0000 VDM
     - Duration: 0 days

6. **Check Database**:
   ```bash
   curl "https://api.decaflow.xyz/v1/solana-staking/positions?wallet=YOUR_WALLET_ADDRESS"
   ```
   Should return your position

7. **Test Rewards (Next Day)**:
   - Wait 24 hours OR manually trigger:
     ```bash
     curl -X POST https://api.decaflow.xyz/v1/solana-staking/admin/update-rewards
     ```
   - Refresh page → should see pending rewards > 0

8. **Test Claim**:
   - Click "Claim" button
   - Approve transaction
   - Verify VDM received (minus 10% performance fee)

9. **Test Unstake**:
   - Click "Unstake" button
   - Verify withdrawal fee: 1.5%
   - Approve transaction
   - Verify VDM returned to wallet

### Expected Results

✅ **Successful Test**:
- Position created in database
- Fees collected (2.5% deposit)
- Rewards accumulate daily
- Claim works (10% performance fee deducted)
- Unstake works (1.5% withdrawal fee)
- All transactions on Solscan

❌ **Common Issues**:

1. **"Failed to fetch positions"**
   - Check backend logs
   - Verify database tables exist
   - Check CORS settings

2. **"Insufficient balance"**
   - Need both VDM and SOL for gas
   - Ensure wallet has enough

3. **"Transaction failed"**
   - Check Solana network status
   - Verify token approvals
   - Check wallet has SOL for gas

4. **"No pending rewards"**
   - Cron job not running
   - Run manually: `POST /admin/update-rewards`

---

## 5️⃣ Monitoring & Analytics

### Track Key Metrics

1. **Pool Stats**:
   ```bash
   curl "https://api.decaflow.xyz/v1/solana-staking/pool-stats?poolId=vdm-sol"
   curl "https://api.decaflow.xyz/v1/solana-staking/pool-stats?poolId=vdm-usdc"
   ```

2. **Fee Revenue**:
   ```sql
   SELECT 
     recipient,
     fee_type,
     SUM(amount) as total_fees,
     COUNT(*) as fee_count
   FROM solana_staking_fees
   GROUP BY recipient, fee_type
   ORDER BY total_fees DESC;
   ```

3. **User Activity**:
   ```sql
   SELECT 
     COUNT(DISTINCT wallet) as unique_stakers,
     COUNT(*) as total_positions,
     SUM(staked_amount) as total_vdm_staked,
     AVG(staked_amount) as avg_stake
   FROM solana_staking_positions
   WHERE status = 'active';
   ```

4. **Transaction Volume**:
   ```sql
   SELECT 
     tx_type,
     COUNT(*) as tx_count,
     SUM(vdm_amount) as total_vdm,
     SUM(fee_amount) as total_fees
   FROM solana_staking_transactions
   GROUP BY tx_type;
   ```

### Set Up Alerts

1. **Backend Uptime**: Use Render/Vercel monitoring
2. **Cron Job**: Set email notifications on cron-job.org
3. **Error Logs**: Monitor backend logs for errors
4. **TVL Tracking**: Query pool stats daily

---

## 6️⃣ Announcement to VDM Community

Once testing is complete:

### Twitter/X Post Template

```
🎉 VDM x DecaFlow Staking is Now LIVE!

Stake your $VDM tokens and earn up to 16% APY 💰

✅ VDM/SOL Pool: 18.5% base APY
✅ VDM/USDC Pool: 15.2% base APY
✅ Daily auto-compound
✅ No lock periods
✅ Audited infrastructure

Stake now: https://decaflow.xyz/staking

Built on @Raydium's proven pools with @affidexlab 🚀

#VDM #Solana #DeFi #Staking
```

### Discord/Telegram Announcement

```
🚀 VDM STAKING IS LIVE!

We're excited to announce our partnership with Affidex Lab (@decaflow.xyz)!

🔥 What's Available:
• VDM/SOL Pool: 18.5% APY
• VDM/USDC Pool: 15.2% APY
• Daily compounding rewards
• Flexible staking (no locks)

💎 How It Works:
1. Visit https://decaflow.xyz/staking
2. Connect Phantom/Solflare wallet
3. Choose your pool
4. Stake & earn!

🛡️ Security:
• Built on Raydium's audited pools
• Non-custodial (you keep your keys)
• Transparent fee structure

📊 Fees:
• 2.5% deposit (one-time)
• 1.5% withdrawal (one-time)
• 10% performance fee (ongoing)

💰 Net APY: 14-16% after fees

Join us in bringing DeFi utility to VDM! 🚀

Questions? Ask in #staking-support
```

---

## 7️⃣ Next Steps After Launch

### Week 1
- [ ] Monitor first 10 stakers
- [ ] Track TVL growth
- [ ] Verify cron job runs daily
- [ ] Collect user feedback
- [ ] Fix any bugs

### Week 2-4
- [ ] Analyze staking patterns
- [ ] Optimize APY if needed
- [ ] Create staking tutorial video
- [ ] Add staking stats to Analytics page
- [ ] Share revenue report with VDM

### Month 2-3
- [ ] Evaluate additional pools (VDM/USDT)
- [ ] Consider governance integration
- [ ] Explore cross-chain staking
- [ ] Partner expansion (use VDM as case study)

---

## 🆘 Emergency Contacts

**Backend Issues**:
- Check Vercel/Render logs
- Email: team@decaflow.xyz

**Database Issues**:
- Check PostgreSQL connection
- Verify schema migrations ran

**Frontend Issues**:
- Check Vercel deployment logs
- Verify env variables set

**Cron Job Issues**:
- Check cron-job.org dashboard
- Test manually: `POST /admin/update-rewards`

---

## ✅ Deployment Checklist

Before going live:

- [ ] Backend deployed to production
- [ ] Database tables created
- [ ] Cron job set up and tested
- [ ] Frontend deployed with Solana packages
- [ ] Mainnet test transaction successful
- [ ] Pool stats API working
- [ ] Positions API working
- [ ] Navigation links visible
- [ ] Wallet connection working
- [ ] Fee calculations correct
- [ ] Monitoring set up
- [ ] Announcement prepared

---

**Ready to launch! 🚀**

If you encounter any issues during deployment, check the logs and refer to the troubleshooting sections above.
