# VDM Staking Troubleshooting Guide

## Issues Reported
1. ❌ VDM Balance showing as 0 even though wallet has VDM tokens
2. ❌ VDM Price showing as "Unavailable"

## Quick Debugging Steps

### 1. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for errors:

**Look for these specific errors:**
- `Error fetching VDM balance:` - Shows balance fetching issues
- `Error fetching VDM price:` - Shows price API issues
- `Error loading data:` - General data loading issues
- CORS errors - Backend API access issues
- RPC errors - Solana network issues

### 2. Test VDM Price API Directly

Open this URL in your browser to test the backend price endpoint:
```
https://decaflow-backend.onrender.com/v1/solana-staking/vdm-price
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "priceUsd": 0.00012345,
    "timestamp": 1704153600000,
    "source": "dexscreener"
  }
}
```

**If you get an error**, the backend may be down or the DexScreener API may be failing.

### 3. Test DexScreener API Directly

Open this URL to check if VDM has trading pairs:
```
https://api.dexscreener.com/latest/dex/tokens/B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5
```

**Expected response:**
```json
{
  "pairs": [
    {
      "pairAddress": "...",
      "baseToken": { "symbol": "VDM" },
      "priceUsd": "0.00012345",
      "liquidity": { "usd": 50000 }
    }
  ]
}
```

**If pairs array is empty**, VDM token has no liquidity pools on DexScreener.

### 4. Verify Your Wallet Has VDM Tokens

#### Option A: Check on Solscan
1. Go to https://solscan.io
2. Enter your wallet address
3. Look for token: `B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5`
4. Check if you have a balance

#### Option B: Check in Your Wallet
1. Open Phantom or Solflare wallet
2. Look for VDM token in your token list
3. Verify you have a non-zero balance

#### Option C: Run Debug Script
```bash
cd /project/workspace/affidexlab/new
node debug-vdm-staking.js YOUR_WALLET_ADDRESS
```

## Common Issues & Solutions

### Issue 1: VDM Balance Shows 0 (But You Have VDM)

**Possible Causes:**

#### A. Token Account Not Created
**Symptom**: You see VDM in your wallet, but the staking page shows 0.

**Solution**: The Associated Token Account (ATA) needs to be created. This usually happens automatically when you receive tokens, but sometimes it needs manual creation.

**Fix**:
1. Send a tiny amount of VDM to yourself (0.01 VDM)
2. This will create the ATA
3. Refresh the staking page

#### B. RPC Rate Limiting
**Symptom**: Console shows errors like "429 Too Many Requests" or timeouts.

**Solution**: The public Solana RPC is rate-limited. We need to use a better RPC endpoint.

**Fix** (Recommended): Update the Solana connection to use a better RPC:

Edit `app/src/contexts/SolanaWalletContext.tsx`:

```typescript
export const SolanaWalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Option 1: Use Helius (recommended - sign up for free at https://helius.dev)
  const endpoint = useMemo(() => 
    import.meta.env.VITE_SOLANA_RPC_URL || 
    'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY', 
    []
  );

  // Option 2: Use QuickNode (sign up at https://quicknode.com)
  // const endpoint = useMemo(() => 
  //   import.meta.env.VITE_SOLANA_RPC_URL || 
  //   'https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR-API-KEY/', 
  //   []
  // );

  // Option 3: Use Alchemy (sign up at https://alchemy.com)
  // const endpoint = useMemo(() => 
  //   import.meta.env.VITE_SOLANA_RPC_URL || 
  //   'https://solana-mainnet.g.alchemy.com/v2/YOUR-API-KEY', 
  //   []
  // );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

Then add to your `.env` file:
```bash
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

#### C. Wrong Network
**Symptom**: Wallet connected to devnet/testnet instead of mainnet.

**Solution**: Make sure your wallet is set to "Mainnet Beta" network.

**Fix**:
1. Open your Solana wallet (Phantom/Solflare)
2. Go to Settings → Network
3. Select "Mainnet Beta"
4. Refresh the staking page

### Issue 2: VDM Price Shows "Unavailable"

**Possible Causes:**

#### A. Backend API Down
**Symptom**: The backend endpoint returns an error or times out.

**Test**: Visit https://decaflow-backend.onrender.com/v1/solana-staking/vdm-price

**Solution**: 
1. Check if the backend is deployed and running
2. Check Render.com dashboard for backend status
3. Restart the backend service if needed

#### B. DexScreener Has No Data
**Symptom**: DexScreener API returns no pairs for VDM token.

**Test**: Visit https://api.dexscreener.com/latest/dex/tokens/B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5

**Solution**: 
1. Verify VDM token has active trading pairs on a DEX
2. Check if VDM is listed on Raydium, Jupiter, or Orca
3. If no pairs exist, you may need to:
   - Add liquidity to a DEX
   - Or hardcode a price temporarily
   - Or use an alternative price feed

**Temporary Fix** (Hardcode Price):

Edit `backend/src/services/solanaStakingService.js`:

```javascript
export async function getCurrentVdmPriceUsdtInfo() {
  // Try cache first
  if (vdmPriceCache.priceUsd > 0 && Date.now() - vdmPriceCache.timestamp < VDM_PRICE_CACHE_TTL) {
    return { ...vdmPriceCache };
  }

  // Try DexScreener
  try {
    const priceUsd = await getVdmPriceFromDexScreener();
    vdmPriceCache = { priceUsd, timestamp: Date.now(), source: 'dexscreener' };
    return { ...vdmPriceCache };
  } catch (error) {
    console.warn('DexScreener price fetch failed:', error?.message || error);
  }

  // TEMPORARY: Fallback to manual price (update this daily)
  // TODO: Remove this once VDM has liquidity on DEX
  const manualPrice = 0.00012; // Update this with actual VDM price
  const manualPriceAge = Date.now() - vdmPriceCache.timestamp;
  
  if (manualPriceAge > 24 * 60 * 60 * 1000) { // 24 hours
    console.warn('Manual VDM price is more than 24 hours old!');
  }
  
  return { 
    priceUsd: manualPrice, 
    timestamp: Date.now(), 
    source: 'manual-fallback' 
  };

  // Original code (keep for reference)
  // if (vdmPriceCache.priceUsd > 0) {
  //   return { ...vdmPriceCache, source: `stale:${vdmPriceCache.source}` };
  // }
  // throw new Error('Failed to fetch VDM price from DexScreener');
}
```

#### C. CORS Issues
**Symptom**: Browser console shows CORS errors when calling DexScreener or backend.

**Solution**: 
1. Backend should have CORS properly configured
2. Check if backend has these headers:
   ```javascript
   app.use(cors({
     origin: ['https://decaflow.app', 'http://localhost:3000'],
     credentials: true
   }));
   ```

### Issue 3: Connection Issues After Wallet Connect

**Symptom**: Wallet connects but no data loads.

**Solution**: Add better error handling and retry logic.

Edit `app/src/pages/SolanaStaking.tsx`:

```typescript
const loadData = async () => {
  if (!publicKey) return;
  
  console.log('🔄 Loading VDM staking data for:', publicKey.toString());
  
  try {
    const [balance, stake, stats] = await Promise.all([
      getVDMTokenBalance(connection, publicKey),
      getUserStake(connection, publicKey),
      getPoolStats(),
    ]);
    
    console.log('✅ VDM Balance:', balance);
    console.log('✅ User Stake:', stake);
    console.log('✅ Pool Stats:', stats);
    
    setVdmBalance(balance);
    setUserStake(stake);
    setPoolStatsState(stats);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    toast.error('Failed to load staking data. Please refresh and try again.');
  }
};
```

## Step-by-Step Debugging Process

1. **Open Browser Console** (F12 → Console tab)

2. **Connect Your Wallet** on the staking page

3. **Check Console Output**:
   - Look for "🔄 Loading VDM staking data"
   - Look for "✅ VDM Balance: X"
   - Look for any "❌ Error" messages

4. **Test Backend APIs**:
   - Price: https://decaflow-backend.onrender.com/v1/solana-staking/vdm-price
   - Pool Stats: https://decaflow-backend.onrender.com/v1/solana-staking/pool-stats
   - Your Stake: https://decaflow-backend.onrender.com/v1/solana-staking/stake-info?wallet=YOUR_WALLET

5. **Verify VDM Token**:
   - Check on Solscan: https://solscan.io/token/B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5
   - Check your wallet balance
   - Verify you're on Mainnet (not devnet/testnet)

6. **Run Debug Script**:
   ```bash
   cd /project/workspace/affidexlab/new
   node debug-vdm-staking.js YOUR_WALLET_ADDRESS
   ```

## Recommended Solutions Priority

### High Priority (Fix Now)

1. **Switch to Better RPC Endpoint**
   - Sign up for Helius (free tier: 100k requests/day)
   - Update `SolanaWalletContext.tsx` with new RPC URL
   - Add `VITE_SOLANA_RPC_URL` to environment variables

2. **Add Logging to Frontend**
   - Add console.log statements to track data loading
   - Help identify where the failure occurs

3. **Test Backend Endpoints**
   - Ensure backend is deployed and accessible
   - Verify DexScreener integration works

### Medium Priority (Fix Soon)

1. **Add Retry Logic**
   - Retry failed RPC calls automatically
   - Implement exponential backoff

2. **Add Loading States**
   - Show "Loading balance..." instead of "0"
   - Show "Fetching price..." instead of "Unavailable"

3. **Implement Price Fallback**
   - If DexScreener fails, use manual price
   - Set up alerts when price is outdated

### Low Priority (Nice to Have)

1. **Add Health Check Endpoint**
   - Create `/health` endpoint that tests all dependencies
   - Monitor RPC connection, DexScreener API, Database

2. **Implement Caching**
   - Cache VDM balance for 30 seconds
   - Cache price for 1 minute
   - Reduce API calls

3. **Add Retry Button**
   - Let users manually retry data loading
   - Show clear error messages

## Need More Help?

Run the debug script and share the output:

```bash
cd /project/workspace/affidexlab/new
node debug-vdm-staking.js YOUR_WALLET_ADDRESS > debug-output.txt
```

Then share `debug-output.txt` for analysis.
