# How to Get Socket API Key for DecaFlow Bridge

Socket provides a bridging aggregator API that enables cross-chain token transfers through multiple bridge protocols. Here's how to get your API key:

## Method 1: Official Socket Dashboard (Recommended)

### Step 1: Visit Socket's Developer Portal
Unfortunately, Socket's bridge API key registration process is **not publicly documented** at the moment. The Socket team appears to be transitioning from their bridging service (Bungee Exchange) to focus on their new Socket Protocol (chain abstraction).

### Current Status
- **Socket Protocol** (chain abstraction): This is their new focus - currently in active development
- **Socket Bridge API** (what we need): Appears to be in a transition phase with limited documentation

## Method 2: Contact Socket Team Directly

### Option A: Discord
1. Join Socket's Discord: https://discord.gg/KMHEEMw3xU
2. Request API key access in the developer channel
3. Explain your use case (cross-chain DEX bridging)
4. They may provide you with:
   - An API key
   - Rate limits
   - Documentation links

### Option B: Twitter/X
- Reach out to [@socketprotocol](https://twitter.com/socketprotocol) on Twitter
- DM them explaining you need bridge API access for your DEX
- They may direct you to the right contact

## Method 3: Use Socket API Without Key (Limited)

Based on the code implementation, Socket API calls are attempted even without a key. However:
- **Rate limits**: Severely limited without API key
- **Functionality**: May fail frequently
- **Production use**: Not recommended

## Alternative: Socket is Optional

**Good news**: Socket is just a **fallback** option in your bridge implementation!

Your bridge system has 3 protocols:
1. **CCTP (Circle)** - Native USDC bridging (fastest, cheapest) - **No API key needed**
2. **CCIP (Chainlink)** - Secure cross-chain protocol - **No API key needed**
3. **Socket** - Aggregator fallback - *Optional, requires API key*

### Without Socket API Key
Your bridge will still work perfectly for:
- ✅ All USDC transfers (via CCTP)
- ✅ WETH, LINK, and major tokens (via CCIP)
- ❌ Socket aggregator routes (will fail gracefully)

### With Socket API Key
You get enhanced routing for:
- ✅ More token options
- ✅ Better route optimization
- ✅ Fallback for when CCTP/CCIP aren't optimal

## Recommended Action Plan

### For Launch (Without Socket)
Your app is **production-ready** without Socket API key because:
1. CCTP handles all USDC bridging (most common use case)
2. CCIP handles other major tokens
3. Socket failure is handled gracefully with try-catch

### For Future Enhancement (Add Socket)
Once you get Socket API key:
1. Add to Vercel environment variables:
   ```
   VITE_SOCKET_API_KEY=your_key_here
   ```
2. Redeploy app
3. Socket routes will automatically activate

## Testing Your Bridge

### Test CCTP (No API key needed)
```
1. Select: Arbitrum → Base
2. Token: USDC
3. Amount: 10 USDC
4. Should use: CCTP route
5. Fee: ~$0.10
6. Time: 2-5 minutes
```

### Test CCIP (No API key needed)
```
1. Select: Arbitrum → Optimism
2. Token: WETH or LINK
3. Amount: 0.1 WETH
4. Should use: CCIP route
5. Fee: ~$1-5
6. Time: 5-10 minutes
```

### Test Socket (Requires API key)
```
1. Select: Arbitrum → Polygon
2. Token: DAI or other tokens
3. Socket will be attempted
4. Falls back gracefully if no API key
```

## Code Implementation Note

Your current implementation in `app/src/lib/bridge.ts`:
```typescript
const response = await fetch(url, {
  headers: {
    "API-KEY": import.meta.env.VITE_SOCKET_API_KEY || "",
  },
});
```

This means:
- ✅ If `VITE_SOCKET_API_KEY` is set → Socket works
- ✅ If not set → Socket API call fails gracefully
- ✅ CCTP and CCIP still work regardless

## Summary

**You can launch without Socket API key!**

Your bridge is fully functional with CCTP and CCIP, which cover the majority of bridging use cases. Socket is a nice-to-have enhancement for additional routing options.

### Priority Order
1. ✅ **Launch now** with CCTP + CCIP (no API key needed)
2. 🔄 **Contact Socket team** via Discord for API key
3. 🚀 **Add Socket later** when you get the key (just add env var and redeploy)

## Additional Resources

- Socket Discord: https://discord.gg/KMHEEMw3xU
- Socket Twitter: https://twitter.com/socketprotocol
- Socket Website: https://socket.tech
- Bungee Exchange (Socket's bridge UI): https://bungee.exchange

## Contact Information

If you get a response from Socket team, add the API key to your environment variables:
```
VITE_SOCKET_API_KEY=your_socket_api_key_here
```

Good luck! 🚀
