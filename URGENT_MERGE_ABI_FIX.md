# 🔴 URGENT: You Need to Merge the ABI Fix!

## The Problem

The contract is deployed CORRECTLY, but **the frontend is using the WRONG ABI**.

Your `main` branch has the old ABI where swap functions are marked as **"nonpayable"**.  
This prevents wagmi/viem from sending ETH with the transaction, causing "execution reverted".

## The Fix (Commit 5c43146)

The branch `capy/cap-1-4a108294` has the critical fix that changes the ABI in `app/src/lib/liquidityRouter.ts`:

```diff
- stateMutability: "nonpayable",  // ❌ WRONG
+ stateMutability: "payable",     // ✅ CORRECT
```

This fix is in commit **5c43146** but NOT yet merged to main!

## What You Must Do NOW

### Option 1: Merge the PR (RECOMMENDED)
1. Go to: https://github.com/affidexlab/new/compare/main...capy/cap-1-4a108294
2. Create Pull Request
3. **Make sure it includes commit 5c43146** (the ABI fix)
4. Merge to main
5. Wait for Vercel to redeploy

### Option 2: Manual Fix (if PR doesn't work)
Edit the file `app/src/lib/liquidityRouter.ts` on main branch:

Line 115: Change `stateMutability: "nonpayable"` → `"payable"`  
Line 130: Change `stateMutability: "nonpayable"` → `"payable"`  
Line 142: Change `stateMutability: "nonpayable"` → `"payable"`

Then commit and deploy.

## Verification

After merging and deployment:
1. Check that decaflow.xyz loads the new code
2. Hard refresh your browser (Ctrl+Shift+R)
3. Try swapping ETH → USDC
4. It should work!

## Current Status

✅ Contracts deployed correctly (with payable functions)  
✅ Contract has WETH support  
✅ Contract verified on-chain  
❌ **Frontend ABI still says "nonpayable"** ← THIS IS THE BUG  

The frontend needs the ABI fix from commit 5c43146!
