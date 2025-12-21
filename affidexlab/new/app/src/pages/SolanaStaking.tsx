import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import {
  LOCK_PERIODS,
  LockPeriod,
  MIN_STAKE_AMOUNT,
  calculateDepositFee,
  calculateWithdrawalFee,
  calculateRewards,
  calculateNetReturn,
  getVDMTokenBalance,
  getUserStake,
  getPoolStats,
  transferVDMAndStake,
  requestOffchainClaim,
} from '../lib/solanaStaking';

export default function SolanaStaking() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { connection } = useConnection();
  
  const [selectedLockPeriod, setSelectedLockPeriod] = useState<LockPeriod>(LockPeriod.TwelveMonths);
  const [stakeAmount, setStakeAmount] = useState('');
  const [vdmBalance, setVdmBalance] = useState(0);
  const [userStake, setUserStake] = useState<any | null>(null);
  const [poolStats, setPoolStatsState] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadData();
    }
  }, [publicKey]);

  const loadData = async () => {
    if (!publicKey) return;
    
    try {
      const [balance, stake, stats] = await Promise.all([
        getVDMTokenBalance(connection, publicKey),
        getUserStake(connection, publicKey),
        getPoolStats(),
      ]);
      
      setVdmBalance(balance);
      setUserStake(stake);
      setPoolStatsState(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleStake = async () => {
    if (!publicKey) {
      toast.error('Please connect your Solana wallet');
      return;
    }

    const amount = parseFloat(stakeAmount);

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < MIN_STAKE_AMOUNT) {
      toast.error(`Minimum stake is ${MIN_STAKE_AMOUNT.toLocaleString()} VDM`);
      return;
    }



    if (amount > vdmBalance) {
      toast.error('Insufficient VDM balance in your wallet');
      return;
    }

    if (userStake?.hasStaked && !userStake?.hasClaimed) {
      toast.error('You already have an active stake. One stake per wallet.');
      return;
    }

    setLoading(true);

    try {
      const depositFee = calculateDepositFee(amount);
      const netStake = amount - depositFee;
      const rewards = calculateRewards(amount, selectedLockPeriod);

      toast.info(`Transferring ${amount.toFixed(2)} VDM to staking wallet. Please approve the transaction in your wallet.`);

      const signature = await transferVDMAndStake(
        connection,
        wallet,
        amount,
        selectedLockPeriod
      );

      toast.success(`Stake successful! Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      setStakeAmount('');
      await loadData();
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.error(error?.message || 'Failed to stake VDM');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!publicKey) {
      toast.error('Please connect your Solana wallet');
      return;
    }

    if (!userStake?.canClaim) {
      toast.error('Your stake is not yet eligible for claim');
      return;
    }

    setLoading(true);

    try {
      const result = await requestOffchainClaim(publicKey);

      toast.success('Claim request submitted. Payout will be processed by Affidex Lab.');
      
      await loadData();
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.error(error?.message || 'Failed to request claim');
    } finally {
      setLoading(false);
    }
  };

  const selectedPeriod = LOCK_PERIODS.find(p => p.id === selectedLockPeriod);
  const amountNumber = stakeAmount ? parseFloat(stakeAmount) : 0;
  const estimatedRewards = amountNumber > 0 ? calculateRewards(amountNumber, selectedLockPeriod) : 0;
  const estimatedNetReturn = amountNumber > 0 ? calculateNetReturn(amountNumber, selectedLockPeriod) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27]">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="/" className="block" style={{ maxWidth: '140px' }}>
                <img
                  src="/images/branding/wordmark-1120.png"
                  alt="DecaFlow"
                  className="w-full h-auto"
                />
              </a>
              <div className="ml-2">
                <h1 className="text-3xl font-bold text-white">VDM Staking</h1>
                <p className="text-sm text-gray-400">VDM staking powered by DecaFlow × VDM</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              {publicKey && (
                <>
                  <p className="text-xs text-gray-400">VDM Balance</p>
                  <p className="text-lg font-bold text-white">{vdmBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </>
              )}
            </div>
            <WalletMultiButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#3396FF]/20 to-[#47A1FF]/10 backdrop-blur-xl border border-[#3396FF]/30 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Total Staked</p>
            <p className="text-3xl font-bold text-white">{poolStats?.totalStaked?.toLocaleString() || '0'} VDM</p>
            <p className="text-xs text-green-400 mt-1">↑ {poolStats?.totalStakers || 0} stakers</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Total Rewards Distributed</p>
            <p className="text-3xl font-bold text-white">{poolStats?.totalRewardsDistributed?.toLocaleString() || '0'} USDT</p>
            <p className="text-xs text-gray-400 mt-1">Since launch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!userStake?.hasStaked || userStake?.hasClaimed ? (
            <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Stake VDM Tokens</h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-xs text-blue-100 mb-4">
                  <p className="font-semibold mb-1">Important staking information</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>VDM tokens are held securely in a custodial staking wallet during the lock period.</li>
                    <li>Staking logic and rewards are managed by DecaFlow infrastructure.</li>
                    <li>Rewards are paid in USDT to maximize flexibility and minimize volatility.</li>
                    <li>This version is fully managed by the DecaFlow × VDM team.</li>
                    <li>Payouts are processed by the VDM / Affidex team.</li>
                  </ul>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Select Lock Period</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {LOCK_PERIODS.map((period) => (
                      <button
                        key={period.id}
                        onClick={() => setSelectedLockPeriod(period.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedLockPeriod === period.id
                            ? 'border-[#47A1FF] bg-[#47A1FF]/10'
                            : 'border-gray-700 hover:border-gray-600 bg-[#0A0E27]/50'
                        }`}
                      >
                        <p className="text-xs text-gray-400">{period.label}</p>
                        <p className="text-2xl font-bold text-[#47A1FF]">{period.apy}%</p>
                        <p className="text-xs text-gray-500">APY (annualized)</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">VDM Amount</label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#47A1FF] focus:outline-none"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Balance: {vdmBalance.toLocaleString()} VDM</span>
                    <button
                      onClick={() => setStakeAmount(vdmBalance.toString())}
                      className="text-[#47A1FF] hover:underline"
                    >
                      Max
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {MIN_STAKE_AMOUNT.toLocaleString()} VDM
                  </p>
                </div>

                {amountNumber > 0 && (
                  <div className="bg-[#0A0E27]/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Deposit Fee (2.5%)</span>
                      <span className="text-red-400">-{calculateDepositFee(amountNumber).toFixed(2)} VDM</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Estimated Rewards ({selectedPeriod?.apy}% APY)</span>
                      <span className="text-green-400">+{estimatedRewards.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Withdrawal Fee (1.5%)</span>
                      <span className="text-red-400">-{calculateWithdrawalFee(amountNumber - calculateDepositFee(amountNumber)).toFixed(2)} VDM</span>
                    </div>
                    <div className="flex justify-between text-white font-medium pt-2 border-t border-gray-700">
                      <span>Net Staked VDM</span>
                      <span className="text-white">{(amountNumber - calculateDepositFee(amountNumber) - calculateWithdrawalFee(amountNumber - calculateDepositFee(amountNumber))).toFixed(2)} VDM</span>
                    </div>
                    <div className="flex justify-between text-white font-medium">
                      <span>Estimated USDT Rewards</span>
                      <span className="text-green-400">{estimatedRewards.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>Lock Period</span>
                      <span className="text-white">{selectedPeriod?.months} months</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStake}
                  disabled={loading || !publicKey || !amountNumber || amountNumber < MIN_STAKE_AMOUNT}
                  className="w-full py-3 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Stake Now'}
                </button>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-100">
                  <p className="font-semibold mb-1">ℹ️ How it works</p>
                  <p>• Click "Stake Now" and approve the transaction in your wallet popup</p>
                  <p>• VDM will be transferred securely to the custodial staking wallet</p>
                  <p>• Your stake will be registered automatically after confirmation</p>
                  <p>• Rewards are calculated and paid in USDT at maturity</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Stake</h2>
              
              <div className="space-y-4">
                <div className="bg-[#0A0E27]/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-400">Staked Amount</p>
                    <p className="text-2xl font-bold text-white">{userStake?.amountStaked.toLocaleString()} VDM</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Lock Period</span>
                      <span className="text-white">{LOCK_PERIODS.find(p => p.id === userStake?.lockPeriod)?.label}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>APY</span>
                      <span className="text-[#47A1FF] font-bold">{userStake?.apy}%</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Allocated Rewards</span>
                      <span className="text-green-400">{userStake?.rewardsAllocated.toLocaleString()} USDT</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Start Date</span>
                      <span className="text-white">{new Date(userStake?.startTimestamp * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Unlock Date</span>
                      <span className="text-white">{new Date(userStake?.unlockTimestamp * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Days Remaining</span>
                      <span className={userStake?.daysRemaining === 0 ? 'text-green-400 font-bold' : 'text-white'}>
                        {userStake?.daysRemaining || 0} days
                      </span>
                    </div>
                  </div>
                </div>

                {userStake?.canClaim ? (
                  <div className="space-y-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-green-400 font-medium mb-2">✅ Eligible for claim</p>
                      <p className="text-xs text-gray-300">Your claim request will be processed by Affidex Lab / VDM. You will receive your VDM (minus withdrawal fee) plus USDT rewards directly to your wallet.</p>
                    </div>
                    <button
                      onClick={handleClaim}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Request Claim'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
                    <p className="font-medium mb-1">🔒 Stake Locked</p>
                    <p>Your stake is locked until the unlock date. Claim requests will be available once the lock period ends.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">About VDM Staking</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#47A1FF]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#47A1FF]">📊</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">High APY Returns in USDT</p>
                    <p className="text-gray-400 text-xs">Earn 4–16% APY in USDT based on your chosen lock period.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400">⚡</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">One-Click Staking</p>
                    <p className="text-gray-400 text-xs">Just approve the transaction in your wallet. VDM transfers directly to staking wallet.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400">🔒</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Time-Locked Security</p>
                    <p className="text-gray-400 text-xs">Choose 3, 6, 9, or 12 month lock periods. No early unstaking.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">💰</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Secure Custody</p>
                    <p className="text-gray-400 text-xs">VDM tokens are held securely in a custodial wallet managed by the team.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400">🛡️</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Staking Management</p>
                    <p className="text-gray-400 text-xs">All staking logic and balances are managed by DecaFlow infrastructure.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Fee Structure</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0A0E27]/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Deposit Fee</span>
                  <span className="text-white font-medium">2.5%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#0A0E27]/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Withdrawal Fee</span>
                  <span className="text-white font-medium">1.5%</span>
                </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-[#3396FF]/10 to-[#47A1FF]/10 rounded-lg border border-[#47A1FF]/30">
                  <p className="text-xs text-gray-400 mb-1">Fees collected by:</p>
                  <p className="text-xs text-gray-300">Affidex Lab (DecaFlow Protocol)</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3396FF]/20 to-[#47A1FF]/10 backdrop-blur-xl border border-[#47A1FF]/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Partnership</h3>
              <p className="text-sm text-gray-300 mb-4">
                This staking program is a collaboration between DecaFlow (Affidex Lab) and VDM, powered by DecaFlow staking infrastructure.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <img src="/images/branding/wordmark-1120.png" alt="DecaFlow" className="h-10 w-auto" />
                  <span className="text-xs text-gray-400">DecaFlow Protocol</span>
                </div>
                <span className="text-2xl text-[#47A1FF]">×</span>
                <div className="flex flex-col items-center gap-2">
                  <img src="/images/vdm-logo.jpg" alt="VDM" className="w-12 h-12 object-contain" />
                  <span className="text-xs text-gray-400">VDM Token</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
