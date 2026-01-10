# Backend API & Points System Debugging Guide

## Issue
Points, analytics, and leaderboard not updating after swaps.

## Step 1: Check Browser Console (CRITICAL)

After completing a swap, open browser console (F12 → Console tab) and look for these logs:

### ✅ Good Signs (Everything Working):
```
🔄 Recording transaction to backend: {txHash: "0x...", ...}
📡 API Base URL: https://api.decaflow.xyz
🏥 Backend health check: ✅ Connected
📥 Response status: 200 OK
✅ API Response: {success: true, data: {...}}
✅ Earned 1.50 points!
```

### ❌ Bad Signs (Backend Issues):

#### Issue 1: Backend Not Reachable
```
❌ Backend unreachable: https://api.decaflow.xyz
⚠️ Backend API is not reachable. Points will not be recorded.
```
**Solution:** Backend is not deployed or URL is wrong.

#### Issue 2: CORS Error
```
Access to fetch at 'https://api.decaflow.xyz/v1/webhooks/transaction-confirmed' 
from origin 'https://decaflow.xyz' has been blocked by CORS policy
```
**Solution:** Backend CORS needs to allow your domain.

#### Issue 3: API Validation Error
```
📥 Response status: 400 Bad Request
❌ API Error Response: {"error": "Validation failed", "details": [...]}
```
**Solution:** Check the validation details - likely missing required fields.

#### Issue 4: API Base URL Not Set
```
📡 API Base URL: undefined
```
**Solution:** VITE_API_BASE_URL environment variable not set in Vercel.

## Step 2: Verify Backend Deployment

### Check if Backend is Running
Open a new browser tab and visit:
```
https://api.decaflow.xyz/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-14T06:30:00.000Z"
}
```

If you get **404 or timeout**, backend is not deployed.

### Check Backend URL in Code
The default is: `https://api.decaflow.xyz`

You can override with Vercel environment variable: `VITE_API_BASE_URL`

## Step 3: Set Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
```
VITE_API_BASE_URL = https://api.decaflow.xyz
```

**After adding/changing:**
1. Save the variable
2. Redeploy the application (Environment Variables → Click deployment to trigger rebuild)

## Step 4: Backend CORS Configuration

Your backend needs to allow requests from your frontend domain.

**File:** `backend/src/server.js`

Check for CORS configuration:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://decaflow.xyz',
    'https://www.decaflow.xyz',
    'https://*.vercel.app'  // For preview deployments
  ],
  credentials: true
}));
```

## Step 5: Backend Database Connection

Points system requires PostgreSQL database. Check:

**In Backend Logs (Render/Railway/etc.):**
```
✅ Database connected
✅ Server running on port 3000
```

**Backend Environment Variables Needed:**
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3000
NODE_ENV=production
```

## Step 6: Test Backend Webhook Directly

Use curl or Postman to test the endpoint:

```bash
curl -X POST https://api.decaflow.xyz/v1/webhooks/transaction-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "transactionType": "swap",
    "amountUSD": 100.50,
    "fromChainId": 8453,
    "toChainId": 8453,
    "fromToken": "0xtoken1",
    "toToken": "0xtoken2"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {...},
    "pointsEarned": "100.50",
    "message": "Earned 100.50 points!"
  }
}
```

## Common Errors & Fixes

### Error: "Backend unreachable"
- ✅ Deploy backend to production (Render, Railway, or Vercel)
- ✅ Check backend service is running
- ✅ Verify backend URL is accessible

### Error: "CORS policy"
- ✅ Add your frontend domain to backend CORS allowed origins
- ✅ Redeploy backend after CORS changes

### Error: "Validation failed"
- ✅ Check console logs for specific validation errors
- ✅ Ensure wallet is connected (address is required)
- ✅ Ensure amountUSD is calculated correctly

### Error: "API returned 500"
- ✅ Check backend logs for errors
- ✅ Verify database connection
- ✅ Check PostgreSQL database is accessible

## What Should Happen (Success Flow)

1. User completes swap → Transaction confirmed on-chain
2. Frontend calls `trackSwap()` with transaction details
3. `trackSwap()` calls backend webhook endpoint
4. Backend validates data, calculates points, stores in database
5. Backend returns success with points earned
6. Frontend shows "Earned X points!" in console
7. Frontend emits transaction event
8. All components listening to events refetch their data:
   - Points tab refreshes (2s delay)
   - Leaderboard refreshes (2s delay)
   - Analytics refreshes (immediate)
   - Landing page stats refresh (immediate)

## Quick Test Checklist

After swap completion, check:
- [ ] Browser console shows "🔄 Recording transaction to backend"
- [ ] Console shows "🏥 Backend health check: ✅ Connected"
- [ ] Console shows "✅ Earned X points!"
- [ ] No red error messages in console
- [ ] Points tab updates within 3 seconds
- [ ] Leaderboard updates within 3 seconds

## If Everything Still Fails

**Share these with me:**
1. Screenshot of browser console after swap (F12 → Console)
2. Backend deployment URL
3. Backend logs (if accessible)
4. Vercel environment variables screenshot (hide sensitive values)

## Where is Your Backend Deployed?

Check your documentation:
- Render: `https://decaflow-api.onrender.com`
- Railway: `https://decaflow-api.railway.app`
- Vercel: `https://api.decaflow.xyz`
- Custom: Check your DNS records

The API_BASE_URL must point to your deployed backend!
