import express from 'express';
import { body, validationResult } from 'express-validator';
import { getSwapQuote, executeSwap } from '../../services/swapService.js';

const router = express.Router();

router.post('/quote', [
  body('fromToken').isString().isLength({ min: 42, max: 42 }),
  body('toToken').isString().isLength({ min: 42, max: 42 }),
  body('amount').isString().notEmpty(),
  body('chainId').isInt({ min: 1 }),
  body('slippage').optional().isFloat({ min: 0, max: 50 }),
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
    const quote = await getSwapQuote(req.body, req.partner);
    
    res.json({
      success: true,
      data: quote,
      meta: {
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Swap quote error:', error);
    res.status(500).json({
      error: 'Failed to get swap quote',
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
    const execution = await executeSwap(req.body, req.partner);
    
    res.json({
      success: true,
      data: execution,
      meta: {
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Swap execution error:', error);
    res.status(500).json({
      error: 'Failed to execute swap',
      message: error.message
    });
  }
});

export default router;
