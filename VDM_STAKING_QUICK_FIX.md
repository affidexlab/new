# VDM Staking Quick Fix

## TL;DR - Most Likely Issues

Based on the symptoms (balance showing 0 and price unavailable), here are the most likely causes and quick fixes:

## Issue #1: Public Solana RPC is Rate Limited ⚡

**The Problem**: Your app uses the default public Solana RPC (`https://api.mainnet-beta.solana.com`) which is heavily rate-limited.

**The Fix**: Use a better RPC provider (takes 5 minutes)

### Quick Fix: Use Helius (Free)

1. **Sign up for Helius** (free): https://helius.dev
   - Create account
   - Create new project
   - Copy your API key

2. **Add to your environment variables** (.env file):
   ```bash
   VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE
   ```

3. **Update the context file**:

   Edit `app/src/contexts/SolanaWalletContext.tsx`:
   
   ```typescript
   export const SolanaWalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
     const endpoint = useMemo(() => 
       import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'), 
       []
     );

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

4. **Redeploy** your frontend

### Alternative RPC Providers

- **Helius** (recommended): https://helius.dev - 100k requests/day free
- **QuickNode**: https://quicknode.com - 50 requests/second free tier  
- **Alchemy**: https://alchemy.com - 300M compute units/month free

## Issue #2: VDM Token Has No Liquidity on DexScreener 💰

**The Problem**: DexScreener API returns no trading pairs for VDM token.

**Check if this is the issue**: Visit this URL in your browser:
```
https://api.dexscreener.com/latest/dex/tokens/B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5
```

If you see `"pairs": []` (empty array), then VDM has no liquidity pools.

**The Fix**: Add a fallback price

Edit `backend/src/services/solanaStakingService.js`:

Replace the `getCurrentVdmPriceUsdtInfo` function:

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

  // Fallback to manual price (update this regularly)
  // TODO: Get VDM price from your team or use a different price feed
  const FALLBACK_PRICE = parseFloat(process.env.VDM_FALLBACK_PRICE || '0.00012');
  
  console.log(`Using fallback VDM price: $${FALLBACK_PRICE}`);
  
  return { 
    priceUsd: FALLBACK_PRICE, 
    timestamp: Date.now(), 
    source: 'fallback-manual' 
  };
}
```

Add to your backend's `.env` file:
```bash
VDM_FALLBACK_PRICE=0.00012
```

Then redeploy your backend.

## Issue #3: Browser Console Errors 🔍

**Check now**: Open your browser's Developer Tools (Press F12) → Console tab

**Look for these specific errors:**

1. **"Error fetching VDM balance"** 
   - RPC issue → Use better RPC (see Issue #1)
   - Token account doesn't exist → Send yourself a tiny amount of VDM first

2. **"Error fetching VDM price"**
   - DexScreener issue → Add fallback price (see Issue #2)
   - Backend down → Check if backend is running on Render

3. **"429 Too Many Requests"**
   - Rate limited → Use better RPC (see Issue #1)

4. **"CORS error"**
   - Backend CORS not configured properly
   - Add frontend URL to backend CORS whitelist

## Quick Test Commands

### Test 1: Check Backend is Running
```bash
curl https://decaflow-backend.onrender.com/v1/solana-staking/vdm-price
```

Should return:
```json
{"success":true,"data":{"priceUsd":0.00012,"timestamp":1234567890,"source":"dexscreener"}}
```

### Test 2: Check DexScreener Has VDM Data
```bash
curl "https://api.dexscreener.com/latest/dex/tokens/B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5"
```

Should return pairs array with at least one pair.

### Test 3: Check Your Wallet on Solscan
Visit: `https://solscan.io/account/YOUR_WALLET_ADDRESS`

Look for VDM token `B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5` in token list.

## Most Likely Solution

**90% chance it's the RPC issue.** The public Solana RPC is notoriously unreliable. Switching to Helius (free) will likely fix both the balance and price issues.

### Action Plan:
1. ✅ Sign up for Helius RPC (5 min)
2. ✅ Update `SolanaWalletContext.tsx` (2 min)
3. ✅ Add `VITE_SOLANA_RPC_URL` to env (1 min)
4. ✅ Redeploy frontend (5 min)
5. ✅ Test again

**Total time: ~15 minutes**

## Still Not Working?

Run this command and share the output:

```bash
cd /project/workspace/affidexlab/new
npm install -g @solana/web3.js @solana/spl-token node-fetch
node debug-vdm-staking.js YOUR_WALLET_ADDRESS
```

This will show exactly where the problem is.
