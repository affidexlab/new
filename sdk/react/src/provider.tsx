/**
 * DecaFlow React Provider
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { DecaFlowConfig } from './types';

interface DecaFlowContextValue {
  config: Required<DecaFlowConfig>;
  apiUrl: string;
}

const DecaFlowContext = createContext<DecaFlowContextValue | undefined>(undefined);

const defaultConfig: Required<DecaFlowConfig> = {
  apiKey: '',
  baseUrl: 'https://api.decaflow.xyz',
  chain: 'arbitrum',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 30000, // 30 seconds
    },
  },
});

export interface DecaFlowProviderProps {
  config?: Partial<DecaFlowConfig>;
  children: ReactNode;
}

export function DecaFlowProvider({ config = {}, children }: DecaFlowProviderProps) {
  const mergedConfig = { ...defaultConfig, ...config };
  const apiUrl = mergedConfig.baseUrl.replace(/\/$/, '');

  const value: DecaFlowContextValue = {
    config: mergedConfig,
    apiUrl,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DecaFlowContext.Provider value={value}>
        {children}
      </DecaFlowContext.Provider>
    </QueryClientProvider>
  );
}

export function useDecaFlowContext(): DecaFlowContextValue {
  const context = useContext(DecaFlowContext);
  if (!context) {
    throw new Error('useDecaFlowContext must be used within DecaFlowProvider');
  }
  return context;
}

export function useDecaFlow() {
  const { config, apiUrl } = useDecaFlowContext();
  return { config, apiUrl };
}
