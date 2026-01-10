# Backend CORS Fix & Deployment Instructions

## What Was Fixed

Updated backend CORS configuration to:
✅ Allow requests without origin header (for direct browser access)
✅ Allow `https://decaflow.xyz` and `https://www.decaflow.xyz`
✅ Allow ALL Vercel preview deployments (`*.vercel.app`)
✅ Allow proper HTTP methods and headers
✅ Better error logging for CORS issues

**Commit:** `ca4a874`

## REQUIRED: Redeploy Backend on Render

The backend code is updated in GitHub, but Render is still running the old code. You MUST redeploy:

### Option 1: Automatic Deploy (If Auto-Deploy is Enabled)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your backend service: `decaflow-backend`
3. Wait for automatic deployment to complete (~2 minutes)
4. Check logs for: `✅ Database initialized successfully`

### Option 2: Manual Deploy (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service: `decaflow-backend`
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment (~2 minutes)
5. Watch the logs for success messages

### Option 3: Redeploy via Render CLI
```bash
render deploy --service=decaflow-backend
```

## Verify Backend is Working

After Render finishes deploying:

### Test 1: Health Check (Direct Browser)
Open in browser:
```
https://decaflow-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": {...},
  "environment": "production",
  "version": "1.0.0",
  "timestamp": "2024-12-14T..."
}
```

**Should NOT see:** `{"error":"CORS policy violation"}`

### Test 2: API Endpoints (From Browser Console)
Open your live site, open console (F12), and run:
```javascript
fetch('https://decaflow-backend.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend reachable:', d))
  .catch(e => console.error('❌ Backend error:', e));
```

### Test 3: Do a Swap
1. Complete a swap on your live site
2. Open console (F12)
3. Look for:
   ```
   🔄 Recording transaction to backend
   🏥 Backend health check: ✅ Connected
   ✅ Earned X points!
   ```

## What Should Happen Now

After backend redeploys + frontend is already updated:

1. **Frontend calls:** `https://decaflow-backend.onrender.com/v1/webhooks/transaction-confirmed`
2. **Backend accepts** the request (CORS allows it)
3. **Backend processes** the transaction and awards points
4. **Backend returns** success with points earned
5. **Frontend emits** transaction event
6. **All components** refresh their data:
   - ✅ Points tab updates (2-3 seconds)
   - ✅ Leaderboard updates (2-3 seconds)
   - ✅ Analytics updates (immediate)
   - ✅ Homepage stats update (immediate)

## Troubleshooting

### Still Getting CORS Error
- **Check:** Backend is actually redeployed (check timestamp in logs)
- **Check:** You're on the latest frontend deployment (commit `b2955a8` or later)
- **Try:** Hard refresh browser (`Ctrl+Shift+R`)

### Backend Not Deploying
- **Check:** Render has the correct GitHub repo connected
- **Check:** Render is watching the `main` branch
- **Try:** Disconnect and reconnect GitHub integration

### Database Errors
If you see database errors in Render logs:
```
❌ Database initialization failed
```

**Solution:** Check Render environment variables has `DATABASE_URL` set correctly.

## After Everything Works

Once you confirm points are updating:
1. Do 2-3 test swaps
2. Verify each shows in:
   - Recent swaps panel
   - Points tab
   - Leaderboard
   - Analytics
3. Check browser console has no errors

## Summary

**What you need to do RIGHT NOW:**
1. ✅ Go to Render Dashboard
2. ✅ Find `decaflow-backend` service
3. ✅ Click "Manual Deploy" → "Deploy latest commit"
4. ✅ Wait 2 minutes for deployment
5. ✅ Test: Open `https://decaflow-backend.onrender.com/health`
6. ✅ Should see `{"status":"ok",...}` NOT CORS error
7. ✅ Do a test swap on live site
8. ✅ Watch console for "✅ Earned X points!"

Then everything will work! 🎉
