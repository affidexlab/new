import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase, healthCheck } from './db/connection.js';

import { authenticatePartner } from './middleware/auth.js';
import swapRoutes from './routes/v1/swap.js';
import liquidityRoutes from './routes/v1/liquidity.js';
import bridgeRoutes from './routes/v1/bridge.js';
import webhooksRoutes from './routes/v1/webhooks.js';
import pointsRoutes from './routes/v1/points.js';
import leaderboardRoutes from './routes/v1/leaderboard.js';
import solanaStakingRoutes from './routes/v1/solana-staking.js';
import investorMetricsRoutes from './routes/v1/investor-metrics.js';
import mevRoutes from './routes/v1/mev.js';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const isSandbox = process.env.ENVIRONMENT === 'sandbox';

app.use(helmet({
  contentSecurityPolicy: isProduction ? {
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
        'https://li.quest'
      ],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  } : false,
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

const allowedOriginsEnv = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const defaultOrigins = [
  'https://decaflow.xyz',
  'https://www.decaflow.xyz',
  'https://decaflow.vercel.app',
  'https://partners.decaflow.xyz',
  'https://partners-sandbox.decaflow.xyz',
  'https://tychiwallet.com',
  'https://app.tychiwallet.com'
];

if (!isProduction) {
  defaultOrigins.push('http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080');
}

// Always include defaultOrigins even when ALLOWED_ORIGINS is set
const origins = Array.from(new Set([...defaultOrigins, ...allowedOriginsEnv]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Allow any decaflow.xyz subdomain
    if (origin === 'https://decaflow.xyz' || origin === 'https://www.decaflow.xyz' || origin.endsWith('.decaflow.xyz')) {
      return callback(null, true);
    }
    
    // Check exact match
    if (origins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin starts with allowed origin
    if (origins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    
    // Allow all Vercel preview deployments
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    console.warn('⚠️ CORS blocked origin:', origin, 'Allowed origins:', origins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Partner-ID']
}));

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProduction ? 100 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/v1/', apiLimiter);

app.get('/health', async (_req, res) => {
  const dbHealth = await healthCheck();
  res.json({
    status: dbHealth.healthy ? 'ok' : 'degraded',
    database: dbHealth,
    environment: isSandbox ? 'sandbox' : 'production',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/v1', (_req, res) => {
  res.json({
    name: 'DecaFlow Partner API',
    version: '1.0.0',
    environment: isSandbox ? 'sandbox' : 'production',
    endpoints: {
      swap: {
        quote: 'POST /v1/swap/quote',
        execute: 'POST /v1/swap/execute'
      },
      liquidity: {
        pools: 'GET /v1/liquidity/pools?chainId={id}',
        add: 'POST /v1/liquidity/add',
        remove: 'POST /v1/liquidity/remove',
        positions: 'GET /v1/liquidity/positions?wallet={address}'
      },
      bridge: {
        quote: 'POST /v1/bridge/quote',
        execute: 'POST /v1/bridge/execute',
        status: 'GET /v1/bridge/status/{trackingId}'
      }
    },
    documentation: 'https://docs.decaflow.xyz/api',
    authentication: 'X-Partner-ID header required'
  });
});

app.use('/v1/swap', authenticatePartner, swapRoutes);
app.use('/v1/liquidity', authenticatePartner, liquidityRoutes);
app.use('/v1/bridge', authenticatePartner, bridgeRoutes);
app.use('/v1/webhooks', webhooksRoutes);
app.use('/v1/points', pointsRoutes);
app.use('/v1/leaderboard', leaderboardRoutes);
app.use('/v1/solana-staking', solanaStakingRoutes);
app.use('/v1/investor-metrics', investorMetricsRoutes);
app.use('/v1/mev', mevRoutes); // MEV prediction and risk scoring
app.use('/api/socket', bridgeRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'Origin required' || err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isProduction ? {} : { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    suggestion: 'See /v1 for available endpoints'
  });
});

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    if (process.env.DATABASE_URL) {
      console.log('🔄 Initializing database...');
      await initializeDatabase();
      console.log('✅ Database initialized successfully');
    } else {
      console.warn('⚠️  DATABASE_URL not set, skipping database initialization');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Server will continue but points system will not work');
  }

  app.listen(port, () => {
    console.log(`🚀 DecaFlow API Server`);
    console.log(`📍 Port: ${port}`);
    console.log(`🌍 Environment: ${isSandbox ? 'Sandbox' : 'Production'}`);
    console.log(`🔒 CORS: ${origins.length} origins allowed`);
    console.log(`⏰ Started: ${new Date().toISOString()}`);
  });
}

startServer();

export default app;
