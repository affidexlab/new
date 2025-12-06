import { useState, useCallback } from 'react';
import { useDecaFlow } from '../provider';

interface RemoveLiquidityParams {
  positionId: string;
  liquidity: string;
  chainId: number;
  walletAddress: string;
  deadline?: number;
}

export function useRemoveLiquidity() {
  const { config, apiUrl } = useDecaFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const removeLiquidity = useCallback(async (params: RemoveLiquidityParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/liquidity/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-ID': config.partnerId
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove liquidity');
      }

      const result = await response.json();
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

  return { removeLiquidity, loading, error, data };
}
