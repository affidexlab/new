// Stubs for routing via 0x and CoW.
// Implement real calls later with API keys and chain-aware endpoints.

export type QuoteParams = {
  fromToken: string;
  toToken: string;
  amount: string; // in decimals
  fromAddress?: string;
  chain: "arbitrum";
  privacy?: boolean;
};

export async function quote0x(params: QuoteParams){
  // Example: https://arbitrum.api.0x.org/swap/v1/quote?buyToken=USDC&sellToken=ETH&sellAmount=...
  return { provider: "0x", price: "stub", data: { tx: {} } };
}

export async function quoteCow(params: QuoteParams){
  // Cow intents quote (network support varies). Return best output and a settlement plan.
  return { provider: "cow", price: "stub", data: { intent: {} } };
}

export async function bestRoute(params: QuoteParams){
  // naive: prefer CoW when privacy enabled; else 0x
  if(params.privacy) return quoteCow(params);
  return quote0x(params);
}
