# Vercel Deployment Guide

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import `affidexlab/new` repository
4. Set **Root Directory** to `app`
5. Framework preset will auto-detect as **Vite**
6. Add environment variables:
   - `VITE_WALLETCONNECT_PROJECT_ID` → Get from [WalletConnect Cloud](https://cloud.walletconnect.com)
   - `VITE_SOCKET_API_KEY` → Get from [Socket](https://socket.tech) (optional for bridge)
7. Click **Deploy**

### Option 2: Deploy via CLI
```bash
cd app
vercel login
vercel
# Follow prompts:
# - Link to existing project or create new
# - Set root directory to current (app)
# - Override settings: No
# - Deploy
```

Add environment variables in Vercel dashboard:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_SOCKET_API_KEY=your_socket_key
```

Then redeploy:
```bash
vercel --prod
```

## Getting API Keys

### WalletConnect Project ID (Required)
1. Go to https://cloud.walletconnect.com
2. Sign in and create a new project
3. Copy the Project ID
4. Add to Vercel env vars as `VITE_WALLETCONNECT_PROJECT_ID`

### Socket API Key (Optional, for bridge)
1. Go to https://socket.tech
2. Sign up for API access
3. Generate API key
4. Add to Vercel env vars as `VITE_SOCKET_API_KEY`

## After Deployment

1. **Update wagmi config** with your WalletConnect Project ID:
   - Edit `src/wagmi.ts` and replace `YOUR_PROJECT_ID`

2. **Test on mainnet** with small amounts:
   - Connect wallet
   - Try ETH → USDC swap on Arbitrum
   - Test bridge USDC from Arbitrum to Base

3. **Monitor**:
   - Check Vercel deployment logs
   - Watch for errors in browser console
   - Test on mobile devices

## Production Checklist

- [ ] WalletConnect Project ID configured
- [ ] Socket API key added (if using bridge)
- [ ] Tested swap on Arbitrum mainnet
- [ ] Tested bridge to another chain
- [ ] Custom domain configured (optional)
- [ ] Analytics tracking set up (optional)
- [ ] Legal disclaimers reviewed
- [ ] US region blocking considered

## Custom Domain (Optional)

In Vercel dashboard:
1. Go to project settings → Domains
2. Add your custom domain (e.g., `defiswap.xyz`)
3. Update DNS records as instructed
4. Wait for SSL certificate

## Troubleshooting

**Build fails:**
- Check Vercel build logs
- Ensure bun is available (it should be auto-detected)
- Verify all imports are correct

**Wallet won't connect:**
- Check WalletConnect Project ID is set correctly
- Ensure it's added as environment variable
- Check browser console for errors

**0x API errors:**
- 0x has rate limits; consider caching quotes
- Check network connectivity
- Verify Arbitrum is selected in wallet

## Support

For issues:
- Check Vercel deployment logs
- Review browser console errors
- Test locally first: `bun run dev`
