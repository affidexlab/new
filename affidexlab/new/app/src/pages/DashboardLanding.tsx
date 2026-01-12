import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, TrendingUp, Shield, Database, Bell, Code, Menu, X, Check } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com').trim().replace(/\/+$/, '');

export default function DashboardLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveStats, setLiveStats] = useState({
    totalMevUsd: 6240000,
    affectedTxs: 188000,
    avgVictimLoss: 33.19
  });

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/mev/overview`);
        if (res.ok) {
          const data = await res.json();
          setLiveStats({
            totalMevUsd: data.totalMevUsd || 6240000,
            affectedTxs: data.affectedTxs || 188000,
            avgVictimLoss: data.avgVictimLoss || 33.19
          });
        }
      } catch (err) {
        console.log('Using fallback stats');
      }
    };

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] text-white">
      <nav className="fixed top-0 w-full bg-[#0A0E27]/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/decaflow-logo.svg" alt="DecaFlow" className="h-8" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}/>
              <div>
                <div className="font-bold text-xl">MEV Dashboard</div>
                <div className="text-xs text-gray-400">Real-Time MEV Intelligence</div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm hover:text-purple-400 transition">Features</button>
              <button onClick={() => scrollToSection('use-cases')} className="text-sm hover:text-purple-400 transition">Use Cases</button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm hover:text-purple-400 transition">Pricing</button>
              <button onClick={() => scrollToSection('api')} className="text-sm hover:text-purple-400 transition">API</button>
              <Button onClick={() => window.location.href = '/mev-dashboard'} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <button onClick={() => scrollToSection('features')} className="block text-sm hover:text-purple-400 transition">Features</button>
              <button onClick={() => scrollToSection('use-cases')} className="block text-sm hover:text-purple-400 transition">Use Cases</button>
              <button onClick={() => scrollToSection('pricing')} className="block text-sm hover:text-purple-400 transition">Pricing</button>
              <button onClick={() => scrollToSection('api')} className="block text-sm hover:text-purple-400 transition">API</button>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
              📊 Real-Time • Multi-Chain • Free to Start
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              The Most Comprehensive MEV Intelligence Platform for Arbitrum
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              Track ${(liveStats.totalMevUsd / 1000000).toFixed(2)}M+ MEV extracted. Real-time. Multi-chain. Free to start.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button onClick={() => window.location.href = '/mev-dashboard'} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
                Explore Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={() => window.open('https://docs.decaflow.xyz/api', '_blank')} variant="outline" size="lg" className="border-purple-500/30 hover:bg-purple-500/10 text-lg px-8 py-6">
                API Documentation
              </Button>
            </div>

            <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                    ${(liveStats.totalMevUsd / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-gray-300">Total MEV Extracted</div>
                  <div className="text-sm text-gray-500 mt-1">Last 30 days</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-2">
                    {(liveStats.affectedTxs / 1000).toFixed(0)}k+
                  </div>
                  <div className="text-gray-300">Affected Transactions</div>
                  <div className="text-sm text-gray-500 mt-1">Across Arbitrum</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">
                    ${liveStats.avgVictimLoss.toFixed(2)}
                  </div>
                  <div className="text-gray-300">Average Victim Loss</div>
                  <div className="text-sm text-gray-500 mt-1">Per transaction</div>
                </div>
              </div>
            </div>
          </div>

          <div id="preview" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Live Dashboard Preview</h2>
            <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-4 hover:border-purple-500/40 transition cursor-pointer" onClick={() => window.location.href = '/mev-dashboard'}>
              <img 
                src="/images/mev-dashboard-preview.png" 
                alt="MEV Dashboard Preview" 
                className="w-full rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"%3E%3Crect fill="%231a1f3a" width="1200" height="600"/%3E%3Ctext fill="%23666" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle"%3EMEV Dashboard Preview%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="text-center mt-4">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Open Live Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div id="who-uses" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Who Uses It</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 text-center hover:border-purple-500/40 transition">
                <TrendingUp className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">Trading Firms</h3>
                <p className="text-gray-300 text-sm">Optimize routing, avoid MEV</p>
              </div>
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 text-center hover:border-purple-500/40 transition">
                <Shield className="h-12 w-12 text-green-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">Protocols</h3>
                <p className="text-gray-300 text-sm">Understand user impact, justify MEV protection</p>
              </div>
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 text-center hover:border-purple-500/40 transition">
                <BarChart3 className="h-12 w-12 text-blue-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">Researchers</h3>
                <p className="text-gray-300 text-sm">Academic research, market analysis</p>
              </div>
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 text-center hover:border-purple-500/40 transition">
                <Database className="h-12 w-12 text-pink-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">Power Users</h3>
                <p className="text-gray-300 text-sm">Check if you've been MEV'd, optimize trades</p>
              </div>
            </div>
          </div>

          <div id="features" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Key Features</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
                <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Real-time MEV tracking across 6 chains</h3>
                <p className="text-gray-300 mb-4">Monitor MEV extraction in real-time across Arbitrum, Base, Ethereum, Polygon, Avalanche, and Optimism</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Live transaction monitoring</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Historical data analysis</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Cross-chain comparisons</li>
                </ul>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
                <Shield className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Protocol-level breakdowns</h3>
                <p className="text-gray-300 mb-4">See exactly how much MEV affects each protocol and their users</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Per-protocol MEV statistics</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> User impact metrics</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Comparative analysis</li>
                </ul>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
                <Database className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Wallet-specific MEV exposure analysis</h3>
                <p className="text-gray-300 mb-4">Check if your wallet has been affected by MEV attacks</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Individual wallet tracking</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Loss calculations</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Historical victim data</li>
                </ul>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
                <Bell className="h-12 w-12 text-orange-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Custom alerts for MEV spikes</h3>
                <p className="text-gray-300 mb-4">Get notified when MEV activity spikes on your protocol or wallet</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Real-time notifications</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Customizable thresholds</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Email & webhook support</li>
                </ul>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
                <TrendingUp className="h-12 w-12 text-pink-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Historical trends and analytics</h3>
                <p className="text-gray-300 mb-4">Analyze MEV patterns over time and identify trends</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Time-series analysis</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Trend forecasting</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Seasonal patterns</li>
                </ul>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition">
                <Code className="h-12 w-12 text-yellow-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">API access for custom integrations</h3>
                <p className="text-gray-300 mb-4">Integrate MEV data into your own applications and dashboards</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> RESTful API</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> WebSocket streams</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> SDKs for Python, JS, Go</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-12 mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Data You Can't Get Elsewhere</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-300 text-center mb-8">
                Most MEV dashboards show searcher profits.<br/>
                <span className="text-2xl font-bold text-purple-400">We show victim losses.</span><br/>
                That's the data protocols and users actually need.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-6">
                  <div className="text-red-400 font-bold mb-2">❌ Other Dashboards</div>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Searcher-focused metrics</li>
                    <li>• Limited chain coverage</li>
                    <li>• Delayed data</li>
                    <li>• No wallet tracking</li>
                  </ul>
                </div>
                <div className="bg-black/20 rounded-xl p-6">
                  <div className="text-green-400 font-bold mb-2">✅ DecaFlow Dashboard</div>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Victim-focused analytics</li>
                    <li>• 6 chains + expanding</li>
                    <li>• Real-time data</li>
                    <li>• Wallet-level tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div id="use-cases" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Use Cases</h2>
            
            <div className="space-y-6">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-3 text-purple-400">Trading Firms</h3>
                <p className="text-gray-300 text-lg">"Optimize routing, avoid MEV"</p>
                <p className="text-gray-400 mt-2">Use our API to integrate real-time MEV risk scores into your trading algorithms and routing decisions.</p>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-3 text-green-400">Protocols</h3>
                <p className="text-gray-300 text-lg">"Understand user impact, justify MEV protection"</p>
                <p className="text-gray-400 mt-2">See exactly how much your users are losing to MEV and make data-driven decisions about protection.</p>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-3 text-blue-400">Researchers</h3>
                <p className="text-gray-300 text-lg">"Academic research, market analysis"</p>
                <p className="text-gray-400 mt-2">Access comprehensive historical data for MEV research, papers, and market intelligence.</p>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-3 text-pink-400">Users</h3>
                <p className="text-gray-300 text-lg">"Check if you've been MEV'd, optimize trades"</p>
                <p className="text-gray-400 mt-2">Enter your wallet address to see if you've been a victim of MEV attacks and how much you've lost.</p>
              </div>
            </div>
          </div>

          <div id="pricing" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Pricing</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition">
                <div className="text-sm font-bold text-purple-400 mb-2">FREE</div>
                <div className="text-4xl font-bold mb-4">$0</div>
                <p className="text-gray-300 mb-6 text-sm">For individual users & researchers</p>
                
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">30-day historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Public dashboard access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Basic filters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Community support</span>
                  </li>
                </ul>

                <Button onClick={() => window.location.href = '/mev-dashboard'} className="w-full bg-purple-600 hover:bg-purple-700">
                  Start Free
                </Button>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition">
                <div className="text-sm font-bold text-purple-400 mb-2">PRO</div>
                <div className="text-4xl font-bold mb-4">$99<span className="text-lg text-gray-400">/mo</span></div>
                <p className="text-gray-300 mb-6 text-sm">For small teams & power users</p>
                
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">6-month historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">CSV exports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">API (1000 calls/day)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Email support</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/pro', '_blank')} variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10">
                  Upgrade
                </Button>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur border-2 border-purple-500/50 rounded-2xl p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-bold">
                  POPULAR
                </div>
                
                <div className="text-sm font-bold text-purple-400 mb-2">ENTERPRISE</div>
                <div className="text-4xl font-bold mb-4">$499<span className="text-lg text-gray-400">/mo</span></div>
                <p className="text-gray-300 mb-6 text-sm">For trading firms & large protocols</p>
                
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Full historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Unlimited API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Real-time webhooks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Priority support</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/enterprise', '_blank')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Contact Sales
                </Button>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition">
                <div className="text-sm font-bold text-purple-400 mb-2">CUSTOM</div>
                <div className="text-4xl font-bold mb-4">Custom</div>
                <p className="text-gray-300 mb-6 text-sm">For institutions & funds</p>
                
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Custom data feeds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">SLA guarantees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5" />
                    <span className="text-gray-300">White-label options</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/custom', '_blank')} variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10">
                  Contact Us
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">🎓 Academic Researchers: Get Enterprise tier for FREE</p>
              <Button onClick={() => window.open('https://decaflow.xyz/academic', '_blank')} variant="link" className="text-purple-400 hover:text-purple-300">
                Apply for Academic Program →
              </Button>
            </div>
          </div>

          <div id="api" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">API Documentation</h2>
            
            <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">Key Endpoints</h3>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="bg-black/40 rounded p-3">
                      <div className="text-green-400 mb-1">GET /api/v1/mev/overview</div>
                      <div className="text-gray-400 text-xs">Total MEV, tx count, chains</div>
                    </div>
                    <div className="bg-black/40 rounded p-3">
                      <div className="text-green-400 mb-1">GET /api/v1/mev/protocols</div>
                      <div className="text-gray-400 text-xs">MEV impact by protocol</div>
                    </div>
                    <div className="bg-black/40 rounded p-3">
                      <div className="text-green-400 mb-1">GET /api/v1/mev/wallet/:address</div>
                      <div className="text-gray-400 text-xs">Wallet-level MEV exposure</div>
                    </div>
                    <div className="bg-black/40 rounded p-3">
                      <div className="text-green-400 mb-1">POST /api/v1/webhooks</div>
                      <div className="text-gray-400 text-xs">Set up real-time alerts</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4 text-pink-400">Example Response</h3>
                  <div className="bg-black/40 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-gray-300">{`{
  "totalMevUsd": 6240000,
  "affectedTxs": 188000,
  "chains": {
    "arbitrum": {
      "mevUsd": 6240000,
      "txCount": 188000
    }
  },
  "topVictims": [
    {
      "protocol": "UniswapV3",
      "mevUsd": 2100000
    }
  ],
  "updatedAt": "2026-01-10T..."
}`}</pre>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button onClick={() => window.open('https://docs.decaflow.xyz/api', '_blank')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  View Full API Docs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur border border-purple-500/30 rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Access MEV Intelligence?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Start exploring the most comprehensive MEV data platform for Arbitrum
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.href = '/mev-dashboard'} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
                Explore Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={() => window.open('https://calendly.com/decaflow/demo', '_blank')} variant="outline" size="lg" className="border-purple-500/30 hover:bg-purple-500/10 text-lg px-8 py-6">
                Book API Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 DecaFlow. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="https://twitter.com/decaflow" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">Twitter</a>
            <a href="https://github.com/decaflow" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">GitHub</a>
            <a href="https://docs.decaflow.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">Docs</a>
            <a href="https://discord.gg/decaflow" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
