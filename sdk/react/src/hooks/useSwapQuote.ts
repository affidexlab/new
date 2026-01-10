/**
 * Hook for fetching swap quotes
 */

import { useQuery } from '@tanstack/react-query';
import { useDecaFlow } from '../provider';
import type { SwapParams, SwapQuote } from '../types';
import { NetworkError } from '../errors';

export interface UseSwapQuoteOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useSwapQuote(params: SwapParams | null, options: UseSwapQuoteOptions = {}) {
  const { apiUrl, config } = useDecaFlow();

  return useQuery({
    queryKey: ['swapQuote', params],
    queryFn: async (): Promise<SwapQuote> => {
      if (!params) throw new Error('No swap params provided');

      const response = await fetch(`${apiUrl}/v1/swap/quote`, {
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
        throw new NetworkError(error.error || 'Failed to fetch quote', error);
      }

      return response.json();
    },
    enabled: !!params && (options.enabled !== false),
    refetchInterval: options.refetchInterval,
    staleTime: 15000, // Quote valid for 15 seconds
  });
}
