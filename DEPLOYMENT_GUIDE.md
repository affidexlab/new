# DecaFlow Deployment Guide

## 🚀 Quick Deployment to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to app directory
cd decaflow-app

# Deploy
vercel
```

Follow the prompts:
1. Set up and deploy: **Yes**
2. Which scope: Select your account
3. Link to existing project: **No**
4. Project name: **decaflow**
5. Directory: **./decaflow-app**
6. Override settings: **No**

### Option 2: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git Repository
3. Select `affidexlab/new`
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `decaflow-app`
   - **Build Command:** `bun run build`
   - **Output Directory:** `dist`
5. Add Environment Variables (see below)
6. Click "Deploy"

---

## 🔐 Environment Variables

### Required for Wallet Connection

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

**How to get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com/
2. Create account / Sign in
3. Create New Project
4. Copy the Project ID
5. Add to Vercel environment variables

### Optional (Custom RPC Endpoints)

```bash
VITE_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
VITE_ETHEREUM_RPC_URL=https://eth.llamarpc.com
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
VITE_OPTIMISM_RPC_URL=https://mainnet.optimism.io
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
VITE_BSC_RPC_URL=https://bsc-dataseed.binance.org
```

### Optional (Analytics)

```bash
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_PLAUSIBLE_DOMAIN=decaflow.app
```

### Future (Contract Addresses - Phase 2)

```bash
VITE_SWAP_ROUTER_ADDRESS=0x...
VITE_REVENUE_CONTRACT_ADDRESS=0x...
```

---

## 🌐 Custom Domain Setup

### On Vercel:

1. Go to Project Settings → Domains
2. Add your domain: `decaflow.app`
3. Configure DNS records as shown:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate will auto-configure

### Subdomain for App:

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

This will make the swap interface available at `app.decaflow.app`

---

## 📊 Vercel Configuration

Create `vercel.json` in `decaflow-app/`:

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "bun install",
  "devCommand": "bun run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## 🔄 CI/CD Setup

### Automatic Deployments

Once connected to Vercel:
- ✅ **Push to branch** → Automatic preview deployment
- ✅ **Merge to main** → Automatic production deployment
- ✅ **Pull Request** → Preview URL in PR comment

### GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
    
    - name: Install dependencies
      working-directory: ./decaflow-app
      run: bun install
    
    - name: Type check
      working-directory: ./decaflow-app
      run: bun run tsc --noEmit
    
    - name: Build
      working-directory: ./decaflow-app
      run: bun run build
```

---

## 🧪 Pre-Deployment Checklist

### Code
- [x] All TypeScript errors fixed
- [x] Build succeeds
- [x] No console errors
- [ ] Add real DecaFlow logo
- [ ] Add blockchain logos
- [ ] Add isometric illustrations

### Configuration
- [ ] WalletConnect Project ID configured
- [ ] Environment variables set
- [ ] Domain purchased (if custom domain)
- [ ] DNS configured (if custom domain)

### Content
- [ ] Update social media links with real URLs
- [ ] Update contract addresses (when deployed)
- [ ] Update documentation links
- [ ] Add real statistics (or connect to API)

### Legal
- [ ] Terms of Service page created
- [ ] Privacy Policy page created
- [ ] Add footer links to Terms/Privacy
- [ ] Add cookie consent if required

### SEO
- [x] Meta tags in index.html
- [ ] Open Graph image created
- [ ] Twitter Card image created
- [ ] Favicon created (all sizes)
- [ ] Sitemap generated

---

## 🎯 Performance Optimization (Phase 2)

### Code Splitting
```typescript
// Lazy load pages
const DAppPage = lazy(() => import('./pages/DAppPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Wrap in Suspense
<Suspense fallback={<LoadingScreen />}>
  <Routes>...</Routes>
</Suspense>
```

### Image Optimization
```bash
# Install image optimization
bun add -D vite-plugin-image-optimizer

# Add to vite.config.ts
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

plugins: [
  react(),
  ViteImageOptimizer({})
]
```

### Bundle Analysis
```bash
# Install bundle analyzer
bun add -D rollup-plugin-visualizer

# Build with analysis
bun run build --mode analyze
```

---

## 🔍 Testing Before Launch

### Manual Testing Checklist
- [ ] Navigate between pages (/ and /swap)
- [ ] Test mobile menu open/close
- [ ] Test all CTA buttons
- [ ] Test modal open/close (token, network, settings)
- [ ] Test hover effects on all interactive elements
- [ ] Test responsive design on mobile device
- [ ] Test wallet connection (MetaMask)
- [ ] Test network switching
- [ ] Test token selection
- [ ] Test settings changes
- [ ] Test all footer links
- [ ] Test social media icons

### Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Firefox
- [ ] Safari (desktop + iOS)
- [ ] Edge

### Device Testing
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)

---

## 📈 Monitoring Setup (Post-Deployment)

### Vercel Analytics (Free)
Enable in Vercel dashboard:
- Web Vitals tracking
- Page view analytics
- Geographic data

### Error Tracking (Recommended)
```bash
# Install Sentry
bun add @sentry/react

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

### Uptime Monitoring
Use:
- UptimeRobot (free tier)
- Pingdom
- Better Uptime

---

## 🔒 Security Checklist

- [x] HTTPS enforced (automatic on Vercel)
- [x] Security headers configured
- [ ] CSP headers (Content Security Policy)
- [x] No secrets in client code
- [x] Environment variables properly used
- [x] XSS protection via React
- [ ] Rate limiting (if backend added)

---

## 📞 Support & Troubleshooting

### Common Issues

**Build fails on Vercel:**
- Check Node.js version (should be 20.19+)
- Check all env variables are set
- Review build logs in Vercel dashboard

**Wallet connection not working:**
- Verify VITE_WALLETCONNECT_PROJECT_ID is set
- Check browser console for errors
- Try clearing cache/cookies

**Page not found (404):**
- Check vercel.json rewrites configuration
- Ensure SPA fallback is configured

**Slow load times:**
- Enable Vercel Edge Network
- Optimize images
- Implement code splitting (Phase 2)

---

## 🎬 Deployment Command Cheat Sheet

```bash
# Development
bun run dev

# Build
bun run build

# Preview build locally
bun run preview

# Deploy to Vercel (production)
vercel --prod

# Deploy to Vercel (preview)
vercel

# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Set environment variable
vercel env add VITE_WALLETCONNECT_PROJECT_ID

# Pull environment variables
vercel env pull
```

---

## ✅ Final Pre-Launch Checklist

### Critical
- [ ] WalletConnect Project ID configured
- [ ] All environment variables set in Vercel
- [ ] Build succeeds in Vercel
- [ ] Test deployment URL works
- [ ] Wallet connection works on deployed site
- [ ] All pages load correctly

### Important
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics tracking active
- [ ] Social media links updated
- [ ] Terms of Service live
- [ ] Privacy Policy live

### Nice to Have
- [ ] Favicon updated
- [ ] Open Graph images
- [ ] Twitter Card images
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Error tracking (Sentry)

---

## 🎊 You're Ready to Deploy!

Once you:
1. Get WalletConnect Project ID
2. Add real assets (logos)
3. Review the implementation

You can deploy to production immediately!

```bash
cd decaflow-app
vercel --prod
```

---

**DecaFlow is ready to go live! 🚀**

*Need help? Check the README.md in decaflow-app/ or review the specification documents.*
