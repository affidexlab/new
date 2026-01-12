import React, { createContext, ReactNode } from 'react';
import { DecaFlowConfig } from '../types';

export const DecaFlowContext = createContext<{ config: DecaFlowConfig } | null>(null);

interface DecaFlowProviderProps {
  config: DecaFlowConfig;
  children: ReactNode;
}

export function DecaFlowProvider({ config, children }: DecaFlowProviderProps) {
  return (
    <DecaFlowContext.Provider value={{ config }}>
      {children}
    </DecaFlowContext.Provider>
  );
}
