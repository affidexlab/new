import fetch from 'node-fetch';

const UNISWAP_V3_SUBGRAPH_URLS = {
  1: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  8453: 'https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest',
  42161: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one',
  10: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
  137: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
  43114: 'https://api.thegraph.com/subgraphs/name/lynnshaoyu/uniswap-v3-avax'
};

const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = {
  1: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  8453: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
  42161: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  10: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  137: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  43114: '0x655C406EBFa14EE2006250925e54ec43AD184f8B'
};

async function fetchSubgraph(subgraphUrl, body, context = {}) {
  try {
    const response = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const text = await response.text();
      console.error('Subgraph HTTP error', {
        status: response.status,
        statusText: response.statusText,
        context,
        bodySnippet: text.slice(0, 200)
      });
      return null;
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Subgraph non-JSON response', {
        context,
        contentType,
        bodySnippet: text.slice(0, 200)
      });
      return null;
    }

    const data = await response.json();

    if (data.errors && data.errors.length) {
      console.error('Subgraph GraphQL errors', { context, errors: data.errors });
      return null;
    }

    return data;
  } catch (error) {
    console.error('Subgraph query error', { context, error });
    return null;
  }
}

export async function getPoolData(chainId, poolAddress) {
  const subgraphUrl = UNISWAP_V3_SUBGRAPH_URLS[chainId];
  if (!subgraphUrl) {
    throw new Error(`Uniswap V3 subgraph not available for chain ${chainId}`);
  }

  const query = `
    query GetPool($poolAddress: String!) {
      pool(id: $poolAddress) {
        id
        token0 {
          id
          symbol
          decimals
        }
        token1 {
          id
          symbol
          decimals
        }
        feeTier
        liquidity
        sqrtPrice
        tick
        token0Price
        token1Price
        volumeUSD
        txCount
        totalValueLockedUSD
        totalValueLockedToken0
        totalValueLockedToken1
        feesUSD
      }
    }
  `;

  const data = await fetchSubgraph(
    subgraphUrl,
    {
      query,
      variables: { poolAddress: poolAddress.toLowerCase() }
    },
    { chainId, operation: 'getPoolData', poolAddress }
  );

  if (!data || !data.data || !data.data.pool) {
    return null;
  }

  const pool = data.data.pool;

  const volumeUSD = parseFloat(pool.volumeUSD || 0);
  const tvlUSD = parseFloat(pool.totalValueLockedUSD || 0);
  const feesUSD = parseFloat(pool.feesUSD || 0);

  const apr = tvlUSD > 0 && feesUSD > 0
    ? ((feesUSD / tvlUSD) * 365 * 100).toFixed(2)
    : '0';

  return {
    address: pool.id,
    token0: {
      address: pool.token0.id,
      symbol: pool.token0.symbol,
      decimals: parseInt(pool.token0.decimals)
    },
    token1: {
      address: pool.token1.id,
      symbol: pool.token1.symbol,
      decimals: parseInt(pool.token1.decimals)
    },
    fee: parseInt(pool.feeTier),
    liquidity: pool.liquidity,
    sqrtPriceX96: pool.sqrtPrice,
    tick: parseInt(pool.tick),
    tvlUSD: tvlUSD.toFixed(2),
    volumeUSD: volumeUSD.toFixed(2),
    feesUSD: feesUSD.toFixed(2),
    apr,
    txCount: parseInt(pool.txCount || 0)
  };
}

export async function getTopPools(chainId, limit = 20) {
  const subgraphUrl = UNISWAP_V3_SUBGRAPH_URLS[chainId];
  if (!subgraphUrl) {
    return [];
  }

  const query = `
    query GetTopPools($limit: Int!) {
      pools(
        first: $limit
        orderBy: totalValueLockedUSD
        orderDirection: desc
        where: { totalValueLockedUSD_gt: "100" }
      ) {
        id
        token0 {
          id
          symbol
          decimals
        }
        token1 {
          id
          symbol
          decimals
        }
        feeTier
        liquidity
        totalValueLockedUSD
        volumeUSD
        feesUSD
        txCount
      }
    }
  `;

  const data = await fetchSubgraph(
    subgraphUrl,
    {
      query,
      variables: { limit }
    },
    { chainId, operation: 'getTopPools', limit }
  );

  if (!data || !data.data || !data.data.pools) {
    return [];
  }

  return data.data.pools.map(pool => {
    const volumeUSD = parseFloat(pool.volumeUSD || 0);
    const tvlUSD = parseFloat(pool.totalValueLockedUSD || 0);
    const feesUSD = parseFloat(pool.feesUSD || 0);

    const apr = tvlUSD > 0 && feesUSD > 0
      ? ((feesUSD / tvlUSD) * 365 * 100).toFixed(2)
      : '0';

    return {
      id: `${chainId}-${pool.token0.symbol}-${pool.token1.symbol}-${pool.feeTier}`,
      address: pool.id,
      token0: {
        address: pool.token0.id,
        symbol: pool.token0.symbol,
        decimals: parseInt(pool.token0.decimals)
      },
      token1: {
        address: pool.token1.id,
        symbol: pool.token1.symbol,
        decimals: parseInt(pool.token1.decimals)
      },
      fee: parseInt(pool.feeTier),
      protocol: 'Uniswap V3',
      tvl: tvlUSD.toFixed(2),
      apr,
      volumeUSD: volumeUSD.toFixed(2),
      txCount: parseInt(pool.txCount || 0)
    };
  });
}

export async function getUserPositions(chainId, walletAddress) {
  const subgraphUrl = UNISWAP_V3_SUBGRAPH_URLS[chainId];
  if (!subgraphUrl) {
    return [];
  }

  const query = `
    query GetUserPositions($owner: String!) {
      positions(
        where: { owner: $owner, liquidity_gt: "0" }
        orderBy: liquidity
        orderDirection: desc
      ) {
        id
        owner
        liquidity
        depositedToken0
        depositedToken1
        withdrawnToken0
        withdrawnToken1
        collectedFeesToken0
        collectedFeesToken1
        pool {
          id
          token0 {
            id
            symbol
            decimals
          }
          token1 {
            id
            symbol
            decimals
          }
          feeTier
          totalValueLockedUSD
        }
        tickLower {
          tickIdx
        }
        tickUpper {
          tickIdx
        }
      }
    }
  `;

  const data = await fetchSubgraph(
    subgraphUrl,
    {
      query,
      variables: { owner: walletAddress.toLowerCase() }
    },
    { chainId, operation: 'getUserPositions', walletAddress }
  );

  if (!data || !data.data || !data.data.positions) {
    return [];
  }

  return data.data.positions.map(position => {
    const deposited0 = parseFloat(position.depositedToken0 || 0);
    const deposited1 = parseFloat(position.depositedToken1 || 0);
    const withdrawn0 = parseFloat(position.withdrawnToken0 || 0);
    const withdrawn1 = parseFloat(position.withdrawnToken1 || 0);
    const feesCollected0 = parseFloat(position.collectedFeesToken0 || 0);
    const feesCollected1 = parseFloat(position.collectedFeesToken1 || 0);

    const currentToken0 = deposited0 - withdrawn0;
    const currentToken1 = deposited1 - withdrawn1;

    return {
      tokenId: position.id,
      chainId,
      poolAddress: position.pool.id,
      token0: {
        address: position.pool.token0.id,
        symbol: position.pool.token0.symbol,
        decimals: parseInt(position.pool.token0.decimals)
      },
      token1: {
        address: position.pool.token1.id,
        symbol: position.pool.token1.symbol,
        decimals: parseInt(position.pool.token1.decimals)
      },
      fee: parseInt(position.pool.feeTier),
      tickLower: parseInt(position.tickLower.tickIdx),
      tickUpper: parseInt(position.tickUpper.tickIdx),
      liquidity: position.liquidity,
      depositedToken0: deposited0.toString(),
      depositedToken1: deposited1.toString(),
      currentToken0: currentToken0.toString(),
      currentToken1: currentToken1.toString(),
      feesEarned0: feesCollected0.toString(),
      feesEarned1: feesCollected1.toString(),
      protocol: 'Uniswap V3',
      tvlUSD: position.pool.totalValueLockedUSD || '0'
    };
  });
}

export function getNonfungiblePositionManagerAddress(chainId) {
  return NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] || null;
}
