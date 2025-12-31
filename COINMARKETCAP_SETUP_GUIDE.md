# CoinMarketCap API Setup Guide for VDM Price Fetching

## Overview

The VDM staking system uses **CoinMarketCap as the PRIMARY source** for fetching VDM token price, with **DexScreener as BACKUP**.

**Price Source Hierarchy:**
1. 🥇 **CoinMarketCap** (Primary)
2. 🥈 **DexScreener** (Backup)
3. 📦 **Cached Price** (Stale fallback)
4. 🔧 **Manual Fallback** (Emergency)

## Getting CoinMarketCap API Key

### Step 1: Sign Up for CoinMarketCap

1. Go to https://pro.coinmarketcap.com/signup
2. Fill out the registration form:
   - Email address
   - Password
   - Accept terms of service
3. Verify your email address

### Step 2: Choose API Plan

**Free Basic Plan** (Recommended for starting):
- ✅ 10,000 API calls per month (~333 calls/day)
- ✅ Real-time price data
- ✅ Historical data
- ✅ All major cryptocurrencies
- ✅ **No credit card required**

**Pricing:**
- **Basic (Free)**: $0/month - 10K calls/month
- **Hobbyist**: $29/month - 100K calls/month
- **Startup**: $79/month - 300K calls/month
- **Standard**: $299/month - 1M calls/month

For the VDM staking platform:
- Price refreshed every 60 seconds
- ~1,440 calls per day (1 per minute)
- **Free plan is sufficient for initial launch**
- **Upgrade to Hobbyist plan when you have more users**

### Step 3: Get Your API Key

1. Log in to https://pro.coinmarketcap.com
2. Go to **API Keys** in the left sidebar
3. Click **Copy** next to your default API key
4. Save this key securely (you'll need it for backend configuration)

**Example API Key format:**
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Step 4: Configure Backend

Add the API key to your backend environment variables:

**For Render.com (Production):**
1. Go to your backend service on Render.com
2. Navigate to **Environment** tab
3. Add new environment variable:
   ```
   Key: COINMARKETCAP_API_KEY
   Value: a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```
4. Save changes
5. Render will automatically redeploy

**For Local Development:**
Add to your `.env` file:
```bash
COINMARKETCAP_API_KEY=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**For Vercel/Netlify (if applicable):**
Add environment variable through their dashboard:
```
COINMARKETCAP_API_KEY=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Testing the Integration

### Method 1: Via Backend API

Once deployed, test your backend endpoint:
```bash
curl https://decaflow-backend.onrender.com/v1/solana-staking/vdm-price
```

**Expected response with CoinMarketCap:**
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

**If CoinMarketCap fails, falls back to DexScreener:**
```json
{
  "success": true,
  "data": {
    "priceUsd": 0.00012340,
    "timestamp": 1704153600000,
    "source": "dexscreener"
  }
}
```

### Method 2: Check Backend Logs

Look for these log messages in your backend logs:

**Success (CoinMarketCap):**
```
🔍 Fetching VDM price (CA: B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5)...
📊 Attempting CoinMarketCap (PRIMARY)...
✅ VDM price from CoinMarketCap: $0.00012345
```

**Fallback (DexScreener):**
```
🔍 Fetching VDM price (CA: B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5)...
📊 Attempting CoinMarketCap (PRIMARY)...
⚠️  CoinMarketCap price fetch failed: CoinMarketCap API key not configured
📊 Attempting DexScreener (BACKUP)...
✅ VDM price from DexScreener: $0.00012340
```

### Method 3: Direct API Test

Test CoinMarketCap API directly:
```bash
curl -H "X-CMC_PRO_API_KEY: YOUR_API_KEY" \
  "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?address=B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5&platform=solana"
```

## Monitoring API Usage

### Check Your Usage

1. Log in to https://pro.coinmarketcap.com
2. Go to **Dashboard**
3. View **API Credits Used** for current month
4. Set up alerts when approaching limit

### API Call Frequency

Current configuration:
- **Cache TTL**: 60 seconds (1 minute)
- **Expected calls**: ~1,440 per day (1 per minute)
- **Monthly calls**: ~43,200 per month
- **Free plan limit**: 10,000 per month

**⚠️ Note**: With default settings, you'll exceed the free plan limit.

### Recommendations:

**Option 1: Increase cache time** (Recommended for Free Plan)
Edit `backend/src/services/solanaStakingService.js`:
```javascript
// Change from 60 seconds to 5 minutes
const VDM_PRICE_CACHE_TTL = 300_000; // 5 minutes = 300 seconds
```

This reduces calls to:
- ~288 calls per day
- ~8,640 calls per month
- ✅ Stays within free plan limit

**Option 2: Upgrade to Hobbyist Plan** ($29/month)
- 100K calls per month
- No need to change cache settings
- More frequent price updates

**Option 3: Use DexScreener as Primary**
If VDM is not listed on CoinMarketCap yet, you can temporarily use DexScreener:
```bash
# Backend .env
COINMARKETCAP_API_KEY=  # Leave empty or remove
```

## Troubleshooting

### Error: "CoinMarketCap API key not configured"

**Cause**: Environment variable not set.

**Solution**:
1. Add `COINMARKETCAP_API_KEY` to backend environment
2. Restart/redeploy backend
3. Check logs to confirm it's working

### Error: "CoinMarketCap API error: 401"

**Cause**: Invalid or expired API key.

**Solution**:
1. Log in to CoinMarketCap dashboard
2. Verify API key is correct
3. Generate new API key if needed
4. Update environment variable

### Error: "CoinMarketCap API error: 429"

**Cause**: Rate limit exceeded (too many requests).

**Solution**:
1. Increase `VDM_PRICE_CACHE_TTL` to reduce calls
2. Check if you're making unexpected API calls
3. Consider upgrading to higher plan
4. System will automatically fall back to DexScreener

### Error: "Invalid price data from CoinMarketCap"

**Cause**: VDM token not listed on CoinMarketCap yet.

**Solution**:
1. Verify VDM is listed: https://coinmarketcap.com/currencies/vdm/ (if available)
2. Check if contract address is correct: `B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5`
3. System will automatically fall back to DexScreener
4. Consider applying to list VDM on CoinMarketCap: https://coinmarketcap.com/request/

## VDM Token on CoinMarketCap

### Is VDM Listed?

To check if VDM is currently listed on CoinMarketCap:

1. **Search by contract address:**
   - Go to https://coinmarketcap.com
   - Search for: `B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5`

2. **Search by name:**
   - Search for "VDM" or "VDM Token"
   - Filter by "Solana" blockchain

### Not Listed Yet?

If VDM is not on CoinMarketCap:

**Short-term solution:**
- System will automatically use DexScreener as backup
- No action needed from your side

**Long-term solution (Recommended):**
- Apply to list VDM on CoinMarketCap
- Visit: https://coinmarketcap.com/request/
- Benefits of listing:
  - ✅ More visibility for VDM token
  - ✅ More reliable price data
  - ✅ Increased credibility
  - ✅ Better SEO and discoverability

**Application requirements:**
- Token must be on a public blockchain (✅ Solana)
- Active trading on at least one exchange
- Official website
- Social media presence
- Project details and documentation

## API Endpoint Details

### CoinMarketCap API Structure

**Endpoint:**
```
GET https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest
```

**Parameters:**
- `address`: Token contract address
- `platform`: Blockchain platform (e.g., "solana")

**Headers:**
- `X-CMC_PRO_API_KEY`: Your API key
- `Accept`: application/json

**Response Example:**
```json
{
  "status": {
    "timestamp": "2025-01-01T12:00:00.000Z",
    "error_code": 0,
    "error_message": null
  },
  "data": {
    "123456": {
      "id": 123456,
      "name": "VDM",
      "symbol": "VDM",
      "quote": {
        "USD": {
          "price": 0.00012345,
          "volume_24h": 50000,
          "market_cap": 1234567,
          "percent_change_24h": 5.67,
          "last_updated": "2025-01-01T12:00:00.000Z"
        }
      }
    }
  }
}
```

## Best Practices

### 1. Monitor API Usage
- Check dashboard weekly
- Set up alerts for 80% usage
- Plan upgrade if consistently hitting limits

### 2. Cache Optimization
- Don't set cache too low (increases API calls)
- Don't set cache too high (price becomes stale)
- Recommended: 2-5 minutes for balance between freshness and cost

### 3. Error Handling
- Always have fallback sources (DexScreener)
- Log errors for debugging
- Never expose API key in frontend or logs

### 4. Security
- Never commit API key to Git
- Use environment variables only
- Rotate keys periodically
- Restrict API key by IP if possible (CoinMarketCap settings)

### 5. Cost Management
- Start with free plan
- Monitor actual usage for 1-2 weeks
- Upgrade only if needed
- Consider DexScreener primary if budget is tight

## Summary

### Setup Checklist

- [ ] Sign up for CoinMarketCap account
- [ ] Get API key from dashboard
- [ ] Add `COINMARKETCAP_API_KEY` to backend environment
- [ ] Redeploy backend
- [ ] Test `/v1/solana-staking/vdm-price` endpoint
- [ ] Verify logs show "CoinMarketCap (PRIMARY)"
- [ ] Monitor API usage in CoinMarketCap dashboard
- [ ] Adjust cache TTL if needed (for free plan)

### Cost Estimation

**Free Plan:**
- Cost: $0/month
- Limit: 10,000 calls/month
- With 5-minute cache: ~8,640 calls/month ✅
- **Recommended for launch**

**Hobbyist Plan:**
- Cost: $29/month
- Limit: 100,000 calls/month
- With 1-minute cache: ~43,200 calls/month ✅
- **Recommended for growth phase**

## Support

- **CoinMarketCap Support**: https://support.coinmarketcap.com
- **API Documentation**: https://coinmarketcap.com/api/documentation/v1/
- **Community**: https://t.me/CoinMarketCapAPIChat
