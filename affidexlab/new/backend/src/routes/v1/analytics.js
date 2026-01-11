<<<<<<< HEAD
import express from 'express';
import { param, query, body, validationResult } from 'express-validator';
import { getPool } from '../../db/connection.js';

=======
/**
 * Analytics API Routes
 * User-specific analytics, historical data, and advanced metrics
 */

const express = require('express');
>>>>>>> origin/main
const router = express.Router();

/**
 * GET /v1/analytics/user/:address/stats
 * Get user-specific MEV protection statistics
 */
<<<<<<< HEAD
router.get('/user/:address/stats', [
  param('address').isEthereumAddress()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid address', details: errors.array() });
  }

  try {
    const { address } = req.params;
    const pool = await getPool();

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_swaps,
        COUNT(*) FILTER (WHERE privacy_mode = true) as privacy_swaps,
        COALESCE(SUM(mev_saved), 0) as total_mev_saved,
        COALESCE(AVG(mev_saved), 0) as avg_mev_saved,
        MAX(created_at) as last_swap_at
      FROM swaps
      WHERE from_address = $1
    `, [address.toLowerCase()]);

    const stats = result.rows[0];
    const protectionRate = stats.total_swaps > 0
      ? (stats.privacy_swaps / stats.total_swaps * 100).toFixed(1)
      : 0;

    const leaderboardRank = await pool.query(`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT from_address, SUM(mev_saved) as total_saved
        FROM swaps
        WHERE privacy_mode = true
        GROUP BY from_address
        HAVING SUM(mev_saved) > (
          SELECT COALESCE(SUM(mev_saved), 0)
          FROM swaps
          WHERE from_address = $1 AND privacy_mode = true
        )
      ) ranked
    `, [address.toLowerCase()]);

    res.json({
      success: true,
      data: {
        address,
        stats: {
          totalSwaps: parseInt(stats.total_swaps),
          privacySwaps: parseInt(stats.privacy_swaps),
          totalMEVSaved: parseFloat(stats.total_mev_saved),
          avgMEVSaved: parseFloat(stats.avg_mev_saved),
          protectionRate: parseFloat(protectionRate),
          lastSwapAt: stats.last_swap_at,
          globalRank: parseInt(leaderboardRank.rows[0].rank)
        },
        achievements: getAchievements(stats)
      }
    });
=======
router.get('/user/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    const chainId = req.query.chainId || 42161;

    // TODO: Query from database
    // For now, return simulated data
    const stats = {
      totalSaved: Math.random() * 5000,
      swapCount: Math.floor(Math.random() * 100) + 10,
      protectionRate: Math.random() * 100,
      averageMEVPerSwap: Math.random() * 50,
      rank: Math.floor(Math.random() * 1000) + 1,
      firstSwapDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
      lastSwapDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    };

    res.json(stats);
>>>>>>> origin/main
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

/**
 * GET /v1/analytics/user/:address/history
<<<<<<< HEAD
 * Get user's swap history with pagination
 */
router.get('/user/:address/history', [
  param('address').isEthereumAddress(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  try {
    const { address } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const pool = await getPool();

    const result = await pool.query(`
      SELECT * FROM swaps
      WHERE from_address = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [address.toLowerCase(), limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM swaps WHERE from_address = $1',
      [address.toLowerCase()]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        swaps: result.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching swap history:', error);
    res.status(500).json({ error: 'Failed to fetch swap history' });
=======
 * Get user's swap history with MEV protection details
 */
router.get('/user/:address/history', async (req, res) => {
  try {
    const { address } = req.params;
    const {
      chainId = 42161,
      offset = 0,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = req.query;

    // TODO: Query from database
    // For now, return simulated data
    const history = [];
    for (let i = 0; i < Math.min(limit, 20); i++) {
      history.push({
        transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        tokenIn: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        tokenOut: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        amountIn: '1000000000000000000',
        amountOut: '3000000000',
        mevSaved: Math.random() * 200,
        timestamp: Date.now() - i * 24 * 60 * 60 * 1000,
        privacyEnabled: Math.random() > 0.3,
        riskScore: Math.random() * 10,
      });
    }

    res.json({
      history,
      hasMore: offset + limit < 100,
      total: 100,
    });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Failed to fetch user history' });
>>>>>>> origin/main
  }
});

/**
 * GET /v1/analytics/leaderboard
<<<<<<< HEAD
 * Get global leaderboard of top MEV protectors
 */
router.get('/leaderboard', [
  query('period').optional().isIn(['7d', '30d', '90d', 'all']),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  try {
    const period = req.query.period || '30d';
    const limit = parseInt(req.query.limit) || 50;

    const pool = await getPool();
    
    let whereClause = 'WHERE privacy_mode = true';
    if (period !== 'all') {
      const days = parseInt(period);
      whereClause += ` AND created_at >= NOW() - INTERVAL '${days} days'`;
    }

    const result = await pool.query(`
      SELECT 
        from_address,
        COUNT(*) as swap_count,
        SUM(mev_saved) as total_mev_saved,
        AVG(mev_saved) as avg_mev_saved,
        MAX(created_at) as last_swap_at
      FROM swaps
      ${whereClause}
      GROUP BY from_address
      ORDER BY total_mev_saved DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: {
        period,
        leaderboard: result.rows.map((row, index) => ({
          rank: index + 1,
          address: row.from_address,
          swapCount: parseInt(row.swap_count),
          totalMEVSaved: parseFloat(row.total_mev_saved),
          avgMEVSaved: parseFloat(row.avg_mev_saved),
          lastSwapAt: row.last_swap_at
        }))
      }
    });
=======
 * Get global leaderboard of top MEV savers
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { chainId = 42161, limit = 100 } = req.query;

    // TODO: Query from database
    const leaderboard = [];
    for (let i = 0; i < Math.min(limit, 100); i++) {
      leaderboard.push({
        rank: i + 1,
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        totalSaved: 10000 - i * 50,
        swapCount: 1000 - i * 5,
        protectionRate: 95 - i * 0.3,
      });
    }

    res.json({ leaderboard });
>>>>>>> origin/main
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
<<<<<<< HEAD
 * GET /v1/analytics/tokens/:tokenAddress
 * Get MEV statistics for a specific token
 */
router.get('/tokens/:tokenAddress', [
  param('tokenAddress').isEthereumAddress()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid token address', details: errors.array() });
  }

  try {
    const { tokenAddress } = req.params;
    const pool = await getPool();

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_swaps,
        SUM(amount_in_usd) as total_volume,
        SUM(mev_saved) as total_mev_saved,
        AVG(mev_saved) as avg_mev_per_swap
      FROM swaps
      WHERE (token_in = $1 OR token_out = $1)
        AND privacy_mode = true
    `, [tokenAddress.toLowerCase()]);

    res.json({
      success: true,
      data: {
        tokenAddress,
        stats: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching token analytics:', error);
    res.status(500).json({ error: 'Failed to fetch token analytics' });
=======
 * POST /v1/analytics/alerts/subscribe
 * Subscribe to MEV risk alerts
 */
router.post('/alerts/subscribe', async (req, res) => {
  try {
    const {
      address,
      alertType,
      threshold,
      notificationChannel,
      tokenPairs,
    } = req.body;

    // TODO: Store in database
    const alert = {
      id: Math.random().toString(36).slice(2),
      address,
      alertType,
      threshold,
      notificationChannel,
      tokenPairs,
      createdAt: Date.now(),
      active: true,
    };

    res.json({
      success: true,
      alert,
      message: 'Alert subscription created successfully',
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert subscription' });
>>>>>>> origin/main
  }
});

/**
<<<<<<< HEAD
 * GET /v1/analytics/protocols
 * Get MEV statistics by protocol
 */
router.get('/protocols', async (_req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.query(`
      SELECT 
        protocol,
        COUNT(*) as swap_count,
        SUM(amount_in_usd) as total_volume,
        SUM(mev_saved) as total_mev_saved
      FROM swaps
      WHERE privacy_mode = true
      GROUP BY protocol
      ORDER BY total_mev_saved DESC
    `);

    res.json({
      success: true,
      data: {
        protocols: result.rows
      }
    });
  } catch (error) {
    console.error('Error fetching protocol analytics:', error);
    res.status(500).json({ error: 'Failed to fetch protocol analytics' });
=======
 * GET /v1/analytics/alerts/:address
 * Get user's active alerts
 */
router.get('/alerts/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // TODO: Query from database
    const alerts = [
      {
        id: 'alert-1',
        address,
        alertType: 'high_risk',
        threshold: 8,
        notificationChannel: 'email',
        active: true,
        triggeredCount: 5,
      },
      {
        id: 'alert-2',
        address,
        alertType: 'gas_spike',
        threshold: 50,
        notificationChannel: 'telegram',
        active: true,
        triggeredCount: 12,
      },
    ];

    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
>>>>>>> origin/main
  }
});

/**
<<<<<<< HEAD
 * POST /v1/analytics/alerts/subscribe
 * Subscribe to MEV risk alerts
 */
router.post('/alerts/subscribe', [
  body('address').isEthereumAddress(),
  body('channel').isIn(['email', 'telegram', 'discord']),
  body('contactInfo').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  try {
    res.json({
      success: true,
      message: 'Alert subscription created',
      data: {
        address: req.body.address,
        channel: req.body.channel,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error creating alert subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
=======
 * GET /v1/analytics/tokens/:tokenAddress
 * Get MEV analytics for a specific token
 */
router.get('/tokens/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    const { chainId = 42161, days = 30 } = req.query;

    // TODO: Query from database
    const tokenStats = {
      tokenAddress,
      symbol: 'WETH',
      totalMEVExtracted: Math.random() * 500000,
      transactionsAffected: Math.floor(Math.random() * 10000),
      avgMEVPerTx: Math.random() * 50,
      riskLevel: Math.random() > 0.5 ? 'high' : 'medium',
      topPairs: [
        { pair: 'WETH-USDC', mevExtracted: 125000 },
        { pair: 'WETH-USDT', mevExtracted: 98000 },
      ],
    };

    res.json(tokenStats);
  } catch (error) {
    console.error('Error fetching token analytics:', error);
    res.status(500).json({ error: 'Failed to fetch token analytics' });
  }
});

/**
 * GET /v1/analytics/protocols
 * Get MEV analytics by protocol
 */
router.get('/protocols', async (req, res) => {
  try {
    const { chainId = 42161 } = req.query;

    const protocols = [
      { name: 'Uniswap V3', mevExtracted: 250000, txCount: 8500, avgRisk: 6.2 },
      { name: 'Camelot', mevExtracted: 180000, txCount: 6200, avgRisk: 5.8 },
      { name: 'GMX', mevExtracted: 145000, txCount: 3400, avgRisk: 7.1 },
      { name: 'Sushiswap', mevExtracted: 98000, txCount: 4100, avgRisk: 5.4 },
    ];

    res.json({ protocols });
  } catch (error) {
    console.error('Error fetching protocol analytics:', error);
    res.status(500).json({ error: 'Failed to fetch protocol analytics' });
>>>>>>> origin/main
  }
});

/**
 * GET /v1/analytics/export
 * Export analytics data as CSV
 */
<<<<<<< HEAD
router.get('/export', [
  query('format').optional().isIn(['csv', 'json']),
  query('period').optional().isIn(['7d', '30d', '90d', 'all'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  try {
    const format = req.query.format || 'csv';
    const period = req.query.period || '30d';

    const pool = await getPool();
    
    let whereClause = '';
    if (period !== 'all') {
      const days = parseInt(period);
      whereClause = `WHERE created_at >= NOW() - INTERVAL '${days} days'`;
    }

    const result = await pool.query(`
      SELECT * FROM swaps
      ${whereClause}
      ORDER BY created_at DESC
    `);

    if (format === 'csv') {
      const csvHeader = Object.keys(result.rows[0] || {}).join(',');
      const csvRows = result.rows.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      );
      const csv = [csvHeader, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="decaflow-analytics-${period}.csv"`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: result.rows
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

function getAchievements(stats) {
  const achievements = [];

  if (stats.total_swaps >= 1) {
    achievements.push({ id: 'first_swap', name: 'First Swap', unlocked: true });
  }

  if (stats.total_swaps >= 100) {
    achievements.push({ id: 'century', name: '100 Swaps', unlocked: true });
  }

  if (parseFloat(stats.total_mev_saved) >= 10000) {
    achievements.push({ id: 'big_saver', name: '$10K+ Saved', unlocked: true });
  }

  if (stats.privacy_swaps >= 50) {
    achievements.push({ id: 'privacy_pro', name: 'Privacy Pro', unlocked: true });
  }

  return achievements;
}

export default router;
=======
router.get('/export', async (req, res) => {
  try {
    const { chainId = 42161, format = 'csv', days = 30 } = req.query;

    // TODO: Generate actual export data
    if (format === 'csv') {
      const csv = `date,mev_extracted,transactions_affected,avg_mev_per_tx\n2026-01-10,150000,5000,30\n2026-01-09,145000,4800,30.2\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="decaflow-analytics-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

module.exports = router;
>>>>>>> origin/main
