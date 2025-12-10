import crypto from 'crypto';

const LIQUIDITY_ROUTER_ADDRESSES = {
  8453: '0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4',
  42161: '0xDE8700785C7512a8397683A9BE9717B0aFdB18F3',
  10: '0xA2fdf81b7967e7FA7610DeBe1901A40686c48992',
  137: '0xFd05977256E8D5753728C78A3003BC3B75Fef1DD'
};

const SUPPORTED_POOLS = {
  8453: [
    {
      id: 'base-usdc-eth-500',
      address: '0x4c36388be6f416a29c8d8eee81c771ce6be14b18',
      token0: { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
      token1: { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
      fee: 500,
      protocol: 'Uniswap V3',
      tvl: '5000000',
      apr: '12.5'
    },
    {
      id: 'base-usdc-eth-aero',
      address: '0x6cDcb1C4A4D1C3C6d054b27AC5B77e89eAFb971d',
      token0: { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
      token1: { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
      fee: 200,
      protocol: 'Aerodrome',
      tvl: '8000000',
      apr: '18.3'
    }
  ],
  42161: [
    {
      id: 'arb-usdc-eth-500',
      address: '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443',
      token0: { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
      token1: { symbol: 'WETH', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18 },
      fee: 500,
      protocol: 'Uniswap V3',
      tvl: '12000000',
      apr: '15.2'
    }
  ],
  10: [
    {
      id: 'op-usdc-eth-500',
      address: '0x85149247691df622eaF1a8Bd0CaFd40BC45154a9',
      token0: { symbol: 'USDC', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6 },
      token1: { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
      fee: 500,
      protocol: 'Uniswap V3',
      tvl: '7000000',
      apr: '13.8'
    }
  ],
  137: [
    {
      id: 'poly-usdc-eth-500',
      address: '0x45dDa9cb7c25131DF268515131f647d726f50608',
      token0: { symbol: 'USDC', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 },
      token1: { symbol: 'WETH', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18 },
      fee: 500,
      protocol: 'Uniswap V3',
      tvl: '3000000',
      apr: '10.5'
    }
  ]
};

export async function getLiquidityPools(chainId, partner) {
  const pools = SUPPORTED_POOLS[chainId];
  
  if (!pools) {
    return {
      chainId,
      pools: [],
      routerAddress: LIQUIDITY_ROUTER_ADDRESSES[chainId] || null,
      message: 'No pools available for this chain'
    };
  }

  return {
    chainId,
    routerAddress: LIQUIDITY_ROUTER_ADDRESSES[chainId],
    pools: pools.map(pool => ({
      ...pool,
      canAdd: true,
      canRemove: true
    }))
  };
}

export async function addLiquidity(params, partner) {
  const { poolId, token0Amount, token1Amount, chainId, walletAddress, deadline, slippage = 0.5 } = params;

  const routerAddress = LIQUIDITY_ROUTER_ADDRESSES[chainId];
  if (!routerAddress) {
    throw new Error(`Liquidity router not available for chain ${chainId}`);
  }

  const pools = SUPPORTED_POOLS[chainId] || [];
  const pool = pools.find(p => p.id === poolId);
  
  if (!pool) {
    throw new Error(`Pool ${poolId} not found`);
  }

  const txDeadline = deadline || Math.floor(Date.now() / 1000) + 1200;

  const addLiquidityCalldata = encodeAddLiquidity({
    token0: pool.token0.address,
    token1: pool.token1.address,
    fee: pool.fee,
    amount0: token0Amount,
    amount1: token1Amount,
    recipient: walletAddress,
    deadline: txDeadline
  });

  return {
    poolId,
    chainId,
    to: routerAddress,
    data: addLiquidityCalldata,
    value: '0',
    gasLimit: '350000',
    pool: {
      token0: pool.token0.symbol,
      token1: pool.token1.symbol,
      protocol: pool.protocol
    },
    amounts: {
      token0: token0Amount,
      token1: token1Amount
    },
    deadline: txDeadline,
    estimatedShares: calculateEstimatedShares(token0Amount, token1Amount),
    metadata: {
      slippage,
      createdAt: new Date().toISOString()
    }
  };
}

export async function removeLiquidity(params, partner) {
  const { positionId, liquidity, chainId, walletAddress, deadline } = params;

  const routerAddress = LIQUIDITY_ROUTER_ADDRESSES[chainId];
  if (!routerAddress) {
    throw new Error(`Liquidity router not available for chain ${chainId}`);
  }

  const txDeadline = deadline || Math.floor(Date.now() / 1000) + 1200;

  const removeLiquidityCalldata = encodeRemoveLiquidity({
    positionId,
    liquidity,
    recipient: walletAddress,
    deadline: txDeadline
  });

  return {
    positionId,
    chainId,
    to: routerAddress,
    data: removeLiquidityCalldata,
    value: '0',
    gasLimit: '300000',
    liquidity,
    deadline: txDeadline,
    metadata: {
      createdAt: new Date().toISOString()
    }
  };
}

export async function getUserPositions(params, partner) {
  const { wallet, chainId } = params;

  const mockPositions = [];

  if (chainId && LIQUIDITY_ROUTER_ADDRESSES[chainId]) {
    const pools = SUPPORTED_POOLS[chainId] || [];
    pools.forEach((pool, index) => {
      if (index === 0) {
        mockPositions.push({
          positionId: `${chainId}-${crypto.randomBytes(8).toString('hex')}`,
          chainId,
          poolId: pool.id,
          poolAddress: pool.address,
          token0: pool.token0,
          token1: pool.token1,
          liquidity: '1000000000000000000',
          token0Amount: '1000000',
          token1Amount: '500000000000000000',
          feesEarned0: '5000',
          feesEarned1: '2500000000000000',
          apr: pool.apr,
          protocol: pool.protocol,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });
  } else {
    Object.keys(LIQUIDITY_ROUTER_ADDRESSES).forEach(cid => {
      const pools = SUPPORTED_POOLS[cid] || [];
      if (pools[0]) {
        mockPositions.push({
          positionId: `${cid}-${crypto.randomBytes(8).toString('hex')}`,
          chainId: parseInt(cid),
          poolId: pools[0].id,
          poolAddress: pools[0].address,
          token0: pools[0].token0,
          token1: pools[0].token1,
          liquidity: '500000000000000000',
          token0Amount: '500000',
          token1Amount: '250000000000000000',
          feesEarned0: '2500',
          feesEarned1: '1250000000000000',
          apr: pools[0].apr,
          protocol: pools[0].protocol,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });
  }

  return {
    wallet,
    chainId: chainId || 'all',
    positions: mockPositions,
    totalPositions: mockPositions.length
  };
}

function encodeAddLiquidity(params) {
  return '0xac9650d8' + crypto.randomBytes(200).toString('hex');
}

function encodeRemoveLiquidity(params) {
  return '0x0c49ccbe' + crypto.randomBytes(150).toString('hex');
}

function calculateEstimatedShares(amount0, amount1) {
  try {
    const amt0 = BigInt(amount0);
    const amt1 = BigInt(amount1);
    return ((amt0 + amt1) / BigInt(2)).toString();
  } catch {
    return '0';
  }
}
