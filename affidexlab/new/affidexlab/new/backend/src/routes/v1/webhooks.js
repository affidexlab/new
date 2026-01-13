import express from 'express';
import { body, validationResult } from 'express-validator';
import { recordTransaction } from '../../services/pointsService.js';
import { trackProtocolRevenue } from '../../services/tvlService.js';

const router = express.Router();

const PROTOCOL_FEE_RATES = {
  swap: 0.003,
  bridge: 0.005,
  liquidity_add: 0.001,
  liquidity_remove: 0.001
};

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

    const feeRate = PROTOCOL_FEE_RATES[req.body.transactionType] || 0.003;
    const feeAmountUSD = req.body.amountUSD * feeRate;
    
    try {
      await trackProtocolRevenue({
        revenueType: `${req.body.transactionType}_fee`,
        source: req.body.transactionType === 'swap' ? '0x_protocol' : (req.body.transactionType === 'bridge' ? 'lifi' : 'uniswap_v3'),
        chainId: req.body.fromChainId || req.body.toChainId,
        amountUSD: feeAmountUSD,
        txHash: req.body.txHash,
        walletAddress: req.body.walletAddress
      });
      console.log(`✅ Protocol revenue tracked: $${feeAmountUSD.toFixed(4)} from ${req.body.transactionType}`);
    } catch (revenueError) {
      console.warn('⚠️  Revenue tracking failed (non-fatal):', revenueError.message);
    }

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
