# DecaFlow Tychi Integration - Deployment Guide

Complete deployment guide for all Tychi partnership infrastructure.

## Overview

This guide covers deploying:
1. REST API Backend (Production + Sandbox)
2. Partner Dashboard
3. Embedded Widgets
4. SDK Publishing
5. Documentation Site

## 1. REST API Backend

### Infrastructure Requirements

#### Production Environment
- **Domain**: api.decaflow.xyz
- **Hosting**: Render, Railway, or AWS ECS
- **Database**: Not required (uses file-based partner store)
- **Environment**: Node.js 18+

#### Sandbox Environment
- **Domain**: sandbox.decaflow.xyz
- **Hosting**: Same as production (separate instance)
- **Environment**: Node.js 18+

### Deployment Steps (Render)

#### Production API

1. **Create Web Service on Render**
   - Name: `decaflow-api-production`
   - Root Directory: `/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Runtime: Node 18

2. **Environment Variables**
   ```
   NODE_ENV=production
   ENVIRONMENT=production
   PORT=3000
   ALLOWED_ORIGINS=https://decaflow.xyz,https://decaflow.vercel.app,https://tychiwallet.com,https://app.tychiwallet.com,https://partners.decaflow.xyz
   SOCKET_API_KEY=<your_socket_key>
   ZEROX_API_KEY=<your_0x_key>
   ```

3. **Custom Domain**
   - Add custom domain: `api.decaflow.xyz`
   - Configure DNS:
     ```
     Type: CNAME
     Name: api
     Value: <render-url>.onrender.com
     ```

#### Sandbox API

1. **Create Web Service on Render**
   - Name: `decaflow-api-sandbox`
   - Root Directory: `/backend`
   - Build Command: `npm install`
   - Start Command: `npm run start:sandbox`
   - Runtime: Node 18

2. **Environment Variables**
   ```
   NODE_ENV=production
   ENVIRONMENT=sandbox
   PORT=3000
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://partners-sandbox.decaflow.xyz,https://test.tychiwallet.com
   SOCKET_API_KEY=<sandbox_socket_key>
   ZEROX_API_KEY=<sandbox_0x_key>
   ```

3. **Custom Domain**
   - Add custom domain: `sandbox.decaflow.xyz`

### API Endpoints to Configure

After deployment, verify these endpoints work:
- `GET https://api.decaflow.xyz/v1/health`
- `GET https://api.decaflow.xyz/v1` (API info)
- `POST https://api.decaflow.xyz/v1/swap/quote` (with auth)

## 2. Partner Dashboard

### Deployment (Vercel)

1. **Create New Project on Vercel**
   - Import from GitHub: `affidexlab/new`
   - Root Directory: `/dashboard`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Environment Variables**
   ```
   # None required - static site
   ```

3. **Domain Configuration**
   - Production: `partners.decaflow.xyz/dashboard`
   - Sandbox: `partners-sandbox.decaflow.xyz/dashboard`

4. **DNS Setup**
   ```
   Type: CNAME
   Name: partners
   Value: cname.vercel-dns.com
   
   Type: CNAME
   Name: partners-sandbox
   Value: cname.vercel-dns.com
   ```

### Authentication Setup (Future)

Current dashboard is demo/mock. For production:
1. Integrate Auth0 or Clerk
2. Protect routes with authentication
3. Fetch real data from API
4. Implement session management

## 3. Embedded Widget

### Deployment (Vercel)

1. **Create New Project on Vercel**
   - Import from GitHub: `affidexlab/new`
   - Root Directory: `/embed`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Domain Configuration**
   - Production: `partners.decaflow.xyz/embed`
   - Sandbox: `partners-sandbox.decaflow.xyz/embed`

### Usage URLs

After deployment:
- Production: `https://partners.decaflow.xyz/embed?partner=tychi&mode=swap&theme=dark`
- Sandbox: `https://partners-sandbox.decaflow.xyz/embed?partner=tychi&mode=swap&theme=light`

## 4. SDK Publishing

### Publish to NPM

1. **Build SDK**
   ```bash
   cd sdk
   npm install
   npm run build
   ```

2. **Test Locally**
   ```bash
   npm pack
   # Test the generated tarball
   ```

3. **Publish to NPM**
   ```bash
   npm login
   npm publish --access public
   ```

4. **Verify Installation**
   ```bash
   npm install @decaflow/partner-sdk
   ```

### SDK Versioning

- Initial release: `1.0.0`
- Follow semantic versioning (semver)
- Update package.json version before publishing

## 5. Documentation Site

### Deployment (GitHub Pages or Vercel)

1. **Option A: GitHub Pages**
   ```bash
   cd docs
   # Deploy to gh-pages branch
   ```

2. **Option B: Vercel**
   - Root Directory: `/docs`
   - Output Directory: `.` (static files)
   - Domain: `docs.decaflow.xyz`

### DNS Configuration

```
Type: CNAME
Name: docs
Value: <hosting-provider-url>
```

### Verify Endpoints

- `https://docs.decaflow.xyz/api/openapi.yaml`
- `https://docs.decaflow.xyz/api/api-viewer.html`

## 6. DNS Configuration Summary

Complete DNS setup for all subdomains:

```
# Production API
api.decaflow.xyz → CNAME → decaflow-api-production.onrender.com

# Sandbox API
sandbox.decaflow.xyz → CNAME → decaflow-api-sandbox.onrender.com

# Partner Dashboard & Embed
partners.decaflow.xyz → CNAME → cname.vercel-dns.com
partners-sandbox.decaflow.xyz → CNAME → cname.vercel-dns.com

# Documentation
docs.decaflow.xyz → CNAME → <docs-hosting-provider>

# Main Site (already configured)
decaflow.xyz → <existing-configuration>
```

## 7. Partner Onboarding (Tychi)

### Step 1: Generate API Keys

Production and Sandbox keys are pre-generated in the partner store:
- Production: `tychi_prod_pk_live_8x9y2z3a4b5c6d7e`
- Sandbox: `tychi_test_pk_sandbox_1a2b3c4d5e6f7g8h`

### Step 2: Share with Tychi

Send integration package to Tychi (tech@tychiwallet.com):
- API keys (secure delivery)
- SDK package name: `@decaflow/partner-sdk`
- Embed URLs
- API documentation: https://docs.decaflow.xyz/api
- Dashboard access: https://partners.decaflow.xyz/dashboard

### Step 3: Integration Support

- Set up shared Slack channel
- Schedule weekly sync calls
- Monitor API usage and errors
- Provide technical assistance

## 8. Monitoring & Maintenance

### API Monitoring

Set up monitoring for:
- API uptime (UptimeRobot, Pingdom)
- Response times (New Relic, Datadog)
- Error rates (Sentry)
- Rate limit violations

### Partner Analytics

Track in dashboard:
- API request volume
- Endpoint usage breakdown
- Success/error rates
- Partner-specific metrics

### Alerts

Configure alerts for:
- API downtime
- High error rates
- Rate limit approaching
- Unusual traffic patterns

## 9. Security Checklist

- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] API keys rotated quarterly
- [ ] Partner authentication working
- [ ] No secrets in client code
- [ ] Security headers enabled (helmet)
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

## 10. Testing Checklist

### API Testing

- [ ] Health check returns 200
- [ ] Authentication rejects invalid keys
- [ ] All swap endpoints work
- [ ] All liquidity endpoints work
- [ ] All bridge endpoints work
- [ ] Rate limiting triggers correctly
- [ ] CORS allows partner domains
- [ ] Error responses are properly formatted

### SDK Testing

- [ ] NPM package installs correctly
- [ ] All hooks work in React app
- [ ] TypeScript types are correct
- [ ] Examples in README work
- [ ] Components render properly

### Embed Testing

- [ ] Widget loads in iframe
- [ ] PostMessage events work
- [ ] Theme customization works
- [ ] All modes (swap/bridge/liquidity) work
- [ ] Mobile responsive

### Dashboard Testing

- [ ] All pages render correctly
- [ ] API keys display properly
- [ ] Usage stats show correctly
- [ ] Links work
- [ ] Mobile responsive

## 11. Rollback Plan

If deployment issues occur:

1. **API**: Roll back to previous Render deployment
2. **Dashboard/Embed**: Revert Vercel deployment
3. **SDK**: Publish previous version with `npm publish --tag previous`
4. **DNS**: Keep DNS TTL low (300s) during initial deployment

## 12. Post-Deployment

### Week 1
- Monitor all endpoints hourly
- Check error logs daily
- Verify Tychi integration working
- Collect feedback

### Week 2-4
- Review usage patterns
- Optimize slow endpoints
- Update documentation based on feedback
- Plan feature additions

### Ongoing
- Monthly security reviews
- Quarterly dependency updates
- Performance optimization
- Partner satisfaction surveys

## Support Contacts

- **Technical Issues**: techpartners@decaflow.xyz
- **Infrastructure**: dev@decaflow.xyz
- **Partnership Questions**: partnerships@decaflow.xyz

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Next Review**: January 2026
