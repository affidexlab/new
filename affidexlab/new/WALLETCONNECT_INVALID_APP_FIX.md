# Fix "Invalid App Configuration" Error

## Problem
WalletConnect shows "Invalid App Configuration" error even with correct project ID.

## Root Cause
The WalletConnect Cloud project settings don't match your deployed application's domain and configuration.

---

## ✅ Step-by-Step Fix

### 1. Go to WalletConnect Cloud Dashboard
Visit: https://cloud.walletconnect.com/app

### 2. Select Your DecaFlow Project
Click on your project to open settings

### 3. Configure **Allowed Domains**

In the **Allowed Origins** section, add these **EXACT** domains:

```
https://decaflow.xyz
https://www.decaflow.xyz
https://decaflow.vercel.app
http://localhost:5173
http://localhost:3000
```

**Important:** 
- ✅ Include BOTH `decaflow.xyz` AND `www.decaflow.xyz`
- ✅ Include your Vercel preview URLs if testing
- ✅ Use `https://` for production domains
- ❌ Do NOT include trailing slashes
- ❌ Do NOT use wildcards unless necessary

### 4. Configure **App Information**

Make sure these are filled in:

**Homepage URL:**
```
https://decaflow.xyz
```

**App Name:**
```
DecaFlow
```

**App Description:**
```
Multi-chain DEX aggregator and cross-chain bridge platform powered by Base
```

**App Icon URL:** (Optional but recommended)
```
https://decaflow.xyz/images/branding/wordmark-500.png
```

### 5. Configure **Redirect Links** (if available)

**Native Redirect:**
```
decaflow://
```

**Universal Link:**
```
https://decaflow.xyz
```

### 6. Enable Required Features

Make sure these are enabled:
- ✅ **Sign** - For wallet authentication
- ✅ **Auth** - For session management
- ✅ **Push** (optional) - For notifications
- ✅ **Web3Inbox** (optional)

### 7. **SAVE CHANGES**
Click **Save** or **Update Project** button

---

## 🔍 Verify Configuration

### Check 1: Domain Verification
In WalletConnect Cloud dashboard, verify:
- ✅ `decaflow.xyz` is in allowed origins
- ✅ `www.decaflow.xyz` is in allowed origins
- ✅ No typos in domain names
- ✅ All domains use `https://` (not `http://`)

### Check 2: Vercel Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```
VITE_WALLETCONNECT_PROJECT_ID = [your-actual-project-id]
```

Make sure:
- ✅ Variable name is EXACTLY `VITE_WALLETCONNECT_PROJECT_ID`
- ✅ Value is your actual project ID (no quotes, no spaces)
- ✅ Applied to Production, Preview, AND Development
- ✅ No extra characters or line breaks

### Check 3: Local Testing
Update your local `.env` file:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
```

Test locally:
```bash
cd /project/workspace/affidexlab/new/affidexlab/new/app
npm run dev
```

Open browser console and check for:
- ❌ "Invalid App Configuration" → Still misconfigured
- ✅ No WalletConnect errors → Working!

---

## 🚨 Common Mistakes That Cause This Error

### ❌ Wrong Domain Format
```
// WRONG - Missing protocol
decaflow.xyz

// WRONG - Trailing slash
https://decaflow.xyz/

// WRONG - Including www but accessing without www
Allowed: https://www.decaflow.xyz
Actual: https://decaflow.xyz (NOT ALLOWED!)

// ✅ CORRECT - Add BOTH
https://decaflow.xyz
https://www.decaflow.xyz
```

### ❌ Missing Vercel Preview Domains
If testing on Vercel preview deployments, add:
```
https://decaflow-git-[branch-name]-[your-vercel-username].vercel.app
https://[your-project]-[hash].vercel.app
```

Or use wildcard (if WalletConnect supports it):
```
https://*.vercel.app
```

### ❌ Cached Configuration
After making changes:
1. Wait 1-2 minutes for changes to propagate
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Try connecting wallet again

---

## 🧪 Testing After Configuration

### Test 1: MetaMask (Should Still Work)
1. Click "Connect Wallet"
2. Select MetaMask
3. Approve connection
4. ✅ Should connect successfully

### Test 2: Coinbase Wallet
1. Click "Connect Wallet"
2. Select Coinbase Wallet
3. ✅ Should now connect (previously broken)

### Test 3: WalletConnect QR Code
1. Click "Connect Wallet"
2. Select "WalletConnect"
3. QR code should appear
4. Scan with mobile wallet (Trust, Rainbow, etc.)
5. ✅ Should connect without "Invalid App Configuration" error

### Test 4: Mobile Wallets
1. Open on mobile device
2. Click "Connect Wallet"
3. Select any wallet (Rainbow, Trust, MetaMask Mobile, etc.)
4. ✅ Should connect properly

---

## 📸 Screenshot of Correct WalletConnect Cloud Settings

Your WalletConnect Cloud project should show:

```
Project Name: DecaFlow
Project ID: [your-project-id]

ALLOWED ORIGINS:
✓ https://decaflow.xyz
✓ https://www.decaflow.xyz
✓ https://decaflow.vercel.app
✓ http://localhost:5173

HOMEPAGE URL:
https://decaflow.xyz

APP METADATA:
Name: DecaFlow
Description: Multi-chain DEX aggregator and cross-chain bridge platform
Icon: https://decaflow.xyz/images/branding/wordmark-500.png
```

---

## 🔧 Still Not Working?

### Debug Checklist:

1. **Double-check project ID is correct**
   ```bash
   # In browser console on decaflow.xyz:
   console.log(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID)
   ```

2. **Verify domains match EXACTLY**
   - Go to https://decaflow.xyz
   - Check URL bar - is it `www.decaflow.xyz` or `decaflow.xyz`?
   - Make sure BOTH are in WalletConnect Cloud allowed origins

3. **Check browser console for specific errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for WalletConnect errors
   - Share error message for further help

4. **Try incognito/private browsing**
   - Sometimes browser cache causes issues
   - Test in incognito mode to rule out cache problems

5. **Wait for DNS/CDN propagation**
   - After deploying on Vercel, wait 5-10 minutes
   - Cloudflare/Vercel CDN needs time to propagate changes

6. **Contact WalletConnect Support**
   - If all else fails: https://support.walletconnect.com
   - Provide your project ID and domain for specific help

---

## 📝 Quick Reference: What Goes Where

### In WalletConnect Cloud:
- **Allowed Origins:** `https://decaflow.xyz`, `https://www.decaflow.xyz`
- **Homepage URL:** `https://decaflow.xyz`
- **App Name:** `DecaFlow`

### In Vercel Environment Variables:
- **Key:** `VITE_WALLETCONNECT_PROJECT_ID`
- **Value:** Your actual project ID from WalletConnect Cloud

### In Local `.env`:
- **Line:** `VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here`

### In Code (wagmi.ts):
- **Already fixed!** ✅ Includes all required metadata

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ No "Invalid App Configuration" error
- ✅ WalletConnect QR code appears instantly
- ✅ Mobile wallets can scan and connect
- ✅ Coinbase Wallet connects properly
- ✅ All wallets show in the connection modal

---

## 🎯 Most Common Solution

**90% of the time, the issue is:**

You added `https://decaflow.xyz` to allowed origins, but your site redirects to `https://www.decaflow.xyz` (or vice versa).

**Fix:** Add BOTH versions to WalletConnect Cloud allowed origins!

```
✅ https://decaflow.xyz
✅ https://www.decaflow.xyz
```

Then redeploy and test. This solves most "Invalid App Configuration" errors.
