# Backend Setup on Render (Protect API Keys)

This guide sets up a minimal backend to proxy Socket API requests, keeping your API key secure and off the frontend.

## 1) What You’ll Deploy

A small Node.js + Express server with one route:
- GET /api/socket/quote — proxies to Socket API with your server-side API key

Repo path: `/backend`

## 2) Prepare Your Repo

The backend already exists at:
- `backend/package.json`
- `backend/server.js`

You don’t need to change anything to deploy.

## 3) Create Web Service on Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub account and select your repo (affidexlab/new)
4. Configure service:
   - Name: `decaflow-backend`
   - Root Directory: `backend`
   - Build Command: (leave empty — not needed)
   - Start Command: `node server.js`
   - Runtime: Node
   - Region: Closest to your users (e.g., Frankfurt or Virginia)
5. Environment Variables:
   - `NODE_ENV=production`
   - `SOCKET_API_KEY=your_socket_api_key_here`
6. Click "Create Web Service"

Wait 1-2 minutes for deployment. You’ll get a URL like `https://decaflow-backend.onrender.com`.

## 4) Point Frontend to Backend

In your Vercel project (DecaFlow webapp):
1. Go to Project → Settings → Environment Variables
2. Add:
   - `VITE_BACKEND_URL=https://decaflow-backend.onrender.com`
3. Redeploy the app.

Frontend will now call:
- `GET {VITE_BACKEND_URL}/api/socket/quote?...`

No API keys ever leave your server.

## 5) Test

- Health: `curl https://decaflow-backend.onrender.com/health` → `{ "status": "ok" }`
- Quote: 
```
curl "https://decaflow-backend.onrender.com/api/socket/quote?fromChainId=42161&toChainId=8453&fromTokenAddress=0xaf88d065e77c8cC2239327C5EDb3A432268e5831&toTokenAddress=0xaf88d065e77c8cC2239327C5EDb3A432268e5831&fromAmount=1000000&userAddress=0x0000000000000000000000000000000000000000"
```

Should return a Socket route object.

## 6) Optional Hardening

- Add IP rate limiting (express-rate-limit)
- Add HTTPS enforcement (Render already provides TLS)
- Add CORS restriction to DecaFlow domain
- Add request validation and schema checks

## 7) Costs

- Render free tier works for small traffic
- Upgrade if you see high usage

## 8) Troubleshooting

- 500 error: Check `SOCKET_API_KEY` is set
- CORS error: Ensure CORS middleware is enabled and origin allowed
- Timeout: Socket API might be slow — try again

---

With this backend, the Socket API key is never exposed in the frontend. ✅
