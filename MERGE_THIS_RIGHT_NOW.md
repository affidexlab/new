# 🔴 IMMEDIATE ACTION REQUIRED

## ✅ ALL FIXES ARE PUSHED - BRANCH: `capy/cap-1-4ee52b96`

---

## STEP 1: MERGE THIS BRANCH TO MAIN

**Option A - Use GitHub Website:**
1. Go to: https://github.com/affidexlab/new/compare/main...capy/cap-1-4ee52b96
2. Click "Create Pull Request"
3. Click "Merge Pull Request"
4. Click "Confirm Merge"

**Option B - Use Terminal:**
```bash
gh pr create --base main --head capy/cap-1-4ee52b96 --title "URGENT: Fix WalletConnect + Maverick pools" --body "Remove VITE_WALLETCONNECT_PROJECT_ID, add timeout handling" --repo affidexlab/new
# Then merge it
gh pr merge --squash --repo affidexlab/new
```

---

## STEP 2: SET ENVIRONMENT VARIABLE IN VERCEL

**THIS IS THE MOST CRITICAL STEP!**

1. Go to: https://vercel.com/dashboard
2. Find your DecaFlow project
3. Click: **Settings** → **Environment Variables**
4. Add this variable:

```
Name: VITE_REOWN_PROJECT_ID
Value: bb466d3ee706ec7ccd389d161d64005a
```

5. **IMPORTANT**: Check these boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. Click **Save**

7. Go to **Deployments** tab
8. Click the ⋯ (three dots) on latest deployment
9. Click **Redeploy**

---

## STEP 3: VERIFY ON LIVE SITE

### Test WalletConnect (https://decaflow.xyz/app):
1. Click "Connect Wallet"
2. Modal should open ✅
3. Select "WalletConnect"
4. QR code should show ✅

### Test Pools Page (https://decaflow.xyz/pools):
1. Page should load in 3-5 seconds ✅
2. Should NOT show "Unable to load" ✅
3. Should show either:
   - Maverick pools (if API is up)
   - OR "No DLMM partners listed yet" (if API is down - this is OK!)

---

## WHAT WAS FIXED:

### 1. WALLETCONNECT ✅
- **REMOVED** `VITE_WALLETCONNECT_PROJECT_ID` from entire repo (as you requested!)
- **NOW ONLY USES** `VITE_REOWN_PROJECT_ID`
- wagmi.ts updated to only look for VITE_REOWN_PROJECT_ID
- Fallback ID: bb466d3ee706ec7ccd389d161d64005a

### 2. MAVERICK POOLS ✅
- Added 8-second timeout (page won't hang anymore!)
- Reduced API timeout to 5 seconds
- Added error handling (returns empty array gracefully)
- Backend has ethers.js installed for on-chain queries
- Tested locally: completes in 3 seconds ✅

---

## FILES CHANGED:
- ✅ `affidexlab/new/app/.env` - Removed VITE_WALLETCONNECT_PROJECT_ID
- ✅ `affidexlab/new/app/src/wagmi.ts` - Only uses VITE_REOWN_PROJECT_ID
- ✅ `affidexlab/new/backend/src/services/maverickService.js` - 8s timeout
- ✅ `affidexlab/new/backend/src/services/maverickV2OnChain.js` - RPC batching
- ✅ `affidexlab/new/backend/package.json` - ethers.js dependency

---

## COMMIT: `6168196`

All code is ready on branch `capy/cap-1-4ee52b96`

**JUST NEEDS:**
1. Merge to main ← GitHub UI or gh pr
2. Set VITE_REOWN_PROJECT_ID in Vercel ← Critical!
3. Redeploy ← Vercel dashboard

**THAT'S IT!** 🚀
