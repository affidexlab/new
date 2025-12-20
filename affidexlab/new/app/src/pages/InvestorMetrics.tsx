import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Users, Activity, BarChart3, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';

interface InvestorData {
  tvl: {
    totalTVL: number;
    liquidityTVL: number;
    stakingTVL: number;
    tvlByChain: Record<string, number>;
  };
  revenue: {
    total: number;
    monthlyRecurring: number;
    breakdown: Array<{ revenue_type: string; source: string; total_revenue: string; transaction_count: string }>;
  };
  growth: {
    weekOverWeek: number;
    monthOverMonth: number;
    lastWeekVolume: number;
    lastMonthVolume: number;
  };
  wallets: {
    total: number;
    top10Concentration: string;
    top100Concentration: string;
  };
  performance: {
    successRate: string;
    averageTransactionSize: string;
  };
}

const CHAIN_NAMES: Record<string, string> = {
  '1': 'Ethereum',
  '8453': 'Base',
  '42161': 'Arbitrum',
  '10': 'Optimism',
  '137': 'Polygon',
  '43114': 'Avalanche'
};

export default function InvestorMetrics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InvestorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_BASE}/v1/investor-metrics/overview`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError('Failed to load metrics');
      }
    } catch (err) {
      console.error('Metrics load error:', err);
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center">
          <Activity size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Failed to Load Metrics</h2>
          <p className="text-gray-400 mb-4">{error || 'Unknown error occurred'}</p>
          <button
            onClick={loadMetrics}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] bg-clip-text text-transparent">
          Investor Metrics Dashboard
        </h1>
        <p className="text-gray-400">Real-time protocol performance and growth metrics</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span>Live Data • Updated {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* TVL */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#47A1FF]/20">
              <TrendingUp className="text-[#47A1FF]" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(data.tvl.totalTVL)}</div>
          <div className="text-sm text-gray-400">Total Value Locked</div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Liquidity:</span>
                <span className="text-[#47A1FF]">{formatCurrency(data.tvl.liquidityTVL)}</span>
              </div>
              <div className="flex justify-between">
                <span>Staking:</span>
                <span className="text-[#47A1FF]">{formatCurrency(data.tvl.stakingTVL)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MRR */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-green-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <DollarSign className="text-green-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(data.revenue.monthlyRecurring)}</div>
          <div className="text-sm text-gray-400">Monthly Recurring Revenue</div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-xs text-gray-500">
              Total Revenue: <span className="text-green-400">{formatCurrency(data.revenue.total)}</span>
            </div>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <BarChart3 className="text-purple-400" size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm ${data.growth.monthOverMonth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.growth.monthOverMonth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{Math.abs(data.growth.monthOverMonth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {data.growth.monthOverMonth >= 0 ? '+' : ''}{data.growth.monthOverMonth.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Month-over-Month Growth</div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-xs text-gray-500">
              WoW: <span className={data.growth.weekOverWeek >= 0 ? 'text-green-400' : 'text-red-400'}>
                {data.growth.weekOverWeek >= 0 ? '+' : ''}{data.growth.weekOverWeek.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Unique Wallets */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-orange-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Users className="text-orange-400" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{formatNumber(data.wallets.total)}</div>
          <div className="text-sm text-gray-400">Unique Wallets</div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-xs text-gray-500">
              Top 10: <span className="text-orange-400">{data.wallets.top10Concentration}% volume</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Success Rate */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-[#47A1FF]" />
            Transaction Success Rate
          </h2>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-5xl font-bold text-green-400">{data.performance.successRate}%</div>
          </div>
          <p className="text-sm text-gray-400 mb-4">Last 30 days</p>
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${data.performance.successRate}%` }}
            ></div>
          </div>
        </div>

        {/* Average Transaction Size */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-[#47A1FF]" />
            Average Transaction Size
          </h2>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-5xl font-bold text-[#47A1FF]">
              ${parseFloat(data.performance.averageTransactionSize).toFixed(0)}
            </div>
          </div>
          <p className="text-sm text-gray-400">Per transaction (30-day avg)</p>
        </div>
      </div>

      {/* TVL by Chain */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">TVL Distribution by Chain</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(data.tvl.tvlByChain).map(([chainId, tvl]) => (
            <div key={chainId} className="rounded-xl bg-[#0F1419] border border-white/5 p-4 text-center">
              <div className="text-sm text-gray-400 mb-2">{CHAIN_NAMES[chainId] || `Chain ${chainId}`}</div>
              <div className="text-xl font-bold text-[#47A1FF]">{formatCurrency(tvl)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {((tvl / data.tvl.totalTVL) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Breakdown */}
      {data.revenue.breakdown && data.revenue.breakdown.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6">
          <h2 className="text-xl font-bold mb-6">Revenue Breakdown</h2>
          <div className="space-y-3">
            {data.revenue.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-[#0F1419] border border-white/5">
                <div>
                  <div className="font-semibold capitalize">{item.revenue_type}</div>
                  <div className="text-sm text-gray-400">{item.source} • {item.transaction_count} transactions</div>
                </div>
                <div className="text-xl font-bold text-green-400">
                  {formatCurrency(parseFloat(item.total_revenue))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Concentration Warning */}
      {parseFloat(data.wallets.top10Concentration) > 50 && (
        <div className="mt-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-6">
          <div className="flex items-start gap-3">
            <TrendingDown className="text-yellow-400 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">High Wallet Concentration</h3>
              <p className="text-sm text-gray-300">
                Top 10 wallets control {data.wallets.top10Concentration}% of total volume. 
                Consider incentivizing broader user adoption to reduce concentration risk.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
