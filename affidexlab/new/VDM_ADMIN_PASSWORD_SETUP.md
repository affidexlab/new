# VDM Admin Dashboard - Password Setup Guide

## Admin Dashboard URL
**Production URL**: `https://decaflow.xyz/still-vdm-decalab`

This secure URL is harder to guess and not exposed publicly.

---

## How to Change the Password in Production

### Option 1: Environment Variable (Recommended) ✅

The password is now controlled by the `VITE_VDM_ADMIN_PASSWORD` environment variable.

#### Step 1: Set Environment Variable in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (decaflow)
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `VITE_VDM_ADMIN_PASSWORD`
   - **Value**: Your secure password (e.g., `SecureVDM2025!@#`)
   - **Environment**: Production (check the box)
5. Click **Save**

#### Step 2: Redeploy

After adding the environment variable, you need to redeploy:

1. Go to **Deployments** tab in Vercel
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** (faster)
5. Click **Redeploy**

**Done!** Your new password is now active in production.

---

### Option 2: Direct Code Change (Not Recommended)

If you prefer to hardcode the password (less secure):

1. Open `app/src/pages/VDMAdmin.tsx`
2. Find line 29: `const ADMIN_PASSWORD = import.meta.env.VITE_VDM_ADMIN_PASSWORD || 'vdm-admin-2025';`
3. Change to: `const ADMIN_PASSWORD = 'YourSecurePassword123!';`
4. Commit and deploy

**⚠️ Warning**: This exposes the password in your source code. Not recommended for production.

---

## Password Security Best Practices

### ✅ Do:
- Use a strong password (minimum 16 characters)
- Include uppercase, lowercase, numbers, and symbols
- Store password in a password manager
- Use environment variables for production
- Change password every 90 days
- Share password only with authorized team members

### ❌ Don't:
- Use common passwords like "admin123" or "password"
- Share password in Slack/Discord/Email
- Hardcode password in source code
- Use the same password for multiple services
- Write password down on paper

### Example Strong Password:
```
VDM!Staking@2025#Secure$Admin%
```

---

## Testing the Password Change

### Local Testing (Development):

1. Create a `.env` file in the `app` folder:
   ```bash
   cd affidexlab/new/app
   nano .env
   ```

2. Add your password:
   ```
   VITE_VDM_ADMIN_PASSWORD=YourTestPassword123!
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

4. Navigate to: `http://localhost:5173/still-vdm-decalab`
5. Test login with your new password

### Production Testing:

1. After deploying with the new environment variable
2. Navigate to: `https://decaflow.xyz/still-vdm-decalab`
3. Enter your new password
4. Verify access to the dashboard

---

## How the Password Works

### Code Explanation:

```typescript
const ADMIN_PASSWORD = import.meta.env.VITE_VDM_ADMIN_PASSWORD || 'vdm-admin-2025';
```

This line means:
- **First**, try to use `VITE_VDM_ADMIN_PASSWORD` from environment variable
- **If not set**, fallback to default `'vdm-admin-2025'`

### Security Flow:

1. User visits `/still-vdm-decalab`
2. Password input appears
3. User enters password
4. Frontend checks: `password === ADMIN_PASSWORD`
5. If match → Show admin dashboard
6. If no match → Show error "Invalid password"

---

## Current Default Password

**⚠️ Default (for testing only)**: `vdm-admin-2025`

**You MUST change this before production launch!**

---

## Vercel Environment Variable Setup (Screenshots)

Since you're using Vercel, here's the exact path:

1. **Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Click **Add New**
3. Fill in:
   ```
   Name: VITE_VDM_ADMIN_PASSWORD
   Value: [Your Secure Password]
   Environments: ✅ Production
   ```
4. Click **Save**
5. Go to **Deployments** → Click **Redeploy** on latest deployment

---

## Troubleshooting

### "Invalid password" even with correct password
- Clear browser cache and cookies
- Check if environment variable is spelled correctly: `VITE_VDM_ADMIN_PASSWORD`
- Ensure you redeployed after adding the environment variable
- Check Vercel deployment logs for any errors

### Environment variable not working
- Verify the variable name starts with `VITE_` (required for Vite)
- Check that you selected "Production" environment in Vercel
- Wait a few minutes after deployment for changes to propagate
- Try a hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Forgot the password
- Check your Vercel environment variables
- If using default, it's `vdm-admin-2025`
- Update the environment variable in Vercel and redeploy

---

## Quick Reference

| Item | Value |
|------|-------|
| **Dashboard URL** | `https://decaflow.xyz/still-vdm-decalab` |
| **Environment Variable Name** | `VITE_VDM_ADMIN_PASSWORD` |
| **Default Password** | `vdm-admin-2025` (change immediately!) |
| **Where to Set** | Vercel → Settings → Environment Variables |
| **After Setting** | Redeploy the application |

---

## Next Steps

1. ✅ Add `VITE_VDM_ADMIN_PASSWORD` to Vercel environment variables
2. ✅ Set a strong, unique password
3. ✅ Redeploy the application
4. ✅ Test login at `/still-vdm-decalab`
5. ✅ Store password in team password manager
6. ✅ Share access only with authorized personnel

---

**Need Help?**

If you have issues with password setup, check:
- Vercel deployment logs
- Browser console (F12) for errors
- Verify environment variable is set correctly in Vercel dashboard
