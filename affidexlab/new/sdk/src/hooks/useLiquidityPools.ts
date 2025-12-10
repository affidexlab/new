import { useState, useEffect } from 'react';
import { Pool } from '../types';
import { useDecaFlow } from './useDecaFlow';

export function useLiquidityPools(chainId: number) {
  const { config } = useDecaFlow();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPools = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = config.apiUrl || 
          (config.environment === 'sandbox' 
            ? 'https://sandbox.decaflow.xyz/v1'
            : 'https://api.decaflow.xyz/v1');

        const response = await fetch(`${apiUrl}/liquidity/pools?chainId=${chainId}`, {
          headers: {
            'X-Partner-ID': config.partnerId
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pools');
        }

        const data = await response.json();
        setPools(data.pools);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (chainId) {
      fetchPools();
    }
  }, [chainId, config]);

  return { pools, loading, error };
}
