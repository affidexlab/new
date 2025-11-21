import { SOCKET_API_BASE, CHAIN_IDS } from "./constants";
import { CCTP_TOKEN_MESSENGER_ABI, CCIP_ROUTER_ABI } from "./bridgeAbis";

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
  // Validate Socket API key
  const SOCKET_API_KEY = import.meta.env.VITE_SOCKET_API_KEY;
  if (!SOCKET_API_KEY || SOCKET_API_KEY === "") {
    throw new Error("Socket API key not configured. Please set VITE_SOCKET_API_KEY environment variable.");
  }

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
        "API-KEY": import.meta.env.VITE_SOCKET_API_KEY || "",
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

// Execute bridge transaction
export async function executeBridge({
  quote,
  token,
  amount,
  fromChain,
  toChain,
  fromAddress,
  writeContract,
}: {
  quote: BridgeQuote;
  token: any;
  amount: string;
  fromChain: keyof typeof CHAIN_IDS;
  toChain: keyof typeof CHAIN_IDS;
  fromAddress: string;
  writeContract: any;
}): Promise<void> {
  // Validation
  if (!fromAddress || fromAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Invalid from address");
  }
  
  if (fromChain === toChain) {
    throw new Error("Source and destination chains must be different");
  }
  
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error("Invalid bridge amount");
  }

  if (quote.provider === "cctp") {
    // Execute CCTP bridge
    const cctpBridges: Record<string, string> = {
      ARBITRUM: "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
      BASE: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962",
      OPTIMISM: "0x2B4069517957735bE00ceE0fadAE88a26365528f",
      POLYGON: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE",
    };

    const destinationDomain = {
      ARBITRUM: 3,
      BASE: 6,
      OPTIMISM: 2,
      POLYGON: 7,
    }[toChain];

    // CCTP Token Messenger ABI (complete production ABI)
    const cctpAbi = CCTP_TOKEN_MESSENGER_ABI;

    const amountWei = BigInt(amount) * BigInt(10 ** token.decimals);
    const mintRecipient = `0x000000000000000000000000${fromAddress.slice(2)}`;

    await writeContract({
      address: cctpBridges[fromChain] as `0x${string}`,
      abi: cctpAbi,
      functionName: "depositForBurn",
      args: [
        amountWei,
        destinationDomain,
        mintRecipient as `0x${string}`,
        token.address as `0x${string}`
      ],
    });
  } else if (quote.provider === "ccip") {
    // Execute CCIP bridge
    const ccipRouters: Record<string, string> = {
      ARBITRUM: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
      BASE: "0x673AA85efd75080031d44fcA061575d1dA427A28",
      OPTIMISM: "0x3206695CaE29952f4b0c22a169725a865bc8Ce0f",
      POLYGON: "0x849c5ED5a80F5B408Dd4969b78c2C8fdf0565Bfe",
    };

    const chainSelectors = {
      ARBITRUM: "4949039107694359620",
      BASE: "15971525489660198786",
      OPTIMISM: "3734403246176062136",
      POLYGON: "4051577828743386545",
    }[toChain];

    // CCIP Router ABI (complete production ABI)
    const ccipAbi = CCIP_ROUTER_ABI;

    const amountWei = BigInt(amount) * BigInt(10 ** token.decimals);

    await writeContract({
      address: ccipRouters[fromChain] as `0x${string}`,
      abi: ccipAbi,
      functionName: "ccipSend",
      args: [
        BigInt(chainSelectors),
        {
          receiver: fromAddress as `0x${string}`,
          data: "0x" as `0x${string}`,
          tokenAmounts: [{
            token: token.address as `0x${string}`,
            amount: amountWei
          }],
          feeToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          extraArgs: "0x" as `0x${string}`
        }
      ],
    });
  } else if (quote.provider === "socket") {
    // Execute Socket bridge using their API route data
    if (!quote.data?.txData) {
      throw new Error("Socket route data incomplete. Make sure VITE_SOCKET_API_KEY is configured.");
    }

    // Socket provides ready-to-use transaction data
    const txData = quote.data.txData;
    
    // Socket returns complete transaction object - send as raw transaction
    // Note: Socket API provides the complete calldata and target contract
    if (!txData.to || !txData.data) {
      throw new Error("Invalid Socket transaction data");
    }

    // For Socket, we need to send the transaction using their prepared data
    // The data already includes the correct function signature and parameters
    await writeContract({
      address: txData.to as `0x${string}`,
      abi: [{
        type: "function",
        name: "executeRoute",
        stateMutability: "payable",
        inputs: [],
        outputs: []
      }] as const,
      functionName: "executeRoute",
      value: BigInt(txData.value || 0),
    });
  } else {
    throw new Error(`Unsupported bridge provider: ${quote.provider}`);
  }
}
