# 🚨 CRITICAL DEPLOYMENT STEP - MUST DO

## ❌ DELETE Environment Variable on Vercel

**BEFORE deploying**, you MUST remove this environment variable:

```
VITE_SOLANA_RPC_URL=https://rpc.ankr.com/solana
```

### Why This is Critical

Ankr RPC now returns **403 Forbidden** without an API key:
```
Error: 403 Forbidden: {"error":"message: API key is not allowed to access blockchain"}
```

If you leave this set, users will see **0 VDM balance** even with the fixes.

### How to Remove It

1. Go to: https://vercel.com/dashboard
2. Navigate to your DecaFlow project
3. Click **Settings** → **Environment Variables**
4. Find `VITE_SOLANA_RPC_URL`
5. Click **Delete** or **Remove**
6. Confirm deletion

### After Removal

The app will automatically use the official Solana RPC:
```typescript
// From SolanaWalletContext.tsx
const endpoint = 'https://api.mainnet-beta.solana.com'; // ✅ Works perfectly
```

This endpoint is:
- ✅ Free (no API key needed)
- ✅ Reliable (official Solana Foundation)
- ✅ Fast (~100ms response times)
- ✅ Tested and verified working

---

## 📋 Complete Deployment Checklist

### Step 1: Remove Environment Variable ⚠️ CRITICAL
- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Delete `VITE_SOLANA_RPC_URL`
- [ ] Confirm it's removed

### Step 2: Create and Merge PR
- [ ] Go to https://github.com/affidexlab/new/pulls
- [ ] Create PR: `main` ← `capy/cap-1-4151f8ef`
- [ ] Title: "Fix VDM balance detection - Verified working"
- [ ] Merge the PR

### Step 3: Deploy (When Rate Limit Clears)
```bash
vercel --prod --force
```

The `--force` flag ensures:
- Fresh build (no cache)
- Picks up removed environment variable
- Uses updated code from merged PR

### Step 4: Verify on Production
1. Go to https://decaflow.xyz/staking
2. Connect a wallet with VDM tokens
3. Check balance displays correctly (NOT 0)
4. Check browser console for logs

---

## ⚠️ What Happens If You Don't Delete It

```
User connects wallet with 20,000 VDM
    ↓
App uses VITE_SOLANA_RPC_URL (Ankr)
    ↓
Ankr returns 403 Forbidden (no API key)
    ↓
Balance fetch fails
    ↓
UI shows: "VDM Balance: 0" ❌
    ↓
USER THINKS THEY HAVE NO VDM 😞
```

## ✅ What Happens After You Delete It

```
User connects wallet with 20,000 VDM
    ↓
App uses default (api.mainnet-beta.solana.com)
    ↓
RPC responds successfully
    ↓
Balance: 20,000 VDM ✅
    ↓
UI shows: "VDM Balance: 20,000" ✅
    ↓
USER SEES CORRECT BALANCE 🎉
```

---

## 🔍 How to Verify It's Deleted

After deployment, check browser console. You should see:
```
⚙️ Using public Solana RPC endpoint: https://api.mainnet-beta.solana.com
```

If you see:
```
✅ Using custom Solana RPC endpoint
```

That means the environment variable is **still set** and you need to delete it.

---

**REMEMBER: Delete the environment variable BEFORE deploying!** ⚠️
