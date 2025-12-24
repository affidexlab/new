import { ethers } from 'ethers';

const MAVERICK_V2_FACTORY_ADDRESS = '0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e';
const MAVERICK_V2_POOL_LENS_ADDRESS = '0x6A9EB38DE5D349Fe751E0aDb4c0D9D391f94cc8D';

const MAVERICK_V2_FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "startIndex", "type": "uint256" },
      { "internalType": "uint256", "name": "endIndex", "type": "uint256" }
    ],
    "name": "lookup",
    "outputs": [
      { "internalType": "contract IMaverickV2Pool[]", "name": "pools", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const MAVERICK_V2_POOL_ABI = [
  {
    "inputs": [],
    "name": "tokenA",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenB",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getState",
    "outputs": [{
      "components": [
        { "internalType": "int32", "name": "activeTick", "type": "int32" },
        { "internalType": "uint8", "name": "status", "type": "uint8" },
        { "internalType": "uint128", "name": "binCounter", "type": "uint128" },
        { "internalType": "uint64", "name": "protocolFeeRatioD3", "type": "uint64" }
      ],
      "internalType": "struct IMaverickV2Pool.State",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bool", "name": "tokenAIn", "type": "bool" }],
    "name": "fee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const MAVERICK_V2_POOL_LENS_ABI = [
  {
    "inputs": [
      { "internalType": "contract IMaverickV2Pool", "name": "pool", "type": "address" }
    ],
    "name": "getPoolPrice",
    "outputs": [{ "internalType": "uint256", "name": "price", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "contract IMaverickV2Pool", "name": "pool", "type": "address" }
    ],
    "name": "getFullPoolState",
    "outputs": [{
      "components": [
        { "internalType": "uint256", "name": "reserveA", "type": "uint256" },
        { "internalType": "uint256", "name": "reserveB", "type": "uint256" },
        { "internalType": "uint256", "name": "totalSupply", "type": "uint256" },
        { "internalType": "int32", "name": "activeTick", "type": "int32" }
      ],
      "internalType": "struct MaverickV2PoolLens.FullPoolState",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
];

const ERC20_ABI = [
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const RPC_URLS = {
  8453: 'https://base.llamarpc.com',
  1: 'https://eth.llamarpc.com',
  42161: 'https://arbitrum.llamarpc.com',
  324: 'https://mainnet.era.zksync.io',
  56: 'https://bsc-dataseed.binance.org',
  534352: 'https://rpc.scroll.io'
};

const REQUEST_TIMEOUT_MS = 8000;

export async function getMaverickV2PoolsOnChain(chainId, { limit = 12 } = {}) {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT_MS)
  );

  try {
    return await Promise.race([timeoutPromise, fetchPoolsInternal(chainId, limit)]);
  } catch (error) {
    console.error('Maverick V2 on-chain fetch error:', error);
    return {
      provider: 'Maverick V2',
      pools: [],
      stats: {
        totalLiquidityUsd: 0,
        totalVolumeUsd: 0,
        averageFeeBps: 0,
        poolCount: 0,
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

async function fetchPoolsInternal(chainId, limit) {
  const rpcUrl = RPC_URLS[chainId];
  if (!rpcUrl) {
    console.log(`No RPC URL for chain ${chainId}`);
    return {
      provider: 'Maverick V2',
      pools: [],
      stats: {
        totalLiquidityUsd: 0,
        totalVolumeUsd: 0,
        averageFeeBps: 0,
        poolCount: 0,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const factory = new ethers.Contract(
      MAVERICK_V2_FACTORY_ADDRESS,
      MAVERICK_V2_FACTORY_ABI,
      provider
    );

    const poolCount = await factory.poolCount();
    const totalPools = Number(poolCount);
    
    if (totalPools === 0) {
      return {
        provider: 'Maverick V2',
        pools: [],
        stats: {
          totalLiquidityUsd: 0,
          totalVolumeUsd: 0,
          averageFeeBps: 0,
          poolCount: 0,
          lastUpdated: new Date().toISOString()
        }
      };
    }

    const endIndex = Math.min(limit, totalPools);
    const poolAddresses = await factory.lookup(0, endIndex);

    const pools = [];
    const batchSize = 3;
    
    for (let i = 0; i < Math.min(poolAddresses.length, limit); i += batchSize) {
      const batch = poolAddresses.slice(i, Math.min(i + batchSize, Math.min(poolAddresses.length, limit)));
      const batchResults = await Promise.all(
        batch.map(async (poolAddress) => {
        try {
          const pool = new ethers.Contract(poolAddress, MAVERICK_V2_POOL_ABI, provider);
          const poolLens = new ethers.Contract(
            MAVERICK_V2_POOL_LENS_ADDRESS,
            MAVERICK_V2_POOL_LENS_ABI,
            provider
          );

          const [tokenAAddress, tokenBAddress, state, feeA, poolState] = await Promise.all([
            pool.tokenA(),
            pool.tokenB(),
            pool.getState(),
            pool.fee(true),
            poolLens.getFullPoolState(poolAddress)
          ]);

          const tokenA = new ethers.Contract(tokenAAddress, ERC20_ABI, provider);
          const tokenB = new ethers.Contract(tokenBAddress, ERC20_ABI, provider);

          const [symbolA, decimalsA, symbolB, decimalsB] = await Promise.all([
            tokenA.symbol(),
            tokenA.decimals(),
            tokenB.symbol(),
            tokenB.decimals()
          ]);

          const reserveA = Number(ethers.formatUnits(poolState.reserveA, decimalsA));
          const reserveB = Number(ethers.formatUnits(poolState.reserveB, decimalsB));
          
          const liquidityUsd = (reserveA + reserveB) * 1000;

          return {
            id: `${chainId}-${symbolA}-${symbolB}-${poolAddress.slice(2, 8)}`,
            poolAddress,
            token0: {
              address: tokenAAddress,
              symbol: symbolA,
              decimals: Number(decimalsA)
            },
            token1: {
              address: tokenBAddress,
              symbol: symbolB,
              decimals: Number(decimalsB)
            },
            liquidityUsd: Number(liquidityUsd.toFixed(2)),
            dailyVolumeUsd: 0,
            lastPrice: 0,
            fees: {
              makerFeeBps: Number((Number(feeA) / 1e16).toFixed(2)),
              takerFeeBps: Number((Number(feeA) / 1e16).toFixed(2))
            },
            apr: 0,
            binWidthBps: 0,
            bins: [],
            updatedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error fetching pool ${poolAddress}:`, error.message);
          return null;
        }
      })
      );
      pools.push(...batchResults);
    }

  const validPools = pools.filter(p => p !== null);
  const totalLiquidityUsd = validPools.reduce((acc, pool) => acc + pool.liquidityUsd, 0);

  return {
    provider: 'Maverick V2',
    pools: validPools,
    stats: {
      totalLiquidityUsd: Number(totalLiquidityUsd.toFixed(2)),
      totalVolumeUsd: 0,
      averageFeeBps: validPools.length > 0
        ? validPools.reduce((acc, pool) => acc + pool.fees.makerFeeBps, 0) / validPools.length
        : 0,
      poolCount: validPools.length,
      lastUpdated: new Date().toISOString()
    }
  };
}
