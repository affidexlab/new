import { query } from '../db/connection.js';

const POINTS_CONFIG = {
  swap: {
    baseRate: 2.0,
    minAmount: 10,
  },
  bridge: {
    baseRate: 4.0,
    minAmount: 5,
  },
  liquidity: {
    add: {
      baseRate: 7.0,
      minAmount: 50,
    },
    remove: {
      baseRate: 1.5,
      minAmount: 0,
    },
  },
  privacy_swap: {
    baseRate: 2.5,
    minAmount: 10,
  },
  vdm_staking: {
    baseRate: 2.5,
    minAmount: 10,
  },
};

export const calculatePoints = async (transactionType, amountUSD, walletAddress) => {
  let basePoints = 0;
  let multiplier = 1.0;

  switch (transactionType) {
    case 'swap':
      if (amountUSD >= POINTS_CONFIG.swap.minAmount) {
        basePoints = amountUSD * POINTS_CONFIG.swap.baseRate;
      }
      break;
    case 'bridge':
      if (amountUSD >= POINTS_CONFIG.bridge.minAmount) {
        basePoints = amountUSD * POINTS_CONFIG.bridge.baseRate;
      }
      break;
    case 'liquidity_add':
      if (amountUSD >= POINTS_CONFIG.liquidity.add.minAmount) {
        basePoints = amountUSD * POINTS_CONFIG.liquidity.add.baseRate;
      }
      break;
    case 'liquidity_remove':
      basePoints = amountUSD * POINTS_CONFIG.liquidity.remove.baseRate;
      break;
    case 'privacy_swap':
      if (amountUSD >= POINTS_CONFIG.privacy_swap.minAmount) {
        basePoints = amountUSD * POINTS_CONFIG.privacy_swap.baseRate;
      }
      break;
    case 'vdm_staking':
      if (amountUSD >= POINTS_CONFIG.vdm_staking.minAmount) {
        basePoints = amountUSD * POINTS_CONFIG.vdm_staking.baseRate;
      }
      break;
    default:
      basePoints = 0;
  }

  const activeMultipliers = await getActiveMultipliers(transactionType, amountUSD);
  if (activeMultipliers.length > 0) {
    multiplier = activeMultipliers.reduce((acc, m) => acc * parseFloat(m.multiplier), 1.0);
  }

  const finalPoints = basePoints * multiplier;
  return { points: finalPoints, multiplier, basePoints };
};

export const getActiveMultipliers = async (transactionType, amountUSD) => {
  const result = await query(
    `SELECT * FROM point_multipliers 
     WHERE active = TRUE 
     AND (transaction_type IS NULL OR transaction_type = $1)
     AND (min_amount_usd IS NULL OR min_amount_usd <= $2)
     AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
     AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)`,
    [transactionType, amountUSD]
  );
  return result.rows;
};

export const recordTransaction = async (txData) => {
  const {
    txHash,
    walletAddress,
    transactionType,
    fromChainId,
    toChainId,
    fromToken,
    toToken,
    amountUSD,
    status = 'completed'
  } = txData;

  await ensureUserExists(walletAddress);

  const { points, multiplier } = await calculatePoints(transactionType, amountUSD, walletAddress);

  const result = await query(
    `INSERT INTO transactions 
     (tx_hash, wallet_address, transaction_type, from_chain_id, to_chain_id, 
      from_token, to_token, amount_usd, points_earned, multiplier, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (tx_hash) DO UPDATE SET status = $11
     RETURNING *`,
    [txHash, walletAddress.toLowerCase(), transactionType, fromChainId, toChainId, 
     fromToken, toToken, amountUSD, points, multiplier, status]
  );

  if (status === 'completed') {
    await updateLeaderboardCache(walletAddress);
  }

  return result.rows[0];
};

export const ensureUserExists = async (walletAddress) => {
  const address = walletAddress.toLowerCase();
  const result = await query(
    `INSERT INTO users (wallet_address, referral_code)
     VALUES ($1, $2)
     ON CONFLICT (wallet_address) DO NOTHING
     RETURNING *`,
    [address, generateReferralCode()]
  );
  return result.rows[0];
};

export const getUserPoints = async (walletAddress) => {
  const result = await query(
    `SELECT 
      wallet_address,
      total_points,
      weekly_points,
      monthly_points,
      total_volume_usd,
      transaction_count,
      referral_code,
      airdrop_eligible,
      created_at,
      (SELECT COUNT(*) FROM users WHERE total_points > u.total_points) + 1 as global_rank,
      (SELECT COUNT(*) FROM users WHERE weekly_points > u.weekly_points) + 1 as weekly_rank,
      (SELECT COUNT(*) FROM users WHERE monthly_points > u.monthly_points) + 1 as monthly_rank
     FROM users u
     WHERE wallet_address = $1`,
    [walletAddress.toLowerCase()]
  );

  if (result.rows.length === 0) {
    await ensureUserExists(walletAddress);
    return getUserPoints(walletAddress);
  }

  return result.rows[0];
};

export const getUserTransactions = async (walletAddress, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT * FROM transactions 
     WHERE wallet_address = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [walletAddress.toLowerCase(), limit, offset]
  );
  return result.rows;
};

export const updateLeaderboardCache = async (walletAddress = null) => {
  const periods = ['all', 'weekly', 'monthly'];
  
  for (const period of periods) {
    let pointsColumn = 'total_points';
    if (period === 'weekly') pointsColumn = 'weekly_points';
    if (period === 'monthly') pointsColumn = 'monthly_points';

    if (walletAddress) {
      const userResult = await query(
        `SELECT 
          wallet_address,
          ${pointsColumn} as points,
          total_volume_usd as volume_usd,
          transaction_count,
          (SELECT COUNT(*) FROM users WHERE ${pointsColumn} > u.${pointsColumn}) + 1 as rank
         FROM users u
         WHERE wallet_address = $1`,
        [walletAddress.toLowerCase()]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        await query(
          `INSERT INTO leaderboard_cache 
           (period_type, wallet_address, rank, points, volume_usd, transaction_count, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           ON CONFLICT (period_type, wallet_address) 
           DO UPDATE SET 
             rank = $3,
             points = $4,
             volume_usd = $5,
             transaction_count = $6,
             last_updated = CURRENT_TIMESTAMP`,
          [period, user.wallet_address, user.rank, user.points, user.volume_usd, user.transaction_count]
        );
      }
    } else {
      const usersResult = await query(
        `SELECT 
          wallet_address,
          ${pointsColumn} as points,
          total_volume_usd as volume_usd,
          transaction_count,
          ROW_NUMBER() OVER (ORDER BY ${pointsColumn} DESC) as rank
         FROM users
         WHERE ${pointsColumn} > 0
         ORDER BY ${pointsColumn} DESC`
      );

      for (const user of usersResult.rows) {
        await query(
          `INSERT INTO leaderboard_cache 
           (period_type, wallet_address, rank, points, volume_usd, transaction_count, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           ON CONFLICT (period_type, wallet_address) 
           DO UPDATE SET 
             rank = $3,
             points = $4,
             volume_usd = $5,
             transaction_count = $6,
             last_updated = CURRENT_TIMESTAMP`,
          [period, user.wallet_address, user.rank, user.points, user.volume_usd, user.transaction_count]
        );
      }
    }
  }
};

export const getLeaderboard = async (period = 'all', limit = 100, offset = 0) => {
  const result = await query(
    `SELECT * FROM leaderboard_cache 
     WHERE period_type = $1 
     ORDER BY rank ASC 
     LIMIT $2 OFFSET $3`,
    [period, limit, offset]
  );
  return result.rows;
};

export const createMultiplier = async (multiplierData) => {
  const {
    name,
    description,
    multiplier,
    transactionType,
    minAmountUSD,
    startDate,
    endDate,
    active = true
  } = multiplierData;

  const result = await query(
    `INSERT INTO point_multipliers 
     (name, description, multiplier, transaction_type, min_amount_usd, start_date, end_date, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, description, multiplier, transactionType, minAmountUSD, startDate, endDate, active]
  );

  return result.rows[0];
};

export const updateAirdropEligibility = async () => {
  await query(
    `UPDATE users 
     SET airdrop_eligible = TRUE 
     WHERE total_points >= 1000 AND transaction_count >= 5`
  );

  const result = await query(
    `SELECT COUNT(*) as eligible_count FROM users WHERE airdrop_eligible = TRUE`
  );

  return result.rows[0];
};

export const createAirdropSnapshot = async () => {
  await query(
    `INSERT INTO airdrop_snapshots (wallet_address, total_points, total_volume_usd, transaction_count, eligible, snapshot_date)
     SELECT 
       wallet_address,
       total_points,
       total_volume_usd,
       transaction_count,
       airdrop_eligible,
       CURRENT_TIMESTAMP
     FROM users
     WHERE airdrop_eligible = TRUE`
  );

  const result = await query(
    `SELECT COUNT(*) as snapshot_count FROM airdrop_snapshots WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM airdrop_snapshots)`
  );

  return result.rows[0];
};

const generateReferralCode = () => {
  return 'DECA' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const resetWeeklyPoints = async () => {
  await query(`SELECT reset_weekly_points()`);
  console.log('✅ Weekly points reset completed');
};

export const resetMonthlyPoints = async () => {
  await query(`SELECT reset_monthly_points()`);
  console.log('✅ Monthly points reset completed');
};

export const getTopPerformers = async (period = 'weekly', limit = 10) => {
  let pointsColumn = period === 'weekly' ? 'weekly_points' : 'monthly_points';
  
  const result = await query(
    `SELECT 
      wallet_address,
      ${pointsColumn} as points,
      total_volume_usd,
      transaction_count,
      ROW_NUMBER() OVER (ORDER BY ${pointsColumn} DESC) as rank
     FROM users
     WHERE ${pointsColumn} > 0
     ORDER BY ${pointsColumn} DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};

export const recordReward = async (rewardData) => {
  const {
    walletAddress,
    periodType,
    periodStart,
    periodEnd,
    rank,
    points,
    rewardAmountUSD,
    status = 'pending'
  } = rewardData;

  const result = await query(
    `INSERT INTO rewards 
     (wallet_address, period_type, period_start, period_end, rank, points, reward_amount_usd, reward_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [walletAddress.toLowerCase(), periodType, periodStart, periodEnd, rank, points, rewardAmountUSD, status]
  );

  return result.rows[0];
};

export const getUserRewards = async (walletAddress) => {
  const result = await query(
    `SELECT * FROM rewards 
     WHERE wallet_address = $1 
     ORDER BY created_at DESC`,
    [walletAddress.toLowerCase()]
  );
  return result.rows;
};

export const updateRewardStatus = async (rewardId, status, paymentTxHash = null) => {
  const result = await query(
    `UPDATE rewards 
     SET reward_status = $1, payment_tx_hash = $2, paid_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [status, paymentTxHash, rewardId]
  );
  return result.rows[0];
};

export const getGlobalMetrics = async () => {
  try {
    // Run all queries in parallel for better performance
    const [transactionsResult, stakingResult, allWalletsResult] = await Promise.all([
      query(
        `SELECT 
          COUNT(*) as total_trades,
          COALESCE(SUM(amount_usd), 0) as total_volume_usd
         FROM transactions 
         WHERE status = 'completed'`
      ),
      query(
        `SELECT 
          COUNT(*) as total_stakes,
          COALESCE(SUM(staked_amount), 0) as total_staking_volume
         FROM solana_staking_positions 
         WHERE status IN ('active', 'completed')`
      ).catch(() => ({ rows: [{ total_stakes: 0, total_staking_volume: 0 }] })),
      query(
        `SELECT COUNT(*) as total_wallets FROM users`
      )
    ]);
    
    const txMetrics = transactionsResult.rows[0];
    const stakingMetrics = stakingResult.rows[0];
    const walletMetrics = allWalletsResult.rows[0];
    
    const totalTrades = (parseInt(txMetrics.total_trades) || 0) + (parseInt(stakingMetrics.total_stakes) || 0);
    const totalVolume = (parseFloat(txMetrics.total_volume_usd) || 0) + (parseFloat(stakingMetrics.total_staking_volume) || 0);
    const uniqueWallets = parseInt(walletMetrics.total_wallets) || 0;
    
    console.log('📊 Analytics Data:', { totalTrades, totalVolume, uniqueWallets });
    
    return {
      totalTrades,
      totalVolumeUsd: totalVolume,
      uniqueWallets
    };
  } catch (error) {
    console.error('❌ Error fetching global metrics:', error);
    throw error; // Let the endpoint handle the error properly
  }
};
