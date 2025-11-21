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
  // CoW Protocol is primarily on Ethereum mainnet and Gnosis Chain
  // Not currently supported on Arbitrum
  throw new Error("CoW Protocol is not supported on Arbitrum. Use 0x instead.");
}

export async function bestRoute(params: QuoteParams): Promise<QuoteResponse> {
  // For now, prefer 0x for Arbitrum as CoW support is limited
  // In production, fetch both in parallel and compare
  
  if (params.privacy) {
    // Try CoW first for privacy, fallback to 0x
    try {
      return await quoteCow(params);
    } catch {
      return await quote0x(params);
    }
  }
  
  return await quote0x(params);
}
