/**
 * Type definitions for DecaFlow React SDK
 */

export type Chain = 'arbitrum' | 'ethereum' | 'base' | 'optimism' | 'polygon' | 'avalanche';

export interface SwapParams {
  fromToken: string;
  toToken: string;
  amount: string;
  fromAddress: string;
  chain?: Chain;
  slippageBps?: number;
  usePrivacy?: boolean;
}

export interface SwapQuote {
  quoteId: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  price: string;
  priceImpact: number;
  gasEstimate: number;
  route: string[];
  mevRiskScore: number;
  estimatedMevSaved: string;
  fees: {
    usageFee: string;
    performanceFee: string;
    total: string;
  };
  expiresAt: string;
}

export interface MEVRiskScore {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedMev: string;
  factors: Record<string, any>;
  recommendations: string[];
  optimalRoute: string;
  timeboostRecommended: boolean;
  timestamp: string;
}

export interface TransactionStatus {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  mevSaved?: string;
  actualPrice?: string;
  gasUsed?: number;
  timestamp: string;
}

export interface ProtectionStats {
  totalSwaps: number;
  protectedSwaps: number;
  totalMevSaved: string;
  protectionRate: number;
  rank?: number;
  achievements: string[];
  historicalSavings: Array<{
    date: string;
    amount: string;
  }>;
}

export interface DecaFlowConfig {
  apiKey?: string;
  baseUrl?: string;
  chain?: Chain;
}
