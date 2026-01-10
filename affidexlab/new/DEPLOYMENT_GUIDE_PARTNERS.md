# DecaFlow Partner Infrastructure Deployment Guide

## Quick Deployment Overview

This guide covers deploying all partner infrastructure components for the Tychi Wallet integration.

---

## Prerequisites

- Vercel account with CLI installed (`npm i -g vercel`)
- DNS access for decaflow.xyz domain
- Node.js 18+ installed

---

## 1. Backend API Deployment

### Production API (api.decaflow.xyz)

```bash
cd affidexlab/new/affidexlab/new/backend

# Install dependencies
npm install

# Test locally
npm start

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# - NODE_ENV=production
# - ENVIRONMENT=production
# - SOCKET_API_KEY=<your_socket_key>
# - ALLOWED_ORIGINS=https://decaflow.xyz,https://partners.decaflow.xyz,https://tychiwallet.com,https://app.tychiwallet.com
```

### Sandbox API (sandbox.decaflow.xyz)

```bash
# Same directory as above

# Deploy with sandbox environment
ENVIRONMENT=sandbox vercel --prod

# Set environment variables in Vercel dashboard
# - NODE_ENV=production
# - ENVIRONMENT=sandbox
# - SOCKET_API_KEY=<your_socket_key>
# - ALLOWED_ORIGINS=https://partners-sandbox.decaflow.xyz,https://test.tychiwallet.com
```

---

## 2. Partner Dashboard Deployment

### Production Dashboard (partners.decaflow.xyz)

```bash
cd partners

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# - VITE_API_URL=https://api.decaflow.xyz
# - VITE_ENVIRONMENT=production
```

### Sandbox Dashboard (partners-sandbox.decaflow.xyz)

```bash
# Same directory as above

# Build for sandbox
VITE_ENVIRONMENT=sandbox npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# - VITE_API_URL=https://sandbox.decaflow.xyz
# - VITE_ENVIRONMENT=sandbox
```

---

## 3. DNS Configuration

After deploying to Vercel, configure these DNS records in your domain registrar:

### Production Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | api | cname.vercel-dns.com | 3600 |
| CNAME | partners | cname.vercel-dns.com | 3600 |

### Sandbox Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | sandbox | cname.vercel-dns.com | 3600 |
| CNAME | partners-sandbox | cname.vercel-dns.com | 3600 |

**Steps:**
1. Go to Vercel project settings
2. Copy the Vercel DNS target (e.g., `cname.vercel-dns.com`)
3. Add CNAME records in your DNS provider
4. Add custom domains in Vercel project settings
5. Wait for SSL certificate generation (automatic)

---

## 4. SDK Package Publishing (Optional)

If you want to publish the SDK to npm:

```bash
cd sdk

# Install dependencies
npm install

# Build the package
npm run build

# Test the build
npm pack

# Login to npm
npm login

# Publish to npm
npm publish --access public
```

**Note:** Update package.json `name` to your npm organization if needed.

---

## 5. Verification Steps

### Test Backend API

```bash
# Test production API
curl https://api.decaflow.xyz/v1/health

# Expected response:
{
  "status": "ok",
  "environment": "production",
  "version": "1.0.0",
  "timestamp": "2025-12-07T..."
}

# Test sandbox API
curl https://sandbox.decaflow.xyz/v1/health

# Expected response:
{
  "status": "ok",
  "environment": "sandbox",
  "version": "1.0.0",
  "timestamp": "2025-12-07T..."
}
```

### Test Partner Authentication

```bash
# Test with Tychi production key
curl -X POST https://api.decaflow.xyz/v1/partners/me \
  -H "X-Partner-ID: tychi_prod_pk_live_8x9y2z3a4b5c6d7e"

# Expected: Partner details and stats

# Test with Tychi sandbox key
curl -X POST https://sandbox.decaflow.xyz/v1/partners/me \
  -H "X-Partner-ID: tychi_test_pk_sandbox_1a2b3c4d5e6f7g8h"

# Expected: Partner details and stats
```

### Test Partner Dashboard

1. Visit https://partners.decaflow.xyz/dashboard
2. Enter partner ID: `tychi_prod_pk_live_8x9y2z3a4b5c6d7e`
3. Click "Access Dashboard"
4. Verify stats display correctly

### Test Embed Widget

1. Create test HTML file:
```html
<!DOCTYPE html>
<html>
<body>
  <iframe 
    src="https://partners.decaflow.xyz/embed?partner=tychi&theme=dark" 
    width="500" 
    height="600"
    frameborder="0"
  ></iframe>
</body>
</html>
```

2. Open in browser
3. Verify widget loads with Tychi branding
4. Test swap interface

---

## 6. Environment Variables Summary

### Backend API (.env)
```env
NODE_ENV=production
ENVIRONMENT=production  # or sandbox
PORT=3000
SOCKET_API_KEY=<your_socket_api_key>
ALLOWED_ORIGINS=<comma_separated_domains>
```

### Partner Dashboard (.env)
```env
VITE_API_URL=https://api.decaflow.xyz  # or https://sandbox.decaflow.xyz
VITE_ENVIRONMENT=production  # or sandbox
```

---

## 7. Monitoring & Maintenance

### Check Vercel Logs
```bash
# View backend logs
vercel logs <deployment-url>

# View partners dashboard logs
vercel logs <deployment-url>
```

### Monitor API Usage
- Partner dashboard shows real-time usage stats
- Access `/v1/partners/stats` endpoint for detailed analytics

### Rate Limiting
- Production: 100 req/min per partner
- Sandbox: 50 req/min per partner
- Adjust in `partnerStore.js` if needed

---

## 8. Troubleshooting

### Issue: CORS errors
**Solution:** Verify allowed origins in backend .env file

### Issue: 401 Unauthorized
**Solution:** Check Partner ID is correct and active in partner store

### Issue: Embed widget not loading
**Solution:** Check iframe CSP headers in vercel.json

### Issue: API endpoints returning 404
**Solution:** Verify routes are properly mounted in server.js

---

## 9. Security Checklist

- [ ] HTTPS enabled on all domains (Vercel auto-configures)
- [ ] CORS properly configured for partner domains only
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] Partner IDs validated on all protected endpoints
- [ ] No API keys exposed in frontend code
- [ ] Content Security Policy configured

---

## 10. Rollback Procedure

If issues occur after deployment:

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>

# Or redeploy previous commit
git checkout <previous-commit>
vercel --prod
```

---

## Support

For deployment issues:
- Technical: techpartners@decaflow.xyz
- Security: security@decaflow.xyz

---

**Deployment Status:** Ready for production  
**Last Updated:** December 7, 2025
