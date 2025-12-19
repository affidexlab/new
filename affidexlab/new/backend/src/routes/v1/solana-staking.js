import express from 'express';
import { body, query, validationResult } from 'express-validator';
import {
  getStakeInfo,
  getPoolStatistics,
  createOffchainStake,
  requestClaim,
  updateRewards,
} from '../../services/solanaStakingService.js';

const router = express.Router();

router.get('/stake-info', [
  query('wallet').isString().notEmpty().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid parameters',
      details: errors.array(),
    });
  }

  try {
    const { wallet } = req.query;
    const stake = await getStakeInfo(wallet);

    res.json({
      success: true,
      data: stake,
    });
  } catch (error) {
    console.error('Get stake info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stake info',
      message: error.message,
    });
  }
});

router.get('/pool-stats', async (req, res) => {
  try {
    const stats = await getPoolStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get pool stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pool statistics',
      message: error.message,
    });
  }
});

router.post('/stake', [
  body('wallet').isString().notEmpty().trim(),
  body('amount').isNumeric(),
  body('lockPeriod').isString().notEmpty(),
  body('depositSignature').isString().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid parameters',
      details: errors.array(),
    });
  }

  try {
    const { wallet, amount, lockPeriod, depositSignature } = req.body;

    const result = await createOffchainStake({
      wallet,
      amount: Number(amount),
      lockPeriod,
      depositSignature,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Create off-chain stake error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create stake',
      message: error.message,
    });
  }
});

router.post('/claim', [
  body('wallet').isString().notEmpty().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid parameters',
      details: errors.array(),
    });
  }

  try {
    const { wallet } = req.body;

    const result = await requestClaim({ wallet });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Request claim error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request claim',
      message: error.message,
    });
  }
});

router.post('/admin/update-rewards', async (req, res) => {
  try {
    const result = await updateRewards();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Update rewards error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rewards',
      message: error.message,
    });
  }
});

export default router;
