import { useState, useEffect } from 'react';
import { Shield, Wallet, TrendingUp, DollarSign, ArrowDownCircle, ArrowUpCircle, CheckCircle, Clock, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ClaimRequest {
  id: number;
  wallet: string;
  principal_amount: number;
  rewards_amount: number;
  status: string;
  requested_at: string;
}

interface StakePosition {
  id: number;
  wallet: string;
  staked_amount: number;
  pending_rewards: number;
  lock_period: string;
  staked_at: string;
  unlock_timestamp: string;
  status: string;
}

interface PoolStats {
  totalStaked: number;
  totalStakers: number;
  totalRewardsDistributed: number;
}

interface Investment {
  id?: number;
  amount: number;
  description: string;
  invested_at: string;
  status: 'active' | 'closed';
  returns?: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';
const ADMIN_PASSWORD = 'vdm-admin-2025';

export default function VDMAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const [stakePositions, setStakePositions] = useState<StakePosition[]>([]);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'claims' | 'positions' | 'investments'>('claims');

  const [investmentForm, setInvestmentForm] = useState({
    amount: '',
    description: '',
    platform: '',
  });

  const [returnForm, setReturnForm] = useState({
    investmentId: '',
    returns: '',
  });

  useEffect(() => {
    if (authenticated) {
      fetchAllData();
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
      toast.success('Admin authenticated');
    } else {
      toast.error('Invalid password');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [claimsRes, positionsRes, statsRes, investmentsRes] = await Promise.all([
        fetch(`${API_BASE}/v1/solana-staking/admin/claims`),
        fetch(`${API_BASE}/v1/solana-staking/admin/positions`),
        fetch(`${API_BASE}/v1/solana-staking/pool-stats`),
        fetch(`${API_BASE}/v1/solana-staking/admin/investments`),
      ]);

      const claimsData = await claimsRes.json();
      const positionsData = await positionsRes.json();
      const statsData = await statsRes.json();
      const investmentsData = await investmentsRes.json();

      if (claimsData.success) setClaimRequests(claimsData.data);
      if (positionsData.success) setStakePositions(positionsData.data);
      if (statsData.success) setPoolStats(statsData.data);
      if (investmentsData.success) setInvestments(investmentsData.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const markClaimAsPaid = async (claimId: number, wallet: string) => {
    if (!confirm(`Mark claim for ${wallet.slice(0, 8)}...${wallet.slice(-6)} as paid?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/solana-staking/admin/claims/${claimId}/paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Claim marked as paid');
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to mark claim as paid');
      }
    } catch (error) {
      console.error('Failed to mark claim as paid:', error);
      toast.error('Failed to mark claim as paid');
    }
  };

  const createInvestment = async () => {
    const amount = parseFloat(investmentForm.amount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!investmentForm.description || !investmentForm.platform) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/solana-staking/admin/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: `${investmentForm.platform}: ${investmentForm.description}`,
          status: 'active',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Investment recorded');
        setInvestmentForm({ amount: '', description: '', platform: '' });
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to record investment');
      }
    } catch (error) {
      console.error('Failed to record investment:', error);
      toast.error('Failed to record investment');
    }
  };

  const recordReturns = async () => {
    const investmentId = parseInt(returnForm.investmentId);
    const returns = parseFloat(returnForm.returns);

    if (!investmentId || !returns) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/solana-staking/admin/investments/${investmentId}/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returns }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Returns recorded');
        setReturnForm({ investmentId: '', returns: '' });
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to record returns');
      }
    } catch (error) {
      console.error('Failed to record returns:', error);
      toast.error('Failed to record returns');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  const getTotalInvested = () => {
    return investments
      .filter(inv => inv.status === 'active')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const getTotalReturns = () => {
    return investments
      .reduce((sum, inv) => sum + (inv.returns || 0), 0);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0f1435] to-[#0A0E27] flex items-center justify-center p-4">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            VDM Staking Admin
          </h1>
          <p className="text-gray-400 text-center mb-6">Enter admin password to continue</p>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Admin password"
              className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#47A1FF] focus:outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0f1435] to-[#0A0E27] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  VDM Staking Admin
                </h1>
                <p className="text-gray-400 mt-1">Manage claims, investments, and pool funds</p>
              </div>
            </div>
            <button
              onClick={() => setAuthenticated(false)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-gray-400">Total Staked</p>
            </div>
            <p className="text-3xl font-bold text-white">{poolStats?.totalStaked?.toLocaleString() || '0'} VDM</p>
            <p className="text-xs text-gray-400 mt-1">{poolStats?.totalStakers || 0} stakers</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Rewards Distributed</p>
            </div>
            <p className="text-3xl font-bold text-white">{poolStats?.totalRewardsDistributed?.toLocaleString() || '0'} USDT</p>
            <p className="text-xs text-gray-400 mt-1">Total paid out</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-gray-400">Active Investments</p>
            </div>
            <p className="text-3xl font-bold text-white">{getTotalInvested().toLocaleString()} USDT</p>
            <p className="text-xs text-gray-400 mt-1">Currently invested</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-xl border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpCircle className="w-5 h-5 text-orange-400" />
              <p className="text-sm text-gray-400">Investment Returns</p>
            </div>
            <p className="text-3xl font-bold text-white">{getTotalReturns().toLocaleString()} USDT</p>
            <p className="text-xs text-gray-400 mt-1">Total returns earned</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg border border-gray-800">
            <button
              onClick={() => setActiveTab('claims')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'claims' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending Claims
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'positions' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Positions
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'investments' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Investments
            </button>
          </div>
        </div>

        {activeTab === 'claims' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-semibold">Pending Claim Requests</h3>
                <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium">
                  {claimRequests.filter(c => c.status === 'requested').length} pending
                </span>
              </div>

              {claimRequests.filter(c => c.status === 'requested').length === 0 ? (
                <p className="text-gray-400 text-center py-8">No pending claims</p>
              ) : (
                <div className="space-y-3">
                  {claimRequests
                    .filter(c => c.status === 'requested')
                    .map((claim) => (
                      <div key={claim.id} className="bg-[#0A0E27] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-mono text-sm text-blue-400">{formatAddress(claim.wallet)}</p>
                              <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 text-xs">
                                Pending
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400 text-xs">Principal (VDM)</p>
                                <p className="text-white font-medium">{claim.principal_amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">Rewards (USDT)</p>
                                <p className="text-green-400 font-medium">{claim.rewards_amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">Requested At</p>
                                <p className="text-white font-medium">{formatDate(claim.requested_at)}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => markClaimAsPaid(claim.id, claim.wallet)}
                            className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Paid
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold">All Staking Positions</h3>
                <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium">
                  {stakePositions.length} total
                </span>
              </div>

              {stakePositions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No staking positions</p>
              ) : (
                <div className="space-y-3">
                  {stakePositions.map((position) => {
                    const unlockDate = new Date(parseInt(position.unlock_timestamp));
                    const isUnlocked = Date.now() >= parseInt(position.unlock_timestamp);
                    
                    return (
                      <div key={position.id} className="bg-[#0A0E27] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <p className="font-mono text-sm text-blue-400">{formatAddress(position.wallet)}</p>
                          <span className={`px-2 py-0.5 border rounded text-xs ${
                            position.status === 'active' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                            position.status === 'claim_requested' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                            'bg-gray-500/20 border-gray-500/30 text-gray-400'
                          }`}>
                            {position.status}
                          </span>
                          {isUnlocked && position.status === 'active' && (
                            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Staked Amount</p>
                            <p className="text-white font-medium">{position.staked_amount.toLocaleString()} VDM</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Rewards (USDT)</p>
                            <p className="text-green-400 font-medium">{position.pending_rewards.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Lock Period</p>
                            <p className="text-white font-medium">{position.lock_period.replace('Months', ' months')}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Staked At</p>
                            <p className="text-white font-medium">{formatDate(position.staked_at)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Unlock Date</p>
                            <p className="text-white font-medium">{unlockDate.toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ArrowDownCircle className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold">Record New Investment</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Platform</label>
                    <input
                      type="text"
                      value={investmentForm.platform}
                      onChange={(e) => setInvestmentForm({ ...investmentForm, platform: e.target.value })}
                      placeholder="e.g., Uniswap, Aave, Compound"
                      className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#47A1FF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount (USDT)</label>
                    <input
                      type="number"
                      value={investmentForm.amount}
                      onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#47A1FF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                    <textarea
                      value={investmentForm.description}
                      onChange={(e) => setInvestmentForm({ ...investmentForm, description: e.target.value })}
                      placeholder="Details about the investment"
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#47A1FF] focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={createInvestment}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Record Investment
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ArrowUpCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-semibold">Record Returns</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Investment ID</label>
                    <select
                      value={returnForm.investmentId}
                      onChange={(e) => setReturnForm({ ...returnForm, investmentId: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#47A1FF] focus:outline-none"
                    >
                      <option value="">Select investment</option>
                      {investments
                        .filter(inv => inv.status === 'active')
                        .map(inv => (
                          <option key={inv.id} value={inv.id}>
                            #{inv.id} - {inv.description} ({inv.amount} USDT)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Returns (USDT)</label>
                    <input
                      type="number"
                      value={returnForm.returns}
                      onChange={(e) => setReturnForm({ ...returnForm, returns: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-[#0A0E27] border border-gray-700 rounded-lg text-white focus:border-[#47A1FF] focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={recordReturns}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Record Returns
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-orange-400" />
                <h3 className="text-xl font-semibold">Investment History</h3>
              </div>

              {investments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No investments recorded</p>
              ) : (
                <div className="space-y-3">
                  {investments.map((investment) => (
                    <div key={investment.id} className="bg-[#0A0E27] border border-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">ID #{investment.id}</span>
                        <span className={`px-2 py-0.5 border rounded text-xs ${
                          investment.status === 'active' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                          'bg-gray-500/20 border-gray-500/30 text-gray-400'
                        }`}>
                          {investment.status}
                        </span>
                      </div>
                      <p className="text-white font-medium mb-2">{investment.description}</p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Invested</p>
                          <p className="text-white font-medium">{investment.amount.toLocaleString()} USDT</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Returns</p>
                          <p className="text-green-400 font-medium">
                            {investment.returns ? `+${investment.returns.toLocaleString()} USDT` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">ROI</p>
                          <p className="text-orange-400 font-medium">
                            {investment.returns ? `${((investment.returns / investment.amount) * 100).toFixed(2)}%` : '-'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(investment.invested_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
