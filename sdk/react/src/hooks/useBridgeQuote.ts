/**
 * Hook for fetching cross-chain bridge quotes
 */

import { useQuery } from '@tanstack/react-query';
import { useDecaFlow } from '../provider';
import type { Chain } from '../types';
import { NetworkError } from '../errors';

export interface BridgeParams {
  fromChain: Chain;
  toChain: Chain;
  token: string;
  amount: string;
  recipient: string;
}

export interface BridgeQuote {
  quoteId: string;
  fromChain: Chain;
  toChain: Chain;
  token: string;
  amountIn: string;
  amountOut: string;
  estimatedTime: number;
  fees: {
    bridgeFee: string;
    gasFee: string;
    total: string;
  };
  route: string[];
  expiresAt: string;
}

export function useBridgeQuote(params: BridgeParams | null) {
  const { apiUrl, config } = useDecaFlow();

  return useQuery({
    queryKey: ['bridgeQuote', params],
    queryFn: async (): Promise<BridgeQuote> => {
      if (!params) throw new Error('No bridge params provided');

      const response = await fetch(`${apiUrl}/v1/bridge/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new NetworkError(error.error || 'Failed to fetch bridge quote', error);
      }

      return response.json();
    },
    enabled: !!params,
    staleTime: 15000,
  });
}
