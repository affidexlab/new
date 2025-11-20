import { ZERO_X_API_BASE, COW_API_BASE, SWAP_FEE_BPS, TREASURY_WALLET } from "./constants";

export type QuoteParams = {
  fromToken: string;
  toToken: string;
  amount: string;
  fromAddress?: string;
  chain: "arbitrum";
  privacy?: boolean;
  slippagePercentage?: number;
};

export type QuoteResponse = {
  provider: "0x" | "cow";
  price: string;
  estimatedOutput: string;
  estimatedGas: string;
  route: string;
  data: any;
  feeAmount: string;
  amountAfterFee: string;
  feePercentage: string;
};

export function calculateSwapFee(amount: string): { feeAmount: string; amountAfterFee: string } {
  const amountBigInt = BigInt(amount);
  const feeAmount = (amountBigInt * BigInt(SWAP_FEE_BPS)) / BigInt(10000);
  const amountAfterFee = amountBigInt - feeAmount;
  
  return {
    feeAmount: feeAmount.toString(),
    amountAfterFee: amountAfterFee.toString(),
  };
}

export function getSwapFeeInfo() {
  return {
    treasuryWallet: TREASURY_WALLET,
    feeBps: SWAP_FEE_BPS,
    feePercentage: (SWAP_FEE_BPS / 100).toFixed(2) + "%",
  };
}

export async function quote0x(params: QuoteParams): Promise<QuoteResponse> {
  const { feeAmount, amountAfterFee } = calculateSwapFee(params.amount);
  
  const sellToken = params.fromToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? "ETH" : params.fromToken;
  const buyToken = params.toToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? "ETH" : params.toToken;
  
  const slippageDecimal = (params.slippagePercentage || 0.5) / 100;
  
  const url = `${ZERO_X_API_BASE}/swap/v1/quote?` + new URLSearchParams({
    sellToken,
    buyToken,
    sellAmount: amountAfterFee,
    slippagePercentage: slippageDecimal.toString(),
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
      feeAmount,
      amountAfterFee,
      feePercentage: (SWAP_FEE_BPS / 100).toFixed(2) + "%",
    };
  } catch (error) {
    console.error("0x quote error:", error);
    throw error;
  }
}

export async function quoteCow(params: QuoteParams): Promise<QuoteResponse> {
  const { feeAmount, amountAfterFee } = calculateSwapFee(params.amount);
  
  console.warn("CoW Protocol may have limited Arbitrum support");
  
  try {
    const response = await fetch(`${COW_API_BASE}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellToken: params.fromToken,
        buyToken: params.toToken,
        sellAmountBeforeFee: amountAfterFee,
        kind: "sell",
        partiallyFillable: false,
        from: params.fromAddress || "0x0000000000000000000000000000000000000000",
      }),
    });

    if (!response.ok) {
      throw new Error(`CoW API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      provider: "cow",
      price: data.quote?.price || "0",
      estimatedOutput: data.quote?.buyAmount || "0",
      estimatedGas: "0",
      route: "CoW Intent Settlement",
      data,
      feeAmount,
      amountAfterFee,
      feePercentage: (SWAP_FEE_BPS / 100).toFixed(2) + "%",
    };
  } catch (error) {
    console.error("CoW quote error:", error);
    throw error;
  }
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
