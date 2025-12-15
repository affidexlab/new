import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { 
  NONFUNGIBLE_POSITION_MANAGER_ABI, 
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, 
  LP_FEE_MANAGER_ABI,
  LP_FEE_MANAGER_ADDRESSES,
  ERC20_ABI,
  nearestUsableTick, 
  getTickSpacing 
} from '@/lib/uniswapV3Lp';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { readContract } from 'wagmi/actions';
import { config } from '@/wagmi';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';
const PARTNER_ID = import.meta.env.VITE_PARTNER_ID || 'tychi_prod_pk_live_8x9y2z3a4b5c6d7e';
const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'X-Partner-ID': PARTNER_ID
};

// 3% LP fee (300 basis points)
const LP_FEE_BPS = 300;

export interface LPPosition {
  tokenId: string;
  chainId: number;
  poolAddress: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
  };
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  depositedToken0: string;
  depositedToken1: string;
  currentToken0: string;
  currentToken1: string;
  feesEarned0: string;
  feesEarned1: string;
  protocol: string;
  tvlUSD: string;
}

export interface PoolData {
  id: string;
  address: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
  };
  fee: number;
  protocol: string;
  tvl: string;
  apr: string;
  volumeUSD: string;
  txCount: number;
}

export function useUniswapV3LP(chainId: number) {
  const { address } = useAccount();
  const [positions, setPositions] = useState<LPPosition[]>([]);
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const fetchPools = async () => {
    if (!chainId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/v1/liquidity/pools?chainId=${chainId}`, {
        headers: defaultHeaders
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success && data.data?.pools) {
        setPools(data.data.pools);
      } else {
        setPools([]);
      }
    } catch (error) {
      logger.error('Failed to fetch pools', error);
      toast.error('Failed to load pools');
      setPools([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    if (!address || !chainId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/v1/liquidity/positions?wallet=${address}&chainId=${chainId}`, {
        headers: defaultHeaders
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success && data.data?.positions) {
        setPositions(data.data.positions);
      } else {
        setPositions([]);
      }
    } catch (error) {
      logger.error('Failed to fetch positions', error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, [chainId]);

  useEffect(() => {
    if (address && chainId) {
      fetchPositions();
    }
  }, [address, chainId]);

  const addLiquidity = async (params: {
    poolAddress: string;
    token0: string;
    token1: string;
    fee: number;
    amount0: string;
    amount1: string;
    tickLower?: number;
    tickUpper?: number;
  }) => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    // Check if LPFeeManager is deployed for this chain
    const lpFeeManagerAddress = LP_FEE_MANAGER_ADDRESSES[chainId];
    if (!lpFeeManagerAddress) {
      toast.error('LP Fee Manager not deployed on this chain yet', {
        description: 'Please contact support'
      });
      return;
    }

    try {
      const tickSpacing = getTickSpacing(params.fee);
      const tickLower = params.tickLower ?? nearestUsableTick(-887220, tickSpacing);
      const tickUpper = params.tickUpper ?? nearestUsableTick(887220, tickSpacing);

      const deadline = Math.floor(Date.now() / 1000) + 1200;

      // Calculate amounts with 5% slippage
      const amount0Min = (BigInt(params.amount0) * BigInt(95)) / BigInt(100);
      const amount1Min = (BigInt(params.amount1) * BigInt(95)) / BigInt(100);

      // Call LPFeeManager which will charge 3% fee
      await writeContract({
        address: lpFeeManagerAddress,
        abi: LP_FEE_MANAGER_ABI,
        functionName: 'mintWithFee',
        args: [
          params.token0 as `0x${string}`,
          params.token1 as `0x${string}`,
          params.fee,
          tickLower,
          tickUpper,
          BigInt(params.amount0),
          BigInt(params.amount1),
          amount0Min,
          amount1Min,
          BigInt(deadline)
        ]
      });

      toast.success('Adding liquidity...', {
        description: 'Transaction submitted. 3% fee will be deducted.'
      });
    } catch (error) {
      logger.error('Add liquidity error', error);
      toast.error('Failed to add liquidity', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Check token allowance
  const checkAllowance = async (tokenAddress: string, spender: string): Promise<bigint> => {
    try {
      const allowance = await readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, spender as `0x${string}`]
      });
      return allowance as bigint;
    } catch (error) {
      logger.error('Check allowance error', error);
      return BigInt(0);
    }
  };

  // Approve token
  const approveToken = async (tokenAddress: string, spender: string, amount: bigint): Promise<boolean> => {
    try {
      await writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, amount]
      });
      
      toast.success('Approval requested', {
        description: 'Please confirm the transaction'
      });
      return true;
    } catch (error) {
      logger.error('Approve token error', error);
      toast.error('Failed to approve token', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const increaseLiquidityPosition = async (params: {
    tokenId: string;
    amount0: string;
    amount1: string;
    token0Address: string;
    token1Address: string;
  }) => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    const lpFeeManagerAddress = LP_FEE_MANAGER_ADDRESSES[chainId];
    if (!lpFeeManagerAddress) {
      toast.error('LP Fee Manager not deployed on this chain yet');
      return;
    }

    try {
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      const amount0Min = (BigInt(params.amount0) * BigInt(95)) / BigInt(100);
      const amount1Min = (BigInt(params.amount1) * BigInt(95)) / BigInt(100);

      await writeContract({
        address: lpFeeManagerAddress,
        abi: LP_FEE_MANAGER_ABI,
        functionName: 'increaseLiquidityWithFee',
        args: [
          BigInt(params.tokenId),
          BigInt(params.amount0),
          BigInt(params.amount1),
          amount0Min,
          amount1Min,
          BigInt(deadline),
          params.token0Address as `0x${string}`,
          params.token1Address as `0x${string}`
        ]
      });

      toast.success('Increasing liquidity...', {
        description: 'Transaction submitted. 3% fee will be deducted.'
      });
    } catch (error) {
      logger.error('Increase liquidity error', error);
      toast.error('Failed to increase liquidity', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const removeLiquidity = async (params: {
    tokenId: string;
    liquidity: string;
  }) => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    const nftManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
    if (!nftManagerAddress) {
      toast.error('Uniswap V3 not available on this chain');
      return;
    }

    try {
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      await writeContract({
        address: nftManagerAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: 'decreaseLiquidity',
        args: [{
          tokenId: BigInt(params.tokenId),
          liquidity: BigInt(params.liquidity),
          amount0Min: BigInt(0),
          amount1Min: BigInt(0),
          deadline: BigInt(deadline)
        }]
      });

      toast.success('Removing liquidity...', {
        description: 'Transaction submitted. Fees will be available to collect.'
      });
    } catch (error) {
      logger.error('Remove liquidity error', error);
      toast.error('Failed to remove liquidity', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const collectFees = async (tokenId: string) => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    const nftManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
    if (!nftManagerAddress) {
      toast.error('Uniswap V3 not available on this chain');
      return;
    }

    try {
      const maxUint128 = BigInt('340282366920938463463374607431768211455');

      await writeContract({
        address: nftManagerAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: 'collect',
        args: [{
          tokenId: BigInt(tokenId),
          recipient: address as `0x${string}`,
          amount0Max: maxUint128,
          amount1Max: maxUint128
        }]
      });

      toast.success('Collecting fees...', {
        description: 'Transaction submitted to blockchain'
      });
    } catch (error) {
      logger.error('Collect fees error', error);
      toast.error('Failed to collect fees', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const burnPosition = async (tokenId: string) => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    const nftManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
    if (!nftManagerAddress) {
      toast.error('Uniswap V3 not available on this chain');
      return;
    }

    try {
      await writeContract({
        address: nftManagerAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: 'burn',
        args: [BigInt(tokenId)]
      });

      toast.success('Burning position NFT...', {
        description: 'Position will be permanently removed'
      });
    } catch (error) {
      logger.error('Burn position error', error);
      toast.error('Failed to burn position', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    if (isSuccess && txHash) {
      toast.success('Transaction confirmed!');
      fetchPositions();
    }
  }, [isSuccess, txHash]);

  return {
    positions,
    pools,
    loading,
    addLiquidity,
    increaseLiquidityPosition,
    removeLiquidity,
    collectFees,
    burnPosition,
    checkAllowance,
    approveToken,
    isProcessing: isPending || isConfirming,
    txHash,
    refetchPositions: fetchPositions,
    refetchPools: fetchPools,
    lpFeeRate: LP_FEE_BPS
  };
}
