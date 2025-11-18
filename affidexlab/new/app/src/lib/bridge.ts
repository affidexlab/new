export type BridgeQuote = { path: string; eta: string; feeEstimate: string };

export async function quoteCCTP(params: { fromChain: string; toChain: string; token: string; amount: string }){
  return { path: "CCTP native USDC", eta: "2-5 min", feeEstimate: "stub" } as BridgeQuote;
}

export async function quoteCCIP(params: { fromChain: string; toChain: string; token: string; amount: string }){
  return { path: "CCIP", eta: "~5-10 min", feeEstimate: "stub" } as BridgeQuote;
}

export async function quoteSocket(params: { fromChain: string; toChain: string; token: string; amount: string }){
  return { path: "Socket", eta: "varies", feeEstimate: "stub" } as BridgeQuote;
}
