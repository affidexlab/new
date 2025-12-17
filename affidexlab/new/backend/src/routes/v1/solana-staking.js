import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { 
  getStakingPositions,
  createStakeTransaction,
  createUnstakeTransaction,
  createClaimTransaction,
  confirmStake,
  confirmUnstake,
  getPoolStatistics,
  updateRewards
} from '../../services/solanaStakingService.js';

const router = express.Router();

router.get('/positions', [
  query('wallet').isString().notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters',
      details: errors.array() 
    });
  }

  try {
    const positions = await getStakingPositions(req.query.wallet);
    
    res.json({
      success: true,
      data: {
        wallet: req.query.wallet,
        positions,
        totalPositions: positions.length
      }
    });
  } catch (error) {
    console.error('Get staking positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get staking positions',
      message: error.message
    });
  }
});

router.post('/stake', [
  body('wallet').isString().notEmpty().trim(),
  body('poolId').isString().notEmpty(),
  body('vdmAmount').isNumeric(),
  body('pairTokenAmount').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters',
      details: errors.array() 
    });
  }

  try {
    const { wallet, poolId, vdmAmount, pairTokenAmount } = req.body;
    
    const transaction = await createStakeTransaction({
      wallet,
      poolId,
      vdmAmount,
      pairTokenAmount
    });
    
    res.json({
      success: true,
      data: {
        transaction,
        poolId,
        vdmAmount,
        pairTokenAmount
      }
    });
  } catch (error) {
    console.error('Stake transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create stake transaction',
      message: error.message
    });
  }
});

router.post('/unstake', [
  body('wallet').isString().notEmpty().trim(),
  body('poolId').isString().notEmpty(),
  body('lpTokenAmount').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters',
      details: errors.array() 
    });
  }

  try {
    const { wallet, poolId, lpTokenAmount } = req.body;
    
    const transaction = await createUnstakeTransaction({
      wallet,
      poolId,
      lpTokenAmount
    });
    
    res.json({
      success: true,
      data: {
        transaction,
        poolId,
        lpTokenAmount
      }
    });
  } catch (error) {
    console.error('Unstake transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create unstake transaction',
      message: error.message
    });
  }
});

router.post('/claim', [
  body('wallet').isString().notEmpty().trim(),
  body('poolId').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters',
      details: errors.array() 
    });
  }

  try {
    const { wallet, poolId } = req.body;
    
    const transaction = await createClaimTransaction({
      wallet,
      poolId
    });
    
    res.json({
      success: true,
      data: {
        transaction,
        poolId
      }
    });
  } catch (error) {
    console.error('Claim transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create claim transaction',
      message: error.message
    });
  }
});

router.post('/confirm', [
  body('wallet').isString().notEmpty().trim(),
  body('signature').isString().notEmpty(),
  body('poolId').isString().notEmpty(),
  body('vdmAmount').isNumeric(),
  body('pairTokenAmount').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters',
      details: errors.array() 
    });
  }

  try {
    const result = await confirmStake(req.body);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Confirm stake error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm stake',
      message: error.message
    });
  }
});

router.post('/confirm-unstake', [
  body('wallet').isString().notEmpty().trim(),
  body('signature').isString().notEmpty(),
  body('poolId').isString().notEmpty(),
  body('lpTokenAmount').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters',
      details: errors.array() 
    });
  }

  try {
    const result = await confirmUnstake(req.body);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Confirm unstake error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm unstake',
      message: error.message
    });
  }
});

router.get('/pool-stats', [
  query('poolId').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters',
      details: errors.array() 
    });
  }

  try {
    const stats = await getPoolStatistics(req.query.poolId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get pool stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pool statistics',
      message: error.message
    });
  }
});

router.post('/admin/update-rewards', async (req, res) => {
  try {
    const result = await updateRewards();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Update rewards error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rewards',
      message: error.message
    });
  }
});

export default router;
