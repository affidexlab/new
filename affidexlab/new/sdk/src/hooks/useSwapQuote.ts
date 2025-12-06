import { useState, useCallback } from 'react';
import { useDecaFlow } from '../provider';
import { SwapQuoteParams, SwapQuoteResponse } from '../types';

export function useSwapQuote() {
  const { config, apiUrl } = useDecaFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SwapQuoteResponse | null>(null);

  const getQuote = useCallback(async (params: SwapQuoteParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/swap/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-ID': config.partnerId
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get swap quote');
      }

      const result: SwapQuoteResponse = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [config.partnerId, apiUrl]);

  return { getQuote, loading, error, data };
}
