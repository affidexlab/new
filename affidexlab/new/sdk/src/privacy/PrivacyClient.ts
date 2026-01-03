/**
 * DecaFlow Privacy SDK - Client
 * Enables privacy-protected swaps with MEV protection
 */

export interface PrivacyConfig {
  network: 'arbitrum' | 'ethereum' | 'base' | 'optimism' | 'polygon' | 'avalanche';
  apiKey?: string;
  apiUrl?: string;
}

export interface SwapParams {
  from: string;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage?: number;
  enableMEVProtection?: boolean;
}

export interface SwapQuote {
  quoteId: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  mevRiskScore: number;
  estimatedGas: string;
  route: 'direct' | 'cow-protocol' | 'private-rpc';
  mevSavingsUSD?: number;
  expiresAt: number;
}

export interface SwapExecution {
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  actualOutput: string;
  gasUsed: string;
  mevSaved: number;
}

const CHAIN_IDS: Record<string, number> = {
  arbitrum: 42161,
  ethereum: 1,
  base: 8453,
  optimism: 10,
  polygon: 137,
  avalanche: 43114,
};

export class PrivacyClient {
  private config: PrivacyConfig;
  private apiUrl: string;

  constructor(config: PrivacyConfig) {
    this.config = config;
    this.apiUrl = config.apiUrl || 'https://api.decaflow.io';
  }

  /**
   * Get a privacy-protected swap quote
   */
  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    const chainId = CHAIN_IDS[this.config.network];
    
    const response = await fetch(`${this.apiUrl}/v1/privacy/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
      },
      body: JSON.stringify({
        chainId,
        fromAddress: params.from,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amount: params.amount,
        slippage: params.slippage || 0.5,
        enableMEVProtection: params.enableMEVProtection !== false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute a privacy-protected swap
   */
  async executeSwap(quote: SwapQuote, signer: any): Promise<SwapExecution> {
    const chainId = CHAIN_IDS[this.config.network];
    
    // Get execution data
    const response = await fetch(`${this.apiUrl}/v1/privacy/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
      },
      body: JSON.stringify({
        quoteId: quote.quoteId,
        chainId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute swap: ${response.statusText}`);
    }

    const executionData = await response.json();

    // Send transaction through signer
    const tx = await signer.sendTransaction({
      to: executionData.to,
      data: executionData.data,
      value: executionData.value || '0',
      gasLimit: executionData.gasLimit,
    });

    return {
      transactionHash: tx.hash,
      status: 'pending',
      actualOutput: quote.outputAmount,
      gasUsed: executionData.gasLimit,
      mevSaved: quote.mevSavingsUSD || 0,
    };
  }

  /**
   * Get MEV risk score for a potential trade
   */
  async getMEVRiskScore(params: SwapParams): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    estimatedMEV: number;
    recommendation: string;
  }> {
    const chainId = CHAIN_IDS[this.config.network];
    
    const response = await fetch(`${this.apiUrl}/v1/mev/risk-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
      },
      body: JSON.stringify({
        chainId,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amount: params.amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get MEV risk score: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get transaction status and MEV savings
   */
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    mevSaved: number;
    executionTime: number;
  }> {
    const response = await fetch(`${this.apiUrl}/v1/privacy/status/${txHash}`, {
      headers: {
        ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.statusText}`);
    }

    return response.json();
  }
}

// Convenience export
export function createPrivacyClient(config: PrivacyConfig): PrivacyClient {
  return new PrivacyClient(config);
}
