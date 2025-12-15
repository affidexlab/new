import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { getBridgeQuote, executeBridge, getBridgeStatus } from '../../services/bridgeService.js';

const router = express.Router();

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
