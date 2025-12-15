import { CHAIN_IDS } from "./constants";
import { CCTP_TOKEN_MESSENGER_ABI, CCIP_ROUTER_ABI } from "./bridgeAbis";
import { logger } from "./logger";

export type BridgeParams = {
  fromChain: keyof typeof CHAIN_IDS;
  toChain: keyof typeof CHAIN_IDS;
  token: string;
  amount: string;
  fromAddress?: string;
};

export type BridgeQuote = {
  provider: "cctp" | "ccip" | "lifi";
  path: string;
  eta: string;
  feeEstimate: string;
  data?: any;
};

// CCTP: Circle's native USDC bridge
export async function quoteCCTP(params: BridgeParams): Promise<BridgeQuote> {
  // CCTP only supports USDC
  const usdcAddresses: Record<string, string> = {
    ETHEREUM: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
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
    ETHEREUM: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
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
    ETHEREUM: "0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D",
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

// Li.Fi: Multi-bridge aggregator (preferred for best rates)
export async function quoteLiFi(params: BridgeParams): Promise<BridgeQuote> {
  try {
    const url = `https://li.quest/v1/quote?${new URLSearchParams({
      fromChain: CHAIN_IDS[params.fromChain].toString(),
      toChain: CHAIN_IDS[params.toChain].toString(),
      fromToken: params.token,
      toToken: params.token,
      fromAmount: params.amount,
      fromAddress: params.fromAddress || "0x0000000000000000000000000000000000000000",
    })}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Li.Fi quote failed");
    }

    const data = await response.json();

    if (!data.estimate) {
      throw new Error("No Li.Fi route found");
    }

    const toolNames = data.toolDetails?.map((t: any) => t.name).join(", ") || "Multi-bridge";

    return {
      provider: "lifi",
      path: `Li.Fi (${toolNames})`,
      eta: `${Math.ceil(data.estimate.executionDuration / 60)} min`,
      feeEstimate: `$${(Number(data.estimate.gasCosts?.[0]?.amountUSD) || 0).toFixed(2)}`,
      data: data,
    };
  } catch (error) {
    logger.error("Li.Fi quote error", error);
    throw error;
  }
}



// Smart routing: Choose best bridge based on token and chains
export async function bestBridgeRoute(params: BridgeParams): Promise<BridgeQuote> {
  // Priority:
  // 1. CCTP for USDC (fastest, cheapest)
  // 2. Li.Fi for best aggregated rates (primary bridge aggregator)
  // 3. CCIP for supported tokens as fallback

  // Check if it's USDC - use CCTP for fastest/cheapest route
  if (params.token.toLowerCase().includes("usdc")) {
    try {
      return await quoteCCTP(params);
    } catch (error) {
      logger.warn("CCTP failed, trying Li.Fi", error);
    }
  }

  // Try Li.Fi for best aggregated rates (primary option)
  try {
    return await quoteLiFi(params);
  } catch (error) {
    logger.warn("Li.Fi failed, trying CCIP", error);
  }

  // Try CCIP as final fallback for major tokens
  const ccipSupportedTokens = ["weth", "link", "usdc"];
  const tokenSymbol = params.token.toLowerCase();
  if (ccipSupportedTokens.some(t => tokenSymbol.includes(t))) {
    try {
      return await quoteCCIP(params);
    } catch (error) {
      logger.error("CCIP failed", error);
      throw new Error("Unable to find bridge route. Please try again later.");
    }
  }

  // If no CCIP support, throw error
  throw new Error("Unable to find bridge route for this token. Please try USDC or WETH.");
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

  // Try Li.Fi (primary aggregator)
  try {
    quotes.push(await quoteLiFi(params));
  } catch (e) {
    console.warn("Li.Fi not available");
  }

  // Try CCIP
  try {
    quotes.push(await quoteCCIP(params));
  } catch (e) {
    console.warn("CCIP not available");
  }

  if (quotes.length === 0) {
    throw new Error("No bridge routes available. Please try again later.");
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
      ETHEREUM: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
      ARBITRUM: "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
      BASE: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962",
      OPTIMISM: "0x2B4069517957735bE00ceE0fadAE88a26365528f",
      POLYGON: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE",
    };

    const destinationDomain = {
      ETHEREUM: 0,
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
      ETHEREUM: "0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D",
      ARBITRUM: "0x141fa059441E0ca23ce184B6A78bafD2A517DdE8",
      BASE: "0x673AA85efd75080031d44fcA061575d1dA427A28",
      OPTIMISM: "0x3206695CaE29952f4b0c22a169725a865bc8Ce0f",
      POLYGON: "0x849c5ED5a80F5B408Dd4969b78c2C8fdf0565Bfe",
    };

    const chainSelectors = {
      ETHEREUM: "5009297550715157269",
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
  } else if (quote.provider === "lifi") {
    // Execute Li.Fi bridge
    if (!quote.data?.transactionRequest) {
      throw new Error("Li.Fi route data incomplete");
    }

    const txData = quote.data.transactionRequest;
    
    if (!txData.to || !txData.data) {
      throw new Error("Invalid Li.Fi transaction data");
    }

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
