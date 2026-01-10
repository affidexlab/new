import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { query, validationResult } from 'express-validator';

dotenv.config();

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: [
        "'self'",
        'https://*.api.0x.org',
        'https://api.cow.fi',
        'https://api.socket.tech',
        'https://relay.walletconnect.com',
        'https://*.infura.io',
        'https://*.alchemy.com'
      ],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS: restrict to allowed origins (configured via ALLOWED_ORIGINS or defaults)
const defaultAllowed = [
  'https://decaflow.xyz',
  'https://decaflow.vercel.app'
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const origins = allowedOrigins.length ? allowedOrigins : defaultAllowed;

app.use(cors({
  origin: (origin, callback) => {
    // Reject requests with missing Origin to avoid CSRF from non-browser clients
    if (!origin) return callback(new Error('Origin required'));
    if (origins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false
}));

app.use(express.json());

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Proxy for Socket API - keeps API key secret on server
app.get('/api/socket/quote', [
  query('fromChainId').isInt({ min: 1 }).toInt(),
  query('toChainId').isInt({ min: 1 }).toInt(),
  query('fromTokenAddress').isString().isLength({ min: 42, max: 42 }),
  query('toTokenAddress').isString().isLength({ min: 42, max: 42 }),
  query('fromAmount').isString().trim(),
  query('userAddress').optional().isString().isLength({ min: 42, max: 42 }),
  query('uniqueRoutesPerBridge').optional().isIn(['true', 'false']),
  query('sort').optional().isIn(['output','time'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    const apiKey = process.env.SOCKET_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Service temporarily unavailable' });
    }

    const { fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount, userAddress, uniqueRoutesPerBridge, sort } = req.query;

    const url = new URL('https://api.socket.tech/v2/quote');
    url.searchParams.set('fromChainId', String(fromChainId));
    url.searchParams.set('toChainId', String(toChainId));
    url.searchParams.set('fromTokenAddress', String(fromTokenAddress));
    url.searchParams.set('toTokenAddress', String(toTokenAddress));
    url.searchParams.set('fromAmount', String(fromAmount));
    url.searchParams.set('userAddress', String(userAddress || '0x0000000000000000000000000000000000000000'));
    url.searchParams.set('uniqueRoutesPerBridge', String(uniqueRoutesPerBridge || 'true'));
    url.searchParams.set('sort', String(sort || 'output'));

    const response = await fetch(url.toString(), {
      headers: {
        'API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Bridge quote failed' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Socket proxy error:', err);
    return res.status(500).json({ error: 'Service error. Please try again.' });
  }
});

// Import analytics routes
import analyticsRoutes from './src/routes/v1/analytics.js';

// Import services
import './src/services/mempoolMonitor.js';
import './src/services/timeboostService.js';

// Register analytics API routes
app.use('/v1/analytics', analyticsRoutes);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Backend running on :${port}`);
  console.log('✅ Analytics API enabled at /v1/analytics');
  console.log('✅ Mempool monitor initialized');
  console.log('✅ Timeboost service initialized');
});
