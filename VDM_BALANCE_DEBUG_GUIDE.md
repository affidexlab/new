# VDM Staking - Debug & Force Refresh Instructions

## Issue
VDM balance still showing 0 after deployment.

## Root Cause Analysis

The fix IS deployed correctly in the code. The issue is likely one of:
1. **Browser cache** - Old JavaScript files are cached
2. **Vercel cache** - Deployment isn't picking up latest build
3. **Runtime error** - Something is failing silently

## Immediate Fix - Browser Console Test

Open the VDM Staking page and press **F12** to open DevTools Console, then run:

```javascript
// Clear all cache and reload
localStorage.clear();
sessionStorage.clear();
window.location.reload(true);
```

After reload, check console for these logs:
- `🔍 Fetching VDM balance for wallet:`
- `📊 Found X token accounts...`
- `✅ VDM Token found! Balance: 100000`

## If Still Showing Zero

### 1. Check Console Errors
Look for RED error messages in console. Common issues:
- RPC connection errors
- Token account fetch failures
- Wrong network selected in wallet

### 2. Verify Wallet Network
Ensure Phantom/Solflare wallet is connected to **Mainnet Beta** (not devnet/testnet).

### 3. Manual Balance Check
Run this in browser console:

```javascript
// Import Solana Web3.js from CDN first
const script = document.createElement('script');
script.src = 'https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js';
document.head.appendChild(script);

// Wait a moment, then run:
(async () => {
  const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
  const wallet = new solanaWeb3.PublicKey('3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk');
  const vdmMint = new solanaWeb3.PublicKey('B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5');
  
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    wallet,
    { programId: solanaWeb3.TOKEN_PROGRAM_ID }
  );
  
  console.log('Total token accounts:', tokenAccounts.value.length);
  
  tokenAccounts.value.forEach((acc, i) => {
    const mint = acc.account.data.parsed.info.mint;
    const balance = acc.account.data.parsed.info.tokenAmount.uiAmount;
    console.log(`Token ${i+1}: ${mint} = ${balance}`);
    
    if (mint === vdmMint.toString()) {
      console.log('✅ VDM FOUND! Balance:', balance);
    }
  });
})();
```

## Force Vercel Redeploy

If the issue persists, force a complete redeploy:

### Option 1: Via Vercel Dashboard
1. Go to Vercel dashboard
2. Select your project
3. Go to Deployments
4. Click on latest deployment
5. Click "..." menu → "Redeploy"
6. Select "Use existing build cache: OFF" ✅
7. Click "Redeploy"

### Option 2: Via Git Command
```bash
git commit --allow-empty -m "Force Vercel redeploy"
git push origin main
```

## Check Deployed Files

To verify the fix is actually deployed, check the network tab:

1. Open DevTools → Network tab
2. Refresh page
3. Find `solana-wallet-*.js` file
4. Click on it → Response tab
5. Search for "VDM_TOKEN_DECIMALS" or "pow(10"
6. If found = fix is deployed ✅
7. If not found = deployment issue ❌

## Debugging Steps

### Step 1: Check if fix is in deployed code
```bash
# From your local machine
curl -s https://decaflow.app | grep -o "solana-wallet-[a-zA-Z0-9]*.js" | head -1
# Copy the filename

curl -s https://decaflow.app/assets/[FILENAME].js | grep -c "pow(10"
# Should return > 0
```

### Step 2: Check environment variables
Ensure these are set in Vercel:
- `VITE_API_BASE_URL=https://decaflow-backend.onrender.com`
- `VITE_REOWN_PROJECT_ID=bb466d3ee706ec7ccd389d161d64005a`

### Step 3: Test with different wallet
Try connecting a different Solana wallet that has VDM tokens.

### Step 4: Check RPC endpoint
The app uses `https://api.mainnet-beta.solana.com` by default. This is a public RPC that can be rate-limited. If you see many failed requests, add a dedicated RPC:

In Vercel, add environment variable:
```
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

Or use a dedicated provider (recommended):
```
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

## Expected Behavior

When working correctly, you should see in console:

```
⚙️ Using public Solana RPC endpoint: https://api.mainnet-beta.solana.com
🔍 Fetching VDM balance for wallet: 3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
   VDM Token Address: B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5
   Detected token program: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
   Scanning primary token program...
📊 Found 1 token accounts for program Tokenkeg...
   Token: B2a9z1fw... Balance: 100000
   ✅ VDM Token found! Balance: 100000
💰 ✅ VDM Balance Total: 100,000 VDM
```

## Still Not Working?

If after all these steps it's still not working, there might be a deeper issue. Please provide:

1. Screenshot of browser console (all messages)
2. Screenshot of Network tab showing failed requests
3. Which wallet you're using (Phantom/Solflare/other)
4. Which browser (Chrome/Firefox/Brave/other)
5. Vercel deployment URL
6. Wallet address you're testing with

---

**Quick Test URL**
You can test with the wallet that has 100k VDM:
```
3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
```

Import this wallet or connect it to verify the balance shows correctly.
