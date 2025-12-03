import { CHAIN_IDS } from "./constants";

export const LIQUIDITY_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_uniswapV3Router", type: "address" },
      { internalType: "address", name: "_aerodromeRouter", type: "address" },
      { internalType: "address", name: "_treasury", type: "address" },
      { internalType: "uint256", name: "_feeRate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "FeeCollected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "newFeeRate", type: "uint256" },
    ],
    name: "FeeRateUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "tokenIn", type: "address" },
      { indexed: true, internalType: "address", name: "tokenOut", type: "address" },
      { indexed: false, internalType: "uint256", name: "amountIn", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amountOut", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "routerUsed", type: "uint8" },
    ],
    name: "SwapExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "newTreasury", type: "address" },
    ],
    name: "TreasuryUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "aerodromeRouter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
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
    ],
    name: "getAerodromeQuote",
    outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "rescueTokens",
    outputs: [],
    stateMutability: "nonpayable",
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
    stateMutability: "nonpayable",
    type: "function",
  },
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
    stateMutability: "nonpayable",
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
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "uniswapV3Router",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newFeeRate", type: "uint256" }],
    name: "updateFeeRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newTreasury", type: "address" }],
    name: "updateTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

export const UNISWAP_V3_QUOTER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "address", name: "tokenOut", type: "address" },
      { internalType: "uint24", name: "fee", type: "uint24" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint160", name: "sqrtPriceX96After", type: "uint160" },
      { internalType: "uint32", name: "initializedTicksCrossed", type: "uint32" },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "path", type: "bytes" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
    ],
    name: "quoteExactInput",
    outputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint160[]", name: "sqrtPriceX96AfterList", type: "uint160[]" },
      { internalType: "uint32[]", name: "initializedTicksCrossedList", type: "uint32[]" },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const AERODROME_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      {
        components: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "bool", name: "stable", type: "bool" },
          { internalType: "address", name: "factory", type: "address" },
        ],
        internalType: "struct Route[]",
        name: "routes",
        type: "tuple[]",
      },
    ],
    name: "getAmountsOut",
    outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const LIQUIDITY_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  [CHAIN_IDS.BASE]: "0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4",
  [CHAIN_IDS.ARBITRUM]: "0xDE8700785C7512a8397683A9BE9717B0aFdB18F3",
  [CHAIN_IDS.OPTIMISM]: "0xA2fdf81b7967e7FA7610DeBe1901A40686c48992",
  [CHAIN_IDS.POLYGON]: "0xFd05977256E8D5753728C78A3003BC3B75Fef1DD", // DEPLOYED Dec 3, 2025
  // [CHAIN_IDS.AVALANCHE]: "0x...", // Needs 0.011 more AVAX
  // [CHAIN_IDS.ETHEREUM]: "0x...", // Needs 0.00001 more ETH
};

export const UNISWAP_V3_QUOTER_ADDRESSES: Record<number, `0x${string}`> = {
  [CHAIN_IDS.ETHEREUM]: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  [CHAIN_IDS.ARBITRUM]: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  [CHAIN_IDS.OPTIMISM]: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  [CHAIN_IDS.POLYGON]: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  [CHAIN_IDS.BASE]: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  [CHAIN_IDS.AVALANCHE]: "0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F",
};

export const AERODROME_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  [CHAIN_IDS.BASE]: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
};

export const AERODROME_FACTORY_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  [CHAIN_IDS.BASE]: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
};

export const UNISWAP_V3_FEE_TIERS = [100, 500, 3000, 10000] as const;

export type UniswapV3FeeTier = typeof UNISWAP_V3_FEE_TIERS[number];

export function isLiquidityRouterDeployed(chainId: number): boolean {
  return !!LIQUIDITY_ROUTER_ADDRESSES[chainId];
}

export function getLiquidityRouterAddress(chainId: number): `0x${string}` | undefined {
  return LIQUIDITY_ROUTER_ADDRESSES[chainId];
}

export function getUniswapV3QuoterAddress(chainId: number): `0x${string}` | undefined {
  return UNISWAP_V3_QUOTER_ADDRESSES[chainId];
}

export function getAerodromeRouterAddress(chainId: number): `0x${string}` | undefined {
  return AERODROME_ROUTER_ADDRESSES[chainId];
}

export function getAerodromeFactoryAddress(chainId: number): `0x${string}` | undefined {
  return AERODROME_FACTORY_ADDRESSES[chainId];
}

export function isAerodromeAvailable(chainId: number): boolean {
  return !!AERODROME_ROUTER_ADDRESSES[chainId];
}

export type RouterType = "uniswap_v3" | "aerodrome";

export interface SwapRoute {
  router: RouterType;
  estimatedOutput: string;
  estimatedGas: string;
  priceImpact: number;
  route: string;
}
