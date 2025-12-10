import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface LeaderboardEntry {
  wallet_address: string;
  rank: number;
  points: string;
  volume_usd: string;
  transaction_count: number;
  last_updated: string;
}

type Period = 'all' | 'weekly' | 'monthly';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.decaflow.xyz';

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/v1/leaderboard?period=${period}&limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.data.leaderboard);
        setLastUpdated(data.data.lastUpdated);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
    }
    if (rank <= 10) {
      return 'bg-gradient-to-r from-[#3396FF]/20 to-[#47A1FF]/20 border-[#3396FF]/50';
    }
    return 'bg-gray-800/50 border-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0f1435] to-[#0A0E27] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#3396FF] to-[#47A1FF] rounded-xl">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#3396FF] to-[#47A1FF] bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <p className="text-gray-400 mt-1">Compete for weekly and monthly rewards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#3396FF]/10 to-[#47A1FF]/10 border border-[#3396FF]/20 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-[#47A1FF]" />
                <div>
                  <p className="text-sm text-gray-400">Weekly Rewards</p>
                  <p className="text-2xl font-bold">$$ Cash Prizes</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Monthly Rewards</p>
                  <p className="text-2xl font-bold">$$ Cash Prizes</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Active Traders</p>
                  <p className="text-2xl font-bold">{leaderboard.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPeriod('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                period === 'all'
                  ? 'bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                period === 'weekly'
                  ? 'bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                period === 'monthly'
                  ? 'bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#47A1FF]"></div>
          </div>
        ) : (
          <>
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Wallet</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Points</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Volume</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.wallet_address}
                        className={`border transition-all hover:bg-gray-800/30 ${getRankBadge(entry.rank)}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(entry.rank)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm">
                            {formatAddress(entry.wallet_address)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-lg text-[#47A1FF]">
                            {formatNumber(entry.points)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-300">
                            ${formatNumber(entry.volume_usd)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-400">
                            {entry.transaction_count}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {lastUpdated && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}

            <div className="mt-8 bg-gradient-to-br from-[#3396FF]/10 to-[#47A1FF]/10 border border-[#3396FF]/20 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Cash Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-[#47A1FF] mb-2">Weekly Top Performers</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>🥇 Top 10 traders receive USD rewards</li>
                    <li>💸 Payouts scale by weekly rank</li>
                    <li>🔁 Distributed every week</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[#3396FF] mb-2">Monthly Top Performers</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>🥇 Top 20 traders earn bonus USD rewards</li>
                    <li>💸 Rewards scale by monthly rank</li>
                    <li>🔁 Distributed every month</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-200">
                  💰 <strong>Airdrop Eligibility:</strong> Users with 1,000+ points and 5+ transactions qualify for the 2026 token airdrop!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
