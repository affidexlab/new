import { query } from '../db/connection.js';
import fetch from 'node-fetch';

const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';
const AFFIDEX_CUSTODY_WALLET = 'EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR';
const AFFIDEX_TREASURY_WALLET = '3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk';

const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com';
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

const VDM_PRICE_CACHE_TTL = Number(process.env.VDM_PRICE_CACHE_TTL_MS || 300_000);
let vdmPriceCache = { priceUsd: 0, timestamp: 0, source: 'none' };

async function fetchJsonWithTimeout(url, timeoutMs, headers = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'user-agent': 'decaflow-backend',
        ...headers,
      },
    });

    return { response, data: await response.json() };
  } finally {
    clearTimeout(id);
  }
}

function pickCmcTokenData(data) {
  const entries = Object.values(data?.data || {});
  if (entries.length === 0) return null;

  const matchByAddress = entries.find((t) => {
    const addr = (t?.platform?.token_address || t?.platform?.tokenAddress || '').toString();
    return addr && addr.toLowerCase() === VDM_TOKEN_ADDRESS.toLowerCase();
  });

  return matchByAddress || entries[0];
}

async function cmcQuotesLatest(queryParams) {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) {
    throw new Error('CoinMarketCap API key not configured');
  }

  const params = new URLSearchParams({ convert: 'USD', ...queryParams });
  const url = `${COINMARKETCAP_API}/v2/cryptocurrency/quotes/latest?${params.toString()}`;

  const { response, data } = await fetchJsonWithTimeout(url, 7000, { 'X-CMC_PRO_API_KEY': apiKey });

  if (!response.ok) {
    const msg = data?.status?.error_message || `HTTP ${response.status}`;
    throw new Error(`CoinMarketCap API error: ${msg}`);
  }

  if (data?.status?.error_code && data.status.error_code !== 0) {
    throw new Error(data?.status?.error_message || 'CoinMarketCap API error');
  }

  const tokenData = pickCmcTokenData(data);
  const priceUsd = Number(tokenData?.quote?.USD?.price);

  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    throw new Error('Invalid price data from CoinMarketCap');
  }

  return priceUsd;
}

async function getVdmPriceFromCoinMarketCap() {
  const cmcId = (process.env.COINMARKETCAP_VDM_ID || '').trim();
  const cmcSlug = (process.env.COINMARKETCAP_VDM_SLUG || '').trim();
  const cmcSymbol = (process.env.COINMARKETCAP_VDM_SYMBOL || 'VDM').trim();

  if (cmcId) {
    try {
      return await cmcQuotesLatest({ id: cmcId });
    } catch (e) {
      console.warn('CoinMarketCap id lookup failed:', e?.message || e);
    }
  }

  if (cmcSlug) {
    try {
      return await cmcQuotesLatest({ slug: cmcSlug });
    } catch (e) {
      console.warn('CoinMarketCap slug lookup failed:', e?.message || e);
    }
  }

  if (cmcSymbol) {
    try {
      return await cmcQuotesLatest({ symbol: cmcSymbol });
    } catch (e) {
      console.warn('CoinMarketCap symbol lookup failed:', e?.message || e);
    }
  }

  try {
    return await cmcQuotesLatest({ address: VDM_TOKEN_ADDRESS, platform: 'solana' });
  } catch (e) {
    console.warn('CoinMarketCap address/platform lookup failed:', e?.message || e);
  }

  throw new Error('CoinMarketCap could not resolve VDM price (set COINMARKETCAP_VDM_ID or COINMARKETCAP_VDM_SLUG)');
}

async function getVdmPriceFromDexScreener() {
  const explicitPair = (process.env.VDM_DEXSCREENER_PAIR || '').trim();

  if (explicitPair) {
    try {
      const { response, data } = await fetchJsonWithTimeout(
        `${DEXSCREENER_API}/pairs/solana/${encodeURIComponent(explicitPair)}`,
        7000
      );

      if (response.ok) {
        const pair = data?.pair || data?.pairs?.[0];
        const priceUsd = Number(pair?.priceUsd);
        if (Number.isFinite(priceUsd) && priceUsd > 0) {
          return priceUsd;
        }
      }
    } catch {
    }
  }

  const { response, data } = await fetchJsonWithTimeout(`${DEXSCREENER_API}/tokens/${VDM_TOKEN_ADDRESS}`, 7000);
  if (!response.ok) {
    throw new Error('DexScreener request failed');
  }

  const pairs = Array.isArray(data?.pairs) ? data.pairs : [];

  const best = pairs
    .map(p => ({
      priceUsd: Number(p?.priceUsd),
      liquidityUsd: Number(p?.liquidity?.usd) || 0,
    }))
    .filter(p => Number.isFinite(p.priceUsd) && p.priceUsd > 0)
    .sort((a, b) => b.liquidityUsd - a.liquidityUsd)[0];

  if (!best) {
    throw new Error('No DexScreener pairs with priceUsd');
  }

  return best.priceUsd;
}


export async function getCurrentVdmPriceUsdtInfo() {
  if (vdmPriceCache.priceUsd > 0 && Date.now() - vdmPriceCache.timestamp < VDM_PRICE_CACHE_TTL) {
    return { ...vdmPriceCache };
  }

  console.log('🔍 Fetching VDM price (CA: B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5)...');

  try {
    console.log('📊 Attempting CoinMarketCap (PRIMARY)...');
    const priceUsd = await getVdmPriceFromCoinMarketCap();
    vdmPriceCache = { priceUsd, timestamp: Date.now(), source: 'coinmarketcap' };
    console.log(`✅ VDM price from CoinMarketCap: $${priceUsd}`);
    return { ...vdmPriceCache };
  } catch (error) {
    console.warn('⚠️  CoinMarketCap price fetch failed:', error?.message || error);
  }

  try {
    console.log('📊 Attempting DexScreener (BACKUP)...');
    const priceUsd = await getVdmPriceFromDexScreener();
    vdmPriceCache = { priceUsd, timestamp: Date.now(), source: 'dexscreener' };
    console.log(`✅ VDM price from DexScreener: $${priceUsd}`);
    return { ...vdmPriceCache };
  } catch (error) {
    console.warn('⚠️  DexScreener price fetch failed:', error?.message || error);
  }

  if (vdmPriceCache.priceUsd > 0) {
    console.log(`📦 Using cached VDM price: $${vdmPriceCache.priceUsd} (stale, source: ${vdmPriceCache.source})`);
    return { ...vdmPriceCache, source: `stale:${vdmPriceCache.source}` };
  }

  const fallbackPrice = parseFloat(process.env.VDM_FALLBACK_PRICE || '0');
  if (fallbackPrice > 0) {
    console.log(`🔄 Using manual fallback VDM price: $${fallbackPrice}`);
    vdmPriceCache = { priceUsd: fallbackPrice, timestamp: Date.now(), source: 'fallback-manual' };
    return { ...vdmPriceCache };
  }

  console.error('❌ Failed to fetch VDM price from all sources (CoinMarketCap, DexScreener, cache, fallback)');
  throw new Error('Failed to fetch VDM price from all available sources');
}

export async function getCurrentVdmPriceUsdt() {
  const info = await getCurrentVdmPriceUsdtInfo();
  return info.priceUsd;
}

const STAKING_FEES = {
  depositFeeBps: 250,
  withdrawalFeeBps: 150,
};

const LOCK_PERIODS = {
  ThreeMonths: {
    id: 'ThreeMonths',
    label: '3 Months',
    months: 3,
    apy: 4,
    seconds: 7_884_000,
  },
  SixMonths: {
    id: 'SixMonths',
    label: '6 Months',
    months: 6,
    apy: 8,
    seconds: 15_768_000,
  },
  NineMonths: {
    id: 'NineMonths',
    label: '9 Months',
    months: 9,
    apy: 12,
    seconds: 23_652_000,
  },
  TwelveMonths: {
    id: 'TwelveMonths',
    label: '12 Months',
    months: 12,
    apy: 16,
    seconds: 31_536_000,
  },
};

const STAKING_POOL_ID = 'vdm-time-locked';
const SECONDS_IN_YEAR = 31_536_000;

export async function getStakeInfo(wallet) {
  const result = await query(
    `SELECT * FROM solana_staking_positions 
     WHERE wallet = $1 AND status IN ('active', 'claim_requested', 'claimed') 
     ORDER BY created_at DESC LIMIT 1`,
    [wallet]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const pos = result.rows[0];
  const lockPeriod = pos.lock_period || 'TwelveMonths';
  const period = LOCK_PERIODS[lockPeriod] || LOCK_PERIODS.TwelveMonths;

  const startTimestamp = Math.floor(Number(pos.staked_at) / 1000);
  const unlockTimestamp = Math.floor(Number(pos.unlock_timestamp || 0) / 1000);

  return {
    user: pos.wallet,
    amountStaked: parseFloat(pos.staked_amount),
    rewardsAllocated: parseFloat(pos.pending_rewards),
    vdmPriceUsdtSnapshot: parseFloat(pos.vdm_price_usdt_snapshot || 0),
    stakedValueUsdtSnapshot: parseFloat(pos.staked_value_usdt_snapshot || 0),
    lockPeriod: period.id,
    startTimestamp,
    unlockTimestamp,
    hasStaked: true,
    hasClaimed: pos.status === 'claimed',
  };
}

export async function getPoolStatistics() {
  const result = await query(
    `SELECT * FROM solana_pool_stats WHERE pool_id = $1`,
    [STAKING_POOL_ID]
  );

  if (result.rows.length === 0) {
    return {
      totalStaked: 0,
      totalRewardsDistributed: 0,
      rewardsPoolRemaining: 150_000_000,
      totalStakers: 0,
    };
  }

  const stats = result.rows[0];
  const rewardsPoolTotal = 150_000_000;
  const totalRewardsDistributed = parseFloat(stats.total_rewards_distributed || 0);

  return {
    totalStaked: parseFloat(stats.total_staked || 0),
    totalRewardsDistributed,
    rewardsPoolRemaining: Math.max(0, rewardsPoolTotal - totalRewardsDistributed),
    totalStakers: stats.total_stakers || 0,
  };
}

export async function createOffchainStake({ wallet, amount, lockPeriod, depositSignature }) {
  const period = LOCK_PERIODS[lockPeriod];
  if (!period) {
    throw new Error('Invalid lock period');
  }

  const existing = await query(
    `SELECT * FROM solana_staking_positions WHERE wallet = $1 AND status IN ('active', 'claim_requested')`,
    [wallet]
  );

  if (existing.rows.length > 0) {
    throw new Error('Wallet already has an active stake');
  }

  const now = Date.now();

  const depositFee = amount * (STAKING_FEES.depositFeeBps / 10000);
  const netStakedAmount = amount - depositFee;

  const vdmPriceUsdtSnapshot = await getCurrentVdmPriceUsdt();
  const stakedValueUsdtSnapshot = netStakedAmount * vdmPriceUsdtSnapshot;

  const rewardRate = period.apy / 100;
  const lockRatio = period.seconds / SECONDS_IN_YEAR;
  const totalRewards = stakedValueUsdtSnapshot * rewardRate * lockRatio;

  const unlockTimestampMs = now + period.seconds * 1000;

  const positionResult = await query(
    `INSERT INTO solana_staking_positions 
     (wallet, pool_id, staked_amount, lp_tokens, pending_rewards, vdm_price_usdt_snapshot, staked_value_usdt_snapshot, staked_at, last_claim_at, status, lock_period, unlock_timestamp, created_at, updated_at)
     VALUES ($1, $2, $3, 0, $4, $5, $6, $7, $8, 'active', $9, $10, $11, $12)
     RETURNING id`,
    [
      wallet,
      STAKING_POOL_ID,
      netStakedAmount,
      totalRewards,
      vdmPriceUsdtSnapshot,
      stakedValueUsdtSnapshot,
      now,
      now,
      period.id,
      unlockTimestampMs,
      now,
      now,
    ]
  );

  const positionId = positionResult.rows[0].id;

  await query(
    `INSERT INTO solana_staking_transactions 
     (wallet, pool_id, tx_type, signature, vdm_amount, pair_token_amount, lp_tokens, fee_amount, timestamp, created_at)
     VALUES ($1, $2, 'stake', $3, $4, 0, 0, $5, $6, $7)`,
    [wallet, STAKING_POOL_ID, depositSignature, amount, depositFee, now, now]
  );

  await updatePoolStats(netStakedAmount, 1, totalRewards);

  await query(
    `INSERT INTO solana_staking_fees 
     (pool_id, fee_type, recipient, amount, percentage, timestamp, created_at)
     VALUES ($1, 'deposit', $2, $3, 100, $4, $5)`,
    [STAKING_POOL_ID, AFFIDEX_TREASURY_WALLET, depositFee, now, now]
  );

  return {
    positionId,
    netStakedAmount,
    stakedValueUsdtSnapshot,
    vdmPriceUsdtSnapshot,
    totalRewards,
    lockPeriod: period.id,
    unlockTimestamp: Math.floor(unlockTimestampMs / 1000),
  };
}

export async function requestClaim({ wallet }) {
  const result = await query(
    `SELECT * FROM solana_staking_positions 
     WHERE wallet = $1 AND pool_id = $2 AND status = 'active'`,
    [wallet, STAKING_POOL_ID]
  );

  if (result.rows.length === 0) {
    throw new Error('No active stake found');
  }

  const position = result.rows[0];
  const now = Date.now();

  if (now < Number(position.unlock_timestamp || 0)) {
    throw new Error('Stake is still locked');
  }

  const stakedAmount = parseFloat(position.staked_amount);
  const rewardsAllocated = parseFloat(position.pending_rewards);
  const withdrawalFee = stakedAmount * (STAKING_FEES.withdrawalFeeBps / 10000);
  const netPrincipal = stakedAmount - withdrawalFee;

  const vdmPriceUsdtSnapshot = parseFloat(position.vdm_price_usdt_snapshot || 0) || await getCurrentVdmPriceUsdt();
  const principalValueUsdtSnapshot = netPrincipal * vdmPriceUsdtSnapshot;

  await query(
    `UPDATE solana_staking_positions 
     SET status = 'claim_requested', updated_at = $1 
     WHERE id = $2`,
    [now, position.id]
  );

  await query(
    `INSERT INTO solana_staking_claims 
     (wallet, pool_id, position_id, principal_amount, principal_value_usdt_snapshot, rewards_amount, vdm_price_usdt_snapshot, status, requested_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'requested', $8, $9)`,
    [wallet, STAKING_POOL_ID, position.id, netPrincipal, principalValueUsdtSnapshot, rewardsAllocated, vdmPriceUsdtSnapshot, now, now]
  );

  await query(
    `INSERT INTO solana_staking_fees 
     (pool_id, fee_type, recipient, amount, percentage, timestamp, created_at)
     VALUES ($1, 'withdrawal', $2, $3, 100, $4, $5)`,
    [STAKING_POOL_ID, AFFIDEX_TREASURY_WALLET, withdrawalFee, now, now]
  );

  await updatePoolStats(-stakedAmount, -1, 0);

  return {
    principalAmount: netPrincipal,
    principalValueUsdtSnapshot,
    rewardsAmount: rewardsAllocated,
    vdmPriceUsdtSnapshot,
    withdrawalFee,
  };
}

export async function updateRewards() {
  const now = Date.now();
  return {
    updated: 0,
    timestamp: now,
  };
}

async function updatePoolStats(stakedAmountDelta, stakersDelta, rewardsDelta) {
  const result = await query(
    `SELECT * FROM solana_pool_stats WHERE pool_id = $1`,
    [STAKING_POOL_ID]
  );

  const now = Date.now();

  if (result.rows.length > 0) {
    const existing = result.rows[0];
    const newTotalStaked = parseFloat(existing.total_staked) + stakedAmountDelta;
    const newTotalStakers = Math.max(0, existing.total_stakers + stakersDelta);
    const newTotalRewards = parseFloat(existing.total_rewards_distributed) + rewardsDelta;

    await query(
      `UPDATE solana_pool_stats 
       SET total_staked = $1, total_stakers = $2, total_rewards_distributed = $3, tvl = $4, updated_at = $5 
       WHERE pool_id = $6`,
      [newTotalStaked, newTotalStakers, newTotalRewards, newTotalStaked, now, STAKING_POOL_ID]
    );
  } else {
    await query(
      `INSERT INTO solana_pool_stats 
       (pool_id, tvl, total_stakers, total_staked, total_rewards_distributed, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [STAKING_POOL_ID, stakedAmountDelta, Math.max(0, stakersDelta), stakedAmountDelta, Math.max(0, rewardsDelta), now, now]
    );
  }
}

export async function getPendingClaims() {
  const result = await query(
    `SELECT * FROM solana_staking_claims 
     WHERE pool_id = $1 AND status = 'requested' 
     ORDER BY requested_at DESC`,
    [STAKING_POOL_ID]
  );

  return result.rows;
}

export async function getAllPositions() {
  const result = await query(
    `SELECT * FROM solana_staking_positions 
     WHERE pool_id = $1 
     ORDER BY staked_at DESC`,
    [STAKING_POOL_ID]
  );

  return result.rows;
}

export async function markClaimAsPaid(claimId) {
  const now = Date.now();

  const claimResult = await query(
    `SELECT * FROM solana_staking_claims WHERE id = $1`,
    [claimId]
  );

  if (claimResult.rows.length === 0) {
    throw new Error('Claim not found');
  }

  const claim = claimResult.rows[0];

  await query(
    `UPDATE solana_staking_claims 
     SET status = 'paid', processed_at = $1 
     WHERE id = $2`,
    [now, claimId]
  );

  await query(
    `UPDATE solana_staking_positions 
     SET status = 'claimed', updated_at = $1 
     WHERE id = $2`,
    [now, claim.position_id]
  );

  return {
    claimId,
    status: 'paid',
    processedAt: now,
  };
}

export async function getInvestments() {
  const result = await query(
    `SELECT * FROM vdm_staking_investments 
     ORDER BY invested_at DESC`
  );

  return result.rows;
}

export async function createInvestment({ amount, description, status = 'active' }) {
  const now = Date.now();

  const result = await query(
    `INSERT INTO vdm_staking_investments 
     (amount, description, status, invested_at, created_at) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id`,
    [amount, description, status, now, now]
  );

  return {
    id: result.rows[0].id,
    amount,
    description,
    status,
    invested_at: now,
  };
}

export async function recordInvestmentReturns(investmentId, returns) {
  const now = Date.now();

  const investmentResult = await query(
    `SELECT * FROM vdm_staking_investments WHERE id = $1`,
    [investmentId]
  );

  if (investmentResult.rows.length === 0) {
    throw new Error('Investment not found');
  }

  await query(
    `UPDATE vdm_staking_investments 
     SET returns = $1, status = 'closed', updated_at = $2 
     WHERE id = $3`,
    [returns, now, investmentId]
  );

  return {
    investmentId,
    returns,
    status: 'closed',
  };
}

export async function getPendingFeeConversions() {
  const result = await query(
    `SELECT 
      fee_type,
      recipient,
      SUM(amount) as total_vdm_amount,
      COUNT(*) as fee_count,
      MIN(timestamp) as earliest_fee,
      MAX(timestamp) as latest_fee
     FROM solana_staking_fees 
     WHERE pool_id = $1 AND recipient = $2
     GROUP BY fee_type, recipient`,
    [STAKING_POOL_ID, AFFIDEX_TREASURY_WALLET]
  );

  const vdmPriceUsdt = await getCurrentVdmPriceUsdt();

  return result.rows.map(row => ({
    feeType: row.fee_type,
    recipient: row.recipient,
    totalVdmAmount: parseFloat(row.total_vdm_amount),
    totalUsdtValue: parseFloat(row.total_vdm_amount) * vdmPriceUsdt,
    feeCount: parseInt(row.fee_count),
    earliestFee: row.earliest_fee,
    latestFee: row.latest_fee,
    conversionNote: 'These VDM fees should be converted to SOL and sent to treasury wallet',
    treasuryWallet: AFFIDEX_TREASURY_WALLET,
    custodyWallet: AFFIDEX_CUSTODY_WALLET,
  }));
}

export function getWalletAddresses() {
  return {
    vdmTokenAddress: VDM_TOKEN_ADDRESS,
    custodyWallet: AFFIDEX_CUSTODY_WALLET,
    treasuryWallet: AFFIDEX_TREASURY_WALLET,
    note: 'VDM fees collected in custody wallet should be converted to SOL and sent to treasury wallet',
  };
}
