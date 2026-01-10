/**
 * Hook for fetching user's swap history
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useDecaFlow } from '../provider';
import { NetworkError } from '../errors';

export interface SwapHistoryItem {
  txHash: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  mevSaved?: string;
  timestamp: string;
  status: string;
}

export interface UseSwapHistoryOptions {
  limit?: number;
  offset?: number;
}

export function useSwapHistory(options: UseSwapHistoryOptions = {}) {
  const { apiUrl, config } = useDecaFlow();
  const { address } = useAccount();
  const { limit = 10, offset = 0 } = options;

  return useQuery({
    queryKey: ['swapHistory', address, limit, offset],
    queryFn: async (): Promise<SwapHistoryItem[]> => {
      if (!address) throw new Error('Wallet not connected');

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${apiUrl}/v1/analytics/user/${address}/history?${params}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new NetworkError(error.error || 'Failed to fetch history', error);
      }

      const data = await response.json();
      return data.swaps || [];
    },
    enabled: !!address,
    staleTime: 30000,
  });
}
