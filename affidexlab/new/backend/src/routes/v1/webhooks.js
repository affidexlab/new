import express from 'express';
import { body, validationResult } from 'express-validator';
import { recordTransaction } from '../../services/pointsService.js';

const router = express.Router();

router.post('/transaction-confirmed', [
  body('txHash').isString().notEmpty(),
  body('walletAddress').isString().isLength({ min: 42, max: 42 }),
  body('transactionType').isString().isIn(['swap', 'bridge', 'liquidity_add', 'liquidity_remove']),
  body('amountUSD').isFloat({ min: 0 }),
  body('fromChainId').optional().isInt(),
  body('toChainId').optional().isInt(),
  body('fromToken').optional().isString(),
  body('toToken').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const transaction = await recordTransaction({
      ...req.body,
      status: 'completed'
    });

    res.json({
      success: true,
      data: {
        transaction,
        pointsEarned: transaction.points_earned,
        message: `Earned ${parseFloat(transaction.points_earned).toFixed(2)} points!`
      }
    });
  } catch (error) {
    console.error('Transaction confirmation webhook error:', error);
    res.status(500).json({
      error: 'Failed to process transaction confirmation',
      message: error.message
    });
  }
});

export default router;
