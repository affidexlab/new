import express from 'express';
import { param, query as queryValidator, body, validationResult } from 'express-validator';
import {
  getUserPoints,
  getUserTransactions,
  recordTransaction,
  createMultiplier,
  updateAirdropEligibility,
  createAirdropSnapshot,
  getUserRewards,
  getTopPerformers,
  recordReward,
  updateRewardStatus,
  getGlobalMetrics
} from '../../services/pointsService.js';

const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getGlobalMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get global metrics error:', error);
    res.status(500).json({
      error: 'Failed to get global metrics',
      message: error.message
    });
  }
});

router.get('/user/:walletAddress', [
  param('walletAddress').isString().isLength({ min: 42, max: 42 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const points = await getUserPoints(req.params.walletAddress);
    res.json({
      success: true,
      data: points
    });
  } catch (error) {
    console.error('Get user points error:', error);
    res.status(500).json({
      error: 'Failed to get user points',
      message: error.message
    });
  }
});

router.get('/user/:walletAddress/transactions', [
  param('walletAddress').isString().isLength({ min: 42, max: 42 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const transactions = await getUserTransactions(req.params.walletAddress, limit, offset);
    
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          limit,
          offset,
          count: transactions.length
        }
      }
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      error: 'Failed to get user transactions',
      message: error.message
    });
  }
});

router.get('/user/:walletAddress/rewards', [
  param('walletAddress').isString().isLength({ min: 42, max: 42 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const rewards = await getUserRewards(req.params.walletAddress);
    res.json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('Get user rewards error:', error);
    res.status(500).json({
      error: 'Failed to get user rewards',
      message: error.message
    });
  }
});

router.post('/record', [
  body('txHash').isString().notEmpty(),
  body('walletAddress').isString().isLength({ min: 42, max: 42 }),
  body('transactionType').isString().isIn(['swap', 'bridge', 'liquidity_add', 'liquidity_remove', 'privacy_swap', 'vdm_staking']),
  body('amountUSD').isFloat({ min: 0 }),
  body('fromChainId').optional().isInt(),
  body('toChainId').optional().isInt(),
  body('fromToken').optional().isString(),
  body('toToken').optional().isString(),
  body('status').optional().isString().isIn(['pending', 'completed', 'failed'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const transaction = await recordTransaction(req.body);
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Record transaction error:', error);
    res.status(500).json({
      error: 'Failed to record transaction',
      message: error.message
    });
  }
});

router.get('/top-performers', [
  queryValidator('period').optional().isString().isIn(['weekly', 'monthly']),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const period = req.query.period || 'weekly';
    const limit = parseInt(req.query.limit) || 10;
    const performers = await getTopPerformers(period, limit);
    
    res.json({
      success: true,
      data: {
        period,
        performers
      }
    });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({
      error: 'Failed to get top performers',
      message: error.message
    });
  }
});

router.post('/admin/multiplier', [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('multiplier').isFloat({ min: 0.1, max: 100 }),
  body('transactionType').optional().isString().isIn(['swap', 'bridge', 'liquidity_add', 'liquidity_remove', 'privacy_swap', 'vdm_staking']),
  body('minAmountUSD').optional().isFloat({ min: 0 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const multiplier = await createMultiplier(req.body);
    res.json({
      success: true,
      data: multiplier
    });
  } catch (error) {
    console.error('Create multiplier error:', error);
    res.status(500).json({
      error: 'Failed to create multiplier',
      message: error.message
    });
  }
});

router.post('/admin/airdrop/update-eligibility', async (req, res) => {
  try {
    const result = await updateAirdropEligibility();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Update airdrop eligibility error:', error);
    res.status(500).json({
      error: 'Failed to update airdrop eligibility',
      message: error.message
    });
  }
});

router.post('/admin/airdrop/snapshot', async (req, res) => {
  try {
    const result = await createAirdropSnapshot();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Create airdrop snapshot error:', error);
    res.status(500).json({
      error: 'Failed to create airdrop snapshot',
      message: error.message
    });
  }
});

router.post('/admin/reward', [
  body('walletAddress').isString().isLength({ min: 42, max: 42 }),
  body('periodType').isString().isIn(['weekly', 'monthly']),
  body('periodStart').isISO8601(),
  body('periodEnd').isISO8601(),
  body('rank').isInt({ min: 1 }),
  body('points').isFloat({ min: 0 }),
  body('rewardAmountUSD').isFloat({ min: 0 }),
  body('status').optional().isString().isIn(['pending', 'paid', 'cancelled'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const reward = await recordReward(req.body);
    res.json({
      success: true,
      data: reward
    });
  } catch (error) {
    console.error('Record reward error:', error);
    res.status(500).json({
      error: 'Failed to record reward',
      message: error.message
    });
  }
});

router.patch('/admin/reward/:rewardId', [
  param('rewardId').isInt(),
  body('status').isString().isIn(['pending', 'paid', 'cancelled']),
  body('paymentTxHash').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const reward = await updateRewardStatus(req.params.rewardId, req.body.status, req.body.paymentTxHash);
    res.json({
      success: true,
      data: reward
    });
  } catch (error) {
    console.error('Update reward status error:', error);
    res.status(500).json({
      error: 'Failed to update reward status',
      message: error.message
    });
  }
});

export default router;
