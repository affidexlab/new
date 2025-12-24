import fetch from 'node-fetch';

const DEFAULT_API_BASE = (process.env.MAVERICK_API_BASE_URL || 'https://stats.mav.xyz').replace(/\/$/, '');
const CACHE_TTL_MS = Number(process.env.MAVERICK_CACHE_TTL_MS || 60_000);
const REQUEST_TIMEOUT_MS = Number(process.env.MAVERICK_API_TIMEOUT_MS || 10_000);
const DEFAULT_FEE_BPS = Number(process.env.MAVERICK_DEFAULT_FEE_BPS || 20);

const cache = new Map();

const TOKEN_METADATA = {
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { symbol: 'USDC', decimals: 6 },
  '0x4200000000000000000000000000000000000006': { symbol: 'WETH', decimals: 18 },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { symbol: 'DAI', decimals: 18 },
  '0x4200000000000000000000000000000000000042': { symbol: 'OP', decimals: 18 },
  '0x0000000000000000000000000000000000000000': { symbol: 'UNKNOWN', decimals: 18 }
};

function normalizeAddress(address) {
  return (address || '').toLowerCase();
}

function resolveToken(address) {
  const normalized = normalizeAddress(address);
  const metadata = TOKEN_METADATA[normalized];

  if (metadata) {
    return {
      address,
      symbol: metadata.symbol,
      decimals: metadata.decimals
    };
  }

  return {
    address,
    symbol: `${address?.slice(0, 6) ?? 'Token'}…` || 'Token',
    decimals: 18
  };
}

function safeNumber(value, fallback = 0) {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(numeric) ? Number(numeric) : fallback;
}

function computeSyntheticBins(ticker, liquidityUsd, lastPrice) {
  const low = safeNumber(ticker.low, lastPrice ? lastPrice * 0.9 : 0);
  const high = safeNumber(ticker.high, lastPrice ? lastPrice * 1.1 : 0);
  if (!low || !high || low >= high) {
    return [];
  }

  const steps = 4;
  const interval = (high - low) / steps;
  const baseWeights = [0.15, 0.35, 0.35, 0.15];

  return Array.from({ length: steps }, (_, index) => {
    const lowerPrice = low + interval * index;
    const upperPrice = lowerPrice + interval;
    const liquidityShare = liquidityUsd * baseWeights[index];

    return {
      id: `${ticker.pool_id || ticker.ticker_id}-bin-${index}`,
      lowerPrice,
      upperPrice,
      liquidityUsd: Number(liquidityShare.toFixed(2))
    };
  });
}

function extractBins(ticker, liquidityUsd, lastPrice) {
  const rawBins = ticker?.bins || ticker?.bin_data || ticker?.binDistribution;
  if (Array.isArray(rawBins) && rawBins.length) {
    return rawBins.map((bin, idx) => {
      const lower = safeNumber(bin.lowerPrice ?? bin.lower ?? bin.min_price ?? bin.priceLower);
      const upper = safeNumber(bin.upperPrice ?? bin.upper ?? bin.max_price ?? bin.priceUpper);
      const liq = safeNumber(bin.liquidityUsd ?? bin.liquidity ?? bin.amount);
      return {
        id: `${ticker.pool_id || ticker.ticker_id}-bin-${bin.id ?? idx}`,
        lowerPrice: lower,
        upperPrice: upper,
        liquidityUsd: Number(liq.toFixed(2))
      };
    }).filter(({ lowerPrice, upperPrice }) => upperPrice > lowerPrice);
  }

  return computeSyntheticBins(ticker, liquidityUsd, lastPrice);
}

async function fetchTickers(chainId) {
  const cacheKey = `maverick:${chainId}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${DEFAULT_API_BASE}/api/latest/tickers?chainId=${chainId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('Maverick API error', { status: response.status, statusText: response.statusText, body: body?.slice(0, 200) });
      return cached?.data || [];
    }

    const json = await response.json();
    const tickers = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.tickers)
          ? json.tickers
          : [];

    cache.set(cacheKey, { data: tickers, timestamp: now });
    return tickers;
  } catch (error) {
    if (error?.name === 'AbortError') {
      console.warn('Maverick API request timed out');
    } else {
      console.error('Failed to fetch Maverick data', error);
    }
    return cached?.data || [];
  } finally {
    clearTimeout(timeout);
  }
}

function formatTicker(raw) {
  const token0 = resolveToken(raw?.base_currency);
  const token1 = resolveToken(raw?.target_currency);
  const liquidityUsd = safeNumber(raw?.liquidity_in_usd);
  const lastPrice = safeNumber(raw?.last_price);
  const baseVolume = safeNumber(raw?.base_volume);
  const targetVolume = safeNumber(raw?.target_volume);
  const volumeUsd = safeNumber(raw?.quote_volume, baseVolume && lastPrice ? baseVolume * lastPrice : targetVolume);
  const makerFee = safeNumber(raw?.maker_fee, DEFAULT_FEE_BPS / 10_000);
  const takerFee = safeNumber(raw?.taker_fee, makerFee);
  const effectiveFee = makerFee || takerFee || (DEFAULT_FEE_BPS / 10_000);

  const apr = liquidityUsd > 0 && volumeUsd > 0 && effectiveFee
    ? Number((((volumeUsd * effectiveFee) / liquidityUsd) * 365 * 100).toFixed(2))
    : 0;

  const bid = safeNumber(raw?.bid);
  const ask = safeNumber(raw?.ask);
  const spread = bid && ask ? ((ask - bid) / ((ask + bid) / 2)) * 10_000 : undefined;
  const derivedBinWidth = spread ? Number(spread.toFixed(2)) : DEFAULT_FEE_BPS;

  return {
    id: raw?.ticker_id || `${token0.symbol}-${token1.symbol}`,
    poolAddress: raw?.pool_id || raw?.ticker_id,
    token0,
    token1,
    liquidityUsd: Number(liquidityUsd.toFixed(2)),
    dailyVolumeUsd: Number(volumeUsd.toFixed(2)),
    lastPrice,
    fees: {
      makerFeeBps: Number((makerFee * 10_000).toFixed(2)),
      takerFeeBps: Number((takerFee * 10_000).toFixed(2))
    },
    apr,
    binWidthBps: derivedBinWidth,
    stats: {
      bid,
      ask,
      high: safeNumber(raw?.high),
      low: safeNumber(raw?.low)
    },
    bins: extractBins(raw, liquidityUsd, lastPrice),
    updatedAt: raw?.updated_at || raw?.timestamp || new Date().toISOString()
  };
}

export async function getMaverickPools(chainId, { limit = 8 } = {}) {
  const tickers = await fetchTickers(chainId);
  if (!tickers.length) {
    return { provider: 'Maverick DLMM', pools: [], stats: { totalLiquidityUsd: 0, totalVolumeUsd: 0, averageFeeBps: 0, poolCount: 0, lastUpdated: new Date().toISOString() } };
  }

  const pools = tickers.slice(0, limit).map(formatTicker);
  const totalLiquidityUsd = pools.reduce((acc, pool) => acc + pool.liquidityUsd, 0);
  const totalVolumeUsd = pools.reduce((acc, pool) => acc + pool.dailyVolumeUsd, 0);
  const averageFeeBps = pools.reduce((acc, pool) => acc + (pool.fees.makerFeeBps || DEFAULT_FEE_BPS), 0) / pools.length;

  return {
    provider: 'Maverick DLMM',
    pools,
    stats: {
      totalLiquidityUsd: Number(totalLiquidityUsd.toFixed(2)),
      totalVolumeUsd: Number(totalVolumeUsd.toFixed(2)),
      averageFeeBps: Number(averageFeeBps.toFixed(2)),
      poolCount: pools.length,
      lastUpdated: pools[0]?.updatedAt || new Date().toISOString()
    }
  };
}
