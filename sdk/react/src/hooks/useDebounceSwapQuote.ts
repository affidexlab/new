/**
 * Hook for debounced swap quotes (useful for input fields)
 */

import { useEffect, useState } from 'react';
import { useSwapQuote } from './useSwapQuote';
import type { SwapParams } from '../types';

export function useDebounceSwapQuote(params: SwapParams | null, delay: number = 500) {
  const [debouncedParams, setDebouncedParams] = useState<SwapParams | null>(params);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParams(params);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [params, delay]);

  return useSwapQuote(debouncedParams);
}
