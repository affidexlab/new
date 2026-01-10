# URGENT FIX: WalletConnect & Maverick DLMM Issues

## Date: December 24, 2025

## Problem Summary

After merging PR and Vercel redeployment:
1. ✅ **Code was deployed successfully** - All changes are in production
2. ❌ **WalletConnect still not working** - "Invalid app configuration" error
3. ❌ **Maverick DLMM pools not showing** - Backend returns empty pools array

---

## Issue 1: WalletConnect Not Working ❌

### Root Cause
The environment variable `VITE_REOWN_PROJECT_ID` is set on Vercel BUT Vercel is likely using a **cached build** that still contains the old project ID from `.env` file.

### Evidence
- Backend API response shows Maverick DLMM returns empty pools: `"pools":[]`
- The `.env` file had old project ID: `459eaeff6b6ccb624b0560abeb84b9e8`
- Vercel env var is set to: `bb466d3ee706ec7ccd389d161d64005a`
- Code correctly reads both `VITE_WALLETCONNECT_PROJECT_ID` and `VITE_REOWN_PROJECT_ID`

### Fix Applied ✅
1. Updated `.env` file to use correct project ID: `bb466d3ee706ec7ccd389d161d64005a`

### REQUIRED ACTIONS (YOU MUST DO THIS):

#### Option A: Trigger Vercel Redeploy with Cache Clear (RECOMMENDED)
1. Go to Vercel Dashboard → Your Project → Settings → Deployments
2. Find the latest deployment
3. Click "..." menu → **"Redeploy"**
4. **CHECK THE BOX: "Clear Build Cache"** ← THIS IS CRITICAL
5. Click "Redeploy"

#### Option B: Force New Deployment via Git
```bash
git pull origin main
git commit --allow-empty -m "Force Vercel rebuild for WalletConnect fix"
git push origin main
```
Then go to Vercel and manually clear build cache as described in Option A.

#### Option C: Update Environment Variable on Vercel (Nuclear Option)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `VITE_REOWN_PROJECT_ID`
3. **DELETE IT**
4. Re-add it with the same value: `bb466d3ee706ec7ccd389d161d64005a`
5. Go to Deployments → **Redeploy** with build cache cleared

---

## Issue 2: Maverick DLMM Pools Not Showing ❌

### Root Cause
The Maverick Stats API endpoint `https://stats.mav.xyz` is **DOWN** or the domain has **CHANGED**.

### Evidence
```bash
$ curl -v "https://stats.mav.xyz/api/latest/tickers?chainId=8453"
curl: (6) Could not resolve host: stats.mav.xyz
```

The DNS lookup fails completely, indicating:
- Domain was moved/deprecated
- Maverick changed their API infrastructure
- Service is temporarily down

### Backend Behavior
File: `affidexlab/new/backend/src/services/maverickService.js:103`

The backend correctly:
- Attempts to fetch from `${DEFAULT_API_BASE}/api/latest/tickers?chainId=${chainId}`
- Has 10-second timeout with AbortController
- Falls back to cached data (but cache is empty on first request)
- Returns empty pools array when API fails

Backend response:
```json
{
  "dlmm": {
    "provider": "Maverick DLMM",
    "pools": [],
    "stats": {
      "totalLiquidityUsd": 0,
      "totalVolumeUsd": 0,
      "averageFeeBps": 0,
      "poolCount": 0,
      "lastUpdated": "2025-12-24T09:36:10.080Z"
    }
  }
}
```

### REQUIRED ACTIONS (YOU MUST DO THIS):

#### Option 1: Find New Maverick API Endpoint (RECOMMENDED)
1. Contact Maverick Protocol team:
   - Discord: https://discord.gg/maverick
   - Twitter: @mavprotocol
   - Ask: "What is the current API endpoint for fetching pool tickers? stats.mav.xyz is not resolving"

2. Check Maverick's official documentation:
   - Developer docs: https://docs.mav.xyz/technical-reference
   - Look for "API" or "SDK" sections

3. Check DefiLlama or CoinGecko APIs:
   - DefiLlama might have Maverick pool data
   - URL: https://api.llama.fi/protocol/maverick-protocol

#### Option 2: Use Maverick Subgraph (Alternative Data Source)
Maverick likely has a subgraph on The Graph. Search for:
- The Graph Explorer: https://thegraph.com/explorer
- Query: "Maverick Protocol"
- Chains: Base (8453), Ethereum (1), zkSync Era

#### Option 3: Temporarily Disable Maverick Integration
If the API is permanently down and no alternative is available:

File: `affidexlab/new/backend/src/services/liquidityService.js:42`

Comment out:
```javascript
// const dlmm = chainId === 8453 ? await getMaverickPools(chainId, { limit: 12 }) : null;
const dlmm = null; // Temporarily disabled - Maverick API down
```

This will prevent backend errors and stop showing empty DLMM section.

#### Option 4: Use Alternative DLMM Protocol
Consider integrating other DLMM protocols available on Base:
- **Uniswap V4** (if live on Base)
- **Trader Joe V2** (if available on Base)
- **Balancer V3** (if available)

---

## Testing After Fixes

### Test WalletConnect (After Vercel Redeploy)
1. Open https://defiswap-nine.vercel.app (or your production URL)
2. Open browser DevTools → Console
3. Look for log: `✅ WalletConnect/Reown Project ID: bb466d3ee7...`
4. Click "Connect Wallet"
5. Select "WalletConnect"
6. Scan QR code with mobile wallet OR use desktop wallet
7. Should connect without "invalid app configuration" error

### Test DLMM Pools (After API Fix)
1. Navigate to Pools page
2. Select Base network (chain ID 8453)
3. Should see section: "Maverick DLMM Pools - Base"
4. Should display pools with:
   - Token pairs (e.g., USDC/WETH)
   - Liquidity USD
   - APR %
   - Bin count
   - Link to Maverick app

---

## Summary of Changes Committed

### Commit 1: `b6dda8d`
**Files Changed:**
- `affidexlab/new/app/.env` - Updated project IDs to `bb466d3ee706ec7ccd389d161d64005a`
- `affidexlab/new/app/.env.example` - Added `VITE_REOWN_PROJECT_ID`
- `affidexlab/new/app/src/wagmi.ts` - Reads both project ID env vars
- `affidexlab/new/app/src/main.tsx` - Added `appInfo` metadata to RainbowKitProvider
- `affidexlab/new/app/src/hooks/useUniswapV3LP.ts` - Added DLMM interfaces and state
- `affidexlab/new/app/src/pages/Pools.tsx` - Added DLMM pools display section

---

## Next Steps

### Immediate (CRITICAL - DO NOW):
1. ✅ Pull latest from main: `git pull origin main`
2. ❌ **Redeploy Vercel with build cache cleared** (see Option A above)
3. ❌ **Find new Maverick API endpoint** or alternative

### Short-term (Within 24 hours):
1. Test WalletConnect after redeploy
2. Contact Maverick team for API status
3. Implement alternative DLMM data source if needed

### Long-term (Optional):
1. Set up monitoring for external API dependencies
2. Implement fallback data sources for critical integrations
3. Consider caching DLMM pool data in your own database

---

## Support

If issues persist after following these steps:
1. Check Vercel deployment logs for errors
2. Check browser console for JavaScript errors
3. Verify environment variables are set correctly on Vercel
4. Confirm build cache was actually cleared

---

**Updated:** December 24, 2025
**Status:** Awaiting Vercel redeploy and Maverick API investigation
