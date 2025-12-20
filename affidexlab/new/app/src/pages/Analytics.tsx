import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { TrendingUp, Activity, Users, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTransactionEvents } from "@/contexts/TransactionEventsContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';

interface AnalyticsData {
  totalVolume: string;
  totalSwaps: number;
  uniqueWallets: number;
  avgSwapSize: string;
  topTokens: Array<{symbol: string; volume: string; swaps: number}>;
  recentActivity: Array<{hash: string; type: string; amount: string; timestamp: number}>;
}

export default function Analytics() {
  const { address, isConnected } = useAccount();
  const { subscribeToTransactions } = useTransactionEvents();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVolume: "0",
    totalSwaps: 0,
    uniqueWallets: 0,
    avgSwapSize: "0",
    topTokens: [],
    recentActivity: [],
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE}/v1/points/metrics`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const totalVolume = data.data.totalVolumeUsd || 0;
        const totalSwaps = data.data.totalTrades || 0;
        const uniqueWallets = data.data.uniqueWallets || 0;
        const avgSize = totalSwaps > 0 ? totalVolume / totalSwaps : 0;

        setAnalytics({
          totalVolume: totalVolume.toFixed(2),
          totalSwaps,
          uniqueWallets,
          avgSwapSize: avgSize.toFixed(2),
          topTokens: [],
          recentActivity: [],
        });
      } else {
        setAnalytics({
          totalVolume: "0",
          totalSwaps: 0,
          uniqueWallets: 0,
          avgSwapSize: "0",
          topTokens: [],
          recentActivity: [],
        });
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setAnalytics({
        totalVolume: "0",
        totalSwaps: 0,
        uniqueWallets: 0,
        avgSwapSize: "0",
        topTokens: [],
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTransactions(() => {
      loadAnalytics();
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-400">Track DecaFlow protocol metrics and activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="text-[#47A1FF]" size={24} />
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <ArrowUpRight size={14} />
              <span>+12.5%</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">${analytics.totalVolume}</div>
          <div className="text-xs text-gray-400">Total Volume (24h)</div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <div className="flex items-center justify-between mb-3">
            <Activity className="text-purple-400" size={24} />
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <ArrowUpRight size={14} />
              <span>+8.3%</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.totalSwaps}</div>
          <div className="text-xs text-gray-400">Total Swaps</div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-orange-400" size={24} />
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <ArrowUpRight size={14} />
              <span>+15.2%</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.uniqueWallets}</div>
          <div className="text-xs text-gray-400">Unique Wallets</div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <div className="flex items-center justify-between mb-3">
            <Zap className="text-yellow-400" size={24} />
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <ArrowDownRight size={14} />
              <span>-3.1%</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">${analytics.avgSwapSize}</div>
          <div className="text-xs text-gray-400">Avg Swap Size</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tokens */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <h2 className="text-xl font-bold mb-4">Top Tokens by Volume</h2>
          {analytics.topTokens.length > 0 ? (
            <div className="space-y-3">
              {analytics.topTokens.map((token, index) => (
                <div key={token.symbol} className="flex items-center justify-between p-3 rounded-xl bg-[#0F1419] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3396FF] to-[#47A1FF] flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold">{token.symbol}</div>
                      <div className="text-xs text-gray-400">{token.swaps} swaps</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#47A1FF]">${token.volume}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity size={48} className="mx-auto mb-4 opacity-30" />
              <p>No token data available yet</p>
              <p className="text-xs mt-2">Start swapping to see analytics</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#0F1419] border border-white/5 hover:border-[#47A1FF]/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#47A1FF]/20 flex items-center justify-center">
                      <Activity size={16} className="text-[#47A1FF]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium capitalize">{activity.type}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${activity.amount}</div>
                    <a 
                      href={`https://arbiscan.io/tx/${activity.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-[#47A1FF] hover:underline"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Zap size={48} className="mx-auto mb-4 opacity-30" />
              <p>No recent activity</p>
              <p className="text-xs mt-2">Your swaps will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Chain Distribution */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
        <h2 className="text-xl font-bold mb-4">Chain Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: "Ethereum", volume: "32%", color: "bg-blue-500" },
            { name: "Arbitrum", volume: "28%", color: "bg-[#47A1FF]" },
            { name: "Base", volume: "18%", color: "bg-blue-400" },
            { name: "Optimism", volume: "12%", color: "bg-red-400" },
            { name: "Polygon", volume: "7%", color: "bg-purple-500" },
            { name: "Avalanche", volume: "3%", color: "bg-red-500" },
          ].map(chain => (
            <div key={chain.name} className="rounded-xl bg-[#0F1419] border border-white/5 p-4 text-center">
              <div className={`w-12 h-12 rounded-full ${chain.color} mx-auto mb-3 flex items-center justify-center text-2xl opacity-80`}>
                {chain.name[0]}
              </div>
              <div className="font-bold text-lg mb-1">{chain.volume}</div>
              <div className="text-xs text-gray-400">{chain.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <h2 className="text-xl font-bold mb-4">Bridge Providers</h2>
          <div className="space-y-3">
            {[
              { name: "Li.Fi", usage: "58%", color: "text-purple-400" },
              { name: "CCTP", usage: "28%", color: "text-blue-400" },
              { name: "CCIP", usage: "14%", color: "text-green-400" },
            ].map(provider => (
              <div key={provider.name} className="flex items-center justify-between p-3 rounded-xl bg-[#0F1419] border border-white/5">
                <span className="font-medium">{provider.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${provider.color.replace('text-', 'bg-')}`} style={{width: provider.usage}}></div>
                  </div>
                  <span className={`text-sm font-bold ${provider.color}`}>{provider.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <h2 className="text-xl font-bold mb-4">Swap Protocols</h2>
          <div className="space-y-3">
            {[
              { name: "0x Protocol", usage: "65%", color: "text-[#47A1FF]" },
              { name: "CoW Protocol", usage: "35%", color: "text-green-400" },
            ].map(protocol => (
              <div key={protocol.name} className="flex items-center justify-between p-3 rounded-xl bg-[#0F1419] border border-white/5">
                <span className="font-medium">{protocol.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${protocol.color.replace('text-', 'bg-')}`} style={{width: protocol.usage}}></div>
                  </div>
                  <span className={`text-sm font-bold ${protocol.color}`}>{protocol.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
        <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0F1419] border border-white/5">
            <div className="text-gray-400 text-sm mb-2">Avg Quote Time</div>
            <div className="text-2xl font-bold text-green-400">1.2s</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0F1419] border border-white/5">
            <div className="text-gray-400 text-sm mb-2">Success Rate</div>
            <div className="text-2xl font-bold text-green-400">98.5%</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0F1419] border border-white/5">
            <div className="text-gray-400 text-sm mb-2">Avg Gas Saved</div>
            <div className="text-2xl font-bold text-[#47A1FF]">$2.40</div>
          </div>
        </div>
      </div>

      {/* User Stats (if connected) */}
      {isConnected && address && (
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <h2 className="text-xl font-bold mb-4">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0F1419] border border-white/5 text-center">
              <div className="text-2xl font-bold text-[#47A1FF] mb-1">
                {analytics.recentActivity.filter(a => a.hash).length}
              </div>
              <div className="text-xs text-gray-400">Your Swaps</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1419] border border-white/5 text-center">
              <div className="text-2xl font-bold text-[#47A1FF] mb-1">$0.00</div>
              <div className="text-xs text-gray-400">Your Volume</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1419] border border-white/5 text-center">
              <div className="text-2xl font-bold text-[#47A1FF] mb-1">$0.00</div>
              <div className="text-xs text-gray-400">Gas Saved</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
