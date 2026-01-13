import { useState, useEffect } from 'react';
import { BridgeQuoteParams, BridgeQuote } from '../types';
import { useDecaFlow } from './useDecaFlow';

export function useBridgeQuote(params: BridgeQuoteParams | null) {
  const { config } = useDecaFlow();
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = config.apiUrl || 
          (config.environment === 'sandbox' 
            ? 'https://sandbox.decaflow.xyz/v1'
            : 'https://api.decaflow.xyz/v1');

        const response = await fetch(`${apiUrl}/bridge/quote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Partner-ID': config.partnerId
          },
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bridge quote');
        }

        const data = await response.json();
        setQuote(data.quote);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [params, config]);

  return { quote, loading, error };
}
