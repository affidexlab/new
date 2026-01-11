import express from 'express';
import { param, query, body, validationResult } from 'express-validator';
import { getPool } from '../../db/connection.js';

const router = express.Router();

/**
 * GET /v1/analytics/user/:address/stats
 * Get user-specific MEV protection statistics
 */
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
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

/**
 * GET /v1/analytics/user/:address/history
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
  }
});

/**
 * GET /v1/analytics/leaderboard
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
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
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
  }
});

/**
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
  }
});

/**
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
  }
});

/**
 * GET /v1/analytics/export
 * Export analytics data as CSV
 */
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
