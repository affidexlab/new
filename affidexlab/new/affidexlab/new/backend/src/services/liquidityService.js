import { getTopPools, getPoolData, getUserPositions as getUniswapPositions, getNonfungiblePositionManagerAddress } from './uniswapV3Service.js';
import { getMaverickPools } from './maverickService.js';

const LIQUIDITY_ROUTER_ADDRESSES = {
  8453: '0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4',
  42161: '0xDE8700785C7512a8397683A9BE9717B0aFdB18F3',
  10: '0xA2fdf81b7967e7FA7610DeBe1901A40686c48992',
  137: '0xFd05977256E8D5753728C78A3003BC3B75Fef1DD'
};

const BASE_FALLBACK_POOLS = [
  {
    id: 'base-usdc-weth-500',
    address: '0x4c36388be6f416a29c8d8eee81c771ce6be14b18',
    token0: {
      symbol: 'USDC',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6
    },
    token1: {
      symbol: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18
    },
    fee: 500,
    protocol: 'Uniswap V3',
    tvl: '5000000',
    apr: '12.5',
    volumeUSD: '0',
    txCount: 0
  }
];

export async function getLiquidityPools(chainId, partner) {
  try {
    let pools = await getTopPools(chainId, 20);

    if ((!pools || pools.length === 0) && chainId === 8453) {
      pools = BASE_FALLBACK_POOLS;
    }

    const dlmm = chainId === 8453 ? await getMaverickPools(chainId, { limit: 12 }) : null;

    if (!pools || pools.length === 0) {
      return {
        chainId,
        pools: [],
        routerAddress: LIQUIDITY_ROUTER_ADDRESSES[chainId] || null,
        nftManagerAddress: getNonfungiblePositionManagerAddress(chainId),
        message: 'No pools available for this chain',
        dlmm
      };
    }

    return {
      chainId,
      routerAddress: LIQUIDITY_ROUTER_ADDRESSES[chainId],
      nftManagerAddress: getNonfungiblePositionManagerAddress(chainId),
      pools: pools.map(pool => ({
        ...pool,
        canAdd: true,
        canRemove: true
      })),
      dlmm
    };
  } catch (error) {
    console.error('Get liquidity pools error:', error);
    return {
      chainId,
      pools: [],
      routerAddress: LIQUIDITY_ROUTER_ADDRESSES[chainId] || null,
      nftManagerAddress: getNonfungiblePositionManagerAddress(chainId),
      message: error.message,
      dlmm: null
    };
  }
}

export async function addLiquidity(params, partner) {
  const { poolAddress, token0Amount, token1Amount, chainId, walletAddress, tickLower, tickUpper, deadline, slippage = 0.5 } = params;

  const nftManagerAddress = getNonfungiblePositionManagerAddress(chainId);
  if (!nftManagerAddress) {
    throw new Error(`Uniswap V3 not available for chain ${chainId}`);
  }

  const poolData = await getPoolData(chainId, poolAddress);
  if (!poolData) {
    throw new Error(`Pool ${poolAddress} not found`);
  }

  const txDeadline = deadline || Math.floor(Date.now() / 1000) + 1200;

  const amount0Min = (BigInt(token0Amount) * BigInt(10000 - Math.floor(slippage * 100)) / BigInt(10000)).toString();
  const amount1Min = (BigInt(token1Amount) * BigInt(10000 - Math.floor(slippage * 100)) / BigInt(10000)).toString();

  return {
    chainId,
    poolAddress,
    nftManagerAddress,
    action: 'mint',
    params: {
      token0: poolData.token0.address,
      token1: poolData.token1.address,
      fee: poolData.fee,
      tickLower,
      tickUpper,
      amount0Desired: token0Amount,
      amount1Desired: token1Amount,
      amount0Min,
      amount1Min,
      recipient: walletAddress,
      deadline: txDeadline
    },
    metadata: {
      poolInfo: {
        token0Symbol: poolData.token0.symbol,
        token1Symbol: poolData.token1.symbol,
        feeTier: poolData.fee
      },
      slippage,
      createdAt: new Date().toISOString()
    }
  };
}

export async function increaseLiquidity(params, partner) {
  const { tokenId, token0Amount, token1Amount, chainId, deadline, slippage = 0.5 } = params;

  const nftManagerAddress = getNonfungiblePositionManagerAddress(chainId);
  if (!nftManagerAddress) {
    throw new Error(`Uniswap V3 not available for chain ${chainId}`);
  }

  const txDeadline = deadline || Math.floor(Date.now() / 1000) + 1200;

  const amount0Min = (BigInt(token0Amount) * BigInt(10000 - Math.floor(slippage * 100)) / BigInt(10000)).toString();
  const amount1Min = (BigInt(token1Amount) * BigInt(10000 - Math.floor(slippage * 100)) / BigInt(10000)).toString();

  return {
    chainId,
    nftManagerAddress,
    action: 'increaseLiquidity',
    params: {
      tokenId,
      amount0Desired: token0Amount,
      amount1Desired: token1Amount,
      amount0Min,
      amount1Min,
      deadline: txDeadline
    },
    metadata: {
      slippage,
      createdAt: new Date().toISOString()
    }
  };
}

export async function removeLiquidity(params, partner) {
  const { tokenId, liquidity, chainId, walletAddress, deadline, slippage = 0.5 } = params;

  const nftManagerAddress = getNonfungiblePositionManagerAddress(chainId);
  if (!nftManagerAddress) {
    throw new Error(`Uniswap V3 not available for chain ${chainId}`);
  }

  const txDeadline = deadline || Math.floor(Date.now() / 1000) + 1200;

  return {
    chainId,
    nftManagerAddress,
    action: 'decreaseLiquidity',
    params: {
      tokenId,
      liquidity,
      amount0Min: '0',
      amount1Min: '0',
      deadline: txDeadline
    },
    collectParams: {
      tokenId,
      recipient: walletAddress,
      amount0Max: '340282366920938463463374607431768211455',
      amount1Max: '340282366920938463463374607431768211455'
    },
    metadata: {
      slippage,
      createdAt: new Date().toISOString()
    }
  };
}

export async function collectFees(params, partner) {
  const { tokenId, chainId, walletAddress } = params;

  const nftManagerAddress = getNonfungiblePositionManagerAddress(chainId);
  if (!nftManagerAddress) {
    throw new Error(`Uniswap V3 not available for chain ${chainId}`);
  }

  return {
    chainId,
    nftManagerAddress,
    action: 'collect',
    params: {
      tokenId,
      recipient: walletAddress,
      amount0Max: '340282366920938463463374607431768211455',
      amount1Max: '340282366920938463463374607431768211455'
    },
    metadata: {
      createdAt: new Date().toISOString()
    }
  };
}

export async function getUserPositions(params, partner) {
  const { wallet, chainId } = params;

  if (chainId) {
    const positions = await getUniswapPositions(chainId, wallet);
    return {
      wallet,
      chainId,
      positions,
      totalPositions: positions.length,
      nftManagerAddress: getNonfungiblePositionManagerAddress(chainId)
    };
  }

  const allPositions = [];
  const supportedChains = [1, 8453, 42161, 10, 137, 43114];

  for (const cid of supportedChains) {
    try {
      const positions = await getUniswapPositions(cid, wallet);
      allPositions.push(...positions);
    } catch (error) {
      console.error(`Failed to fetch positions for chain ${cid}:`, error);
    }
  }

  return {
    wallet,
    chainId: 'all',
    positions: allPositions,
    totalPositions: allPositions.length
  };
}
