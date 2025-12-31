# VDM Staking Environment Variables

## Required Environment Variables

### Backend Environment Variables

Add these to your backend deployment (Render.com, Vercel, etc.):

```bash
# ============================================
# COINMARKETCAP API (PRIMARY PRICE SOURCE)
# ============================================
# Get from: https://pro.coinmarketcap.com
# Free plan: 10,000 calls/month
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key-here

# ============================================
# OPTIONAL: FALLBACK PRICE
# ============================================
# Manual price fallback if both CoinMarketCap and DexScreener fail
# Only used as last resort
# Update this value regularly if you use it
VDM_FALLBACK_PRICE=0.00012

# ============================================
# OPTIONAL: DEXSCREENER SPECIFIC PAIR
# ============================================
# If VDM has multiple pairs, specify which one to use
# Find pair addresses at: https://dexscreener.com
VDM_DEXSCREENER_PAIR=

# ============================================
# WALLET ADDRESSES (Already configured in code)
# ============================================
# Custodial wallet (holds staked VDM):
# EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR

# Treasury wallet (receives fees in SOL):
# 3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk

# VDM Token Contract Address:
# B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5
```

### Frontend Environment Variables

Add these to your frontend deployment (Vercel, Netlify, etc.) or `.env` file:

```bash
# ============================================
# BACKEND API
# ============================================
VITE_API_BASE_URL=https://decaflow-backend.onrender.com

# ============================================
# SOLANA RPC (HIGHLY RECOMMENDED)
# ============================================
# Default public RPC is rate-limited and unreliable
# Get free RPC from:
# - Helius: https://helius.dev (100K req/day free)
# - QuickNode: https://quicknode.com (50 req/sec free)
# - Alchemy: https://alchemy.com (300M compute units/month free)

# Helius (Recommended):
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY

# QuickNode:
# VITE_SOLANA_RPC_URL=https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR-API-KEY/

# Alchemy:
# VITE_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR-API-KEY
```

## How to Add Environment Variables

### On Render.com (Backend)

1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add key-value pairs (e.g., `COINMARKETCAP_API_KEY = your-key-here`)
6. Click **Save Changes**
7. Service will automatically redeploy

### On Vercel (Frontend)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add variables:
   - Variable Name: `VITE_SOLANA_RPC_URL`
   - Value: Your RPC URL
   - Environment: Production, Preview, Development (select all)
5. Click **Save**
6. Redeploy your site

### On Netlify (Frontend)

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Click **Edit variables**
5. Add variables
6. Click **Save**
7. Trigger new deploy

### Local Development

Create a `.env` file in your backend and frontend directories:

**Backend `.env`:**
```bash
COINMARKETCAP_API_KEY=your-key-here
VDM_FALLBACK_PRICE=0.00012
```

**Frontend `.env`:**
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

⚠️ **Important**: Never commit `.env` files to Git! They should be in `.gitignore`.

## Priority Setup (What to do first)

### 🔴 Critical (Do Immediately)

1. **VITE_SOLANA_RPC_URL** (Frontend)
   - Without this, balance fetching will fail
   - Free tier from Helius is sufficient
   - Takes 5 minutes to setup

2. **COINMARKETCAP_API_KEY** (Backend)
   - Without this, price will fall back to DexScreener
   - Free tier is sufficient
   - Takes 5 minutes to setup

### 🟡 Important (Do Soon)

3. **VITE_API_BASE_URL** (Frontend)
   - Probably already configured
   - Should point to your backend URL

### 🟢 Optional (Nice to Have)

4. **VDM_FALLBACK_PRICE** (Backend)
   - Only needed if both CoinMarketCap and DexScreener fail
   - Emergency fallback
   - Update manually if used

5. **VDM_DEXSCREENER_PAIR** (Backend)
   - Only if VDM has multiple trading pairs
   - Helps get more accurate price

## Testing Your Configuration

### Test 1: Check Backend Price API

```bash
curl https://decaflow-backend.onrender.com/v1/solana-staking/vdm-price
```

**Expected output:**
```json
{
  "success": true,
  "data": {
    "priceUsd": 0.00012345,
    "timestamp": 1704153600000,
    "source": "coinmarketcap"
  }
}
```

If `source` is `"dexscreener"`, CoinMarketCap API key is not configured or not working.

### Test 2: Check Frontend RPC

1. Open your staking page
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Connect your Solana wallet
5. Look for logs like:
   ```
   Using custom Solana RPC endpoint
   🔄 Loading VDM staking data for wallet: YOUR_WALLET
   💰 VDM Balance: 1000.00
   ```

If you see "Using default public Solana RPC", the `VITE_SOLANA_RPC_URL` is not configured.

### Test 3: Full Integration Test

1. Open staking page with F12 console open
2. Connect Solana wallet with VDM tokens
3. Check console for:
   - ✅ "Using custom Solana RPC endpoint"
   - ✅ "VDM Balance: X.XX"
   - ✅ "VDM price loaded: 0.00012345 USD (source: coinmarketcap)"

All three should show success messages.

## Troubleshooting

### "Balance showing 0"

**Likely cause**: `VITE_SOLANA_RPC_URL` not configured.

**Solution**:
1. Sign up for Helius: https://helius.dev
2. Get API key
3. Add `VITE_SOLANA_RPC_URL` to frontend env
4. Redeploy

### "Price showing Unavailable"

**Likely cause**: `COINMARKETCAP_API_KEY` not configured.

**Solution**:
1. Sign up for CoinMarketCap: https://pro.coinmarketcap.com
2. Get API key
3. Add `COINMARKETCAP_API_KEY` to backend env
4. Redeploy

**Alternative**: System will automatically fall back to DexScreener.

### "Failed to load staking data"

**Likely causes**:
1. Backend is down
2. RPC is rate-limited
3. Network issues

**Solution**:
1. Check backend is running on Render
2. Use custom RPC (not public Solana RPC)
3. Check browser console for specific errors

## Security Best Practices

### ✅ Do:
- Use environment variables for all keys
- Add `.env` to `.gitignore`
- Rotate API keys periodically
- Use different keys for dev/staging/production
- Monitor API usage

### ❌ Don't:
- Never commit API keys to Git
- Never expose keys in frontend code
- Never log API keys
- Never share API keys publicly
- Never hardcode sensitive values

## Quick Start Summary

For a working VDM staking setup, you need:

**Backend (Render.com):**
```
COINMARKETCAP_API_KEY=your-coinmarketcap-key
```

**Frontend (Vercel/Netlify):**
```
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-helius-key
VITE_API_BASE_URL=https://decaflow-backend.onrender.com
```

**Time to setup**: ~15 minutes
**Cost**: $0 (both have free tiers)

## Need Help?

1. Check @COINMARKETCAP_SETUP_GUIDE.md for CoinMarketCap setup
2. Check @VDM_STAKING_QUICK_FIX.md for RPC setup
3. Check @VDM_STAKING_TROUBLESHOOTING.md for debugging
4. Run `node debug-vdm-staking.js YOUR_WALLET` for detailed diagnostics
