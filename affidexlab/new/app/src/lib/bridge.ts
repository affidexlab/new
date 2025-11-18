import { SOCKET_API_BASE, CHAIN_IDS } from "./constants";

export type BridgeParams = {
  fromChain: keyof typeof CHAIN_IDS;
  toChain: keyof typeof CHAIN_IDS;
  token: string;
  amount: string;
  fromAddress?: string;
};

export type BridgeQuote = {
  provider: "cctp" | "ccip" | "socket";
  path: string;
  eta: string;
  feeEstimate: string;
  data?: any;
};

// CCTP: Circle's native USDC bridge
export async function quoteCCTP(params: BridgeParams): Promise<BridgeQuote> {
  // CCTP only supports USDC
  const usdcAddresses: Record<string, string> = {
    ARBITRUM: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    BASE: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    OPTIMISM: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    POLYGON: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  };

  if (!params.token.toLowerCase().includes("usdc")) {
    throw new Error("CCTP only supports USDC");
  }

  // CCTP contract addresses per chain
  const cctpBridges: Record<string, string> = {
    ARBITRUM: "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
    BASE: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962",
    OPTIMISM: "0x2B4069517957735bE00ceE0fadAE88a26365528f",
    POLYGON: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE",
  };

  return {
    provider: "cctp",
    path: "CCTP Native USDC",
    eta: "2-5 min",
    feeEstimate: "~$0.10",
    data: {
      sourceContract: cctpBridges[params.fromChain],
      destinationDomain: CHAIN_IDS[params.toChain],
    },
  };
}

// CCIP: Chainlink's cross-chain protocol
export async function quoteCCIP(params: BridgeParams): Promise<BridgeQuote> {
  // CCIP router addresses
  const ccipRouters: Record<string, string> = {
    ARBITRUM: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
    BASE: "0x673AA85efd75080031d44fcA061575d1dA427A28",
    OPTIMISM: "0x3206695CaE29952f4b0c22a169725a865bc8Ce0f",
    POLYGON: "0x849c5ED5a80F5B408Dd4969b78c2C8fdf0565Bfe",
  };

  return {
    provider: "ccip",
    path: `CCIP ${params.fromChain} → ${params.toChain}`,
    eta: "5-10 min",
    feeEstimate: "~$1-5",
    data: {
      router: ccipRouters[params.fromChain],
      destinationChainSelector: CHAIN_IDS[params.toChain],
    },
  };
}

// Socket: Aggregator fallback for all routes
export async function quoteSocket(params: BridgeParams): Promise<BridgeQuote> {
  try {
    const url = `${SOCKET_API_BASE}/quote?${new URLSearchParams({
      fromChainId: CHAIN_IDS[params.fromChain].toString(),
      toChainId: CHAIN_IDS[params.toChain].toString(),
      fromTokenAddress: params.token,
      toTokenAddress: params.token, // Same token on dest
      fromAmount: params.amount,
      userAddress: params.fromAddress || "0x0000000000000000000000000000000000000000",
      uniqueRoutesPerBridge: "true",
      sort: "output",
    })}`;

    const response = await fetch(url, {
      headers: {
        "API-KEY": "YOUR_SOCKET_API_KEY", // Replace with actual key
      },
    });

    if (!response.ok) {
      throw new Error(`Socket API error: ${response.statusText}`);
    }

    const data = await response.json();
    const bestRoute = data.result?.routes?.[0];

    if (!bestRoute) {
      throw new Error("No routes found");
    }

    return {
      provider: "socket",
      path: `Socket (${bestRoute.usedBridgeNames?.join(", ") || "Multi-bridge"})`,
      eta: `${Math.ceil(bestRoute.serviceTime / 60)} min`,
      feeEstimate: `$${(Number(bestRoute.totalGasFeesInUsd) || 0).toFixed(2)}`,
      data: bestRoute,
    };
  } catch (error) {
    console.error("Socket quote error:", error);
    throw error;
  }
}

// Smart routing: Choose best bridge based on token and chains
export async function bestBridgeRoute(params: BridgeParams): Promise<BridgeQuote> {
  // Priority:
  // 1. CCTP for USDC (fastest, cheapest)
  // 2. CCIP for supported tokens
  // 3. Socket for everything else

  // Check if it's USDC
  if (params.token.toLowerCase().includes("usdc")) {
    try {
      return await quoteCCTP(params);
    } catch (error) {
      console.warn("CCTP failed, trying CCIP:", error);
    }
  }

  // Try CCIP for major tokens
  const ccipSupportedTokens = ["weth", "link", "usdc"];
  const tokenSymbol = params.token.toLowerCase();
  if (ccipSupportedTokens.some(t => tokenSymbol.includes(t))) {
    try {
      return await quoteCCIP(params);
    } catch (error) {
      console.warn("CCIP failed, falling back to Socket:", error);
    }
  }

  // Fallback to Socket for all other cases
  return await quoteSocket(params);
}

// Get all available routes and compare
export async function compareAllRoutes(params: BridgeParams): Promise<BridgeQuote[]> {
  const quotes: BridgeQuote[] = [];

  // Try CCTP if USDC
  if (params.token.toLowerCase().includes("usdc")) {
    try {
      quotes.push(await quoteCCTP(params));
    } catch (e) {
      console.warn("CCTP not available");
    }
  }

  // Try CCIP
  try {
    quotes.push(await quoteCCIP(params));
  } catch (e) {
    console.warn("CCIP not available");
  }

  // Always include Socket
  try {
    quotes.push(await quoteSocket(params));
  } catch (e) {
    console.error("Socket failed:", e);
  }

  return quotes;
}
