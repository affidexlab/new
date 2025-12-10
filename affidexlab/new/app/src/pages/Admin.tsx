import { useState, useEffect } from 'react';
import { Shield, Award, TrendingUp, Gift, Settings, Database, Calendar } from 'lucide-react';

interface TopPerformer {
  wallet_address: string;
  rank: number;
  points: string;
  total_volume_usd: string;
  transaction_count: number;
}

interface Multiplier {
  id: number;
  name: string;
  description: string;
  multiplier: string;
  transaction_type: string;
  min_amount_usd: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.decaflow.xyz';

export default function Admin() {
  const [weeklyTop, setWeeklyTop] = useState<TopPerformer[]>([]);
  const [monthlyTop, setMonthlyTop] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  
  const [multiplierForm, setMultiplierForm] = useState({
    name: '',
    description: '',
    multiplier: '1.5',
    transactionType: '',
    minAmountUSD: '100',
    startDate: '',
    endDate: '',
    active: true
  });

  const [rewardForm, setRewardForm] = useState({
    periodType: 'weekly',
    periodStart: '',
    periodEnd: '',
    topN: 10
  });

  useEffect(() => {
    fetchTopPerformers();
  }, []);

  const fetchTopPerformers = async () => {
    setLoading(true);
    try {
      const [weeklyRes, monthlyRes] = await Promise.all([
        fetch(`${API_BASE}/v1/points/top-performers?period=weekly&limit=20`),
        fetch(`${API_BASE}/v1/points/top-performers?period=monthly&limit=20`)
      ]);

      const weeklyData = await weeklyRes.json();
      const monthlyData = await monthlyRes.json();

      if (weeklyData.success) setWeeklyTop(weeklyData.data.performers);
      if (monthlyData.success) setMonthlyTop(monthlyData.data.performers);
    } catch (error) {
      console.error('Failed to fetch top performers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMultiplier = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/points/admin/multiplier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(multiplierForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Multiplier created successfully!');
        setMultiplierForm({
          name: '',
          description: '',
          multiplier: '1.5',
          transactionType: '',
          minAmountUSD: '100',
          startDate: '',
          endDate: '',
          active: true
        });
      }
    } catch (error) {
      console.error('Failed to create multiplier:', error);
      alert('Failed to create multiplier');
    }
  };

  const distributeRewards = async () => {
    const performers = activeTab === 'weekly' ? weeklyTop : monthlyTop;
    const rewardAmounts = activeTab === 'weekly' 
      ? [2000, 1200, 800, 400, 300, 200, 150, 100, 75, 75]
      : [8000, 5000, 3000, 1500, 1000, 800, 600, 400, 300, 200];

    try {
      const rewards = performers.slice(0, rewardForm.topN).map((performer, index) => ({
        walletAddress: performer.wallet_address,
        periodType: rewardForm.periodType,
        periodStart: rewardForm.periodStart,
        periodEnd: rewardForm.periodEnd,
        rank: performer.rank,
        points: parseFloat(performer.points),
        rewardAmountUSD: rewardAmounts[index] || 100,
        status: 'pending'
      }));

      const responses = await Promise.all(
        rewards.map(reward =>
          fetch(`${API_BASE}/v1/points/admin/reward`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reward)
          })
        )
      );

      const allSuccessful = responses.every(r => r.ok);
      if (allSuccessful) {
        alert(`Successfully distributed rewards to top ${rewardForm.topN} performers!`);
      } else {
        alert('Some rewards failed to distribute');
      }
    } catch (error) {
      console.error('Failed to distribute rewards:', error);
      alert('Failed to distribute rewards');
    }
  };

  const createAirdropSnapshot = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/points/admin/airdrop/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Airdrop snapshot created! ${data.data.snapshot_count} eligible wallets`);
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      alert('Failed to create snapshot');
    }
  };

  const updateAirdropEligibility = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/points/admin/airdrop/update-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Updated airdrop eligibility! ${data.data.eligible_count} eligible wallets`);
      }
    } catch (error) {
      console.error('Failed to update eligibility:', error);
      alert('Failed to update eligibility');
    }
  };

  const refreshLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/leaderboard/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Leaderboard cache refreshed successfully!');
        fetchTopPerformers();
      }
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
      alert('Failed to refresh leaderboard');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0f1435] to-[#0A0E27] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Manage rewards, multipliers, and airdrops</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Database Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={refreshLeaderboard}
                className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all font-medium"
              >
                Refresh Leaderboard
              </button>
              <button
                onClick={updateAirdropEligibility}
                className="w-full px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all font-medium"
              >
                Update Airdrop Eligibility
              </button>
              <button
                onClick={createAirdropSnapshot}
                className="w-full px-4 py-3 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all font-medium"
              >
                Create Airdrop Snapshot
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Create Multiplier Event</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Event Name"
                value={multiplierForm.name}
                onChange={(e) => setMultiplierForm({ ...multiplierForm, name: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Multiplier (e.g., 2.0)"
                value={multiplierForm.multiplier}
                onChange={(e) => setMultiplierForm({ ...multiplierForm, multiplier: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <select
                value={multiplierForm.transactionType}
                onChange={(e) => setMultiplierForm({ ...multiplierForm, transactionType: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="">All Types</option>
                <option value="swap">Swap</option>
                <option value="bridge">Bridge</option>
                <option value="liquidity_add">Liquidity Add</option>
              </select>
              <input
                type="number"
                placeholder="Min Amount USD"
                value={multiplierForm.minAmountUSD}
                onChange={(e) => setMultiplierForm({ ...multiplierForm, minAmountUSD: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <input
                type="datetime-local"
                placeholder="Start Date"
                value={multiplierForm.startDate}
                onChange={(e) => setMultiplierForm({ ...multiplierForm, startDate: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <input
                type="datetime-local"
                placeholder="End Date"
                value={multiplierForm.endDate}
                onChange={(e) => setMultiplierForm({ ...multiplierForm, endDate: e.target.value })}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <textarea
                placeholder="Description"
                value={multiplierForm.description}
                onChange={(e) => setMultiplierForm({ ...multiplierForm, description: e.target.value })}
                className="md:col-span-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                rows={2}
              />
              <button
                onClick={createMultiplier}
                className="md:col-span-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Create Multiplier Event
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold">Top Performers</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'weekly'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'monthly'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Wallet</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Points</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Volume</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Txs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {(activeTab === 'weekly' ? weeklyTop : monthlyTop).map((performer) => (
                    <tr key={performer.wallet_address} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-bold">#{performer.rank}</td>
                      <td className="px-4 py-3 font-mono text-sm">{formatAddress(performer.wallet_address)}</td>
                      <td className="px-4 py-3 text-right text-purple-400 font-semibold">
                        {formatNumber(performer.points)}
                      </td>
                      <td className="px-4 py-3 text-right">${formatNumber(performer.total_volume_usd)}</td>
                      <td className="px-4 py-3 text-right">{performer.transaction_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold">Distribute Rewards</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <select
              value={rewardForm.periodType}
              onChange={(e) => setRewardForm({ ...rewardForm, periodType: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <input
              type="date"
              value={rewardForm.periodStart}
              onChange={(e) => setRewardForm({ ...rewardForm, periodStart: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
              placeholder="Period Start"
            />
            <input
              type="date"
              value={rewardForm.periodEnd}
              onChange={(e) => setRewardForm({ ...rewardForm, periodEnd: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
              placeholder="Period End"
            />
            <input
              type="number"
              min="1"
              max="20"
              value={rewardForm.topN}
              onChange={(e) => setRewardForm({ ...rewardForm, topN: parseInt(e.target.value) })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
              placeholder="Top N"
            />
          </div>
          <button
            onClick={distributeRewards}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Distribute Rewards to Top {rewardForm.topN} Performers
          </button>
        </div>
      </div>
    </div>
  );
}
