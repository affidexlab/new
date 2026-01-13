import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  calculateMEVRisk,
  calculateMEVSavings,
  calculateProtectedTransactionFees,
  getHistoricalMEVData,
} from '../../services/mevPredictionService.js';

const router = express.Router();

/**
 * POST /api/v1/mev/risk-score
 * Calculate MEV risk score for a potential trade
 */
router.post('/risk-score', [
  body('chainId').isInt({ min: 1 }),
  body('tokenIn').isString().isLength({ min: 42, max: 42 }),
  body('tokenOut').isString().isLength({ min: 42, max: 42 }),
  body('amount').isString().notEmpty(),
  body('tokenInPrice').optional().isFloat({ min: 0 }),
  body('tokenOutPrice').optional().isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const risk = await calculateMEVRisk(req.body);
    
    // Calculate potential savings if privacy routing is used
    const savings = calculateMEVSavings(risk.riskScore, risk.estimatedMEV);
    
    // Calculate fees for protected transaction
    const fees = calculateProtectedTransactionFees(
      risk.factors.tradeSizeUSD,
      savings.estimatedMEVSaved
    );
    
    res.json({
      success: true,
      data: {
        ...risk,
        savings,
        fees,
      },
      meta: {
        timestamp: new Date().toISOString(),
        model: 'DecaFlow MEV Prediction v1.0',
      },
    });
  } catch (error) {
    console.error('MEV risk calculation error:', error);
    res.status(500).json({
      error: 'Failed to calculate MEV risk',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/mev/historical/:chainId
 * Get historical MEV data for analytics
 */
router.get('/historical/:chainId', async (req, res) => {
  try {
    const chainId = parseInt(req.params.chainId);
    const days = parseInt(req.query.days) || 30;
    
    if (isNaN(chainId) || chainId < 1) {
      return res.status(400).json({
        error: 'Invalid chain ID',
      });
    }
    
    if (days < 1 || days > 365) {
      return res.status(400).json({
        error: 'Days must be between 1 and 365',
      });
    }
    
    const data = await getHistoricalMEVData(chainId, days);
    
    res.json({
      success: true,
      data: {
        chainId,
        days,
        history: data,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Historical MEV data error:', error);
    res.status(500).json({
      error: 'Failed to fetch historical MEV data',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/mev/savings-estimate
 * Estimate MEV savings for privacy routing
 */
router.post('/savings-estimate', [
  body('riskScore').isFloat({ min: 0, max: 10 }),
  body('estimatedMEV').isFloat({ min: 0 }),
  body('tradeSizeUSD').isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const { riskScore, estimatedMEV, tradeSizeUSD } = req.body;
    
    const savings = calculateMEVSavings(riskScore, estimatedMEV);
    const fees = calculateProtectedTransactionFees(tradeSizeUSD, savings.estimatedMEVSaved);
    
    res.json({
      success: true,
      data: {
        savings,
        fees,
        worthIt: fees.netBenefit > 0,
        recommendation: fees.netBenefit > 0 
          ? 'Privacy routing recommended - you save more than the fees'
          : 'Direct routing may be better - fees exceed MEV savings',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Savings estimate error:', error);
    res.status(500).json({
      error: 'Failed to estimate savings',
      message: error.message,
    });
  }
});

export default router;
