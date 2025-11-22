import { API_ENDPOINTS } from "./constants";

export type QuoteParams = {
  fromToken: string;
  toToken: string;
  amount: string;
  fromAddress?: string;
  chainId: number;
  privacy?: boolean;
  slippagePercentage?: number;
  timeoutMs?: number;
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
  const apiEndpoint = API_ENDPOINTS[params.chainId]?.zeroX;
  if (!apiEndpoint) throw new Error(`0x API not supported on chain ${params.chainId}`);

  const sellToken = params.fromToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? "ETH" : params.fromToken;
  const buyToken = params.toToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? "ETH" : params.toToken;

  const urlParams: Record<string, string> = {
    sellToken,
    buyToken,
    sellAmount: params.amount,
  };
  
  if (params.fromAddress) {
    urlParams.takerAddress = params.fromAddress;
  }
  
  if (params.slippagePercentage !== undefined) {
    urlParams.slippagePercentage = (params.slippagePercentage / 100).toString();
  }

  const url = `${apiEndpoint}/swap/v1/quote?` + new URLSearchParams(urlParams);
  
  const controller = new AbortController();
  const timeoutId = params.timeoutMs ? setTimeout(() => controller.abort(), params.timeoutMs) : null;

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`0x API error: ${response.statusText}`);
    const data = await response.json();
    // Basic schema validation
    if (!data || typeof data !== 'object' || !data.price || !data.buyAmount || !data.to || !data.data) {
      throw new Error("Invalid 0x API response");
    }
    return {
      provider: "0x",
      price: data.price,
      estimatedOutput: data.buyAmount,
      estimatedGas: data.estimatedGas || "0",
      route: Array.isArray(data.sources) ? data.sources.map((s: any) => s?.name).filter(Boolean).join(" → ") : "Unknown",
      data,
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}



export async function quoteCow(params: QuoteParams): Promise<QuoteResponse> {
  const apiEndpoint = API_ENDPOINTS[params.chainId]?.cow;
  if (!apiEndpoint) throw new Error(`CoW Protocol not supported on chain ${params.chainId}`);

  const controller = new AbortController();
  const timeoutId = params.timeoutMs ? setTimeout(() => controller.abort(), params.timeoutMs) : null;

  try {
    const response = await fetch(`${apiEndpoint}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellToken: params.fromToken,
        buyToken: params.toToken,
        sellAmountBeforeFee: params.amount,
        kind: "sell",
        partiallyFillable: false,
        from: params.fromAddress || "0x0000000000000000000000000000000000000000",
        ...(params.slippagePercentage && {
          slippageBps: Math.floor(params.slippagePercentage * 100),
        }),
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`CoW API error: ${response.statusText}`);
    const data = await response.json();

    return {
      provider: "cow",
      price: data.quote?.price || "0",
      estimatedOutput: data.quote?.buyAmount || "0",
      estimatedGas: "0",
      route: "CoW Intent Settlement",
      data,
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function bestRoute(params: QuoteParams): Promise<QuoteResponse> {
  if (params.privacy && API_ENDPOINTS[params.chainId]?.cow) {
    try {
      return await quoteCow(params);
    } catch {
      return await quote0x(params);
    }
  }
  return await quote0x(params);
}
