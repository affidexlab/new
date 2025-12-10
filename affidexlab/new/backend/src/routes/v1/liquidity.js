import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { 
  getLiquidityPools, 
  addLiquidity, 
  removeLiquidity, 
  getUserPositions 
} from '../../services/liquidityService.js';

const router = express.Router();

router.get('/pools', [
  query('chainId').isInt({ min: 1 }).toInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const pools = await getLiquidityPools(req.query.chainId, req.partner);
    
    res.json({
      success: true,
      data: pools,
      meta: {
        chainId: req.query.chainId,
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get pools error:', error);
    res.status(500).json({
      error: 'Failed to get liquidity pools',
      message: error.message
    });
  }
});

router.post('/add', [
  body('poolId').isString().notEmpty(),
  body('token0Amount').isString().notEmpty(),
  body('token1Amount').isString().notEmpty(),
  body('chainId').isInt({ min: 1 }),
  body('walletAddress').isString().isLength({ min: 42, max: 42 }),
  body('deadline').optional().isInt(),
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
    const result = await addLiquidity(req.body, req.partner);
    
    res.json({
      success: true,
      data: result,
      meta: {
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Add liquidity error:', error);
    res.status(500).json({
      error: 'Failed to add liquidity',
      message: error.message
    });
  }
});

router.post('/remove', [
  body('positionId').isString().notEmpty(),
  body('liquidity').isString().notEmpty(),
  body('chainId').isInt({ min: 1 }),
  body('walletAddress').isString().isLength({ min: 42, max: 42 }),
  body('deadline').optional().isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const result = await removeLiquidity(req.body, req.partner);
    
    res.json({
      success: true,
      data: result,
      meta: {
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Remove liquidity error:', error);
    res.status(500).json({
      error: 'Failed to remove liquidity',
      message: error.message
    });
  }
});

router.get('/positions', [
  query('wallet').isString().isLength({ min: 42, max: 42 }),
  query('chainId').optional().isInt({ min: 1 }).toInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const positions = await getUserPositions(req.query, req.partner);
    
    res.json({
      success: true,
      data: positions,
      meta: {
        wallet: req.query.wallet,
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({
      error: 'Failed to get user positions',
      message: error.message
    });
  }
});

export default router;
