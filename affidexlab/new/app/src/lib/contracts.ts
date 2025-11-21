export const MINIMAL_FACTORY_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createPair",
    "inputs": [
      { "name": "tokenA", "type": "address" },
      { "name": "tokenB", "type": "address" },
      { "name": "feeBips", "type": "uint24" },
      { "name": "tvlCap", "type": "uint256" }
    ],
    "outputs": [{ "name": "pair", "type": "address" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getPair",
    "inputs": [
      { "name": "", "type": "address" },
      { "name": "", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "allPairs",
    "inputs": [{ "name": "", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "PairCreated",
    "inputs": [
      { "name": "token0", "type": "address", "indexed": false },
      { "name": "token1", "type": "address", "indexed": false },
      { "name": "pair", "type": "address", "indexed": false }
    ]
  }
] as const;

export const MINIMAL_PAIR_ABI = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_t0", "type": "address" },
      { "name": "_t1", "type": "address" },
      { "name": "_fee", "type": "uint24" },
      { "name": "_cap", "type": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "token0",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "token1",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "feeBips",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint24" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tvlCap",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getReserves",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint112" },
      { "name": "", "type": "uint112" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "addLiquidity",
    "inputs": [
      { "name": "amount0", "type": "uint256" },
      { "name": "amount1", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "swap",
    "inputs": [
      { "name": "amount0Out", "type": "uint256" },
      { "name": "amount1Out", "type": "uint256" },
      { "name": "to", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Sync",
    "inputs": [
      { "name": "r0", "type": "uint112", "indexed": false },
      { "name": "r1", "type": "uint112", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "Swap",
    "inputs": [
      { "name": "sender", "type": "address", "indexed": false },
      { "name": "amount0In", "type": "uint256", "indexed": false },
      { "name": "amount1In", "type": "uint256", "indexed": false },
      { "name": "amount0Out", "type": "uint256", "indexed": false },
      { "name": "amount1Out", "type": "uint256", "indexed": false },
      { "name": "to", "type": "address", "indexed": false }
    ]
  }
] as const;

export const MINIMAL_FACTORY_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  // Add deployed addresses here after deployment
  // 42161: "0x...", // Arbitrum
  // 43114: "0x...", // Avalanche
  // 8453: "0x...",  // Base
  // 10: "0x...",     // Optimism
  // 137: "0x...",    // Polygon
};

export function isFactoryDeployed(chainId: number): boolean {
  return !!MINIMAL_FACTORY_ADDRESSES[chainId];
}

export function getFactoryAddress(chainId: number): `0x${string}` | undefined {
  return MINIMAL_FACTORY_ADDRESSES[chainId];
}
