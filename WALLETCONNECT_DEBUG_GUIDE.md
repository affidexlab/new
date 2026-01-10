# WalletConnect "Invalid App Configuration" - Final Fix

## Issue
Domains are correctly configured in WalletConnect Cloud, but still getting "Invalid App Configuration" error.

## Root Cause Found
The issue is that the **project ID in your deployed application** might not match the project ID in WalletConnect Cloud, OR the metadata isn't being passed correctly to WalletConnect.

---

## ✅ Complete Fix (3 Steps)

### Step 1: Verify Your Project ID Matches

1. **Get your actual project ID from WalletConnect Cloud:**
   - Go to https://cloud.walletconnect.com
   - Open your "Decaflow" project
   - Copy the **exact** Project ID (should be a long string like `abc123def456...`)

2. **Check what's in your deployed site:**
   - Open https://decaflow.xyz in browser
   - Open DevTools (F12)
   - Go to Console tab
   - You should see: `✅ WalletConnect Project ID loaded: abc123def4...`
   - **The first 10 characters should match your actual project ID**

3. **If they don't match:**
   - The Vercel environment variable is wrong
   - Go to Vercel → Settings → Environment Variables
   - Find `VITE_WALLETCONNECT_PROJECT_ID`
   - **Delete it and recreate it** with the correct value
   - Redeploy

### Step 2: Update Vercel Environment Variable (Critical!)

Go to your Vercel project: https://vercel.com/[your-account]/[decaflow-project]/settings/environment-variables

**Delete the old variable and create new:**

1. Click on `VITE_WALLETCONNECT_PROJECT_ID`
2. Click "Delete"
3. Click "+ Add New"
4. **Key:** `VITE_WALLETCONNECT_PROJECT_ID`
5. **Value:** `[paste your EXACT project ID from WalletConnect Cloud]`
6. **Environments:** Check ALL THREE boxes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
7. Click "Save"

**IMPORTANT:** Copy-paste the project ID directly from WalletConnect Cloud. No spaces, no quotes, no extra characters.

### Step 3: Add BOTH Domains to Vercel

Sometimes Vercel serves your site on different domains. Check:

1. In Vercel → Settings → Domains
2. You might see:
   - `decaflow.xyz`
   - `www.decaflow.xyz`
   - `decaflow.vercel.app`
   - `decaflow-git-main-[account].vercel.app`

3. **Add ALL these domains to WalletConnect Cloud**

Go back to WalletConnect Cloud → Your Project → Domain tab:
```
decaflow.xyz
https://decaflow.xyz
www.decaflow.xyz  
https://www.decaflow.xyz
decaflow.vercel.app
https://decaflow.vercel.app
```

---

## 🧪 Debug Steps

### Debug 1: Check What Project ID Is Being Used

Add this to your browser console on https://decaflow.xyz:

```javascript
// Check if env variable is loaded
console.log('ENV:', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID);

// Check current domain
console.log('Domain:', window.location.origin);
```

**Expected output:**
```
ENV: abc123def456...  ← Should match WalletConnect Cloud
Domain: https://decaflow.xyz  ← Should be in WalletConnect Cloud allowed domains
```

### Debug 2: Network Tab

1. Open DevTools → Network tab
2. Try connecting with WalletConnect
3. Filter by "walletconnect"
4. Look for failed requests
5. Check error messages in the response

### Debug 3: Check Vercel Deployment Logs

1. Go to Vercel → Deployments
2. Click on latest deployment
3. Go to "Runtime Logs" or "Build Logs"  
4. Search for "WALLETCONNECT"
5. Check if environment variable is being loaded

---

## 🔧 Alternative: Create New WalletConnect Project

If nothing works, create a completely fresh project:

### 1. Create New Project in WalletConnect Cloud

1. Go to https://cloud.walletconnect.com
2. Click "Create New Project"
3. Name: `DecaFlow-New`
4. Save and copy the NEW project ID

### 2. Add Domains to NEW Project

In the new project, add:
```
decaflow.xyz
https://decaflow.xyz
www.decaflow.xyz
https://www.decaflow.xyz
```

### 3. Update Environment Variable

In Vercel, update `VITE_WALLETCONNECT_PROJECT_ID` with the NEW project ID.

### 4. Redeploy

Force a new deployment in Vercel.

### 5. Test

Try connecting with WalletConnect again. Should work with fresh project.

---

## 🎯 Most Likely Issue

Based on your screenshot showing domains are configured, **99% chance the issue is:**

1. **Vercel environment variable doesn't match WalletConnect Cloud project ID**
   - Solution: Recreate the environment variable in Vercel

2. **Environment variable not being loaded in deployment**
   - Solution: Check build logs, ensure `VITE_` prefix is there

3. **Cached deployment**
   - Solution: Force redeploy from Vercel dashboard

---

## ✅ Final Checklist

- [ ] Copied exact project ID from WalletConnect Cloud
- [ ] Deleted old environment variable in Vercel
- [ ] Created new environment variable with exact project ID
- [ ] Applied to Production, Preview, AND Development
- [ ] Redeployed from Vercel dashboard
- [ ] Waited 2-3 minutes for deployment to complete
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Tested on https://decaflow.xyz
- [ ] Opened DevTools console to check project ID logs
- [ ] Tried connecting with Coinbase Wallet
- [ ] Tried connecting with WalletConnect QR code

---

## 🚨 If Still Not Working

**Share this info for debugging:**

1. First 10 characters of your WalletConnect project ID: `__________`
2. What shows in console: `✅ WalletConnect Project ID loaded: __________`
3. Current domain you're testing on: `https://___________`
4. Exact error message from browser console
5. Screenshot of Network tab when connecting wallet

---

## 📝 Code Changes Applied

I've updated `wagmi.ts` with:
- ✅ Better logging to see what project ID is being used
- ✅ Domain detection to ensure correct origin
- ✅ Explicit app metadata
- ✅ Debug logs in console

**After you merge and redeploy, check browser console for the logs!**
