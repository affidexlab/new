# 🚀 Deploy to Vercel - Quick Guide

## Status
✅ All code merged to `main` branch
✅ Production build tested and working
✅ Ready for immediate Vercel deployment
✅ Environment variable configuration fixed

## Deploy Now (3 Steps)

### Step 1: Deploy via Vercel Dashboard

1. **Go to Vercel**: https://vercel.com/new

2. **Import Repository**:
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose `affidexlab/new`
   - Click "Import"

3. **Configure Project**:
   - **Root Directory**: `app` ← IMPORTANT! Set this to `app`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `bun run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

4. **Add Environment Variables** (required):
   Click "Environment Variables" and add:
   ```
   VITE_WALLETCONNECT_PROJECT_ID = your_project_id_here
   ```
   
   Get your WalletConnect Project ID:
   - Go to https://cloud.walletconnect.com
   - Sign in with GitHub
   - Click "Create Project"
   - Copy the Project ID
   - Paste it in Vercel

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live!

### Step 2: Update Code with Your Project ID

After deployment, update the code:

1. Edit `app/src/wagmi.ts` on GitHub:
   ```typescript
   projectId: 'YOUR_ACTUAL_PROJECT_ID', // Replace with your ID from cloud.walletconnect.com
   ```

2. Commit the change - Vercel will auto-redeploy

### Step 3: Test Your Deployment

1. Open your Vercel URL (e.g., `your-project.vercel.app`)
2. Click "Connect Wallet"
3. Connect with MetaMask or any wallet
4. Switch to Arbitrum network if prompted
5. Try a small test swap: ETH → USDC

## Optional: Add Custom Domain

In Vercel dashboard:
1. Go to your project → Settings → Domains
2. Add your domain (e.g., `decaflow.xyz`)
3. Update DNS records as shown
4. Wait for SSL (usually < 5 minutes)

## Optional: Socket API Key (for Bridge)

If you want to enable full bridge functionality:

1. Go to https://socket.tech
2. Sign up and get API key
3. Add to Vercel environment variables:
   ```
   VITE_SOCKET_API_KEY = your_socket_key
   ```
4. Update `app/src/lib/bridge.ts` to use `import.meta.env.VITE_SOCKET_API_KEY`

## Troubleshooting

**Build fails**: Check that Root Directory is set to `app`

**Wallet won't connect**: Verify WalletConnect Project ID is set correctly

**Can't find app**: Make sure you're visiting the Vercel URL, not the repo URL

## What's Next

Once deployed:
- Share the URL with early testers
- Monitor Vercel analytics for traffic
- Track swaps and volume
- Add analytics indexing (Phase 5)
- Run marketing campaigns

## Need Help?

Check `app/DEPLOYMENT.md` for detailed troubleshooting guide.
