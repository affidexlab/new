import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { 
  getLiquidityPools, 
  addLiquidity,
  increaseLiquidity, 
  removeLiquidity,
  collectFees, 
  getUserPositions 
} from '../../services/liquidityService.js';

const router = express.Router();

const DLMM_PROVIDERS = [
  {
    id: 'maverick-base',
    name: 'Maverick Protocol',
    status: 'live',
    supportedChains: [8453],
    docsUrl: 'https://docs.mav.xyz/',
    description: 'Dynamic Distribution AMM powering Goose.run MemeFi and other Base deployments. Battle-tested across Ethereum and zkSync with programmable liquidity bins.',
    integrationNotes: 'Interact through Maverick Router / Boosted Pools. Supports concentrated, auto-shifting bins ideal for DLMM incentives.',
    tags: ['dlmm', 'base', 'battle-tested']
  }
];

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
  body('poolAddress').isString().isLength({ min: 42, max: 42 }),
  body('token0Amount').isString().notEmpty(),
  body('token1Amount').isString().notEmpty(),
  body('tickLower').isInt(),
  body('tickUpper').isInt(),
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

router.post('/increase', [
  body('tokenId').isString().notEmpty(),
  body('token0Amount').isString().notEmpty(),
  body('token1Amount').isString().notEmpty(),
  body('chainId').isInt({ min: 1 }),
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
    const result = await increaseLiquidity(req.body, req.partner);
    
    res.json({
      success: true,
      data: result,
      meta: {
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Increase liquidity error:', error);
    res.status(500).json({
      error: 'Failed to increase liquidity',
      message: error.message
    });
  }
});

router.post('/remove', [
  body('tokenId').isString().notEmpty(),
  body('liquidity').isString().notEmpty(),
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

router.post('/collect', [
  body('tokenId').isString().notEmpty(),
  body('chainId').isInt({ min: 1 }),
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
    const result = await collectFees(req.body, req.partner);
    
    res.json({
      success: true,
      data: result,
      meta: {
        partnerId: req.partner?.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Collect fees error:', error);
    res.status(500).json({
      error: 'Failed to collect fees',
      message: error.message
    });
  }
});

router.get('/dlmm/providers', (_req, res) => {
  res.json({
    success: true,
    data: {
      providers: DLMM_PROVIDERS,
      updatedAt: new Date().toISOString()
    }
  });
});

export default router;
