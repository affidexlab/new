import { useState, useCallback } from 'react';
import { useDecaFlow } from '../provider';
import { BridgeQuoteParams, BridgeQuoteResponse } from '../types';

export function useBridgeQuote() {
  const { config, apiUrl } = useDecaFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BridgeQuoteResponse | null>(null);

  const getQuote = useCallback(async (params: BridgeQuoteParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/bridge/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-ID': config.partnerId
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get bridge quote');
      }

      const result: BridgeQuoteResponse = await response.json();
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
