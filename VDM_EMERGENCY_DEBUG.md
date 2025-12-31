# VDM BALANCE FIX - EMERGENCY INSTRUCTIONS

## IMMEDIATE ACTION REQUIRED

Copy and paste this into your browser console when on the VDM Staking page:

```javascript
// VDM Balance Emergency Checker
(async function() {
    console.clear();
    console.log('%c🚨 VDM BALANCE EMERGENCY CHECKER', 'color: red; font-size: 20px; font-weight: bold');
    
    // Check 1: Is Solana Web3 available?
    if (typeof window.solanaWeb3 === 'undefined') {
        console.log('%c❌ Solana Web3 NOT loaded', 'color: red; font-size: 16px');
        console.log('The app is broken. Solana library is missing.');
        return;
    }
    
    console.log('%c✅ Solana Web3 loaded', 'color: green');
    
    // Check 2: Test direct balance fetch
    try {
        const VDM = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';
        const WALLET = '3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk';
        
        console.log('🔄 Testing balance fetch...');
        const conn = new window.solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
        const wallet = new window.solanaWeb3.PublicKey(WALLET);
        const vdmMint = new window.solanaWeb3.PublicKey(VDM);
        
        const accounts = await conn.getParsedTokenAccountsByOwner(
            wallet,
            { programId: window.solanaWeb3.TOKEN_PROGRAM_ID }
        );
        
        console.log(`📊 Found ${accounts.value.length} token accounts`);
        
        let found = false;
        accounts.value.forEach(acc => {
            const info = acc.account.data.parsed.info;
            if (info.mint === VDM) {
                found = true;
                console.log('%c🎉 VDM FOUND! Balance: ' + info.tokenAmount.uiAmount, 'color: green; font-size: 18px; font-weight: bold');
            }
        });
        
        if (!found) {
            console.log('%c❌ VDM NOT FOUND', 'color: red; font-size: 16px');
        }
        
    } catch (err) {
        console.log('%c❌ ERROR: ' + err.message, 'color: red; font-size: 16px');
    }
    
    console.log('%c\n📋 SEND THIS OUTPUT TO DEVELOPER', 'color: yellow; font-size: 16px; font-weight: bold');
})();
```

## What This Does

This script will:
1. Check if Solana is properly loaded
2. Directly test fetching VDM balance
3. Tell us EXACTLY what's wrong

## Next Steps

1. Go to: https://decaflow.app/solana-staking
2. Press F12 (or long-press reload → Inspect on mobile)
3. Go to "Console" tab
4. Paste the script above
5. Press Enter
6. **Take a screenshot of ALL the output**
7. Send that screenshot back

---

## Alternative: Use Test Page

I've created a dedicated test page. After Vercel redeploys, visit:

**https://decaflow.app/vdm-test.html**

Click the "Test VDM Balance Now" button and screenshot the results.

---

## Critical Questions

1. **What URL are you accessing?**
   - decaflow.app?
   - www.decaflow.app?
   - defiswap-nine.vercel.app?
   - Something else?

2. **What wallet are you testing with?**
   - The test wallet 3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk?
   - Your own wallet?
   - If your own, what's the address?

3. **Are you seeing ANY console errors?**
   - Open browser console (F12)
   - Look for RED text
   - Screenshot it

4. **Is the wallet actually connecting?**
   - Does it show "Connected" in the wallet button?
   - Does it show your wallet address?

---

## If Test Page Shows 100k VDM But App Shows 0

This means:
- The blockchain has the tokens ✅
- The test works ✅  
- The app has a BUG ❌

In that case, there's a critical bug in how the app is calling the balance function.

---

## Emergency Contact Info

Send screenshots of:
1. The console output from the script above
2. The full browser console (all red errors)
3. The wallet connection status
4. The URL you're accessing

This will tell me EXACTLY what's broken.
