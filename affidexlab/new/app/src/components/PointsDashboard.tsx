import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Star, TrendingUp, Award, Gift, ExternalLink, History } from 'lucide-react';
import { useTransactionEvents } from '@/contexts/TransactionEventsContext';

interface UserPoints {
  wallet_address: string;
  total_points: string;
  weekly_points: string;
  monthly_points: string;
  total_volume_usd: string;
  transaction_count: number;
  referral_code: string;
  airdrop_eligible: boolean;
  global_rank: number;
  weekly_rank: number;
  monthly_rank: number;
}

interface Transaction {
  id: number;
  tx_hash: string;
  transaction_type: string;
  amount_usd: string;
  points_earned: string;
  multiplier: string;
  status: string;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';

export default function PointsDashboard() {
  const { address, isConnected } = useAccount();
  const { subscribeToTransactions } = useTransactionEvents();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserPoints();
      fetchTransactions();
    }
  }, [address, isConnected]);

  useEffect(() => {
    if (!isConnected || !address) return;
    const unsubscribe = subscribeToTransactions(() => {
      setTimeout(() => {
        fetchUserPoints();
        fetchTransactions();
      }, 2000);
    });
    return unsubscribe;
  }, [address, isConnected]);

  const fetchUserPoints = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`${API_BASE}/v1/points/user/${address}`);
      const data = await response.json();
      
      if (data.success) {
        setUserPoints(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user points:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`${API_BASE}/v1/points/user/${address}/transactions?limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const copyReferralCode = () => {
    if (userPoints?.referral_code) {
      navigator.clipboard.writeText(userPoints.referral_code);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-[#3396FF]/10 to-[#47A1FF]/10 border border-[#3396FF]/20 rounded-xl p-8 text-center">
        <Star className="w-16 h-16 mx-auto mb-4 text-[#47A1FF]" />
        <h3 className="text-2xl font-bold mb-2">Connect Wallet to Earn Points</h3>
        <p className="text-gray-400">Start trading to earn points and qualify for rewards & airdrops</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#47A1FF]"></div>
      </div>
    );
  }

  if (!userPoints) {
    return (
      <div className="bg-gradient-to-br from-[#3396FF]/10 to-[#47A1FF]/10 border border-[#3396FF]/20 rounded-xl p-8 text-center">
        <Star className="w-16 h-16 mx-auto mb-4 text-[#47A1FF]" />
        <h3 className="text-2xl font-bold mb-2">Start Earning Points</h3>
        <p className="text-gray-400 mb-4">Make your first trade to start earning points!</p>
        <div className="text-sm text-gray-500">
          <p>• 1x points on swaps</p>
          <p>• 2x points on bridges</p>
          <p>• 5x points on liquidity additions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#3396FF]/20 to-[#47A1FF]/20 border border-[#3396FF]/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-[#47A1FF]" />
            <p className="text-sm text-gray-400">Total Points</p>
          </div>
          <p className="text-3xl font-bold">{formatNumber(userPoints.total_points)}</p>
          <p className="text-xs text-gray-500 mt-1">Rank #{userPoints.global_rank}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <p className="text-sm text-gray-400">Weekly Points</p>
          </div>
          <p className="text-3xl font-bold">{formatNumber(userPoints.weekly_points)}</p>
          <p className="text-xs text-gray-500 mt-1">Rank #{userPoints.weekly_rank}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-green-400" />
            <p className="text-sm text-gray-400">Monthly Points</p>
          </div>
          <p className="text-3xl font-bold">{formatNumber(userPoints.monthly_points)}</p>
          <p className="text-xs text-gray-500 mt-1">Rank #{userPoints.monthly_rank}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-6 h-6 text-yellow-400" />
            <p className="text-sm text-gray-400">Airdrop Status</p>
          </div>
          <p className="text-2xl font-bold">
            {userPoints.airdrop_eligible ? (
              <span className="text-green-400">✓ Eligible</span>
            ) : (
              <span className="text-gray-400">Not Yet</span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {userPoints.airdrop_eligible ? 'Qualified for 2026 airdrop' : 'Need 1K pts & 5 txs'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Trading Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Volume</span>
              <span className="font-semibold">${formatNumber(userPoints.total_volume_usd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transactions</span>
              <span className="font-semibold">{userPoints.transaction_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Points/TX</span>
              <span className="font-semibold">
                {(parseFloat(userPoints.total_points) / userPoints.transaction_count || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Referral Code</h3>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-3">
            <p className="text-2xl font-mono font-bold text-center text-[#47A1FF]">
              {userPoints.referral_code}
            </p>
          </div>
          <button
            onClick={copyReferralCode}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Copy Code
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Share with friends to earn bonus points!
          </p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#47A1FF]" />
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
          </div>
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="text-sm text-[#47A1FF] hover:text-[#3396FF]"
          >
            {showTransactions ? 'Hide' : 'Show All'}
          </button>
        </div>

        {showTransactions && transactions.length > 0 && (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.status === 'completed' ? 'bg-green-500' : 
                    tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium capitalize">{tx.transaction_type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#47A1FF]">
                    +{parseFloat(tx.points_earned).toFixed(2)} pts
                  </p>
                  <p className="text-xs text-gray-500">
                    ${parseFloat(tx.amount_usd).toFixed(2)}
                  </p>
                </div>
                <a
                  href={`https://etherscan.io/tx/${tx.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {showTransactions && transactions.length === 0 && (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#3396FF]/10 to-[#47A1FF]/10 border border-[#3396FF]/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">How to Earn More Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-sm">
            <p className="font-semibold text-[#47A1FF] mb-1">💱 Swaps</p>
            <p className="text-gray-400">1x points per $1 volume</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-blue-400 mb-1">🌉 Bridges</p>
            <p className="text-gray-400">2x points per $1 volume</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-green-400 mb-1">💧 Liquidity</p>
            <p className="text-gray-400">5x points per $1 added</p>
          </div>
        </div>
      </div>
    </div>
  );
}
