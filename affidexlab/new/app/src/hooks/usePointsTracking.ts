import { useEffect } from 'react';
import { useAccount, useWatchBlockNumber } from 'wagmi';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';

interface TransactionData {
  txHash: string;
  walletAddress: string;
  transactionType: 'swap' | 'bridge' | 'liquidity_add' | 'liquidity_remove' | 'privacy_swap' | 'vdm_staking';
  amountUSD: number;
  fromChainId?: number;
  toChainId?: number;
  fromToken?: string;
  toToken?: string;
}

// Test backend connectivity
const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
    console.log('🏥 Backend health check:', response.ok ? '✅ Connected' : '❌ Failed');
    return response.ok;
  } catch (error) {
    console.error('❌ Backend unreachable:', API_BASE);
    return false;
  }
};

export const recordTransaction = async (data: TransactionData) => {
  console.log('🔄 Recording transaction to backend:', data);
  console.log('📡 API Base URL:', API_BASE);
  
  // Test connection first
  const isConnected = await testBackendConnection();
  if (!isConnected) {
    console.error('⚠️ Backend API is not reachable. Points will not be recorded.');
    console.error('⚠️ Please check:');
    console.error('   1. Backend is deployed and running');
    console.error('   2. VITE_API_BASE_URL environment variable is set correctly');
    console.error('   3. CORS is configured to allow requests from your domain');
  }
  
  try {
    const response = await fetch(`${API_BASE}/v1/webhooks/transaction-confirmed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📥 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ API Response:', result);
    
    if (result.success) {
      console.log(`✅ Earned ${result.data.pointsEarned} points!`);
      
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Points Earned! 🎉', {
          body: result.data.message,
          icon: '/images/branding/wordmark-500.png'
        });
      }
      
      return result.data;
    } else {
      console.error('❌ API returned success=false:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to record transaction:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      data: data,
      apiBase: API_BASE
    });
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
    if (!address) {
      console.warn('⚠️ No wallet address - cannot track swap');
      return;
    }
    
    console.log('💱 Tracking swap:', { txHash, fromToken, toToken, amountUSD, chainId });
    
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
    if (!address) {
      console.warn('⚠️ No wallet address - cannot track bridge');
      return;
    }
    
    console.log('🌉 Tracking bridge:', { txHash, fromChainId, toChainId, amountUSD });
    
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
    if (!address) {
      console.warn('⚠️ No wallet address - cannot track liquidity add');
      return;
    }
    
    console.log('💧 Tracking liquidity add:', { txHash, amountUSD, chainId });
    
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
    if (!address) {
      console.warn('⚠️ No wallet address - cannot track liquidity remove');
      return;
    }
    
    console.log('💧 Tracking liquidity remove:', { txHash, amountUSD, chainId });
    
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

  const trackPrivacySwap = async (txHash: string, fromToken: string, toToken: string, amountUSD: number, chainId: number) => {
    if (!address) {
      console.warn('⚠️ No wallet address - cannot track privacy swap');
      return;
    }
    
    console.log('🔒 Tracking privacy swap:', { txHash, fromToken, toToken, amountUSD, chainId });
    
    return recordTransaction({
      txHash,
      walletAddress: address,
      transactionType: 'privacy_swap',
      amountUSD,
      fromChainId: chainId,
      toChainId: chainId,
      fromToken,
      toToken,
    });
  };

  const trackVdmStaking = async (txHash: string, amountUSD: number, chainId: number) => {
    if (!address) {
      console.warn('⚠️ No wallet address - cannot track VDM staking');
      return;
    }
    
    console.log('🏦 Tracking VDM staking:', { txHash, amountUSD, chainId });
    
    return recordTransaction({
      txHash,
      walletAddress: address,
      transactionType: 'vdm_staking',
      amountUSD,
      fromChainId: chainId,
      toChainId: chainId,
      fromToken: 'VDM',
      toToken: 'VDM',
    });
  };

  return {
    trackSwap,
    trackBridge,
    trackLiquidityAdd,
    trackLiquidityRemove,
    trackPrivacySwap,
    trackVdmStaking,
  };
};
