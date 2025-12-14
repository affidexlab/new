import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

interface TransactionEvent {
  type: 'swap' | 'bridge' | 'liquidity_add' | 'liquidity_remove';
  txHash: string;
  timestamp: number;
  amountUSD?: number;
}

interface TransactionEventsContextType {
  emitTransactionComplete: (event: TransactionEvent) => void;
  lastTransaction: TransactionEvent | null;
  subscribeToTransactions: (callback: (event: TransactionEvent) => void) => () => void;
}

const TransactionEventsContext = createContext<TransactionEventsContextType | undefined>(undefined);

export const TransactionEventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastTransaction, setLastTransaction] = useState<TransactionEvent | null>(null);
  const [subscribers, setSubscribers] = useState<Set<(event: TransactionEvent) => void>>(new Set());

  const emitTransactionComplete = useCallback((event: TransactionEvent) => {
    setLastTransaction(event);
    subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in transaction event subscriber:', error);
      }
    });
  }, [subscribers]);

  const subscribeToTransactions = useCallback((callback: (event: TransactionEvent) => void) => {
    setSubscribers(prev => new Set(prev).add(callback));
    return () => {
      setSubscribers(prev => {
        const next = new Set(prev);
        next.delete(callback);
        return next;
      });
    };
  }, []);

  return (
    <TransactionEventsContext.Provider value={{ emitTransactionComplete, lastTransaction, subscribeToTransactions }}>
      {children}
    </TransactionEventsContext.Provider>
  );
};

export const useTransactionEvents = () => {
  const context = useContext(TransactionEventsContext);
  if (!context) {
    throw new Error('useTransactionEvents must be used within TransactionEventsProvider');
  }
  return context;
};
