# Bridge Li.Fi Integration - Setup Guide

## Issue

Users encountering the error: **"Unable to find bridge route. Errors: Li.fi: failed to fetch"**

This occurs when the Li.Fi API rate limit is exceeded (200 requests per 2 hours for unauthenticated requests).

## Solution

Add a Li.Fi API key to increase the rate limit from **200 requests per 2 hours** to **200 requests per minute**.

---

## How to Get a Li.Fi API Key

### Step 1: Contact Li.Fi for API Access

Visit the Li.Fi documentation and request an API key:
- **Documentation**: https://docs.li.fi/integrate-li.fi-natively/authentication
- **Contact**: https://li.fi/ (look for "Get in Touch" or "Request API Key")

Alternatively, you can use Li.Fi without an API key, but you'll be subject to stricter rate limits.

### Step 2: Add API Key to Environment Variables

Once you have your API key, add it to your `.env` file:

```bash
# In /app/.env
VITE_LIFI_API_KEY=your_api_key_here
```

### Step 3: Restart Development Server

After adding the key, restart your Vite development server:

```bash
cd app
npm run dev
# or
bun run dev
```

---

## Fallback Behavior

If Li.Fi is unavailable or rate-limited, the bridge will automatically fall back to:

1. **CCTP (Circle Cross-Chain Transfer Protocol)** - for USDC transfers
2. **CCIP (Chainlink Cross-Chain Interoperability Protocol)** - for other supported tokens (WETH, LINK, etc.)

### Bridge Providers

| Provider | Tokens Supported | Speed | Cost | Rate Limit |
|----------|-----------------|-------|------|------------|
| **Li.Fi** | All tokens | Variable | Lowest | 200/2hrs (no key) or 200/min (with key) |
| **CCTP** | USDC only | 2-5 min | ~$0.10 | No limit |
| **CCIP** | WETH, LINK, USDC | 5-10 min | ~$1-5 | No limit |

---

## Testing Without API Key

If you don't have a Li.Fi API key yet, the bridge will work but with limitations:

- Rate limit: 200 requests per 2 hours
- After hitting the limit, users will see: "Li.fi: rate limit exceeded. Try again in a few minutes or use CCTP/CCIP"
- CCTP and CCIP will still work as fallbacks

---

## Troubleshooting

### Error: "Li.fi: failed to fetch"
**Cause**: Rate limit exceeded or network issue  
**Solution**: 
1. Add API key (see above)
2. Use CCTP/CCIP fallback providers
3. Wait a few minutes and try again

### Error: "Li.fi: rate limit exceeded"
**Cause**: Too many requests in 2-hour window  
**Solution**: Add API key to increase limit to 200/min

### Error: "Li.fi: service temporarily unavailable"
**Cause**: Li.Fi API is down  
**Solution**: System will automatically fallback to CCTP or CCIP

### Error: "Li.fi: no route found for this token pair"
**Cause**: Token not supported by Li.Fi  
**Solution**: System will try CCTP (for USDC) or CCIP (for supported tokens)

---

## Production Deployment

For production, ensure the API key is set in your hosting platform's environment variables:

### Vercel
```bash
vercel env add VITE_LIFI_API_KEY
```

### Railway/Render
Add `VITE_LIFI_API_KEY` in the environment variables section of your dashboard.

---

## Code Changes Made

### `/app/src/lib/bridge.ts`
- Added support for `VITE_LIFI_API_KEY` environment variable
- Improved error handling with specific messages
- Added 15-second timeout for API requests
- Better fallback logic for rate limits

### `/app/.env.example`
- Added `VITE_LIFI_API_KEY` with documentation

---

## Need Help?

If you continue experiencing issues:

1. Check the browser console for detailed error logs
2. Verify your API key is correctly set
3. Try using CCTP/CCIP directly (no Li.Fi needed)
4. Contact support: admin@affidexlab.com
