# VDM Staking - Quick Testing Guide

## ✅ Issue Fixed
The VDM balance display issue has been fixed. Wallets with VDM tokens will now show the correct balance.

## 🧪 How to Test

### Test Wallet
Use this wallet to verify the fix:
- **Address**: `3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk`
- **Expected Balance**: 100,000 VDM
- **Token Account**: `9RvLQt3TdwSm5MYxH8Ar4xPgpsG5ytYhg63rSwUADg5a`

### Testing Steps

1. **Deploy the updated code**
   ```bash
   cd affidexlab/new/app
   git pull origin capy/cap-1-8c516f19
   npm install
   npm run build
   # Deploy to your hosting platform
   ```

2. **Open the VDM Staking Page**
   - Navigate to `/solana-staking` or your VDM staking URL
   - Open browser DevTools (Press F12)
   - Go to Console tab

3. **Connect Test Wallet**
   - Click "Connect Wallet" button
   - Select your Solana wallet (Phantom, Solflare, etc.)
   - Connect to the test wallet address above

4. **Verify Balance Display**
   - Check the UI shows: **100,000 VDM**
   - Check the console shows detailed logging like:
     ```
     🔍 Fetching VDM balance for wallet: 3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
     ✅ VDM Token found! Balance: 100000
     💰 ✅ VDM Balance Total: 100,000 VDM
     ```

5. **Test Staking (Optional)**
   - Try staking a small amount (e.g., 1,000 VDM)
   - Verify the transaction completes successfully
   - Check that the stake is registered

## 🔍 What to Look For

### ✅ Success Indicators
- Balance shows correct VDM amount (not 0)
- Console shows detailed logging
- No error messages in console
- Stake button is enabled
- Price displays correctly

### ❌ Problem Indicators
- Balance shows 0 VDM
- Console shows error messages
- RPC connection failures
- Transaction failures

## 🐛 If Issues Persist

### Check Console Logs
Look for these specific error patterns:

1. **RPC Rate Limiting**
   ```
   Error: 429 Too Many Requests
   ```
   **Solution**: Wait a few minutes or use a dedicated RPC endpoint

2. **Connection Timeout**
   ```
   Error: Connection timeout
   ```
   **Solution**: Refresh the page and try again

3. **Wrong Network**
   ```
   Error: Invalid account data
   ```
   **Solution**: Ensure wallet is connected to Solana mainnet-beta

### Quick Fixes
1. **Refresh the page**
2. **Disconnect and reconnect wallet**
3. **Clear browser cache**
4. **Try different browser**
5. **Check wallet is on mainnet-beta**

## 📊 Expected Console Output

When everything works correctly, you should see:
```
✅ Using custom Solana RPC endpoint
OR
⚙️ Using public Solana RPC endpoint: https://api.mainnet-beta.solana.com

🔍 Fetching VDM balance for wallet: 3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
   VDM Token Address: B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5
   Detected token program: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
   Scanning primary token program...
📊 Found 1 token accounts for program Tokenkeg...
   Token: B2a9z1fw... Balance: 100000
   ✅ VDM Token found! Balance: 100000
   Scanning alternative token program...
📊 Found 0 token accounts for program TokenzQd...
💰 ✅ VDM Balance Total: 100,000 VDM
```

## 🔐 Verify on Blockchain

You can independently verify the VDM balance:

1. **Solscan**
   - Visit: https://solscan.io/account/3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
   - Look for VDM token in token list

2. **DexScreener**
   - Visit: https://dexscreener.com/solana/B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5
   - Verify token exists and has liquidity

## 🚀 Next Steps After Successful Test

1. **Test with real user wallets**
2. **Monitor for any RPC issues**
3. **Consider upgrading to dedicated RPC** (Helius, QuickNode)
4. **Test full staking flow** (stake → wait → claim)

## 📝 Changes Made

### Critical Fixes
- ✅ Fixed VDM token decimals (6 instead of 9)
- ✅ Added retry logic for RPC calls
- ✅ Enhanced error handling and logging
- ✅ Improved RPC endpoint configuration

### Files Modified
- `affidexlab/new/app/src/lib/solanaStaking.ts`
- `affidexlab/new/app/src/contexts/SolanaWalletContext.tsx`

## 📞 Support

If you encounter any issues:
1. Copy the console logs
2. Take screenshots of the error
3. Note the wallet address being tested
4. Contact the development team with details

---

**Last Updated**: December 31, 2025
**Branch**: `capy/cap-1-8c516f19`
**Status**: ✅ Ready for Testing
