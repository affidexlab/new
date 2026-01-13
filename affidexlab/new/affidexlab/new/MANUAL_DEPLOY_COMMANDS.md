# Manual Deployment Commands

If you prefer to run commands manually instead of using the scripts, here are the exact commands:

---

## Prerequisites

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login
```

---

## 1. Deploy Backend API (Production)

```bash
# Navigate to backend
cd /project/workspace/affidexlab/new/affidexlab/new/backend

# Install dependencies
npm install

# Deploy to Vercel
vercel --prod --name decaflow-api --yes
```

**After deployment:**
- Copy the deployment URL
- Go to Vercel dashboard → decaflow-api project
- Settings → Domains → Add: `api.decaflow.xyz`
- Settings → Environment Variables → Add:
  - `NODE_ENV` = `production`
  - `ENVIRONMENT` = `production`
  - `ALLOWED_ORIGINS` = `https://decaflow.xyz,https://partners.decaflow.xyz,https://tychiwallet.com,https://app.tychiwallet.com`
- Redeploy

---

## 2. Deploy Backend API (Sandbox)

```bash
# Same directory as above
cd /project/workspace/affidexlab/new/affidexlab/new/backend

# Deploy with sandbox environment
ENVIRONMENT=sandbox vercel --prod --name decaflow-api-sandbox --yes
```

**After deployment:**
- Go to Vercel dashboard → decaflow-api-sandbox project
- Settings → Domains → Add: `sandbox.decaflow.xyz`
- Settings → Environment Variables → Add:
  - `NODE_ENV` = `production`
  - `ENVIRONMENT` = `sandbox`
  - `ALLOWED_ORIGINS` = `https://partners-sandbox.decaflow.xyz,https://test.tychiwallet.com,http://localhost:3000`
- Redeploy

---

## 3. Deploy Partners Dashboard (Production)

```bash
# Navigate to partners
cd /project/workspace/affidexlab/new/partners

# Install dependencies
npm install

# Deploy to Vercel
vercel --prod --name decaflow-partners --yes
```

**After deployment:**
- Go to Vercel dashboard → decaflow-partners project
- Settings → Domains → Add: `partners.decaflow.xyz`
- Settings → Environment Variables → Add:
  - `VITE_API_URL` = `https://api.decaflow.xyz`
  - `VITE_ENVIRONMENT` = `production`
- Redeploy

---

## 4. Deploy Partners Dashboard (Sandbox)

```bash
# Same directory as above
cd /project/workspace/affidexlab/new/partners

# Deploy with sandbox environment
VITE_ENVIRONMENT=sandbox vercel --prod --name decaflow-partners-sandbox --yes
```

**After deployment:**
- Go to Vercel dashboard → decaflow-partners-sandbox project
- Settings → Domains → Add: `partners-sandbox.decaflow.xyz`
- Settings → Environment Variables → Add:
  - `VITE_API_URL` = `https://sandbox.decaflow.xyz`
  - `VITE_ENVIRONMENT` = `sandbox`
- Redeploy

---

## Quick Commands (Copy-Paste)

If you want to run all deployments in sequence:

```bash
# 1. Backend Production
cd /project/workspace/affidexlab/new/affidexlab/new/backend && npm install && vercel --prod --name decaflow-api --yes

# 2. Backend Sandbox
cd /project/workspace/affidexlab/new/affidexlab/new/backend && ENVIRONMENT=sandbox vercel --prod --name decaflow-api-sandbox --yes

# 3. Partners Production
cd /project/workspace/affidexlab/new/partners && npm install && vercel --prod --name decaflow-partners --yes

# 4. Partners Sandbox
cd /project/workspace/affidexlab/new/partners && VITE_ENVIRONMENT=sandbox vercel --prod --name decaflow-partners-sandbox --yes
```

---

## Verification

After all deployments:

```bash
# Check projects in Vercel dashboard
vercel projects ls

# Should show:
# - decaflow-api
# - decaflow-api-sandbox
# - decaflow-partners
# - decaflow-partners-sandbox
```

---

## Next Steps

1. Configure DNS in Hostinger (see DEPLOYMENT_GUIDE_PARTNERS.md - Step 2)
2. Add custom domains in Vercel (see DEPLOYMENT_GUIDE_PARTNERS.md - Step 3)
3. Add environment variables (see above)
4. Redeploy each project
5. Test endpoints
