import { query } from '../db/connection.js';

const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';

const STAKING_FEES = {
  depositFeeBps: 250,
  withdrawalFeeBps: 150,
  performanceFeeBps: 1000,
  affidexShareBps: 700,
  vdmShareBps: 300,
};

const POOL_CONFIGS = {
  'vdm-sol': {
    id: 'vdm-sol',
    name: 'VDM/SOL',
    pairToken: 'SOL',
    baseApy: 18.5,
    raydiumPoolAddress: null,
  },
  'vdm-usdc': {
    id: 'vdm-usdc',
    name: 'VDM/USDC',
    pairToken: 'USDC',
    baseApy: 15.2,
    raydiumPoolAddress: null,
  },
};

export async function getStakingPositions(wallet) {
  const result = await query(
    `SELECT * FROM solana_staking_positions 
     WHERE wallet = $1 AND status = 'active' 
     ORDER BY staked_at DESC`,
    [wallet]
  );

  return result.rows.map(pos => ({
    poolId: pos.pool_id,
    stakedAmount: parseFloat(pos.staked_amount),
    lpTokens: parseFloat(pos.lp_tokens),
    pendingRewards: parseFloat(pos.pending_rewards),
    stakedAt: parseInt(pos.staked_at),
    lastClaimAt: parseInt(pos.last_claim_at),
    estimatedApy: calculateNetApy(POOL_CONFIGS[pos.pool_id].baseApy),
  }));
}

export async function createStakeTransaction({ wallet, poolId, vdmAmount, pairTokenAmount }) {
  const pool = POOL_CONFIGS[poolId];
  if (!pool) {
    throw new Error(`Invalid pool: ${poolId}`);
  }

  const depositFee = vdmAmount * (STAKING_FEES.depositFeeBps / 10000);
  const netVdmAmount = vdmAmount - depositFee;

  const mockTransaction = Buffer.from(JSON.stringify({
    type: 'stake',
    poolId,
    wallet,
    vdmAmount: netVdmAmount,
    pairTokenAmount,
    depositFee,
    timestamp: Date.now(),
  })).toString('base64');

  return mockTransaction;
}

export async function createUnstakeTransaction({ wallet, poolId, lpTokenAmount }) {
  const result = await query(
    `SELECT * FROM solana_staking_positions 
     WHERE wallet = $1 AND pool_id = $2 AND status = 'active'`,
    [wallet, poolId]
  );

  if (result.rows.length === 0) {
    throw new Error('No active staking position found');
  }

  const position = result.rows[0];
  const stakedAmount = parseFloat(position.staked_amount);
  const withdrawalFee = stakedAmount * (STAKING_FEES.withdrawalFeeBps / 10000);
  const netAmount = stakedAmount - withdrawalFee;

  const mockTransaction = Buffer.from(JSON.stringify({
    type: 'unstake',
    poolId,
    wallet,
    lpTokenAmount,
    stakedAmount,
    withdrawalFee,
    netAmount,
    timestamp: Date.now(),
  })).toString('base64');

  return mockTransaction;
}

export async function createClaimTransaction({ wallet, poolId }) {
  const result = await query(
    `SELECT * FROM solana_staking_positions 
     WHERE wallet = $1 AND pool_id = $2 AND status = 'active'`,
    [wallet, poolId]
  );

  if (result.rows.length === 0) {
    throw new Error('No active staking position found');
  }

  const position = result.rows[0];
  const pendingRewards = parseFloat(position.pending_rewards);
  if (pendingRewards <= 0) {
    throw new Error('No rewards to claim');
  }

  const performanceFee = pendingRewards * (STAKING_FEES.performanceFeeBps / 10000);
  const netRewards = pendingRewards - performanceFee;

  const mockTransaction = Buffer.from(JSON.stringify({
    type: 'claim',
    poolId,
    wallet,
    pendingRewards,
    performanceFee,
    netRewards,
    timestamp: Date.now(),
  })).toString('base64');

  return mockTransaction;
}

export async function confirmStake({ wallet, signature, poolId, vdmAmount, pairTokenAmount }) {
  const depositFee = vdmAmount * (STAKING_FEES.depositFeeBps / 10000);
  const netVdmAmount = vdmAmount - depositFee;
  
  const lpTokens = Math.sqrt(netVdmAmount * pairTokenAmount);
  
  const existingResult = await query(
    `SELECT * FROM solana_staking_positions 
     WHERE wallet = $1 AND pool_id = $2 AND status = 'active'`,
    [wallet, poolId]
  );

  const now = Date.now();

  if (existingResult.rows.length > 0) {
    const existingPosition = existingResult.rows[0];
    const newStakedAmount = parseFloat(existingPosition.staked_amount) + netVdmAmount;
    const newLpTokens = parseFloat(existingPosition.lp_tokens) + lpTokens;

    await query(
      `UPDATE solana_staking_positions 
       SET staked_amount = $1, lp_tokens = $2, updated_at = $3 
       WHERE id = $4`,
      [newStakedAmount, newLpTokens, now, existingPosition.id]
    );
  } else {
    await query(
      `INSERT INTO solana_staking_positions 
       (wallet, pool_id, staked_amount, lp_tokens, pending_rewards, staked_at, last_claim_at, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, 0, $5, $6, 'active', $7, $8)`,
      [wallet, poolId, netVdmAmount, lpTokens, now, now, now, now]
    );
  }

  await query(
    `INSERT INTO solana_staking_transactions 
     (wallet, pool_id, tx_type, signature, vdm_amount, pair_token_amount, lp_tokens, fee_amount, timestamp, created_at) 
     VALUES ($1, $2, 'stake', $3, $4, $5, $6, $7, $8, $9)`,
    [wallet, poolId, signature, netVdmAmount, pairTokenAmount, lpTokens, depositFee, now, now]
  );

  await updatePoolStats(poolId, netVdmAmount, 1);

  const feeRecords = [
    { recipient: 'affidex', amount: depositFee * 1.0, percentage: 100 }
  ];

  for (const record of feeRecords) {
    await query(
      `INSERT INTO solana_staking_fees 
       (pool_id, fee_type, recipient, amount, percentage, timestamp, created_at) 
       VALUES ($1, 'deposit', $2, $3, $4, $5, $6)`,
      [poolId, record.recipient, record.amount, record.percentage, now, now]
    );
  }

  return {
    signature,
    poolId,
    stakedAmount: netVdmAmount,
    lpTokens,
    depositFee
  };
}

export async function confirmUnstake({ wallet, signature, poolId, lpTokenAmount }) {
  const result = await query(
    `SELECT * FROM solana_staking_positions 
     WHERE wallet = $1 AND pool_id = $2 AND status = 'active'`,
    [wallet, poolId]
  );

  if (result.rows.length === 0) {
    throw new Error('No active staking position found');
  }

  const position = result.rows[0];
  const stakedAmount = parseFloat(position.staked_amount);
  const withdrawalFee = stakedAmount * (STAKING_FEES.withdrawalFeeBps / 10000);
  const netAmount = stakedAmount - withdrawalFee;
  const now = Date.now();

  await query(
    `UPDATE solana_staking_positions 
     SET status = 'unstaked', updated_at = $1 
     WHERE id = $2`,
    [now, position.id]
  );

  await query(
    `INSERT INTO solana_staking_transactions 
     (wallet, pool_id, tx_type, signature, vdm_amount, pair_token_amount, lp_tokens, fee_amount, timestamp, created_at) 
     VALUES ($1, $2, 'unstake', $3, $4, 0, $5, $6, $7, $8)`,
    [wallet, poolId, signature, netAmount, lpTokenAmount, withdrawalFee, now, now]
  );

  await updatePoolStats(poolId, -stakedAmount, -1);

  const feeRecords = [
    { recipient: 'affidex', amount: withdrawalFee * 1.0, percentage: 100 }
  ];

  for (const record of feeRecords) {
    await query(
      `INSERT INTO solana_staking_fees 
       (pool_id, fee_type, recipient, amount, percentage, timestamp, created_at) 
       VALUES ($1, 'withdrawal', $2, $3, $4, $5, $6)`,
      [poolId, record.recipient, record.amount, record.percentage, now, now]
    );
  }

  return {
    signature,
    poolId,
    unstakedAmount: netAmount,
    withdrawalFee
  };
}

export async function getPoolStatistics(poolId) {
  const result = await query(
    `SELECT * FROM solana_pool_stats WHERE pool_id = $1`,
    [poolId]
  );

  if (result.rows.length === 0) {
    return {
      poolId,
      tvl: 0,
      totalStakers: 0,
      totalStaked: 0,
      totalRewardsDistributed: 0,
      baseApy: POOL_CONFIGS[poolId]?.baseApy || 0,
    };
  }

  const stats = result.rows[0];
  return {
    poolId: stats.pool_id,
    tvl: parseFloat(stats.tvl),
    totalStakers: stats.total_stakers,
    totalStaked: parseFloat(stats.total_staked),
    totalRewardsDistributed: parseFloat(stats.total_rewards_distributed),
    baseApy: POOL_CONFIGS[poolId]?.baseApy || 0,
  };
}

export async function updateRewards() {
  const result = await query(
    `SELECT * FROM solana_staking_positions WHERE status = 'active'`
  );

  const activePositions = result.rows;
  let totalUpdated = 0;
  const dailyRewardRate = 0.0004;
  const now = Date.now();

  for (const position of activePositions) {
    const stakedAmount = parseFloat(position.staked_amount);
    const pool = POOL_CONFIGS[position.pool_id];
    
    if (!pool) continue;

    const dailyRewards = stakedAmount * dailyRewardRate * (pool.baseApy / 18.5);
    const newPendingRewards = parseFloat(position.pending_rewards) + dailyRewards;

    await query(
      `UPDATE solana_staking_positions 
       SET pending_rewards = $1, updated_at = $2 
       WHERE id = $3`,
      [newPendingRewards, now, position.id]
    );

    totalUpdated++;
  }

  console.log(`Updated rewards for ${totalUpdated} positions`);

  return {
    updated: totalUpdated,
    timestamp: now
  };
}

async function updatePoolStats(poolId, stakedAmountDelta, stakersDelta) {
  const result = await query(
    `SELECT * FROM solana_pool_stats WHERE pool_id = $1`,
    [poolId]
  );

  const now = Date.now();

  if (result.rows.length > 0) {
    const existing = result.rows[0];
    const newTotalStaked = parseFloat(existing.total_staked) + stakedAmountDelta;
    const newTotalStakers = Math.max(0, existing.total_stakers + stakersDelta);

    await query(
      `UPDATE solana_pool_stats 
       SET total_staked = $1, total_stakers = $2, tvl = $3, updated_at = $4 
       WHERE pool_id = $5`,
      [newTotalStaked, newTotalStakers, newTotalStaked * 1.5, now, poolId]
    );
  } else {
    await query(
      `INSERT INTO solana_pool_stats 
       (pool_id, tvl, total_stakers, total_staked, total_rewards_distributed, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, 0, $5, $6)`,
      [poolId, stakedAmountDelta * 1.5, Math.max(0, stakersDelta), stakedAmountDelta, now, now]
    );
  }
}

function calculateNetApy(baseApy) {
  const depositFeeImpact = (STAKING_FEES.depositFeeBps / 10000) * 0.2;
  const withdrawalFeeImpact = (STAKING_FEES.withdrawalFeeBps / 10000) * 0.1;
  const performanceFeeImpact = baseApy * (STAKING_FEES.performanceFeeBps / 10000);
  
  return baseApy - depositFeeImpact - withdrawalFeeImpact - performanceFeeImpact;
}
