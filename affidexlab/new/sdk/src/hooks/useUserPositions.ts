import { useState, useCallback, useEffect } from 'react';
import { useDecaFlow } from '../provider';
import { UserPosition } from '../types';

export function useUserPositions(wallet?: string, chainId?: number) {
  const { config, apiUrl } = useDecaFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserPosition[]>([]);

  const fetchPositions = useCallback(async (walletAddress: string, cid?: number) => {
    setLoading(true);
    setError(null);

    try {
      const url = cid 
        ? `${apiUrl}/liquidity/positions?wallet=${walletAddress}&chainId=${cid}`
        : `${apiUrl}/liquidity/positions?wallet=${walletAddress}`;

      const response = await fetch(url, {
        headers: {
          'X-Partner-ID': config.partnerId
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get positions');
      }

      const result = await response.json();
      setData(result.data.positions || []);
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
    if (wallet) {
      fetchPositions(wallet, chainId);
    }
  }, [wallet, chainId, fetchPositions]);

  return { positions: data, loading, error, refetch: fetchPositions };
}
