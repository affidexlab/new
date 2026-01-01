import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountIdempotentInstruction, createTransferInstruction, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

async function retryRpcCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  delayMs: number = 800
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();
      if (i > 0) {
        console.log(`✅ RPC call succeeded on attempt ${i + 1}`);
      }
      return result;
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️  RPC call failed (attempt ${i + 1}/${maxRetries}):`, error?.message || error);
      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(1.5, i);
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error(`❌ RPC call failed after ${maxRetries} attempts`);
  throw lastError;
}

const FALLBACK_SOLANA_RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
] as const;

function shouldFallbackRpc(error: any): boolean {
  const msg = String(error?.message || error || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed') ||
    msg.includes('fetch') ||
    msg.includes('blocked') ||
    msg.includes('csp') ||
    msg.includes('content security policy')
  );
}

async function getWorkingConnection(primary: Connection): Promise<Connection> {
  console.log('🔌 Testing primary Solana RPC connection...');
  try {
    await retryRpcCall(() => primary.getLatestBlockhash('processed'), 2);
    console.log('✅ Primary RPC connection working');
    return primary;
  } catch (e: any) {
    console.warn('⚠️  Primary RPC failed:', e?.message);
    if (!shouldFallbackRpc(e)) {
      console.log('   Error not RPC-related, continuing with primary');
      return primary;
    }
  }

  console.log('🔄 Trying fallback RPC endpoints...');
  for (const url of FALLBACK_SOLANA_RPC_URLS) {
    try {
      console.log(`   Testing ${url}...`);
      const c = new Connection(url, 'confirmed');
      await retryRpcCall(() => c.getLatestBlockhash('processed'), 2);
      console.log(`✅ Using fallback Solana RPC: ${url}`);
      return c;
    } catch (e: any) {
      console.warn(`   ❌ Failed: ${e?.message}`);
    }
  }

  console.warn('⚠️  All fallback RPCs failed, using primary');
  return primary;
}

export const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';
export const VDM_TOKEN_DECIMALS = 6;
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

let vdmTokenProgramIdCache: Promise<PublicKey> | null = null;

async function getVdmTokenProgramId(connection: Connection): Promise<PublicKey> {
  if (!vdmTokenProgramIdCache) {
    vdmTokenProgramIdCache = (async () => {
      const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
      const info = await retryRpcCall(() => connection.getAccountInfo(vdmMint));
      const owner = info?.owner;
      if (owner?.equals(TOKEN_2022_PROGRAM_ID)) {
        return TOKEN_2022_PROGRAM_ID;
      }
      return TOKEN_PROGRAM_ID;
    })().catch((e) => {
      vdmTokenProgramIdCache = null;
      throw e;
    });
  }
  return vdmTokenProgramIdCache;
}

async function sumTokenBalanceByProgram(
  connection: Connection,
  walletAddress: PublicKey,
  tokenProgramId: PublicKey
): Promise<number> {
  const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
  
  const resp = await retryRpcCall(() => 
    connection.getParsedTokenAccountsByOwner(walletAddress, { programId: tokenProgramId })
  );
  
  console.log(`📊 Found ${resp.value.length} token accounts for program ${tokenProgramId.toString().substring(0, 8)}...`);
  
  let total = 0;
  for (const acc of resp.value) {
    const parsed: any = acc.account.data;
    const mint = parsed?.parsed?.info?.mint;
    const uiAmount = Number(parsed?.parsed?.info?.tokenAmount?.uiAmount);
    
    console.log(`   Token: ${mint?.substring(0, 8)}... Balance: ${uiAmount}`);
    
    if (mint === vdmMint.toString()) {
      console.log(`   ✅ VDM Token found! Balance: ${uiAmount}`);
      if (Number.isFinite(uiAmount)) {
        total += uiAmount;
      }
    }
  }
  return total;
}

export async function getVDMTokenBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  console.log('\n🔍 === VDM BALANCE FETCH START ===');
  console.log('   Wallet:', walletAddress.toString());
  console.log('   VDM Token:', VDM_TOKEN_ADDRESS);
  console.log('   Timestamp:', new Date().toISOString());

  const run = async (conn: Connection, rpcLabel: string): Promise<number> => {
    console.log(`\n📊 Fetching balance via ${rpcLabel}...`);
    
    const programId = await getVdmTokenProgramId(conn);
    console.log('   Token Program ID:', programId.toString());

    let total = 0;

    try {
      console.log('   [1/2] Scanning primary token program...');
      const primaryBalance = await sumTokenBalanceByProgram(conn, walletAddress, programId);
      total += primaryBalance;
      console.log(`   Primary program balance: ${primaryBalance}`);
    } catch (e: any) {
      console.error('   ❌ Primary scan failed:', e?.message || e);
      throw e;
    }

    const altProgramId = programId.equals(TOKEN_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
    try {
      console.log('   [2/2] Scanning alternative token program...');
      const altBalance = await sumTokenBalanceByProgram(conn, walletAddress, altProgramId);
      total += altBalance;
      console.log(`   Alternative program balance: ${altBalance}`);
    } catch (e: any) {
      console.log('   No accounts in alternative program (this is normal)');
    }

    console.log(`\n💰 ✅ TOTAL VDM BALANCE: ${total.toLocaleString()} VDM`);
    return total;
  };

  try {
    const primaryConn = await getWorkingConnection(connection);
    
    try {
      const balance = await run(primaryConn, 'primary RPC');
      console.log('\n✅ === VDM BALANCE FETCH SUCCESS ===\n');
      return balance;
    } catch (e: any) {
      console.error('❌ Primary RPC balance fetch failed:', e?.message);
      
      if (!shouldFallbackRpc(e)) {
        console.error('   Error is not RPC-related, re-throwing');
        throw e;
      }
      
      console.log('   Attempting fallback RPCs...');
    }

    for (const url of FALLBACK_SOLANA_RPC_URLS) {
      try {
        console.log(`\n🔄 Trying fallback RPC: ${url}`);
        vdmTokenProgramIdCache = null;
        const fallbackConn = new Connection(url, 'confirmed');
        const balance = await run(fallbackConn, url);
        console.log('\n✅ === VDM BALANCE FETCH SUCCESS (fallback) ===\n');
        return balance;
      } catch (e: any) {
        console.error(`   ❌ Fallback ${url} failed:`, e?.message);
      }
    }

    console.error('\n❌ All RPC endpoints failed, returning 0');
    return 0;
  } catch (error: any) {
    console.error('\n❌ === VDM BALANCE FETCH FAILED ===');
    console.error('   Wallet:', walletAddress.toString());
    console.error('   VDM Token:', VDM_TOKEN_ADDRESS);
    console.error('   Error:', error?.message || error);
    console.error('   Stack:', error?.stack);
    console.error('===================================\n');
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

  const conn = await getWorkingConnection(connection);

  const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
  const custodyWallet = new PublicKey(AFFIDEX_CUSTODY_WALLET);
  const tokenProgramId = await getVdmTokenProgramId(conn);

  const fromTokenAccount = await getAssociatedTokenAddress(
    vdmMint,
    walletAdapter.publicKey,
    false,
    tokenProgramId
  );

  const fromTokenAccountInfo = await retryRpcCall(() => conn.getAccountInfo(fromTokenAccount));
  if (!fromTokenAccountInfo) {
    throw new Error('VDM token account not found for your wallet.');
  }

  const toTokenAccount = await getAssociatedTokenAddress(
    vdmMint,
    custodyWallet,
    true,
    tokenProgramId
  );

  const transaction = new Transaction();

  const toTokenAccountInfo = await retryRpcCall(() => conn.getAccountInfo(toTokenAccount));
  if (!toTokenAccountInfo) {
    transaction.add(
      createAssociatedTokenAccountIdempotentInstruction(
        walletAdapter.publicKey,
        toTokenAccount,
        custodyWallet,
        vdmMint,
        tokenProgramId
      )
    );
  }

  const amountInSmallestUnit = Math.floor(amount * Math.pow(10, VDM_TOKEN_DECIMALS));

  const transferInstruction = createTransferInstruction(
    fromTokenAccount,
    toTokenAccount,
    walletAdapter.publicKey,
    amountInSmallestUnit,
    [],
    tokenProgramId
  );

  transaction.add(transferInstruction);

  const { blockhash, lastValidBlockHeight } = await retryRpcCall(() => conn.getLatestBlockhash('finalized'));
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletAdapter.publicKey;

  const signed = await walletAdapter.signTransaction(transaction);

  let signature: string;
  try {
    signature = await retryRpcCall(() => conn.sendRawTransaction(signed.serialize()));
  } catch (e) {
    if (!shouldFallbackRpc(e)) throw e;

    for (const url of FALLBACK_SOLANA_RPC_URLS) {
      try {
        const fallbackConn = new Connection(url, 'confirmed');
        signature = await retryRpcCall(() => fallbackConn.sendRawTransaction(signed.serialize()));
        try {
          await retryRpcCall(() => fallbackConn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed'));
        } catch (e: any) {
          const statuses = await retryRpcCall(() => fallbackConn.getSignatureStatuses([signature], { searchTransactionHistory: true }));
          const s = statuses?.value?.[0];
          if (!s || s.err) {
            throw e;
          }
        }
        const stake = await registerOffchainStake(walletAdapter.publicKey, amount, lockPeriod, signature);
        return { signature, stake };
      } catch {
      }
    }

    throw e;
  }

  try {
    await retryRpcCall(() => conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed'));
  } catch (e: any) {
    const statuses = await retryRpcCall(() => conn.getSignatureStatuses([signature], { searchTransactionHistory: true }));
    const s = statuses?.value?.[0];
    if (!s || s.err) {
      throw e;
    }
  }

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

  const raw = await response.text();
  let data: any;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(`Failed to register stake (HTTP ${response.status})`);
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || `Failed to register stake (HTTP ${response.status})`);
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
