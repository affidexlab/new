/**
 * Hook for real-time MEV risk streaming via WebSocket
 */

import { useEffect, useState, useRef } from 'react';
import { useDecaFlow } from '../provider';
import type { MEVRiskScore } from '../types';

export interface UseMEVStreamOptions {
  fromToken?: string;
  toToken?: string;
  enabled?: boolean;
}

export function useMEVStream(options: UseMEVStreamOptions = {}) {
  const { apiUrl } = useDecaFlow();
  const { fromToken, toToken, enabled = true } = options;
  const [riskScore, setRiskScore] = useState<MEVRiskScore | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !fromToken || !toToken) return;

    const wsUrl = apiUrl.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/v1/mev/stream`);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      
      // Subscribe to token pair
      ws.send(JSON.stringify({
        type: 'subscribe',
        fromToken,
        toToken,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'mevRisk') {
          setRiskScore(data.data);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (event) => {
      setError(new Error('WebSocket error'));
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [apiUrl, fromToken, toToken, enabled]);

  return {
    riskScore,
    isConnected,
    error,
  };
}
