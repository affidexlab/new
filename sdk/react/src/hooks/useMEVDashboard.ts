/**
 * Hook for fetching MEV dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { useDecaFlow } from '../provider';
import type { Chain } from '../types';
import { NetworkError } from '../errors';

export interface MEVDashboardData {
  totalMEVExtracted: string;
  transactionsAffected: number;
  avgMEVPerTx: string;
  decaflowMEVSaved: string;
  privacyAdoptionRate: number;
  timeline: Array<{
    date: string;
    mevExtracted: number;
  }>;
}

export function useMEVDashboard(chain: Chain = 'arbitrum') {
  const { apiUrl, config } = useDecaFlow();

  return useQuery({
    queryKey: ['mevDashboard', chain],
    queryFn: async (): Promise<MEVDashboardData> => {
      const response = await fetch(`${apiUrl}/v1/mev/dashboard/${chain}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new NetworkError(error.error || 'Failed to fetch dashboard data', error);
      }

      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
}
