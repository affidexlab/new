/**
 * Hook for executing privacy-protected swaps
 */

import { useMutation } from '@tanstack/react-query';
import { useAccount, useSignTypedData } from 'wagmi';
import { useDecaFlow } from '../provider';
import type { SwapQuote } from '../types';
import { NetworkError, QuoteExpiredError } from '../errors';

export interface ExecuteSwapParams {
  quote: SwapQuote;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function usePrivacySwap() {
  const { apiUrl, config } = useDecaFlow();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const executeMutation = useMutation({
    mutationFn: async ({ quote }: ExecuteSwapParams): Promise<string> => {
      if (!address) throw new Error('Wallet not connected');

      // Check if quote expired
      const expiresAt = new Date(quote.expiresAt);
      if (expiresAt < new Date()) {
        throw new QuoteExpiredError();
      }

      // Request transaction data
      const execResponse = await fetch(`${apiUrl}/v1/swap/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify({
          quoteId: quote.quoteId,
          fromAddress: address,
        }),
      });

      if (!execResponse.ok) {
        const error = await execResponse.json();
        throw new NetworkError(error.error || 'Failed to execute swap', error);
      }

      const { transaction, signatureData } = await execResponse.json();

      // Sign typed data if required
      let signature;
      if (signatureData) {
        signature = await signTypedDataAsync(signatureData);
      }

      // Submit transaction
      const submitResponse = await fetch(`${apiUrl}/v1/swap/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify({
          quoteId: quote.quoteId,
          transaction,
          signature,
        }),
      });

      if (!submitResponse.ok) {
        const error = await submitResponse.json();
        throw new NetworkError(error.error || 'Failed to submit transaction', error);
      }

      const { txHash } = await submitResponse.json();
      return txHash;
    },
  });

  return {
    executeSwap: (params: ExecuteSwapParams) => {
      return executeMutation.mutateAsync(params, {
        onSuccess: params.onSuccess,
        onError: params.onError,
      });
    },
    isExecuting: executeMutation.isPending,
    error: executeMutation.error,
    reset: executeMutation.reset,
  };
}
