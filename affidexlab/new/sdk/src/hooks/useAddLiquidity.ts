import { useState, useCallback } from 'react';
import { useDecaFlow } from '../provider';

interface AddLiquidityParams {
  poolId: string;
  token0Amount: string;
  token1Amount: string;
  chainId: number;
  walletAddress: string;
  deadline?: number;
  slippage?: number;
}

export function useAddLiquidity() {
  const { config, apiUrl } = useDecaFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const addLiquidity = useCallback(async (params: AddLiquidityParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/liquidity/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-ID': config.partnerId
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add liquidity');
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

  return { addLiquidity, loading, error, data };
}
