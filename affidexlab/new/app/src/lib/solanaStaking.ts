import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

export const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';
export const AFFIDEX_CUSTODY_WALLET = 'EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR';
export const AFFIDEX_TREASURY_WALLET = '3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk';

export const MIN_STAKE_AMOUNT = 1_000;

export const STAKING_FEES = {
  depositFeeBps: 250,
  withdrawalFeeBps: 150,
};

export enum LockPeriod {
  ThreeMonths = 'ThreeMonths',
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
    id: LockPeriod.ThreeMonths,
    label: '3 Months',
    months: 3,
    apy: 4.0,
    seconds: 7_884_000,
  },
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
  vdmPriceUsdtSnapshot?: number;
  stakedValueUsdtSnapshot?: number;
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

export const calculateNetStakedVdm = (amount: number): number => {
  const depositFee = calculateDepositFee(amount);
  return amount - depositFee;
};

export const calculateGrossValueUsdt = (amount: number, vdmPriceUsdt: number): number => {
  if (!vdmPriceUsdt) return 0;
  return amount * vdmPriceUsdt;
};

export const calculateNetStakedValueUsdt = (amount: number, vdmPriceUsdt: number): number => {
  if (!vdmPriceUsdt) return 0;
  return calculateNetStakedVdm(amount) * vdmPriceUsdt;
};

export const calculateEstimatedRewardsUsdt = (amount: number, lockPeriod: LockPeriod, vdmPriceUsdt: number): number => {
  const period = LOCK_PERIODS.find(p => p.id === lockPeriod);
  if (!period || !vdmPriceUsdt) return 0;

  const netValueUsdt = calculateNetStakedValueUsdt(amount, vdmPriceUsdt);
  const annualRate = period.apy / 100;
  const secondsInYear = 31_536_000;
  const lockRatio = period.seconds / secondsInYear;
  return netValueUsdt * annualRate * lockRatio;
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

export async function getVDMPriceUsdt(): Promise<{ priceUsd: number; timestamp: number; source?: string } | null> {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';
    const response = await fetch(`${API_BASE}/v1/solana-staking/vdm-price`);
    const data = await response.json();

    if (data?.success && data?.data?.priceUsd) {
      return data.data;
    }
  } catch {
  }

  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${VDM_TOKEN_ADDRESS}`);
    const data = await response.json();

    const pairs = Array.isArray(data?.pairs) ? data.pairs : [];
    const best = pairs
      .map((p: any) => ({
        priceUsd: Number(p?.priceUsd),
        liquidityUsd: Number(p?.liquidity?.usd) || 0,
      }))
      .filter((p: any) => Number.isFinite(p.priceUsd) && p.priceUsd > 0)
      .sort((a: any, b: any) => b.liquidityUsd - a.liquidityUsd)[0];

    if (!best) {
      return null;
    }

    return { priceUsd: best.priceUsd, timestamp: Date.now(), source: 'dexscreener-direct' };
  } catch (error) {
    console.error('Error fetching VDM price:', error);
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

export async function transferVDMAndStake(
  connection: Connection,
  walletAdapter: any,
  amount: number,
  lockPeriod: LockPeriod,
): Promise<{ signature: string; stake: any }> {
  if (!walletAdapter.publicKey || !walletAdapter.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
  const custodyWallet = new PublicKey(AFFIDEX_CUSTODY_WALLET);
  
  // Get token accounts
  const fromTokenAccount = await getAssociatedTokenAddress(
    vdmMint,
    walletAdapter.publicKey
  );
  
  const toTokenAccount = await getAssociatedTokenAddress(
    vdmMint,
    custodyWallet
  );
  
  // Convert amount to token decimals (VDM has 9 decimals)
  const amountInLamports = Math.floor(amount * 1_000_000_000);
  
  // Create transfer instruction
  const transferInstruction = createTransferInstruction(
    fromTokenAccount,
    toTokenAccount,
    walletAdapter.publicKey,
    amountInLamports
  );
  
  // Create transaction
  const transaction = new Transaction().add(transferInstruction);
  
  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletAdapter.publicKey;
  
  // Sign and send transaction
  const signed = await walletAdapter.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  
  // Wait for confirmation
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  }, 'confirmed');
  
  const stake = await registerOffchainStake(
    walletAdapter.publicKey,
    amount,
    lockPeriod,
    signature
  );
  
  return { signature, stake };
}

export async function registerOffchainStake(
  walletAddress: PublicKey,
  amount: number,
  lockPeriod: LockPeriod,
  depositSignature: string,
): Promise<any> {
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

  return data.data;
}

export async function requestOffchainClaim(
  walletAddress: PublicKey,
): Promise<{ principalAmount: number; principalValueUsdtSnapshot: number; rewardsAmount: number; vdmPriceUsdtSnapshot: number; withdrawalFee: number }> {
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
