import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { getBridgeQuote, executeBridge, getBridgeStatus } from '../../services/bridgeService.js';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/socket/quote', async (req, res) => {
  try {
    const apiKey = process.env.SOCKET_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Bridge service unavailable',
        message: 'Socket API key not configured'
      });
    }

    const url = new URL('https://api.socket.tech/v2/quote');
    
    Object.keys(req.query).forEach(key => {
      url.searchParams.set(key, req.query[key]);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Socket API returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Socket proxy error:', error);
    res.status(500).json({
      error: 'Failed to fetch bridge quote',
      message: error.message
    });
  }
});

router.post('/quote', [
  body('fromChainId').isInt({ min: 1 }),
  body('toChainId').isInt({ min: 1 }),
  body('fromToken').isString().isLength({ min: 42, max: 42 }),
  body('toToken').isString().isLength({ min: 42, max: 42 }),
  body('amount').isString().notEmpty(),
  body('walletAddress').isString().isLength({ min: 42, max: 42 }),
  body('slippage').optional().isFloat({ min: 0, max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const quote = await getBridgeQuote(req.body, req.partner);
    
    res.json({
      success: true,
      data: quote,
      meta: {
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Bridge quote error:', error);
    res.status(500).json({
      error: 'Failed to get bridge quote',
      message: error.message
    });
  }
});

router.post('/execute', [
  body('quoteId').isString().notEmpty(),
  body('walletAddress').isString().isLength({ min: 42, max: 42 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const execution = await executeBridge(req.body, req.partner);
    
    res.json({
      success: true,
      data: execution,
      meta: {
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Bridge execution error:', error);
    res.status(500).json({
      error: 'Failed to execute bridge',
      message: error.message
    });
  }
});

router.get('/status/:trackingId', [
  param('trackingId').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const status = await getBridgeStatus(req.params.trackingId, req.partner);
    
    res.json({
      success: true,
      data: status,
      meta: {
        trackingId: req.params.trackingId,
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Bridge status error:', error);
    res.status(500).json({
      error: 'Failed to get bridge status',
      message: error.message
    });
  }
});

export default router;
