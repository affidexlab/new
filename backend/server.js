import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Proxy for Socket API - keeps API key secret on server
app.get('/api/socket/quote', async (req, res) => {
  try {
    const { fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount, userAddress, uniqueRoutesPerBridge, sort } = req.query;

    const apiKey = process.env.SOCKET_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server not configured: SOCKET_API_KEY missing' });
    }

    const url = new URL('https://api.socket.tech/v2/quote');
    url.searchParams.set('fromChainId', String(fromChainId || ''));
    url.searchParams.set('toChainId', String(toChainId || ''));
    url.searchParams.set('fromTokenAddress', String(fromTokenAddress || ''));
    url.searchParams.set('toTokenAddress', String(toTokenAddress || ''));
    url.searchParams.set('fromAmount', String(fromAmount || ''));
    url.searchParams.set('userAddress', String(userAddress || '0x0000000000000000000000000000000000000000'));
    url.searchParams.set('uniqueRoutesPerBridge', String(uniqueRoutesPerBridge || 'true'));
    url.searchParams.set('sort', String(sort || 'output'));

    const response = await fetch(url.toString(), {
      headers: {
        'API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text();
    res.status(response.status).type('application/json').send(text);
  } catch (err) {
    console.error('Socket proxy error:', err);
    res.status(500).json({ error: 'Socket proxy failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend running on :${port}`));
