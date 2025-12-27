import express from 'express';
import { body, query, validationResult } from 'express-validator';
import {
  getStakeInfo,
  getPoolStatistics,
  createOffchainStake,
  requestClaim,
  updateRewards,
  getCurrentVdmPriceUsdtInfo,
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

router.get('/vdm-price', async (req, res) => {
  try {
    const info = await getCurrentVdmPriceUsdtInfo();

    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error('Get VDM price error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get VDM price',
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

router.get('/admin/claims', async (req, res) => {
  try {
    const { getPendingClaims } = await import('../../services/solanaStakingService.js');
    const claims = await getPendingClaims();

    res.json({
      success: true,
      data: claims,
    });
  } catch (error) {
    console.error('Get pending claims error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending claims',
      message: error.message,
    });
  }
});

router.get('/admin/positions', async (req, res) => {
  try {
    const { getAllPositions } = await import('../../services/solanaStakingService.js');
    const positions = await getAllPositions();

    res.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    console.error('Get all positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get positions',
      message: error.message,
    });
  }
});

router.post('/admin/claims/:claimId/paid', async (req, res) => {
  try {
    const { claimId } = req.params;
    const { markClaimAsPaid } = await import('../../services/solanaStakingService.js');
    const result = await markClaimAsPaid(parseInt(claimId));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Mark claim as paid error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark claim as paid',
      message: error.message,
    });
  }
});

router.get('/admin/investments', async (req, res) => {
  try {
    const { getInvestments } = await import('../../services/solanaStakingService.js');
    const investments = await getInvestments();

    res.json({
      success: true,
      data: investments,
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get investments',
      message: error.message,
    });
  }
});

router.post('/admin/investments', [
  body('amount').isNumeric(),
  body('description').isString().notEmpty(),
  body('status').isString().optional(),
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
    const { amount, description, status } = req.body;
    const { createInvestment } = await import('../../services/solanaStakingService.js');
    const result = await createInvestment({ amount, description, status });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create investment',
      message: error.message,
    });
  }
});

router.post('/admin/investments/:investmentId/returns', [
  body('returns').isNumeric(),
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
    const { investmentId } = req.params;
    const { returns } = req.body;
    const { recordInvestmentReturns } = await import('../../services/solanaStakingService.js');
    const result = await recordInvestmentReturns(parseInt(investmentId), returns);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Record investment returns error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record investment returns',
      message: error.message,
    });
  }
});

export default router;
