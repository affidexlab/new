import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import {
  STAKING_POOLS,
  calculateNetApy,
  calculateDepositFee,
  calculateWithdrawalFee,
  calculateRewards,
  getVDMTokenBalance,
  getSOLBalance,
  getUserStakingPositions,
  stakeTokens,
  unstakeTokens,
  claimRewards,
  getPoolStats,
  UserStakingPosition,
  StakingPool,
  STAKING_FEES,
} from '../lib/solanaStaking';

export default function SolanaStaking() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [selectedPool, setSelectedPool] = useState<StakingPool>(STAKING_POOLS[0]);
  const [vdmAmount, setVdmAmount] = useState('');
  const [pairAmount, setPairAmount] = useState('');
  const [vdmBalance, setVdmBalance] = useState(0);
  const [solBalance, setSOLBalance] = useState(0);
  const [positions, setPositions] = useState<UserStakingPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [poolStats, setPoolStats] = useState<any>({});

  useEffect(() => {
    if (publicKey) {
      loadBalances();
      loadPositions();
      loadPoolStats();
    }
  }, [publicKey]);

  const loadBalances = async () => {
    if (!publicKey) return;
    
    try {
      const [vdm, sol] = await Promise.all([
        getVDMTokenBalance(connection, publicKey),
        getSOLBalance(connection, publicKey),
      ]);
      
      setVdmBalance(vdm);
      setSOLBalance(sol);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const loadPositions = async () => {
    if (!publicKey) return;
    
    try {
      const userPositions = await getUserStakingPositions(connection, publicKey);
      setPositions(userPositions);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const loadPoolStats = async () => {
    try {
      const stats = await Promise.all(
        STAKING_POOLS.map(pool => getPoolStats(pool.id))
      );
      
      const statsMap: any = {};
      STAKING_POOLS.forEach((pool, idx) => {
        statsMap[pool.id] = stats[idx];
      });
      
      setPoolStats(statsMap);
    } catch (error) {
      console.error('Error loading pool stats:', error);
    }
  };

  const handleStake = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your Solana wallet');
      return;
    }

    const vdm = parseFloat(vdmAmount);
    const pair = parseFloat(pairAmount);

    if (!vdm || !pair || vdm <= 0 || pair <= 0) {
      toast.error('Please enter valid amounts');
      return;
    }

    if (vdm > vdmBalance) {
      toast.error('Insufficient VDM balance');
      return;
    }

    if (selectedPool.pairToken === 'SOL' && pair > solBalance) {
      toast.error('Insufficient SOL balance');
      return;
    }

    setLoading(true);

    try {
      const depositFee = calculateDepositFee(vdm);
      const netVdm = vdm - depositFee;

      toast.info(`Staking ${netVdm.toFixed(4)} VDM (${depositFee.toFixed(4)} VDM fee)`);

      const signature = await stakeTokens(
        connection,
        publicKey,
        selectedPool.id,
        vdm,
        pair,
        signTransaction
      );

      toast.success(`Successfully staked! TX: ${signature.substring(0, 8)}...`);
      
      setVdmAmount('');
      setPairAmount('');
      
      await Promise.all([loadBalances(), loadPositions(), loadPoolStats()]);
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.error(error?.message || 'Failed to stake tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async (position: UserStakingPosition) => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your Solana wallet');
      return;
    }

    setLoading(true);

    try {
      const withdrawalFee = calculateWithdrawalFee(position.stakedAmount);
      const netAmount = position.stakedAmount - withdrawalFee;

      toast.info(`Unstaking ${netAmount.toFixed(4)} VDM (${withdrawalFee.toFixed(4)} VDM fee)`);

      const signature = await unstakeTokens(
        connection,
        publicKey,
        position.poolId,
        position.lpTokens,
        signTransaction
      );

      toast.success(`Successfully unstaked! TX: ${signature.substring(0, 8)}...`);
      
      await Promise.all([loadBalances(), loadPositions(), loadPoolStats()]);
    } catch (error: any) {
      console.error('Unstake error:', error);
      toast.error(error?.message || 'Failed to unstake tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (position: UserStakingPosition) => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your Solana wallet');
      return;
    }

    if (position.pendingRewards <= 0) {
      toast.error('No rewards to claim');
      return;
    }

    setLoading(true);

    try {
      const signature = await claimRewards(
        connection,
        publicKey,
        position.poolId,
        signTransaction
      );

      toast.success(`Rewards claimed! TX: ${signature.substring(0, 8)}...`);
      
      await Promise.all([loadBalances(), loadPositions()]);
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.error(error?.message || 'Failed to claim rewards');
    } finally {
      setLoading(false);
    }
  };

  const totalStakedValue = positions.reduce((sum, pos) => sum + pos.stakedAmount, 0);
  const totalPendingRewards = positions.reduce((sum, pos) => sum + pos.pendingRewards, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27]">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center text-2xl font-bold text-white">
                V
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">VDM Staking</h1>
                <p className="text-sm text-gray-400">Powered by DecaFlow x VDM</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              {publicKey && (
                <>
                  <p className="text-xs text-gray-400">VDM Balance</p>
                  <p className="text-lg font-bold text-white">{vdmBalance.toFixed(2)}</p>
                </>
              )}
            </div>
            <WalletMultiButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#FF6B35]/20 to-[#F7931E]/10 backdrop-blur-xl border border-[#FF6B35]/30 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Total Staked Value</p>
            <p className="text-3xl font-bold text-white">${totalStakedValue.toFixed(2)}</p>
            <p className="text-xs text-green-400 mt-1">↑ Across all pools</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Pending Rewards</p>
            <p className="text-3xl font-bold text-white">{totalPendingRewards.toFixed(4)} VDM</p>
            <p className="text-xs text-yellow-400 mt-1">Daily compounding active</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">Active Positions</p>
            <p className="text-3xl font-bold text-white">{positions.length}</p>
            <p className="text-xs text-gray-400 mt-1">Across {STAKING_POOLS.length} pools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Staking Pools</h2>
            
            <div className="space-y-3 mb-6">
              {STAKING_POOLS.map((pool) => {
                const stats = poolStats[pool.id] || pool;
                const netApy = calculateNetApy(pool.baseApy);
                
                return (
                  <button
                    key={pool.id}
                    onClick={() => setSelectedPool(pool)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedPool.id === pool.id
                        ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                        : 'border-gray-700 hover:border-gray-600 bg-[#0A0E27]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-lg font-bold text-white">{pool.name}</p>
                        <p className="text-xs text-gray-400">TVL: ${stats.tvl?.toFixed(0) || '0'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#FF6B35]">{netApy.toFixed(1)}%</p>
                        <p className="text-xs text-gray-400">Net APY</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{stats.totalStakers || 0} stakers</span>
                      <span>Base: {pool.baseApy}% APY</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('stake')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    activeTab === 'stake'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  Stake
                </button>
                <button
                  onClick={() => setActiveTab('unstake')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    activeTab === 'unstake'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  My Positions
                </button>
              </div>

              {activeTab === 'stake' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">VDM Amount</label>
                    <input
                      type="number"
                      value={vdmAmount}
                      onChange={(e) => setVdmAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#FF6B35] focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Balance: {vdmBalance.toFixed(4)} VDM
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      {selectedPool.pairToken} Amount
                    </label>
                    <input
                      type="number"
                      value={pairAmount}
                      onChange={(e) => setPairAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#FF6B35] focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPool.pairToken === 'SOL' ? `Balance: ${solBalance.toFixed(4)} SOL` : 'Balance: 0.00 USDC'}
                    </p>
                  </div>

                  {vdmAmount && parseFloat(vdmAmount) > 0 && (
                    <div className="bg-[#0A0E27]/50 rounded-lg p-3 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Deposit Fee (2.5%)</span>
                        <span className="text-red-400">-{calculateDepositFee(parseFloat(vdmAmount)).toFixed(4)} VDM</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Performance Fee (10% of rewards)</span>
                        <span className="text-orange-400">Applied on rewards</span>
                      </div>
                      <div className="flex justify-between text-white font-medium pt-2 border-t border-gray-700">
                        <span>Net APY</span>
                        <span className="text-green-400">{calculateNetApy(selectedPool.baseApy).toFixed(2)}%</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleStake}
                    disabled={loading || !publicKey}
                    className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Stake Tokens'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {positions.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No active positions</p>
                  ) : (
                    positions.map((position, idx) => {
                      const pool = STAKING_POOLS.find(p => p.id === position.poolId);
                      const stakedDays = Math.floor((Date.now() - position.stakedAt) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={idx} className="bg-[#0A0E27]/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-bold text-white">{pool?.name}</p>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              {position.estimatedApy.toFixed(1)}% APY
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm mb-3">
                            <div className="flex justify-between text-gray-400">
                              <span>Staked</span>
                              <span className="text-white">{position.stakedAmount.toFixed(4)} VDM</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Pending Rewards</span>
                              <span className="text-yellow-400">{position.pendingRewards.toFixed(4)} VDM</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Staked Duration</span>
                              <span className="text-white">{stakedDays} days</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClaim(position)}
                              disabled={loading || position.pendingRewards <= 0}
                              className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Claim
                            </button>
                            <button
                              onClick={() => handleUnstake(position)}
                              disabled={loading}
                              className="flex-1 py-2 bg-red-600/80 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Unstake
                            </button>
                          </div>
                          
                          {position.stakedAmount > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              Withdrawal fee: {calculateWithdrawalFee(position.stakedAmount).toFixed(4)} VDM (1.5%)
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">About VDM Staking</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FF6B35]">📊</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">High APY Returns</p>
                    <p className="text-gray-400 text-xs">Earn up to 16% net APY on your VDM tokens through liquidity provision</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400">🔄</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Daily Auto-Compound</p>
                    <p className="text-gray-400 text-xs">Rewards automatically compound daily to maximize your returns</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">💰</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Flexible Staking</p>
                    <p className="text-gray-400 text-xs">No lock periods - stake and unstake anytime with instant settlement</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400">🛡️</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Audited & Secure</p>
                    <p className="text-gray-400 text-xs">Built on Raydium's battle-tested liquidity pools with robust security</p>
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
                
                <div className="flex items-center justify-between p-3 bg-[#0A0E27]/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Performance Fee</span>
                  <span className="text-white font-medium">10% of rewards</span>
                </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 rounded-lg border border-[#FF6B35]/30">
                  <p className="text-xs text-gray-400 mb-1">Performance fee split:</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">Affidex Lab: 7%</span>
                    <span className="text-[#FF6B35]">VDM Treasury: 3%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FF6B35]/20 to-[#F7931E]/10 backdrop-blur-xl border border-[#FF6B35]/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Partnership</h3>
              <p className="text-sm text-gray-300 mb-4">
                This staking pool is a collaboration between VDM and Affidex Lab through the DecaFlow Protocol, bringing DeFi opportunities to the VDM community.
              </p>
              <div className="flex items-center gap-4">
                <img src="/vdm-logo.png" alt="VDM" className="w-10 h-10 rounded-full" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <span className="text-2xl">×</span>
                <img src="/logo.png" alt="DecaFlow" className="w-10 h-10 rounded-full" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
