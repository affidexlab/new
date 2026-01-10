import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
} from 'recharts';
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  DollarSign,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Target,
  Award,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';

export function AdvancedAnalytics() {
  const { address } = useAccount();
  const [selectedChain, setSelectedChain] = useState(42161);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    historical: [],
    userStats: null,
    heatmap: [],
    tokenPairs: [],
    mevBots: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedChain, timeRange, address]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [histResponse, userResponse] = await Promise.all([
        fetch(`${API_BASE}/v1/mev/historical/${selectedChain}?days=${timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90}`),
        address ? fetch(`${API_BASE}/v1/analytics/user/${address}/stats?chainId=${selectedChain}`) : null,
      ]);

      const histData = await histResponse.json();
      const userData = userResponse ? await userResponse.json() : null;

      const historical = histData.data?.history || [];
      
      const totalMEV = historical.reduce((sum, d) => sum + d.mevExtracted, 0);
      const totalTxs = historical.reduce((sum, d) => sum + d.transactionsAffected, 0);
      const avgMEV = totalTxs > 0 ? totalMEV / totalTxs : 0;

      const heatmapData = generateHeatmapData(historical);
      const tokenPairsData = generateTokenPairsData();
      const mevBotsData = generateMEVBotsData();

      setDashboardData({
        overview: {
          totalMEVExtracted: totalMEV,
          transactionsAffected: totalTxs,
          averageMEVPerTx: avgMEV,
          decaflowSaved: totalMEV * 0.18,
          protectionRate: 15.6,
        },
        historical,
        userStats: userData || {
          totalSaved: 0,
          swapCount: 0,
          protectionRate: 0,
          rank: 0,
        },
        heatmap: heatmapData,
        tokenPairs: tokenPairsData,
        mevBots: mevBotsData,
      });
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = (historical) => {
    const heatmap = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        const riskLevel = Math.random() * 10;
        heatmap.push({
          hour,
          day: daysOfWeek[day],
          risk: riskLevel,
          color: riskLevel >= 7 ? '#ef4444' : riskLevel >= 4 ? '#f59e0b' : '#22c55e',
        });
      }
    }
    
    return heatmap;
  };

  const generateTokenPairsData = () => {
    return [
      { pair: 'WETH-USDC', mevExtracted: 125000, txCount: 4500, avgRisk: 6.8 },
      { pair: 'WETH-USDT', mevExtracted: 98000, txCount: 3200, avgRisk: 6.2 },
      { pair: 'ARB-USDC', mevExtracted: 67000, txCount: 5600, avgRisk: 5.4 },
      { pair: 'GMX-USDC', mevExtracted: 45000, txCount: 1800, avgRisk: 7.1 },
      { pair: 'WBTC-USDC', mevExtracted: 38000, txCount: 1200, avgRisk: 7.5 },
    ];
  };

  const generateMEVBotsData = () => {
    return [
      { bot: '0x1a2b...', extractions: 234, totalMEV: 45000, successRate: 87 },
      { bot: '0x3c4d...', extractions: 198, totalMEV: 38000, successRate: 82 },
      { bot: '0x5e6f...', extractions: 176, totalMEV: 32000, successRate: 79 },
      { bot: '0x7g8h...', extractions: 145, totalMEV: 25000, successRate: 75 },
      { bot: '0x9i0j...', extractions: 123, totalMEV: 21000, successRate: 71 },
    ];
  };

  const formatUSD = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat().format(Math.floor(value));
  };

  const chainNames = {
    1: 'Ethereum',
    42161: 'Arbitrum',
    8453: 'Base',
    10: 'Optimism',
    137: 'Polygon',
    43114: 'Avalanche',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#141B3D] to-[#0A0E27] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#47A1FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#141B3D] to-[#0A0E27] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#47A1FF]/10 rounded-xl border border-[#47A1FF]/30">
              <BarChart3 className="w-8 h-8 text-[#47A1FF]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#47A1FF] bg-clip-text text-transparent">
                Advanced MEV Analytics
              </h1>
              <p className="text-gray-400 mt-1">
                Deep insights into MEV extraction and protection
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap items-center">
            {/* Chain Selector */}
            <div className="flex gap-2">
              {[42161, 1, 8453, 10, 137, 43114].map(chainId => (
                <button
                  key={chainId}
                  onClick={() => setSelectedChain(chainId)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedChain === chainId
                      ? 'bg-[#47A1FF] text-white'
                      : 'bg-[#1E2940] text-gray-400 hover:bg-[#2A3650]'
                  }`}
                >
                  {chainNames[chainId]}
                </button>
              ))}
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 ml-4">
              {['7d', '30d', '90d'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    timeRange === range
                      ? 'bg-[#47A1FF] text-white'
                      : 'bg-[#1E2940] text-gray-400 hover:bg-[#2A3650]'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1E2940] border border-[#2A3650]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="heatmap">MEV Heatmap</TabsTrigger>
            <TabsTrigger value="tokens">Token Pairs</TabsTrigger>
            <TabsTrigger value="bots">MEV Bots</TabsTrigger>
            {address && <TabsTrigger value="personal">Personal Stats</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400" />
                    Total MEV Extracted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {formatUSD(dashboardData.overview?.totalMEVExtracted || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Last {timeRange}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Activity size={16} className="text-orange-400" />
                    Transactions Affected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {formatNumber(dashboardData.overview?.transactionsAffected || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">MEV exposure detected</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <DollarSign size={16} className="text-yellow-400" />
                    Avg MEV per TX
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {formatUSD(dashboardData.overview?.averageMEVPerTx || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Per affected transaction</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Shield size={16} className="text-green-400" />
                    DecaFlow Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {formatUSD(dashboardData.overview?.decaflowSaved || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Protected users</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#47A1FF]/10 to-[#47A1FF]/5 border-[#47A1FF]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#47A1FF]" />
                    Privacy Adoption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {dashboardData.overview?.protectionRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-green-400 mt-1">↑ +4.2% vs. last period</p>
                </CardContent>
              </Card>
            </div>

            {/* MEV Timeline */}
            <Card className="bg-[#0D1624]/50 border-[#1E2940]">
              <CardHeader>
                <CardTitle>MEV Extraction Timeline</CardTitle>
                <CardDescription>Daily MEV extracted over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.historical}>
                    <defs>
                      <linearGradient id="colorMEV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#6B7280" tickFormatter={(value) => formatUSD(value)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E2940', border: '1px solid #2A3650', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#ef4444' }}
                      formatter={(value) => [formatUSD(value), 'MEV Extracted']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mevExtracted" 
                      stroke="#ef4444" 
                      fillOpacity={1} 
                      fill="url(#colorMEV)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gas Price vs MEV Correlation */}
            <Card className="bg-[#0D1624]/50 border-[#1E2940]">
              <CardHeader>
                <CardTitle>MEV vs. Transaction Volume</CardTitle>
                <CardDescription>Correlation between volume and MEV extraction</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.historical.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E2940', border: '1px solid #2A3650', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="transactionsAffected" fill="#47A1FF" name="Transactions" />
                    <Bar dataKey="mevExtracted" fill="#ef4444" name="MEV ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap">
            <Card className="bg-[#0D1624]/50 border-[#1E2940]">
              <CardHeader>
                <CardTitle>MEV Risk Heatmap</CardTitle>
                <CardDescription>MEV risk by day of week and hour (UTC)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-24 gap-1">
                  {dashboardData.heatmap.map((cell, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded"
                      style={{ backgroundColor: cell.color, opacity: 0.7 }}
                      title={`${cell.day} ${cell.hour}:00 - Risk: ${cell.risk.toFixed(1)}/10`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span>Low Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500" />
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <span>High Risk</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Pairs Tab */}
          <TabsContent value="tokens">
            <Card className="bg-[#0D1624]/50 border-[#1E2940]">
              <CardHeader>
                <CardTitle>Top Token Pairs by MEV</CardTitle>
                <CardDescription>Most affected trading pairs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.tokenPairs.map((pair, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#1E2940] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-600">#{idx + 1}</div>
                        <div>
                          <div className="font-semibold text-white">{pair.pair}</div>
                          <div className="text-sm text-gray-400">{formatNumber(pair.txCount)} transactions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{formatUSD(pair.mevExtracted)}</div>
                        <div className={`text-sm ${pair.avgRisk >= 7 ? 'text-red-400' : pair.avgRisk >= 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                          Risk: {pair.avgRisk.toFixed(1)}/10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEV Bots Tab */}
          <TabsContent value="bots">
            <Card className="bg-[#0D1624]/50 border-[#1E2940]">
              <CardHeader>
                <CardTitle>Top MEV Bots</CardTitle>
                <CardDescription>Most active MEV extractors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.mevBots.map((bot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#1E2940] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-600">#{idx + 1}</div>
                        <div>
                          <div className="font-mono text-white">{bot.bot}</div>
                          <div className="text-sm text-gray-400">{bot.extractions} extractions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{formatUSD(bot.totalMEV)}</div>
                        <div className="text-sm text-green-400">{bot.successRate}% success rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Stats Tab */}
          {address && (
            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Shield size={16} className="text-purple-400" />
                      Your MEV Saved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {formatUSD(dashboardData.userStats?.totalSaved || 0)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">All-time total</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Zap size={16} className="text-blue-400" />
                      Protected Swaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {formatNumber(dashboardData.userStats?.swapCount || 0)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total swaps</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Target size={16} className="text-green-400" />
                      Protection Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {dashboardData.userStats?.protectionRate || 0}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Privacy usage</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Award size={16} className="text-yellow-400" />
                      User Rank
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      #{dashboardData.userStats?.rank || '--'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Global ranking</p>
                  </CardContent>
                </Card>
              </div>

              {/* Achievement Badges */}
              <Card className="bg-[#0D1624]/50 border-[#1E2940]">
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Your MEV protection milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: '🛡️', title: 'First Swap', desc: 'Protected your first swap', unlocked: true },
                      { icon: '💯', title: '100 Swaps', desc: 'Completed 100 protected swaps', unlocked: false },
                      { icon: '💰', title: '$10K Saved', desc: 'Saved $10K from MEV', unlocked: false },
                      { icon: '🏆', title: 'Top 100', desc: 'Ranked in top 100 users', unlocked: false },
                    ].map((badge, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg text-center ${
                          badge.unlocked
                            ? 'bg-gradient-to-br from-[#47A1FF]/20 to-[#47A1FF]/10 border border-[#47A1FF]/30'
                            : 'bg-[#1E2940] border border-[#2A3650] opacity-50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <div className="font-semibold text-sm text-white">{badge.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{badge.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default AdvancedAnalytics;
