import React, { createContext, useContext, ReactNode } from 'react';
import { DecaFlowConfig } from './types';

interface DecaFlowContextValue {
  config: DecaFlowConfig;
  apiUrl: string;
}

const DecaFlowContext = createContext<DecaFlowContextValue | null>(null);

interface DecaFlowProviderProps {
  config: DecaFlowConfig;
  children: ReactNode;
}

export function DecaFlowProvider({ config, children }: DecaFlowProviderProps) {
  const apiUrl = config.apiBaseUrl || 
    (config.environment === 'sandbox' 
      ? 'https://sandbox.decaflow.xyz/v1'
      : 'https://api.decaflow.xyz/v1');

  return (
    <DecaFlowContext.Provider value={{ config, apiUrl }}>
      {children}
    </DecaFlowContext.Provider>
  );
}

export function useDecaFlow() {
  const context = useContext(DecaFlowContext);
  if (!context) {
    throw new Error('useDecaFlow must be used within DecaFlowProvider');
  }
  return context;
}
