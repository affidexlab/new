import { useState, useCallback, useEffect } from 'react';
import { useDecaFlow } from '../provider';
import { LiquidityPool } from '../types';

export function useLiquidityPools(chainId?: number) {
  const { config, apiUrl } = useDecaFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LiquidityPool[]>([]);

  const fetchPools = useCallback(async (cid: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/liquidity/pools?chainId=${cid}`, {
        headers: {
          'X-Partner-ID': config.partnerId
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get liquidity pools');
      }

      const result = await response.json();
      setData(result.data.pools || []);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [config.partnerId, apiUrl]);

  useEffect(() => {
    if (chainId) {
      fetchPools(chainId);
    }
  }, [chainId, fetchPools]);

  return { pools: data, loading, error, refetch: fetchPools };
}
