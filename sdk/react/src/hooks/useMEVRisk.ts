/**
 * Hook for fetching MEV risk scores
 */

import { useQuery } from '@tanstack/react-query';
import { useDecaFlow } from '../provider';
import type { MEVRiskScore, Chain } from '../types';
import { NetworkError } from '../errors';

export interface UseMEVRiskParams {
  fromToken: string;
  toToken: string;
  amount: string;
  chain?: Chain;
}

export function useMEVRisk(params: UseMEVRiskParams | null) {
  const { apiUrl, config } = useDecaFlow();

  return useQuery({
    queryKey: ['mevRisk', params],
    queryFn: async (): Promise<MEVRiskScore> => {
      if (!params) throw new Error('No params provided');

      const response = await fetch(`${apiUrl}/v1/mev/risk-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify({
          ...params,
          chain: params.chain || config.chain,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new NetworkError(error.error || 'Failed to fetch MEV risk', error);
      }

      return response.json();
    },
    enabled: !!params,
    staleTime: 10000,
  });
}
