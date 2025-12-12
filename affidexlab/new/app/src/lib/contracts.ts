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

export const LIQUIDITY_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "address", name: "tokenOut", type: "address" },
      { internalType: "uint24", name: "fee", type: "uint24" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMinimum", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactInputUniswapV3",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "path", type: "bytes" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMinimum", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactInputUniswapV3MultiHop",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "bool", name: "stable", type: "bool" },
          { internalType: "address", name: "factory", type: "address" },
        ],
        internalType: "struct IAerodromeRouter.Route[]",
        name: "routes",
        type: "tuple[]",
      },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactInputAerodrome",
    outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const LIQUIDITY_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  8453: "0xd2ba93660d623b665DbC0957F010F60d5Cb98B5E", // Base - WITH NATIVE ETH SUPPORT
  42161: "0xDE8700785C7512a8397683A9BE9717B0aFdB18F3", // Arbitrum
  10: "0xA2fdf81b7967e7FA7610DeBe1901A40686c48992", // Optimism
  137: "0xFd05977256E8D5753728C78A3003BC3B75Fef1DD", // Polygon
  // 43114: "0x...", // Avalanche
  // 1: "0x...", // Ethereum
};

export function isLiquidityRouterDeployed(chainId: number): boolean {
  return !!LIQUIDITY_ROUTER_ADDRESSES[chainId];
}

export function getLiquidityRouterAddress(chainId: number): `0x${string}` | undefined {
  return LIQUIDITY_ROUTER_ADDRESSES[chainId];
}
