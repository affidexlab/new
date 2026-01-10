# 🚀 Quick Deploy Guide - Super Simple!

## Option 1: Deploy Everything At Once (Recommended)

**Just run ONE command:**

```bash
cd /project/workspace/affidexlab/new
./DEPLOY_ALL.sh
```

This will deploy all 4 projects automatically!

---

## Option 2: Deploy One By One

If you prefer to deploy projects individually:

### Step 1: Login to Vercel First

```bash
vercel login
```

Follow the prompts in your browser.

### Step 2: Deploy Backend Production

```bash
cd /project/workspace/affidexlab/new
./deploy-backend-production.sh
```

### Step 3: Deploy Backend Sandbox

```bash
cd /project/workspace/affidexlab/new
./deploy-backend-sandbox.sh
```

### Step 4: Deploy Partners Production

```bash
cd /project/workspace/affidexlab/new
./deploy-partners-production.sh
```

### Step 5: Deploy Partners Sandbox

```bash
cd /project/workspace/affidexlab/new
./deploy-partners-sandbox.sh
```

---

## What Happens After Deployment?

After running the deployment, you'll see:
- ✅ 4 new projects in your Vercel dashboard
- URLs for each deployment

**Project Names:**
- `decaflow-api` (production backend)
- `decaflow-api-sandbox` (sandbox backend)
- `decaflow-partners` (production dashboard)
- `decaflow-partners-sandbox` (sandbox dashboard)

---

## Next: Configure DNS & Domains

After deployment completes, follow the instructions printed by the script:

1. **Add DNS records in Hostinger** (see DEPLOYMENT_GUIDE_PARTNERS.md)
2. **Add custom domains in Vercel** (see DEPLOYMENT_GUIDE_PARTNERS.md)
3. **Add environment variables** (see DEPLOYMENT_GUIDE_PARTNERS.md)
4. **Redeploy** each project

---

## Troubleshooting

### "vercel: command not found"

Install Vercel CLI:
```bash
npm install -g vercel
```

### "Not logged in"

Run:
```bash
vercel login
```

### "Permission denied"

Make scripts executable:
```bash
cd /project/workspace/affidexlab/new
chmod +x *.sh
```

---

## Need Help?

See the full guide: `DEPLOYMENT_GUIDE_PARTNERS.md`
