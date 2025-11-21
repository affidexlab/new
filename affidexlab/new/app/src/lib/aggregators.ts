import { ZERO_X_API_BASE, COW_API_BASE } from "./constants";

export type QuoteParams = {
  fromToken: string;
  toToken: string;
  amount: string;
  fromAddress?: string;
  chain: "arbitrum";
  privacy?: boolean;
};

export type QuoteResponse = {
  provider: "0x" | "cow";
  price: string;
  estimatedOutput: string;
  estimatedGas: string;
  route: string;
  data: any;
};

export async function quote0x(params: QuoteParams): Promise<QuoteResponse> {
  const sellToken = params.fromToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? "ETH" : params.fromToken;
  const buyToken = params.toToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? "ETH" : params.toToken;
  
  const url = `${ZERO_X_API_BASE}/swap/v1/quote?` + new URLSearchParams({
    sellToken,
    buyToken,
    sellAmount: params.amount,
    ...(params.fromAddress && { takerAddress: params.fromAddress }),
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`0x API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    return {
      provider: "0x",
      price: data.price,
      estimatedOutput: data.buyAmount,
      estimatedGas: data.estimatedGas || "0",
      route: data.sources?.map((s: any) => s.name).join(" → ") || "Unknown",
      data,
    };
  } catch (error) {
    console.error("0x quote error:", error);
    throw error;
  }
}

export async function quoteCow(params: QuoteParams): Promise<QuoteResponse> {
  // CoW Protocol supports Arbitrum One for intent-based trading with MEV protection
  const sellToken = params.fromToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" 
    ? "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" // Use WETH for CoW
    : params.fromToken;
  const buyToken = params.toToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    ? "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" // Use WETH for CoW
    : params.toToken;
  
  try {
    const response = await fetch(`${COW_API_BASE}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellToken,
        buyToken,
        sellAmountBeforeFee: params.amount,
        kind: "sell",
        partiallyFillable: false,
        from: params.fromAddress || "0x0000000000000000000000000000000000000000",
        receiver: params.fromAddress || "0x0000000000000000000000000000000000000000",
        validTo: Math.floor(Date.now() / 1000) + 600, // 10 minutes validity
        appData: "0x0000000000000000000000000000000000000000000000000000000000000000",
        signingScheme: "eip712",
        onchainOrder: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`CoW API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    
    return {
      provider: "cow",
      price: data.quote?.price || "0",
      estimatedOutput: data.quote?.buyAmount || "0",
      estimatedGas: data.quote?.feeAmount || "0",
      route: "CoW Intent Settlement (MEV Protected)",
      data,
    };
  } catch (error) {
    console.error("CoW quote error:", error);
    throw error;
  }
}

export async function bestRoute(params: QuoteParams): Promise<QuoteResponse> {
  // If privacy mode is enabled, use CoW Protocol for MEV protection
  if (params.privacy) {
    try {
      // CoW Protocol provides intent-based trading with MEV protection
      const cowQuote = await quoteCow(params);
      return cowQuote;
    } catch (cowError) {
      console.warn("CoW Protocol unavailable, falling back to 0x:", cowError);
      // If CoW fails, fallback to 0x (but without MEV protection)
      const zeroXQuote = await quote0x(params);
      return {
        ...zeroXQuote,
        route: zeroXQuote.route + " (Privacy unavailable)",
      };
    }
  }
  
  // For non-privacy mode, try both in parallel and return best price
  try {
    const [zeroXQuote, cowQuote] = await Promise.allSettled([
      quote0x(params),
      quoteCow(params)
    ]);

    const validQuotes: QuoteResponse[] = [];
    
    if (zeroXQuote.status === "fulfilled") {
      validQuotes.push(zeroXQuote.value);
    }
    
    if (cowQuote.status === "fulfilled") {
      validQuotes.push(cowQuote.value);
    }

    if (validQuotes.length === 0) {
      throw new Error("All aggregators failed to provide quotes");
    }

    // Return quote with highest output
    return validQuotes.reduce((best, current) => {
      const bestOutput = BigInt(best.estimatedOutput);
      const currentOutput = BigInt(current.estimatedOutput);
      return currentOutput > bestOutput ? current : best;
    });
  } catch (error) {
    // If parallel fetch fails, try 0x as final fallback
    console.warn("Parallel quote fetch failed, using 0x only:", error);
    return await quote0x(params);
  }
}
