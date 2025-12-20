import express from 'express';
import {
  calculateTVL,
  getProtocolRevenue,
  getMonthlyRecurringRevenue,
  getGrowthRates,
  getWalletDistribution,
  getTransactionSuccessRate,
  getAverageTransactionSize
} from '../../services/tvlService.js';

const router = express.Router();

router.get('/tvl', async (req, res) => {
  try {
    const tvlData = await calculateTVL();
    res.json({
      success: true,
      data: tvlData
    });
  } catch (error) {
    console.error('TVL fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch TVL',
      message: error.message
    });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const revenueData = await getProtocolRevenue(start, end);
    const mrr = await getMonthlyRecurringRevenue();

    res.json({
      success: true,
      data: {
        ...revenueData,
        monthlyRecurringRevenue: mrr,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Revenue fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue',
      message: error.message
    });
  }
});

router.get('/growth', async (req, res) => {
  try {
    const growthData = await getGrowthRates();
    res.json({
      success: true,
      data: growthData
    });
  } catch (error) {
    console.error('Growth rates fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch growth rates',
      message: error.message
    });
  }
});

router.get('/wallet-distribution', async (req, res) => {
  try {
    const distribution = await getWalletDistribution();
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Wallet distribution fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet distribution',
      message: error.message
    });
  }
});

router.get('/success-rate', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const successRate = await getTransactionSuccessRate(start, end);
    res.json({
      success: true,
      data: successRate
    });
  } catch (error) {
    console.error('Success rate fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch success rate',
      message: error.message
    });
  }
});

router.get('/avg-transaction-size', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const avgSize = await getAverageTransactionSize(parseInt(days));
    res.json({
      success: true,
      data: avgSize
    });
  } catch (error) {
    console.error('Avg transaction size fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch average transaction size',
      message: error.message
    });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const [
      tvlData,
      mrr,
      growthData,
      distribution,
      successRate,
      avgSize
    ] = await Promise.all([
      calculateTVL(),
      getMonthlyRecurringRevenue(),
      getGrowthRates(),
      getWalletDistribution(),
      getTransactionSuccessRate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      getAverageTransactionSize(30)
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenueData = await getProtocolRevenue(thirtyDaysAgo, new Date());

    res.json({
      success: true,
      data: {
        tvl: tvlData,
        revenue: {
          total: revenueData.totalRevenue,
          monthlyRecurring: mrr,
          breakdown: revenueData.breakdown
        },
        growth: growthData,
        wallets: {
          total: distribution.totalWallets,
          top10Concentration: distribution.top10Concentration,
          top100Concentration: distribution.top100Concentration
        },
        performance: {
          successRate: successRate.successRate,
          averageTransactionSize: avgSize.averageSize
        }
      }
    });
  } catch (error) {
    console.error('Overview fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investor overview',
      message: error.message
    });
  }
});

export default router;
