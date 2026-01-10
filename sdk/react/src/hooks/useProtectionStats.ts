/**
 * Hook for fetching user's MEV protection statistics
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useDecaFlow } from '../provider';
import type { ProtectionStats } from '../types';
import { NetworkError } from '../errors';

export function useProtectionStats() {
  const { apiUrl, config } = useDecaFlow();
  const { address } = useAccount();

  return useQuery({
    queryKey: ['protectionStats', address],
    queryFn: async (): Promise<ProtectionStats> => {
      if (!address) throw new Error('Wallet not connected');

      const response = await fetch(`${apiUrl}/v1/analytics/user/${address}/stats`, {
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new NetworkError(error.error || 'Failed to fetch stats', error);
      }

      return response.json();
    },
    enabled: !!address,
    staleTime: 60000, // 1 minute
  });
}
