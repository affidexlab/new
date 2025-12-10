import { useEffect } from 'react';
import { useAccount, useWatchBlockNumber } from 'wagmi';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.decaflow.xyz';

interface TransactionData {
  txHash: string;
  walletAddress: string;
  transactionType: 'swap' | 'bridge' | 'liquidity_add' | 'liquidity_remove';
  amountUSD: number;
  fromChainId?: number;
  toChainId?: number;
  fromToken?: string;
  toToken?: string;
}

export const recordTransaction = async (data: TransactionData) => {
  try {
    const response = await fetch(`${API_BASE}/v1/webhooks/transaction-confirmed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Earned ${result.data.pointsEarned} points!`);
      
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Points Earned! 🎉', {
          body: result.data.message,
          icon: '/images/branding/wordmark-500.png'
        });
      }
      
      return result.data;
    }
  } catch (error) {
    console.error('Failed to record transaction:', error);
  }
  return null;
};

export const usePointsTracking = () => {
  const { address } = useAccount();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const trackSwap = async (txHash: string, fromToken: string, toToken: string, amountUSD: number, chainId: number) => {
    if (!address) return;
    
    return recordTransaction({
      txHash,
      walletAddress: address,
      transactionType: 'swap',
      amountUSD,
      fromChainId: chainId,
      toChainId: chainId,
      fromToken,
      toToken,
    });
  };

  const trackBridge = async (txHash: string, fromChainId: number, toChainId: number, fromToken: string, toToken: string, amountUSD: number) => {
    if (!address) return;
    
    return recordTransaction({
      txHash,
      walletAddress: address,
      transactionType: 'bridge',
      amountUSD,
      fromChainId,
      toChainId,
      fromToken,
      toToken,
    });
  };

  const trackLiquidityAdd = async (txHash: string, amountUSD: number, chainId: number, token0: string, token1: string) => {
    if (!address) return;
    
    return recordTransaction({
      txHash,
      walletAddress: address,
      transactionType: 'liquidity_add',
      amountUSD,
      fromChainId: chainId,
      toChainId: chainId,
      fromToken: token0,
      toToken: token1,
    });
  };

  const trackLiquidityRemove = async (txHash: string, amountUSD: number, chainId: number, token0: string, token1: string) => {
    if (!address) return;
    
    return recordTransaction({
      txHash,
      walletAddress: address,
      transactionType: 'liquidity_remove',
      amountUSD,
      fromChainId: chainId,
      toChainId: chainId,
      fromToken: token0,
      toToken: token1,
    });
  };

  return {
    trackSwap,
    trackBridge,
    trackLiquidityAdd,
    trackLiquidityRemove,
  };
};
