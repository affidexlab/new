import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

export const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';

export const RAYDIUM_POOL_IDS = {
  'VDM-SOL': 'TBD',
  'VDM-USDC': 'TBD',
};

export const STAKING_FEES = {
  depositFeeBps: 250,
  withdrawalFeeBps: 150,
  performanceFeeBps: 1000,
  affidexShareBps: 700,
  vdmShareBps: 300,
};

export interface StakingPool {
  id: string;
  name: string;
  pairToken: string;
  baseApy: number;
  tvl: number;
  totalStakers: number;
  poolAddress?: string;
}

export interface UserStakingPosition {
  poolId: string;
  stakedAmount: number;
  lpTokens: number;
  pendingRewards: number;
  stakedAt: number;
  lastClaimAt: number;
  estimatedApy: number;
}

export const STAKING_POOLS: StakingPool[] = [
  {
    id: 'vdm-sol',
    name: 'VDM/SOL',
    pairToken: 'SOL',
    baseApy: 18.5,
    tvl: 0,
    totalStakers: 0,
    poolAddress: RAYDIUM_POOL_IDS['VDM-SOL'],
  },
  {
    id: 'vdm-usdc',
    name: 'VDM/USDC',
    pairToken: 'USDC',
    baseApy: 15.2,
    tvl: 0,
    totalStakers: 0,
    poolAddress: RAYDIUM_POOL_IDS['VDM-USDC'],
  },
];

export const calculateNetApy = (baseApy: number): number => {
  const depositFeeImpact = (STAKING_FEES.depositFeeBps / 10000) * 0.2;
  const withdrawalFeeImpact = (STAKING_FEES.withdrawalFeeBps / 10000) * 0.1;
  const performanceFeeImpact = baseApy * (STAKING_FEES.performanceFeeBps / 10000);
  
  return baseApy - depositFeeImpact - withdrawalFeeImpact - performanceFeeImpact;
};

export const calculateDepositFee = (amount: number): number => {
  return amount * (STAKING_FEES.depositFeeBps / 10000);
};

export const calculateWithdrawalFee = (amount: number): number => {
  return amount * (STAKING_FEES.withdrawalFeeBps / 10000);
};

export const calculateRewards = (
  stakedAmount: number,
  stakedDays: number,
  baseApy: number
): number => {
  const netApy = calculateNetApy(baseApy);
  const dailyRate = netApy / 365 / 100;
  return stakedAmount * dailyRate * stakedDays;
};

export async function getVDMTokenBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
    const tokenAccount = await getAssociatedTokenAddress(vdmMint, walletAddress);
    
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return parseFloat(balance.value.uiAmount?.toString() || '0');
  } catch (error) {
    console.error('Error fetching VDM balance:', error);
    return 0;
  }
}

export async function getSOLBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const balance = await connection.getBalance(walletAddress);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0;
  }
}

export async function getUserStakingPositions(
  connection: Connection,
  walletAddress: PublicKey
): Promise<UserStakingPosition[]> {
  try {
    const response = await fetch(`/api/v1/solana-staking/positions?wallet=${walletAddress.toString()}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch positions');
    }
    
    return data.data.positions || [];
  } catch (error) {
    console.error('Error fetching staking positions:', error);
    return [];
  }
}

export async function stakeTokens(
  connection: Connection,
  walletAddress: PublicKey,
  poolId: string,
  vdmAmount: number,
  pairTokenAmount: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const response = await fetch('/api/v1/solana-staking/stake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: walletAddress.toString(),
        poolId,
        vdmAmount,
        pairTokenAmount,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to prepare stake transaction');
    }

    const transaction = Transaction.from(Buffer.from(data.data.transaction, 'base64'));
    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction(signature, 'confirmed');

    await fetch('/api/v1/solana-staking/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: walletAddress.toString(),
        signature,
        poolId,
        vdmAmount,
        pairTokenAmount,
      }),
    });

    return signature;
  } catch (error) {
    console.error('Error staking tokens:', error);
    throw error;
  }
}

export async function unstakeTokens(
  connection: Connection,
  walletAddress: PublicKey,
  poolId: string,
  lpTokenAmount: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const response = await fetch('/api/v1/solana-staking/unstake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: walletAddress.toString(),
        poolId,
        lpTokenAmount,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to prepare unstake transaction');
    }

    const transaction = Transaction.from(Buffer.from(data.data.transaction, 'base64'));
    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction(signature, 'confirmed');

    await fetch('/api/v1/solana-staking/confirm-unstake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: walletAddress.toString(),
        signature,
        poolId,
        lpTokenAmount,
      }),
    });

    return signature;
  } catch (error) {
    console.error('Error unstaking tokens:', error);
    throw error;
  }
}

export async function claimRewards(
  connection: Connection,
  walletAddress: PublicKey,
  poolId: string,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const response = await fetch('/api/v1/solana-staking/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: walletAddress.toString(),
        poolId,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to prepare claim transaction');
    }

    const transaction = Transaction.from(Buffer.from(data.data.transaction, 'base64'));
    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
  } catch (error) {
    console.error('Error claiming rewards:', error);
    throw error;
  }
}

export async function getPoolStats(poolId: string) {
  try {
    const response = await fetch(`/api/v1/solana-staking/pool-stats?poolId=${poolId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch pool stats');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    return null;
  }
}
