import { query } from '../db/connection.js';
import fetch from 'node-fetch';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const PRICE_CACHE_TTL = 60000;
const priceCache = new Map();

const CHAIN_PLATFORMS = {
  1: 'ethereum',
  8453: 'base',
  42161: 'arbitrum-one',
  10: 'optimistic-ethereum',
  137: 'polygon-pos',
  43114: 'avalanche'
};

let stakingTableChecked = false;
let stakingTableExistsCache = false;

async function hasStakingTable() {
  if (stakingTableChecked) {
    return stakingTableExistsCache;
  }

  try {
    const result = await query(`SELECT to_regclass('public.solana_staking_positions') as reg`);
    stakingTableExistsCache = Boolean(result.rows[0]?.reg);
  } catch (error) {
    console.warn('⚠️  Failed to check staking table availability:', error.message);
    stakingTableExistsCache = false;
  }

  stakingTableChecked = true;
  return stakingTableExistsCache;
}

async function getTokenPrice(tokenAddress, chainId) {
  const cacheKey = `${chainId}-${tokenAddress.toLowerCase()}`;
  const cached = priceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL) {
    return cached.price;
  }

  try {
    const platform = CHAIN_PLATFORMS[chainId];
    if (!platform) return 0;

    const response = await fetch(
      `${COINGECKO_API}/simple/token_price/${platform}?contract_addresses=${tokenAddress}&vs_currencies=usd`,
      { timeout: 5000 }
    );
    
    const data = await response.json();
    const price = data[tokenAddress.toLowerCase()]?.usd || 0;
    
    priceCache.set(cacheKey, { price, timestamp: Date.now() });
    return price;
  } catch (error) {
    console.error('Price fetch error:', error);
    return 0;
  }
}

export async function trackLiquidityPosition(params) {
  const {
    walletAddress,
    chainId,
    poolAddress,
    tokenId,
    token0Address,
    token1Address,
    token0Symbol,
    token1Symbol,
    token0Amount,
    token1Amount,
    feeTier,
    tickLower,
    tickUpper,
    txHash
  } = params;

  const token0Price = await getTokenPrice(token0Address, chainId);
  const token1Price = await getTokenPrice(token1Address, chainId);

  const token0AmountFloat = parseFloat(token0Amount);
  const token1AmountFloat = parseFloat(token1Amount);

  const token0USD = token0AmountFloat * token0Price;
  const token1USD = token1AmountFloat * token1Price;
  const totalUSD = token0USD + token1USD;

  const result = await query(
    `INSERT INTO liquidity_positions (
      wallet_address, chain_id, pool_address, token_id,
      token0_address, token1_address, token0_symbol, token1_symbol,
      token0_amount, token1_amount, token0_amount_usd, token1_amount_usd,
      total_value_usd, fee_tier, tick_lower, tick_upper, tx_hash, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *`,
    [
      walletAddress, chainId, poolAddress, tokenId,
      token0Address, token1Address, token0Symbol, token1Symbol,
      token0Amount, token1Amount, token0USD.toFixed(2), token1USD.toFixed(2),
      totalUSD.toFixed(2), feeTier, tickLower, tickUpper, txHash, 'active'
    ]
  );

  return result.rows[0];
}

export async function updateLiquidityPosition(tokenId, chainId, status = 'removed') {
  const result = await query(
    `UPDATE liquidity_positions 
     SET status = $1, removed_at = CURRENT_TIMESTAMP, last_updated = CURRENT_TIMESTAMP
     WHERE token_id = $2 AND chain_id = $3
     RETURNING *`,
    [status, tokenId, chainId]
  );

  return result.rows[0];
}

export async function calculateTVL() {
  try {
    const positionsResult = await query(
      `SELECT 
        chain_id,
        pool_address,
        token0_address,
        token1_address,
        SUM(token0_amount::decimal) as total_token0,
        SUM(token1_amount::decimal) as total_token1
       FROM liquidity_positions
       WHERE status = 'active'
       GROUP BY chain_id, pool_address, token0_address, token1_address`
    );

    let totalTVL = 0;
    const tvlByChain = {};

    for (const position of positionsResult.rows) {
      const token0Price = await getTokenPrice(position.token0_address, position.chain_id);
      const token1Price = await getTokenPrice(position.token1_address, position.chain_id);

      const token0Value = parseFloat(position.total_token0 || 0) * token0Price;
      const token1Value = parseFloat(position.total_token1 || 0) * token1Price;
      const poolTVL = token0Value + token1Value;

      totalTVL += poolTVL;

      if (!tvlByChain[position.chain_id]) {
        tvlByChain[position.chain_id] = 0;
      }
      tvlByChain[position.chain_id] += poolTVL;
    }

    let stakingTVL = 0;
    const stakingTableExists = await hasStakingTable();
    if (stakingTableExists) {
      const stakingResult = await query(
        `SELECT COALESCE(SUM(staked_amount), 0) as total_staked
         FROM solana_staking_positions
         WHERE status = 'active'`
      ).catch(() => ({ rows: [{ total_staked: 0 }] }));
      stakingTVL = parseFloat(stakingResult.rows[0]?.total_staked || 0);
      totalTVL += stakingTVL;
    } else {
      console.log('ℹ️  Staking table not present, skipping staking TVL');
    }

    return {
      totalTVL,
      liquidityTVL: totalTVL - stakingTVL,
      stakingTVL,
      tvlByChain
    };
  } catch (error) {
    console.error('TVL calculation error:', error);
    return {
      totalTVL: 0,
      liquidityTVL: 0,
      stakingTVL: 0,
      tvlByChain: {}
    };
  }
}

export async function trackProtocolRevenue(params) {
  const { revenueType, source, chainId, amountUSD, txHash, walletAddress } = params;

  const result = await query(
    `INSERT INTO protocol_revenue (
      revenue_type, source, chain_id, amount_usd, tx_hash, wallet_address
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [revenueType, source, chainId, amountUSD, txHash, walletAddress]
  );

  return result.rows[0];
}

export async function getProtocolRevenue(startDate, endDate) {
  const result = await query(
    `SELECT 
      revenue_type,
      source,
      SUM(amount_usd) as total_revenue,
      COUNT(*) as transaction_count
     FROM protocol_revenue
     WHERE created_at >= $1 AND created_at <= $2
     GROUP BY revenue_type, source`,
    [startDate, endDate]
  );

  const totalRevenue = await query(
    `SELECT COALESCE(SUM(amount_usd), 0) as total
     FROM protocol_revenue
     WHERE created_at >= $1 AND created_at <= $2`,
    [startDate, endDate]
  );

  return {
    totalRevenue: parseFloat(totalRevenue.rows[0].total),
    breakdown: result.rows
  };
}

export async function getMonthlyRecurringRevenue() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await query(
    `SELECT COALESCE(SUM(amount_usd), 0) as mrr
     FROM protocol_revenue
     WHERE created_at >= $1`,
    [thirtyDaysAgo]
  );

  return parseFloat(result.rows[0].mrr);
}

export async function getGrowthRates() {
  const now = new Date();
  
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);
  
  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(now.getMonth() - 2);

  const [lastWeekVolume, prevWeekVolume, lastMonthVolume, prevMonthVolume] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(amount_usd), 0) as volume FROM transactions 
       WHERE created_at >= $1 AND status = 'completed'`,
      [lastWeek]
    ),
    query(
      `SELECT COALESCE(SUM(amount_usd), 0) as volume FROM transactions 
       WHERE created_at >= $1 AND created_at < $2 AND status = 'completed'`,
      [twoWeeksAgo, lastWeek]
    ),
    query(
      `SELECT COALESCE(SUM(amount_usd), 0) as volume FROM transactions 
       WHERE created_at >= $1 AND status = 'completed'`,
      [lastMonth]
    ),
    query(
      `SELECT COALESCE(SUM(amount_usd), 0) as volume FROM transactions 
       WHERE created_at >= $1 AND created_at < $2 AND status = 'completed'`,
      [twoMonthsAgo, lastMonth]
    )
  ]);

  const lastWeekVol = parseFloat(lastWeekVolume.rows[0].volume);
  const prevWeekVol = parseFloat(prevWeekVolume.rows[0].volume);
  const lastMonthVol = parseFloat(lastMonthVolume.rows[0].volume);
  const prevMonthVol = parseFloat(prevMonthVolume.rows[0].volume);

  const weekOverWeek = prevWeekVol > 0 
    ? ((lastWeekVol - prevWeekVol) / prevWeekVol * 100).toFixed(2)
    : '0';
  
  const monthOverMonth = prevMonthVol > 0
    ? ((lastMonthVol - prevMonthVol) / prevMonthVol * 100).toFixed(2)
    : '0';

  return {
    weekOverWeek: parseFloat(weekOverWeek),
    monthOverMonth: parseFloat(monthOverMonth),
    lastWeekVolume: lastWeekVol,
    prevWeekVolume: prevWeekVol,
    lastMonthVolume: lastMonthVol,
    prevMonthVolume: prevMonthVol
  };
}

export async function getWalletDistribution() {
  const result = await query(
    `SELECT 
      wallet_address,
      total_volume_usd,
      transaction_count,
      total_points
     FROM users
     ORDER BY total_volume_usd DESC
     LIMIT 100`
  );

  const allWallets = await query(
    `SELECT COUNT(*) as total FROM users`
  );

  const totalVolume = await query(
    `SELECT COALESCE(SUM(total_volume_usd), 0) as total FROM users`
  );

  const totalVol = parseFloat(totalVolume.rows[0].total);
  const top10Volume = result.rows.slice(0, 10).reduce((sum, w) => sum + parseFloat(w.total_volume_usd || 0), 0);
  const top100Volume = result.rows.reduce((sum, w) => sum + parseFloat(w.total_volume_usd || 0), 0);

  return {
    totalWallets: parseInt(allWallets.rows[0].total),
    top10Wallets: result.rows.slice(0, 10),
    top100Wallets: result.rows,
    top10Concentration: totalVol > 0 ? ((top10Volume / totalVol) * 100).toFixed(2) : '0',
    top100Concentration: totalVol > 0 ? ((top100Volume / totalVol) * 100).toFixed(2) : '0'
  };
}

export async function getTransactionSuccessRate(startDate, endDate) {
  const result = await query(
    `SELECT 
      status,
      COUNT(*) as count
     FROM transactions
     WHERE created_at >= $1 AND created_at <= $2
     GROUP BY status`,
    [startDate, endDate]
  );

  const stats = result.rows.reduce((acc, row) => {
    acc[row.status] = parseInt(row.count);
    acc.total += parseInt(row.count);
    return acc;
  }, { total: 0, completed: 0, pending: 0, failed: 0 });

  const successRate = stats.total > 0 
    ? ((stats.completed / stats.total) * 100).toFixed(2)
    : '100';

  return {
    successRate: parseFloat(successRate),
    totalTransactions: stats.total,
    completed: stats.completed,
    pending: stats.pending,
    failed: stats.failed
  };
}

export async function getAverageTransactionSize(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await query(
    `SELECT 
      DATE(created_at) as date,
      AVG(amount_usd) as avg_size,
      COUNT(*) as count
     FROM transactions
     WHERE created_at >= $1 AND status = 'completed'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [startDate]
  );

  const overall = await query(
    `SELECT AVG(amount_usd) as avg_size
     FROM transactions
     WHERE created_at >= $1 AND status = 'completed'`,
    [startDate]
  );

  return {
    averageSize: parseFloat(overall.rows[0]?.avg_size || 0).toFixed(2),
    trend: result.rows.map(row => ({
      date: row.date,
      averageSize: parseFloat(row.avg_size || 0).toFixed(2),
      count: parseInt(row.count)
    }))
  };
}

export async function updateDailyMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tvlData = await calculateTVL();
  const revenueData = await getProtocolRevenue(today, new Date());

  const volumeData = await query(
    `SELECT 
      COALESCE(SUM(amount_usd), 0) as total_volume,
      COUNT(*) as total_trades,
      COUNT(DISTINCT wallet_address) as unique_wallets
     FROM transactions
     WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'`
  );

  const volumeByType = await query(
    `SELECT 
      transaction_type,
      COALESCE(SUM(amount_usd), 0) as volume
     FROM transactions
     WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'
     GROUP BY transaction_type`
  );

  const volumes = volumeByType.rows.reduce((acc, row) => {
    acc[row.transaction_type] = parseFloat(row.volume);
    return acc;
  }, {});

  await query(
    `INSERT INTO daily_metrics (
      metric_date, total_volume_usd, total_trades, unique_wallets, tvl_usd,
      protocol_revenue_usd, swap_volume_usd, bridge_volume_usd, liquidity_volume_usd
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (metric_date) DO UPDATE SET
      total_volume_usd = $2,
      total_trades = $3,
      unique_wallets = $4,
      tvl_usd = $5,
      protocol_revenue_usd = $6,
      swap_volume_usd = $7,
      bridge_volume_usd = $8,
      liquidity_volume_usd = $9,
      updated_at = CURRENT_TIMESTAMP`,
    [
      today,
      parseFloat(volumeData.rows[0].total_volume),
      parseInt(volumeData.rows[0].total_trades),
      parseInt(volumeData.rows[0].unique_wallets),
      tvlData.totalTVL.toFixed(2),
      revenueData.totalRevenue.toFixed(2),
      (volumes.swap || 0).toFixed(2),
      (volumes.bridge || 0).toFixed(2),
      (volumes.liquidity_add || 0).toFixed(2)
    ]
  );
}
