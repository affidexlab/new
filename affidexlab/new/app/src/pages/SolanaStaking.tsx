import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import {
  LOCK_PERIODS,
  LockPeriod,
  MIN_STAKE_AMOUNT,
  MAX_STAKE_AMOUNT,
  calculateDepositFee,
  calculateWithdrawalFee,
  calculateRewards,
  calculateNetReturn,
  getVDMTokenBalance,
  getUserStake,
  getPoolStats,
  stakeTokens,
  claimStake,
  UserStake,
  PoolStats,
} from '../lib/solanaStaking';

export default function SolanaStaking() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [selectedLockPeriod, setSelectedLockPeriod] = useState<LockPeriod>(LockPeriod.TwelveMonths);
  const [stakeAmount, setStakeAmount] = useState('');
  const [vdmBalance, setVdmBalance] = useState(0);
  const [userStake, setUserStake] = useState<UserStake | null>(null);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
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
      setPoolStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleStake = async () => {
    if (!publicKey || !signTransaction) {
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

    if (amount > MAX_STAKE_AMOUNT) {
      toast.error(`Maximum stake is ${MAX_STAKE_AMOUNT.toLocaleString()} VDM`);
      return;
    }

    if (amount > vdmBalance) {
      toast.error('Insufficient VDM balance');
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

      toast.info(`Staking ${netStake.toFixed(2)} VDM (${depositFee.toFixed(2)} VDM fee)`);

      const signature = await stakeTokens(
        connection,
        publicKey,
        amount,
        selectedLockPeriod,
        signTransaction
      );

      toast.success(`Successfully staked! TX: ${signature.substring(0, 8)}...`);
      
      setStakeAmount('');
      await loadData();
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.error(error?.message || 'Failed to stake tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your Solana wallet');
      return;
    }

    if (!userStake?.canClaim) {
      toast.error('Your stake is not ready to claim yet');
      return;
    }

    setLoading(true);

    try {
      const signature = await claimStake(connection, publicKey, signTransaction);

      toast.success(`Successfully claimed! TX: ${signature.substring(0, 8)}...`);
      
      await loadData();
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.error(error?.message || 'Failed to claim stake');
    } finally {
      setLoading(false);
    }
  };

  const selectedPeriod = LOCK_PERIODS.find(p => p.id === selectedLockPeriod);
  const estimatedRewards = stakeAmount ? calculateRewards(parseFloat(stakeAmount), selectedLockPeriod) : 0;
  const estimatedNetReturn = stakeAmount ? calculateNetReturn(parseFloat(stakeAmount), selectedLockPeriod) : 0;

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
                <p className="text-sm text-gray-400">Partnership: DecaFlow × VDM</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              {publicKey && (
                <>
                  <p className="text-xs text-gray-400">VDM Balance</p>
                  <p className="text-lg font-bold text-white">{vdmBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                </>
              )}
            </div>
            <WalletMultiButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#3396FF]/20 to-[#47A1FF]/10 backdrop-blur-xl border border-[#3396FF]/30 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Total Staked</p>
            <p className="text-3xl font-bold text-white">{poolStats?.totalStaked.toLocaleString() || '0'} VDM</p>
            <p className="text-xs text-green-400 mt-1">↑ {poolStats?.totalStakers || 0} stakers</p>
          </div>
          
          <div className="bg-gradient-to-br from-[#47A1FF]/20 to-purple-500/10 backdrop-blur-xl border border-[#47A1FF]/30 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Rewards Pool Remaining</p>
            <p className="text-3xl font-bold text-white">{poolStats?.rewardsPoolRemaining.toLocaleString() || '150M'} VDM</p>
            <p className="text-xs text-yellow-400 mt-1">Available for distribution</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Total Rewards Distributed</p>
            <p className="text-3xl font-bold text-white">{poolStats?.totalRewardsDistributed.toLocaleString() || '0'} VDM</p>
            <p className="text-xs text-gray-400 mt-1">Since launch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!userStake?.hasStaked || userStake?.hasClaimed ? (
            <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Stake VDM Tokens</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Select Lock Period</label>
                  <div className="grid grid-cols-3 gap-3">
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
                        <p className="text-xs text-gray-500">APY</p>
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
                    Min: {MIN_STAKE_AMOUNT.toLocaleString()} VDM | Max: {MAX_STAKE_AMOUNT.toLocaleString()} VDM
                  </p>
                </div>

                {stakeAmount && parseFloat(stakeAmount) > 0 && (
                  <div className="bg-[#0A0E27]/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Deposit Fee (2.5%)</span>
                      <span className="text-red-400">-{calculateDepositFee(parseFloat(stakeAmount)).toFixed(2)} VDM</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Estimated Rewards ({selectedPeriod?.apy}% APY)</span>
                      <span className="text-green-400">+{estimatedRewards.toFixed(2)} VDM</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Withdrawal Fee (1.5%)</span>
                      <span className="text-red-400">-{calculateWithdrawalFee(parseFloat(stakeAmount) - calculateDepositFee(parseFloat(stakeAmount))).toFixed(2)} VDM</span>
                    </div>
                    <div className="flex justify-between text-white font-medium pt-2 border-t border-gray-700">
                      <span>Estimated Net Return</span>
                      <span className="text-green-400">{estimatedNetReturn.toFixed(2)} VDM</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>Lock Period</span>
                      <span className="text-white">{selectedPeriod?.months} months</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStake}
                  disabled={loading || !publicKey}
                  className="w-full py-3 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Stake Tokens'}
                </button>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-300">
                  <p className="font-medium mb-1">⚠️ Important:</p>
                  <p>• One stake per wallet</p>
                  <p>• No early unstaking - locked until maturity</p>
                  <p>• Claim your stake + rewards after lock period ends</p>
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
                      <span className="text-green-400">{userStake?.rewardsAllocated.toLocaleString()} VDM</span>
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
                      <p className="text-green-400 font-medium mb-2">✅ Your stake is ready to claim!</p>
                      <p className="text-sm text-gray-300">You will receive:</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Principal (minus withdrawal fee)</span>
                          <span className="text-white">
                            {(userStake.amountStaked - calculateWithdrawalFee(userStake.amountStaked)).toLocaleString()} VDM
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rewards</span>
                          <span className="text-green-400">{userStake.rewardsAllocated.toLocaleString()} VDM</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-green-500/30">
                          <span className="text-white">Total</span>
                          <span className="text-green-400">
                            {(userStake.amountStaked - calculateWithdrawalFee(userStake.amountStaked) + userStake.rewardsAllocated).toLocaleString()} VDM
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleClaim}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Claim Stake + Rewards'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
                    <p className="font-medium mb-1">🔒 Stake Locked</p>
                    <p>Your stake will be available to claim after {userStake?.daysRemaining} days.</p>
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
                    <p className="text-white font-medium">High APY Returns</p>
                    <p className="text-gray-400 text-xs">Earn 8-16% APY based on your chosen lock period</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400">🔒</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Time-Locked Security</p>
                    <p className="text-gray-400 text-xs">Choose 6, 9, or 12 month lock periods - no early unstaking</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">💰</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Simple Single-Token Staking</p>
                    <p className="text-gray-400 text-xs">Stake only VDM - no need for SOL or USDC pairs</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400">🛡️</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Audited & Secure</p>
                    <p className="text-gray-400 text-xs">Built on Solana with battle-tested smart contracts</p>
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
                This staking pool is a collaboration between DecaFlow (Affidex Lab) and VDM, bringing DeFi opportunities to the VDM community.
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
