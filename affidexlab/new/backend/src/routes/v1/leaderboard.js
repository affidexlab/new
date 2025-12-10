import express from 'express';
import { query as queryValidator, validationResult } from 'express-validator';
import { getLeaderboard, updateLeaderboardCache } from '../../services/pointsService.js';

const router = express.Router();

router.get('/', [
  queryValidator('period').optional().isString().isIn(['all', 'weekly', 'monthly']),
  queryValidator('limit').optional().isInt({ min: 1, max: 500 }),
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
    const period = req.query.period || 'all';
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const leaderboard = await getLeaderboard(period, limit, offset);

    res.json({
      success: true,
      data: {
        period,
        leaderboard,
        pagination: {
          limit,
          offset,
          count: leaderboard.length
        },
        lastUpdated: leaderboard[0]?.last_updated || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to get leaderboard',
      message: error.message
    });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    await updateLeaderboardCache();
    res.json({
      success: true,
      message: 'Leaderboard cache refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to refresh leaderboard',
      message: error.message
    });
  }
});

export default router;
