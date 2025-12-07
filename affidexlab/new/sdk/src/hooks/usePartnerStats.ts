import { useState, useEffect } from 'react';
import { PartnerStats } from '../types';
import { useDecaFlow } from './useDecaFlow';

export function usePartnerStats() {
  const { config } = useDecaFlow();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = config.apiUrl || 
          (config.environment === 'sandbox' 
            ? 'https://sandbox.decaflow.xyz/v1'
            : 'https://api.decaflow.xyz/v1');

        const response = await fetch(`${apiUrl}/partners/stats`, {
          headers: {
            'X-Partner-ID': config.partnerId
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data.stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [config]);

  return { stats, loading, error };
}
