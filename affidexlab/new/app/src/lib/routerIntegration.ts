import { encodePacked } from "viem";
import { 
  UNISWAP_V3_QUOTER_ADDRESSES, 
  AERODROME_ROUTER_ADDRESSES,
  AERODROME_FACTORY_ADDRESSES,
  UNISWAP_V3_FEE_TIERS,
  UNISWAP_V3_QUOTER_ABI,
  AERODROME_ROUTER_ABI,
  type RouterType,
  type SwapRoute,
  type UniswapV3FeeTier,
} from "./liquidityRouter";
import { createPublicClient, http, type PublicClient } from "viem";
import { mainnet, arbitrum, optimism, polygon, base, avalanche } from "viem/chains";

const CHAIN_CONFIG: Record<number, any> = {
  1: mainnet,
  42161: arbitrum,
  10: optimism,
  137: polygon,
  8453: base,
  43114: avalanche,
};

function getPublicClient(chainId: number): PublicClient {
  const chain = CHAIN_CONFIG[chainId];
  if (!chain) throw new Error(`Chain ${chainId} not supported`);
  
  return createPublicClient({
    chain,
    transport: http(),
  });
}

export interface QuoteParams {
  fromToken: string;
  toToken: string;
  amount: string;
  fromAddress?: string;
  chainId: number;
  slippagePercentage?: number;
}

export interface QuoteResult {
  provider: "uniswap_v3" | "aerodrome";
  price: string;
  estimatedOutput: string;
  estimatedGas: string;
  route: string;
  routerType: RouterType;
  fee?: UniswapV3FeeTier;
  aerodromeRoutes?: AerodromeRoute[];
  path?: `0x${string}`;
}

export interface AerodromeRoute {
  from: `0x${string}`;
  to: `0x${string}`;
  stable: boolean;
  factory: `0x${string}`;
}

export async function quoteUniswapV3(params: QuoteParams): Promise<QuoteResult | null> {
  const quoterAddress = UNISWAP_V3_QUOTER_ADDRESSES[params.chainId];
  if (!quoterAddress) {
    console.log(`Uniswap V3 not available on chain ${params.chainId}`);
    return null;
  }

  const client = getPublicClient(params.chainId);
  
  const fromToken = params.fromToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" 
    ? getWrappedNative(params.chainId) 
    : params.fromToken;
  const toToken = params.toToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    ? getWrappedNative(params.chainId)
    : params.toToken;

  let bestQuote: QuoteResult | null = null;
  let bestOutput = 0n;

  for (const fee of UNISWAP_V3_FEE_TIERS) {
    try {
      const result = await client.readContract({
        address: quoterAddress,
        abi: UNISWAP_V3_QUOTER_ABI,
        functionName: "quoteExactInputSingle",
        args: [
          fromToken as `0x${string}`,
          toToken as `0x${string}`,
          fee,
          BigInt(params.amount),
          0n,
        ],
      });

      const [amountOut, , , gasEstimate] = result;

      if (amountOut > bestOutput) {
        bestOutput = amountOut;
        const price = (Number(amountOut) / Number(params.amount)).toFixed(6);
        
        bestQuote = {
          provider: "uniswap_v3",
          price,
          estimatedOutput: amountOut.toString(),
          estimatedGas: gasEstimate.toString(),
          route: `Uniswap V3 (${fee / 10000}%)`,
          routerType: "uniswap_v3",
          fee,
        };
      }
    } catch (error) {
      console.log(`Failed to quote Uniswap V3 with fee ${fee}:`, error);
    }
  }

  return bestQuote;
}

export async function quoteAerodrome(params: QuoteParams): Promise<QuoteResult | null> {
  const aerodromeRouter = AERODROME_ROUTER_ADDRESSES[params.chainId];
  const aerodromeFactory = AERODROME_FACTORY_ADDRESSES[params.chainId];
  
  if (!aerodromeRouter || !aerodromeFactory) {
    console.log(`Aerodrome not available on chain ${params.chainId}`);
    return null;
  }

  const client = getPublicClient(params.chainId);
  
  const fromToken = params.fromToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    ? getWrappedNative(params.chainId)
    : params.fromToken;
  const toToken = params.toToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    ? getWrappedNative(params.chainId)
    : params.toToken;

  const routes: AerodromeRoute[] = [
    {
      from: fromToken as `0x${string}`,
      to: toToken as `0x${string}`,
      stable: false,
      factory: aerodromeFactory,
    },
  ];

  const routesStable: AerodromeRoute[] = [
    {
      from: fromToken as `0x${string}`,
      to: toToken as `0x${string}`,
      stable: true,
      factory: aerodromeFactory,
    },
  ];

  let bestQuote: QuoteResult | null = null;
  let bestOutput = 0n;

  for (const routeSet of [routes, routesStable]) {
    try {
      const amounts = await client.readContract({
        address: aerodromeRouter,
        abi: AERODROME_ROUTER_ABI,
        functionName: "getAmountsOut",
        args: [BigInt(params.amount), routeSet],
      });

      const amountOut = amounts[amounts.length - 1];

      if (amountOut > bestOutput) {
        bestOutput = amountOut;
        const price = (Number(amountOut) / Number(params.amount)).toFixed(6);
        const poolType = routeSet[0].stable ? "Stable" : "Volatile";
        
        bestQuote = {
          provider: "aerodrome",
          price,
          estimatedOutput: amountOut.toString(),
          estimatedGas: "150000",
          route: `Aerodrome ${poolType}`,
          routerType: "aerodrome",
          aerodromeRoutes: routeSet,
        };
      }
    } catch (error) {
      console.log(`Failed to quote Aerodrome (stable: ${routeSet[0].stable}):`, error);
    }
  }

  return bestQuote;
}

export async function getBestRoute(params: QuoteParams): Promise<QuoteResult> {
  const [uniswapQuote, aerodromeQuote] = await Promise.allSettled([
    quoteUniswapV3(params),
    quoteAerodrome(params),
  ]);

  const quotes: QuoteResult[] = [];

  if (uniswapQuote.status === "fulfilled" && uniswapQuote.value) {
    quotes.push(uniswapQuote.value);
  }

  if (aerodromeQuote.status === "fulfilled" && aerodromeQuote.value) {
    quotes.push(aerodromeQuote.value);
  }

  if (quotes.length === 0) {
    throw new Error("No quotes available from any router");
  }

  const bestQuote = quotes.reduce((best, current) => {
    const bestOutput = BigInt(best.estimatedOutput);
    const currentOutput = BigInt(current.estimatedOutput);
    return currentOutput > bestOutput ? current : best;
  });

  return bestQuote;
}

export function getWrappedNative(chainId: number): string {
  const WRAPPED_NATIVE: Record<number, string> = {
    1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    10: "0x4200000000000000000000000000000000000006",
    137: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    8453: "0x4200000000000000000000000000000000000006",
    43114: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  };
  
  return WRAPPED_NATIVE[chainId] || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
}

export function encodeUniswapV3Path(
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  fee: UniswapV3FeeTier
): `0x${string}` {
  return encodePacked(
    ["address", "uint24", "address"],
    [tokenIn, fee, tokenOut]
  );
}

export function calculateMinimumOutput(
  estimatedOutput: string,
  slippagePercentage: number
): bigint {
  const output = BigInt(estimatedOutput);
  const slippage = BigInt(Math.floor(slippagePercentage * 100));
  return (output * (10000n - slippage)) / 10000n;
}
