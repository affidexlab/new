/**
 * Hook for tracking transaction status
 */

import { useQuery } from '@tanstack/react-query';
import { useDecaFlow } from '../provider';
import type { TransactionStatus } from '../types';
import { NetworkError } from '../errors';

export interface UseTransactionStatusOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

export function useTransactionStatus(
  txHash: string | null,
  options: UseTransactionStatusOptions = {}
) {
  const { apiUrl, config } = useDecaFlow();
  const { refetchInterval = 3000, enabled = true } = options;

  return useQuery({
    queryKey: ['transactionStatus', txHash],
    queryFn: async (): Promise<TransactionStatus> => {
      if (!txHash) throw new Error('No transaction hash provided');

      const response = await fetch(`${apiUrl}/v1/swap/status/${txHash}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new NetworkError(error.error || 'Failed to fetch status', error);
      }

      return response.json();
    },
    enabled: !!txHash && enabled,
    refetchInterval: (data) => {
      // Stop refetching if transaction is confirmed or failed
      if (data?.status === 'confirmed' || data?.status === 'failed') {
        return false;
      }
      return refetchInterval;
    },
  });
}
