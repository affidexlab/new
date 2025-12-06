import { useState, useCallback } from 'react';
import { useDecaFlow } from '../provider';
import { SwapExecuteParams, SwapExecuteResponse } from '../types';

export function useSwapExecute() {
  const { config, apiUrl } = useDecaFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SwapExecuteResponse | null>(null);

  const execute = useCallback(async (params: SwapExecuteParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/swap/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-ID': config.partnerId
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute swap');
      }

      const result: SwapExecuteResponse = await response.json();
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

  return { execute, loading, error, data };
}
