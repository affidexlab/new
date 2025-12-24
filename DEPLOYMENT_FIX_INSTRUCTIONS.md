# URGENT FIX DEPLOYMENT INSTRUCTIONS

## Issues Fixed
1. ✅ **Maverick Pools** - Added timeout handling and improved error recovery
2. ✅ **WalletConnect** - Added fallback project ID and better validation

## Backend Changes
Modified files:
- `backend/src/services/maverickService.js` - Added 8s timeout for API calls
- `backend/src/services/maverickV2OnChain.js` - Added 8s timeout and improved RPC reliability

## Frontend Changes  
Modified files:
- `app/src/wagmi.ts` - Added fallback WalletConnect project ID and better validation

## Deployment Steps

### 1. Deploy Backend (Render)
The backend changes are already in the code. Simply redeploy:
```bash
# Backend will automatically redeploy from main branch
# OR manually trigger a deploy in Render dashboard
```

### 2. Deploy Frontend (Vercel)
The frontend changes are already in the code. Redeploy and **ensure these environment variables are set**:

**Required Environment Variables in Vercel:**
```bash
VITE_WALLETCONNECT_PROJECT_ID=bb466d3ee706ec7ccd389d161d64005a
VITE_REOWN_PROJECT_ID=bb466d3ee706ec7ccd389d161d64005a
VITE_API_BASE_URL=https://decaflow-backend.onrender.com
VITE_PARTNER_ID=tychi_prod_pk_live_8x9y2z3a4b5c6d7e
```

**How to set in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable above
3. Make sure to select "Production", "Preview", and "Development" for each
4. Redeploy the frontend

### 3. Verify Fixes

After deployment, test:

**Test Maverick Pools:**
1. Go to https://decaflow.xyz
2. Click "Explore DLMM Pools"
3. Should show Maverick pools or gracefully handle if no pools available (no more "Unable to load" error)

**Test WalletConnect:**
1. Go to https://decaflow.xyz/app
2. Click "Connect Wallet"
3. RainbowKit modal should open
4. Select WalletConnect option
5. QR code should display properly

## Technical Details

### Maverick Pools Fix
- Reduced API timeout from 10s to 5s
- Added overall timeout of 8s for entire fetch process
- Switched Base RPC from mainnet.base.org to base.llamarpc.com for better reliability
- Added proper error handling to return empty array instead of hanging

### WalletConnect Fix
- Added fallback project ID (bb466d3ee706ec7ccd389d161d64005a)
- Added validation for project ID length (must be >= 32 chars)
- Improved console logging for debugging

## Notes
- The WalletConnect project ID `bb466d3ee706ec7ccd389d161d64005a` is a default fallback
- For production, you should create your own project ID at https://cloud.walletconnect.com
- Maverick pools may still show as empty if their API is down, but it won't hang the page
- The on-chain fallback will attempt to fetch pools directly from the blockchain
