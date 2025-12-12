# Contract Update & Deployment Guide

## ✅ Step 1: Merge the PR

**PR Link:** https://github.com/affidexlab/new/pull/new/capy/fee-update-1-5-percent

**Changes in this PR:**
- ✅ Platform fee updated from 0.8% to 1.5%
- ✅ Gas calculation optimized for L2 chains (Base: $0.15 instead of $24)
- ✅ Contract update script created
- ✅ Deployment scripts updated with new fee rate

**Action:** Merge this PR to main branch

---

## 🔧 Step 2: Update Deployed Contracts

After merging, we need to update the fee rate on your already-deployed LiquidityRouter contracts.

### Prerequisites

1. **Your deployer wallet private key** (the wallet that deployed the contracts)
2. **Node.js** installed

### Setup Environment

```bash
cd /project/workspace/affidexlab/new/affidexlab/new/contracts

# Create .env file with your private key
echo "DEPLOYER_PRIVATE_KEY=your_private_key_here" > .env

# Or edit .env.example and rename it
cp .env.example .env
# Then edit .env with your actual private key
```

⚠️ **SECURITY NOTE:** Never commit your .env file! It's already in .gitignore.

### Install Dependencies (if needed)

```bash
npm install
```

### Run the Update Script

```bash
node update_fee_rate.js
```

This will update the fee rate on:
- ✅ Base (Chain ID: 8453)
- ✅ Arbitrum (Chain ID: 42161)
- ✅ Optimism (Chain ID: 10)
- ✅ Polygon (Chain ID: 137)

### Expected Output

```
╔═══════════════════════════════════════════════════════════════╗
║     DecaFlow Platform Fee Rate Update Script                  ║
║     Updating from 0.8% (80 bps) to 1.5% (150 bps)             ║
╚═══════════════════════════════════════════════════════════════╝

============================================================
Updating fee rate on Base (Chain ID: 8453)
Router Address: 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
============================================================

Using wallet: 0x...

1. Checking contract owner...
   Contract owner: 0x...
   Your wallet: 0x...

2. Checking current fee rate...
   Current fee rate: 80 bps (0.8%)

3. Updating fee rate to 150 bps (1.5%)...
   Transaction hash: 0x...
   Waiting for confirmation...
   ✓ Transaction confirmed in block ...

4. Verifying update...
   New fee rate: 150 bps (1.5%)

   ✅ SUCCESS: Fee rate updated successfully on Base!

[... repeats for each chain ...]

╔═══════════════════════════════════════════════════════════════╗
║                        SUMMARY                                 ║
╚═══════════════════════════════════════════════════════════════╝

   Base            ✅ SUCCESS
   Arbitrum        ✅ SUCCESS
   Optimism        ✅ SUCCESS
   Polygon         ✅ SUCCESS

🎉 All contracts updated successfully!
```

---

## 🚀 Step 3: Deploy Frontend

### Build the Frontend

```bash
cd /project/workspace/affidexlab/new/affidexlab/new/app

# Install dependencies (if needed)
npm install

# Build for production
npm run build
```

### Check Build Output

The build should complete successfully and create a `dist` folder with your production files.

### Deploy to Production

Depending on your hosting:

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy
vercel --prod
```

Or use the Vercel GitHub integration - it will auto-deploy when you merge to main.

#### Option B: Manual Deployment

```bash
# The built files are in the dist folder
cd dist

# Upload these files to your hosting provider (Netlify, AWS S3, etc.)
```

### Environment Variables

Make sure your production environment has:

```env
VITE_TREASURY_WALLET=0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901
```

---

## 🧪 Step 4: Test Everything

### Test Swap on Base

1. Go to https://decaflow.xyz/app
2. Connect your wallet
3. Switch to Base network
4. Enter swap: 0.00195 ETH → USDC

### Expected Results:

✅ **Route:** "Aerodrome Stable" (not 0x)  
✅ **Network Fee:** ~$0.15 (not $24.29!)  
✅ **Platform Fee:** 0.0000293 ETH (1.5% of 0.00195)  
✅ **Minimum Received:** ~6.22 USDC

### Verify Fee Collection

After executing a few swaps, check your treasury wallet:
- **Address:** 0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901
- Should show incoming transactions with 1.5% of each swap

---

## 📊 Contract Addresses

### LiquidityRouter (Updated to 1.5% fee)

| Chain      | Chain ID | Address                                      |
|------------|----------|----------------------------------------------|
| Base       | 8453     | `0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4` |
| Arbitrum   | 42161    | `0xDE8700785C7512a8397683A9BE9717B0aFdB18F3` |
| Optimism   | 10       | `0xA2fdf81b7967e7FA7610DeBe1901A40686c48992` |
| Polygon    | 137      | `0xFd05977256E8D5753728C78A3003BC3B75Fef1DD` |

### Treasury Wallet

**Address:** `0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901`

All platform fees (1.5% of every swap, bridge, liquidity operation) go here.

---

## ❓ Troubleshooting

### "You are not the owner of this contract!"

**Solution:** Make sure you're using the same wallet that deployed the contracts. Check the deployer address in your deployment logs.

### "DEPLOYER_PRIVATE_KEY not found"

**Solution:** Create a `.env` file in the contracts directory with your private key:
```bash
echo "DEPLOYER_PRIVATE_KEY=your_private_key_here" > .env
```

### Build fails with "out of memory"

**Solution:** Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Vercel deployment shows old code

**Solution:** Clear cache and redeploy:
```bash
vercel --prod --force
```

---

## 📋 Checklist

- [ ] PR merged to main
- [ ] Contract update script run successfully on all 4 chains
- [ ] Frontend built successfully
- [ ] Frontend deployed to production
- [ ] Test swap completed on Base with expected fees
- [ ] Treasury wallet receiving fees confirmed

---

## 🎉 Success Metrics

After deployment, you should see:

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Network Fee (Base) | $24.29 | ~$0.15 | ✅ 99.4% reduction |
| Platform Fee | 0.8% | 1.5% | ✅ Correct |
| Route | 0x Aggregator | Aerodrome Direct | ✅ Optimized |
| Gas Estimate | ~500k | ~150k | ✅ Efficient |

---

**Questions?** Check the logs or reach out for support!

**Last Updated:** December 12, 2025
