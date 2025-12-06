import { useState, useCallback } from 'react';
import { useDecaFlow } from '../provider';
import { BridgeStatusResponse } from '../types';

export function useBridgeStatus() {
  const { config, apiUrl } = useDecaFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BridgeStatusResponse | null>(null);

  const getStatus = useCallback(async (trackingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/bridge/status/${trackingId}`, {
        headers: {
          'X-Partner-ID': config.partnerId
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get bridge status');
      }

      const result: BridgeStatusResponse = await response.json();
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

  return { getStatus, loading, error, data };
}
