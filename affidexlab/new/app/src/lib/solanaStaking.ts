import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';
export const AFFIDEX_CUSTODY_WALLET = '3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk';

export const MIN_STAKE_AMOUNT = 1_000;
export const MAX_STAKE_AMOUNT = 10_000_000;

export const STAKING_FEES = {
  depositFeeBps: 250,
  withdrawalFeeBps: 150,
};

export enum LockPeriod {
  SixMonths = 'SixMonths',
  NineMonths = 'NineMonths',
  TwelveMonths = 'TwelveMonths',
}

export interface LockPeriodOption {
  id: LockPeriod;
  label: string;
  months: number;
  apy: number;
  seconds: number;
}

export const LOCK_PERIODS: LockPeriodOption[] = [
  {
    id: LockPeriod.SixMonths,
    label: '6 Months',
    months: 6,
    apy: 8.0,
    seconds: 15_768_000,
  },
  {
    id: LockPeriod.NineMonths,
    label: '9 Months',
    months: 9,
    apy: 12.0,
    seconds: 23_652_000,
  },
  {
    id: LockPeriod.TwelveMonths,
    label: '12 Months',
    months: 12,
    apy: 16.0,
    seconds: 31_536_000,
  },
];

export interface UserStake {
  user: string;
  amountStaked: number;
  rewardsAllocated: number;
  lockPeriod: LockPeriod;
  startTimestamp: number;
  unlockTimestamp: number;
  hasStaked: boolean;
  hasClaimed: boolean;
  apy: number;
  daysRemaining: number;
  canClaim: boolean;
}

export interface PoolStats {
  totalStaked: number;
  totalRewardsDistributed: number;
  rewardsPoolRemaining: number;
  totalStakers: number;
}

export const calculateDepositFee = (amount: number): number => {
  return amount * (STAKING_FEES.depositFeeBps / 10000);
};

export const calculateWithdrawalFee = (amount: number): number => {
  return amount * (STAKING_FEES.withdrawalFeeBps / 10000);
};

export const calculateRewards = (amount: number, lockPeriod: LockPeriod): number => {
  const period = LOCK_PERIODS.find(p => p.id === lockPeriod);
  if (!period) return 0;
  
  const depositFee = calculateDepositFee(amount);
  const netAmount = amount - depositFee;
  const annualRate = period.apy / 100;
  const secondsInYear = 31_536_000;
  const lockRatio = period.seconds / secondsInYear;
  return netAmount * annualRate * lockRatio;
};

export const calculateNetReturn = (amount: number, lockPeriod: LockPeriod): number => {
  const depositFee = calculateDepositFee(amount);
  const netAmount = amount - depositFee;
  const rewards = calculateRewards(amount, lockPeriod);
  const withdrawalFee = calculateWithdrawalFee(netAmount);
  
  return netAmount - withdrawalFee + rewards;
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

export async function getUserStake(
  connection: Connection,
  walletAddress: PublicKey
): Promise<UserStake | null> {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';
    const response = await fetch(`${API_BASE}/v1/solana-staking/stake-info?wallet=${walletAddress.toString()}`);
    const data = await response.json();
    
    if (!data.success || !data.data) {
      return null;
    }
    
    const stake = data.data;
    const now = Math.floor(Date.now() / 1000);
    const daysRemaining = Math.max(0, Math.ceil((stake.unlockTimestamp - now) / 86400));
    const hasStaked = !!stake;
    const hasClaimed = stake.hasClaimed || false;
    const canClaim = now >= stake.unlockTimestamp && hasStaked && !hasClaimed;
    
    const period = LOCK_PERIODS.find(p => p.id === stake.lockPeriod);
    
    return {
      ...stake,
      daysRemaining,
      canClaim,
      apy: period?.apy || 0,
    };
  } catch (error) {
    console.error('Error fetching user stake:', error);
    return null;
  }
}

export async function getPoolStats(): Promise<PoolStats | null> {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';
    const response = await fetch(`${API_BASE}/v1/solana-staking/pool-stats`);
    const data = await response.json();
    
    if (!data.success) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    return null;
  }
}

export async function registerOffchainStake(
  walletAddress: PublicKey,
  amount: number,
  lockPeriod: LockPeriod,
  depositSignature: string,
): Promise<void> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';
  
  const response = await fetch(`${API_BASE}/v1/solana-staking/stake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: walletAddress.toString(),
      amount,
      lockPeriod,
      depositSignature,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to register stake');
  }
}

export async function requestOffchainClaim(
  walletAddress: PublicKey,
): Promise<{ principalAmount: number; rewardsAmount: number; withdrawalFee: number }> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';
  
  const response = await fetch(`${API_BASE}/v1/solana-staking/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: walletAddress.toString(),
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to request claim');
  }

  return data.data;
}
