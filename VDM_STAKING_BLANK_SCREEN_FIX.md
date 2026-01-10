# VDM Staking Blank Screen Fix

## Quick Diagnostic Steps

### Step 1: Check Browser Console (CRITICAL)

1. Open https://decaflow.xyz/staking
2. **Press F12** to open Developer Tools
3. Go to **Console** tab
4. **Take a screenshot** and share all red errors

**Look for these specific errors:**
- `Failed to resolve module specifier`
- `Cannot read properties of undefined`
- `Uncaught ReferenceError`
- `Module not found`
- Anything mentioning "Solana" or "wallet"

### Step 2: Check Network Tab

1. Still in Developer Tools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for any failed requests (red color)
5. Check if JavaScript bundles are loading

### Step 3: Test Other Pages

Check if other pages work:
- https://decaflow.xyz/ (home)
- https://decaflow.xyz/app (swap page)
- https://decaflow.xyz/leaderboard

**If only /staking is broken**, it's a staking-specific issue.
**If all pages are broken**, it's a build/deployment issue.

## Common Causes & Solutions

### Cause 1: Environment Variables Not Set

**Symptom**: Blank screen, console shows `undefined` errors

**Solution**: Verify these env vars are set in Vercel/Netlify:
```bash
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
VITE_API_BASE_URL=https://decaflow-backend.onrender.com
```

**How to verify on Vercel:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Check if variables exist
5. If you added them recently, **redeploy** the site

**Important**: After adding env vars, you MUST redeploy for changes to take effect.

### Cause 2: Build Cache Issue

**Symptom**: Changes not showing up, blank screen after deployment

**Solution**: Clear build cache and redeploy

**On Vercel:**
1. Go to Deployments tab
2. Click the ⋮ menu on latest deployment
3. Select "Redeploy"
4. Check "Clear Build Cache"
5. Click "Redeploy"

**On Netlify:**
1. Go to Deploys tab
2. Click "Trigger deploy"
3. Select "Clear cache and deploy site"

### Cause 3: Missing Solana Dependencies

**Symptom**: Console error mentioning Solana or wallet adapter

**Solution**: Reinstall dependencies and rebuild

```bash
cd affidexlab/new/app
rm -rf node_modules package-lock.json
npm install
npm run build
```

Then redeploy.

### Cause 4: Buffer Polyfill Issue

**Symptom**: Console error: `Buffer is not defined` or `process is not defined`

**Solution**: Check if `vite.config.ts` has proper polyfills

The `main.tsx` already has:
```typescript
import { Buffer } from 'buffer'
window.Buffer = Buffer
```

But if it's still failing, add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
})
```

### Cause 5: Invalid RPC URL

**Symptom**: Page loads but crashes when connecting wallet

**Solution**: Test your RPC URL

```bash
curl "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

Should return: `{"jsonrpc":"2.0","result":"ok","id":1}`

If it fails, your RPC URL is invalid.

### Cause 6: Deployment Failed

**Symptom**: Old version still showing, blank screen

**Solution**: Check deployment status

**On Vercel:**
1. Go to Deployments tab
2. Check if latest deployment shows "Ready" (green)
3. If "Failed" (red), click to see error logs

**On Netlify:**
1. Go to Deploys tab
2. Check if latest deploy shows "Published"
3. If "Failed", click to see build logs

### Cause 7: Wrong Build Output

**Symptom**: Deployment succeeds but page is blank

**Solution**: Verify build settings

**Vercel settings should be:**
- Framework Preset: Vite
- Build Command: `cd affidexlab/new/app && npm install && npm run build`
- Output Directory: `affidexlab/new/app/dist`
- Install Command: `npm install`

**Netlify settings should be:**
- Base directory: `affidexlab/new/app`
- Build command: `npm run build`
- Publish directory: `affidexlab/new/app/dist`

## Emergency Quick Fix

If you need to get it working ASAP, try this minimal staking page:

Create `affidexlab/new/app/src/pages/SolanaStakingSimple.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function SolanaStakingSimple() {
  const { publicKey } = useWallet();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Staking page loaded successfully');
    console.log('Public key:', publicKey?.toString());
    console.log('RPC URL:', import.meta.env.VITE_SOLANA_RPC_URL || 'default');
    console.log('API Base:', import.meta.env.VITE_API_BASE_URL || 'default');
  }, [publicKey]);

  try {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">VDM Staking</h1>
          
          <div className="bg-green-500/20 border border-green-500 rounded p-4 mb-4">
            <p>✅ Page is loading correctly</p>
            <p>✅ React is working</p>
            <p>✅ Solana wallet adapter is working</p>
          </div>

          <div className="mb-4">
            <WalletMultiButton />
          </div>

          {publicKey && (
            <div className="bg-blue-500/20 border border-blue-500 rounded p-4">
              <p className="font-bold">Wallet Connected!</p>
              <p className="text-sm">{publicKey.toString()}</p>
            </div>
          )}

          <div className="mt-8 bg-gray-800 rounded p-4">
            <h2 className="font-bold mb-2">Environment Check:</h2>
            <p className="text-sm text-gray-400">RPC URL: {import.meta.env.VITE_SOLANA_RPC_URL ? '✅ Set' : '❌ Not set'}</p>
            <p className="text-sm text-gray-400">API URL: {import.meta.env.VITE_API_BASE_URL ? '✅ Set' : '❌ Not set'}</p>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500 rounded p-4">
              <p className="font-bold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="min-h-screen bg-red-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">Error Loading Page</h1>
        <p>{err?.message || 'Unknown error'}</p>
        <pre className="mt-4 bg-black p-4 rounded overflow-auto">
          {err?.stack || 'No stack trace'}
        </pre>
      </div>
    );
  }
}
```

Then update `App.tsx` to use it temporarily:

```typescript
import SolanaStakingSimple from "./pages/SolanaStakingSimple";

// In the return statement, replace:
{currentPage === "staking" && <SolanaStaking />}
// with:
{currentPage === "staking" && <SolanaStakingSimple />}
```

This will help diagnose what's working and what's not.

## What to Share

To help debug, please share:

1. **Browser console errors** (screenshot or text)
2. **Deployment platform** (Vercel/Netlify/other?)
3. **Deployment logs** (if build failed)
4. **Network tab** (any failed requests?)
5. **Environment variables** (are they set?)
6. **URL you're accessing** (decaflow.xyz/staking or decaflow.app/staking?)

## Testing Checklist

Run through these tests and report results:

- [ ] Home page (/) loads correctly
- [ ] App page (/app) loads correctly  
- [ ] Staking page (/staking) shows blank screen ❌
- [ ] Browser console shows errors: _______
- [ ] Environment variables are set in deployment platform
- [ ] Latest deployment status: _______
- [ ] Tried clearing cache and redeploying
- [ ] Tried different browser

## Most Likely Cause

Based on the symptoms:

**90% chance**: Environment variables not set or deployment didn't pick them up.

**Fix**: 
1. Go to deployment platform (Vercel/Netlify)
2. Verify `VITE_SOLANA_RPC_URL` is set
3. Clear cache and redeploy
4. Wait 2-3 minutes for deployment
5. Try again

**10% chance**: JavaScript error in Solana wallet adapter initialization.

**Fix**: Share browser console errors for specific diagnosis.
