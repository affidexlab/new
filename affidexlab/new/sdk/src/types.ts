export interface DecaFlowConfig {
  partnerId: string;
  apiBaseUrl?: string;
  environment?: 'production' | 'sandbox';
}

export interface SwapQuoteParams {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  slippage?: number;
  walletAddress: string;
}

export interface SwapQuoteResponse {
  success: boolean;
  data: {
    quoteId: string;
    fromToken: string;
    toToken: string;
    amount: string;
    chainId: number;
    routes: Array<{
      provider: string;
      protocol: string;
      buyAmount: string;
      sellAmount: string;
      price: string;
      estimatedGas: string;
    }>;
    bestRoute: any;
    priceImpact: string;
    expiresAt: number;
  };
}

export interface SwapExecuteParams {
  quoteId: string;
  walletAddress: string;
}

export interface SwapExecuteResponse {
  success: boolean;
  data: {
    quoteId: string;
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    chainId: number;
    estimatedOutput: string;
  };
}

export interface BridgeQuoteParams {
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
  walletAddress: string;
  slippage?: number;
}

export interface BridgeQuoteResponse {
  success: boolean;
  data: {
    quoteId: string;
    fromChainId: number;
    toChainId: number;
    routes: Array<{
      protocol: string;
      outputAmount: string;
      estimatedTime: number;
      gasCost: string;
      bridgeFee: string;
    }>;
    bestRoute: any;
    estimatedArrival: string;
    totalFees: string;
  };
}

export interface BridgeExecuteParams {
  quoteId: string;
  walletAddress: string;
}

export interface BridgeStatusResponse {
  success: boolean;
  data: {
    trackingId: string;
    status: 'pending' | 'confirming' | 'completed' | 'failed';
    fromChainId: number;
    toChainId: number;
    originTxHash?: string;
    destinationTxHash?: string;
    estimatedArrival: string;
  };
}

export interface LiquidityPool {
  id: string;
  address: string;
  token0: {
    symbol: string;
    address: string;
    decimals: number;
  };
  token1: {
    symbol: string;
    address: string;
    decimals: number;
  };
  fee: number;
  protocol: string;
  tvl: string;
  apr: string;
}

export interface UserPosition {
  positionId: string;
  chainId: number;
  poolId: string;
  token0Amount: string;
  token1Amount: string;
  feesEarned0: string;
  feesEarned1: string;
  apr: string;
  createdAt: string;
}
