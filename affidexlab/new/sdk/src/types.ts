export interface DecaFlowConfig {
  partnerId: string;
  apiUrl?: string;
  environment?: 'production' | 'sandbox';
}

export interface SwapQuoteParams {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  slippage?: number;
  walletAddress?: string;
}

export interface SwapQuote {
  quoteId: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  route: string[];
  estimatedGas: string;
  expiresAt: number;
}

export interface SwapExecuteParams {
  quoteId: string;
  walletAddress: string;
}

export interface BridgeQuoteParams {
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
  walletAddress: string;
}

export interface BridgeQuote {
  quoteId: string;
  route: string;
  estimatedTime: number;
  fee: string;
  toAmount: string;
}

export interface Pool {
  id: string;
  chainId: number;
  token0: string;
  token1: string;
  fee: number;
  tvl: string;
  apr: number;
}

export interface PartnerStats {
  totalRequests: number;
  todayRequests: number;
  last30Days: Array<{
    date: string;
    requests: number;
  }>;
}
