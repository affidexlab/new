import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useTransactionEvents } from "@/contexts/TransactionEventsContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [enterDappOpen, setEnterDappOpen] = useState(false);
  const [stats, setStats] = useState({ trades: 0, volumeUSD: 0, wallets: 0, tvl: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [campaignStats, setCampaignStats] = useState<null | {
    dailyTrades: number;
    dailyVolumeUsd: number;
    weeklyTrades: number;
    weeklyVolumeUsd: number;
    prizePoolUsd: number;
    privacySwapsToday: number;
    activeMultipliers: number;
    pioneerTraders: number;
    updatedAt: string;
  }>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [dlmmProviders, setDlmmProviders] = useState<Array<{ id: string; name: string; description: string; status: string; supportedChains: number[]; docsUrl: string; tags?: string[] }>>([]);
  const [dlmmLoading, setDlmmLoading] = useState(true);
  const [dlmmSnapshot, setDlmmSnapshot] = useState<DlmmSnapshot | null>(null);
  const [dlmmStatsLoading, setDlmmStatsLoading] = useState(true);
  const { subscribeToTransactions } = useTransactionEvents();

  const PIONEER_TARGET = 100;
  const pioneerCount = stats.wallets || 0;
  const pioneerProgress = Math.min(pioneerCount / PIONEER_TARGET, 1);
  const totalChainsLive = 6;

  const fetchGlobalStats = async () => {
    try {
      setStatsLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${API_BASE}/v1/points/metrics`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Landing page stats loaded:', data);
      
      if (data.success && data.data) {
        setStats({
          trades: data.data.totalTrades || 0,
          volumeUSD: data.data.totalVolumeUsd || 0,
          wallets: data.data.uniqueWallets || 0,
          tvl: data.data.tvl || 0,
        });
      } else {
        console.warn('⚠️ API returned unsuccessful response:', data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch global stats:', error);
      console.error('API endpoint:', `${API_BASE}/v1/points/metrics`);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCampaignStats = async () => {
    try {
      setCampaignLoading(true);
      const response = await fetch(`${API_BASE}/v1/points/campaign-metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign metrics');
      }
      const data = await response.json();
      if (data.success) {
        setCampaignStats(data.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch campaign metrics:', error);
    } finally {
      setCampaignLoading(false);
    }
  };

  const fetchDlmmProviders = async () => {
    try {
      setDlmmLoading(true);
      const response = await fetch(`${API_BASE}/v1/liquidity/dlmm/providers`);
      if (!response.ok) {
        throw new Error('Failed to fetch DLMM providers');
      }
      const data = await response.json();
      if (data.success) {
        setDlmmProviders(data.data.providers || []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch DLMM providers:', error);
    } finally {
      setDlmmLoading(false);
    }
  };

  const fetchDlmmStats = async () => {
    try {
      setDlmmStatsLoading(true);
      const response = await fetch(`${API_BASE}/v1/liquidity/pools?chainId=8453`);
      if (!response.ok) {
        throw new Error('Failed to fetch DLMM pools');
      }
      const data = await response.json();
      if (data.success && data.data?.dlmm) {
        setDlmmSnapshot(data.data.dlmm as DlmmSnapshot);
      } else {
        setDlmmSnapshot(null);
      }
    } catch (error) {
      console.error('❌ Failed to fetch DLMM stats:', error);
      setDlmmSnapshot(null);
    } finally {
      setDlmmStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    fetchCampaignStats();
    fetchDlmmProviders();
    fetchDlmmStats();
    const id = setInterval(() => {
      fetchGlobalStats();
      fetchCampaignStats();
      fetchDlmmStats();
    }, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTransactions(() => {
      fetchGlobalStats();
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E27]/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a href="/" className="header-logo-link block" aria-label="DecaFlow home">
              <img
                className="header-logo block w-full h-auto"
                src="/images/branding/wordmark-1120.png"
                srcSet="/images/branding/wordmark-500.png 500w, /images/branding/wordmark-800.png 800w, /images/branding/wordmark-1080.png 1080w, /images/branding/wordmark-1120.png 1120w"
                sizes="(max-width: 160px) 100vw, 160px"
                width={1120}
                height={631}
                alt="DecaFlow"
              />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <a href="/" className="text-white hover:text-[#47A1FF] transition">Home</a>
              <a href="#CardCCIP" className="text-gray-400 hover:text-[#47A1FF] transition">CCIP</a>
              <a href="#CardCCTP" className="text-gray-400 hover:text-[#47A1FF] transition">CCTP</a>
              <a href="/staking" className="text-gray-400 hover:text-[#47A1FF] transition flex items-center gap-1">
                <span>VDM Staking</span>
                <span className="text-xs bg-gradient-to-r from-[#FF6B35] to-[#F7931E] px-1.5 py-0.5 rounded text-white font-bold">NEW</span>
              </a>
              <a href="/leaderboard" className="text-gray-400 hover:text-[#47A1FF] transition">Leaderboard</a>
              <a href="/quests" className="text-gray-400 hover:text-[#47A1FF] transition">Quests</a>
              <a href="https://docs.decaflow.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#47A1FF] transition">Docs</a>
              <div className="relative">
                <Button 
                  className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 text-white font-semibold px-6"
                  onClick={() => setEnterDappOpen(!enterDappOpen)}
                >
                  ENTER DAPP
                </Button>
                {enterDappOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1F2E] border border-[#47A1FF]/20 rounded-lg shadow-xl overflow-hidden z-50">
                    <a href="/app" className="block px-4 py-3 text-sm hover:bg-[#3396FF]/20 transition">Enter Dapp</a>
                    <a href="/app/privacy" className="block px-4 py-3 text-sm hover:bg-[#3396FF]/20 transition">Privacy Swap</a>
                    <a href="/staking" className="block px-4 py-3 text-sm hover:bg-[#3396FF]/20 transition border-t border-[#FF6B35]/30">
                      <span className="flex items-center gap-2">
                        <span>VDM Staking</span>
                        <span className="text-xs bg-gradient-to-r from-[#FF6B35] to-[#F7931E] px-1.5 py-0.5 rounded text-white font-bold">NEW</span>
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0E27] border-t border-white/5">
            <div className="container mx-auto px-4 py-6 space-y-4">
              <a href="/" className="block text-white hover:text-[#47A1FF] transition py-2">Home</a>
              <a href="#CardCCIP" className="block text-gray-400 hover:text-[#47A1FF] transition py-2">CCIP</a>
              <a href="#CardCCTP" className="block text-gray-400 hover:text-[#47A1FF] transition py-2">CCTP</a>
              <a href="/staking" className="block text-gray-400 hover:text-[#47A1FF] transition py-2 flex items-center gap-2">
                <span>VDM Staking</span>
                <span className="text-xs bg-gradient-to-r from-[#FF6B35] to-[#F7931E] px-1.5 py-0.5 rounded text-white font-bold">NEW</span>
              </a>
              <a href="/leaderboard" className="block text-gray-400 hover:text-[#47A1FF] transition py-2">Leaderboard</a>
              <a href="/quests" className="block text-gray-400 hover:text-[#47A1FF] transition py-2">Quests</a>
              <a href="https://docs.decaflow.xyz" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-[#47A1FF] transition py-2">Docs</a>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 text-white font-semibold"
                  onClick={() => window.location.href = '/app'}
                >
                  Enter Dapp
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-[#3396FF] text-white hover:bg-[#3396FF]/10"
                  onClick={() => window.location.href = '/app/privacy'}
                >
                  Privacy Swap
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 sm:pb-20 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#141B3D] to-[#0A0E27]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27]/50 via-transparent to-[#0A0E27]/80"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141B3D] border border-[#3396FF]/30 mb-8 hover:border-[#3396FF]/60 transition group">
                <span className="text-xs sm:text-sm font-medium text-white">PRIVATE LIQUIDITY LAYER</span>
                <span className="text-gray-500">|</span>
                <span className="text-xs sm:text-sm text-[#47A1FF]">Built on Base</span>
                <ArrowRight size={16} className="text-[#47A1FF] group-hover:translate-x-1 transition" />
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                <span className="block animate-fade-in-up">Privacy Swaps.</span>
                <span className="block animate-fade-in-up delay-100 bg-gradient-to-r from-white via-[#47A1FF] to-white bg-clip-text text-transparent">
                  DLMM Liquidity. Base Native.
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-[#A8B1B1] mb-10 max-w-3xl lg:max-w-none animate-fade-in-up delay-200">
                CoW Protocol privacy routing meets programmable DLMM pools so traders can move size quietly, LPs capture denser fees, and the Pioneer 100 earn outsized rewards.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:scale-105 hover:shadow-[0_0_30px_rgba(51,150,255,0.5)] text-white font-bold px-12 py-6 text-lg rounded-xl transition-all duration-300"
                  onClick={() => window.location.href = '/app/privacy'}
                >
                  Trade Privately
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-[#47A1FF] text-white hover:bg-[#47A1FF]/10 px-12 py-6 text-lg rounded-xl"
                  onClick={() => {
                    const section = document.getElementById('dlmm');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore DLMM Pools
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-400 mt-6">
                <a href="https://docs.decaflow.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Docs</a>
                <span className="text-gray-600">•</span>
                <a href="https://x.com/Decaflow" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">@DecaFlow</a>
                <span className="text-gray-600">•</span>
                <a href="https://t.me/decaflowprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Telegram</a>
              </div>
            </div>

            {/* Right Column - Hero Device */}
            <div className="hidden lg:flex items-center justify-center animate-fade-in-up delay-300">
              <div className="relative w-full max-w-2xl">
                <img 
                  src="/images/chainswap/ipad-pro.svg" 
                  alt="DecaFlow App Interface" 
                  className="w-full h-auto object-contain drop-shadow-[0_0_60px_rgba(51,150,255,0.4)] hover:scale-105 transition-transform duration-500"
                  lazy={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 sm:py-20 bg-[#0F1419]/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatsCard 
              number={statsLoading ? '—' : `$${Math.round(stats.tvl).toLocaleString()}`}
              label="Total Value Locked"
              subtext="Across Base + connected chains"
            />
            <StatsCard 
              number={statsLoading ? '—' : `$${Math.round(stats.volumeUSD).toLocaleString()}`}
              label="Cumulative Volume"
              subtext="Fees route into prize pool"
            />
            <StatsCard 
              number={statsLoading ? '—' : stats.trades.toLocaleString()}
              label="Swaps Logged"
              subtext="Privacy flow protected by CoW"
            />
            <StatsCard 
              number={statsLoading ? '—' : `${pioneerCount}/${PIONEER_TARGET}`}
              label="Pioneer Traders"
              subtext="First 100 double their airdrop"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <PioneerProgressCard 
              pioneerCount={pioneerCount}
              target={PIONEER_TARGET}
              progress={pioneerProgress}
              loading={statsLoading}
              weeklyVolume={campaignStats?.weeklyVolumeUsd}
            />
            <UrgencyCard 
              campaignStats={campaignStats}
              campaignLoading={campaignLoading}
            />
          </div>

          {/* Partner Logos Carousel */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8 sm:gap-12">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-8 sm:gap-12 items-center">
                  <LogoCard name="Base" />
                  <LogoCard name="Arbitrum" />
                  <LogoCard name="Optimism" />
                  <LogoCard name="Polygon" />
                  <LogoCard name="Ethereum" />
                  <LogoCard name="Avalanche" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy + Liquidity Value Props */}
      <section className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why traders pick DecaFlow</h2>
            <p className="text-xl text-gray-400">Privacy-first execution paired with DLMM liquidity incentives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-[#1A1F2E]/60 to-[#101425]/80 border border-[#47A1FF]/20">
              <h3 className="text-3xl font-bold mb-4">Privacy Flow Engine</h3>
              <p className="text-gray-400 text-lg mb-8">
                CoW Protocol routing hides intent, routes through dark orderflow, and neutralizes MEV so whales and retail get the same price without sandwich bots front-running their trades.
              </p>
              <ul className="space-y-3 text-gray-300 text-base">
                <li>• Batch auctions with zero gas until settlement</li>
                <li>• Auto-reroute if public pools slip</li>
                <li>• Optional privacy quests that boost points 3x</li>
              </ul>
            </div>
            <div className="p-10 rounded-3xl bg-gradient-to-br from-[#142033]/60 to-[#0C1326]/80 border border-[#47A1FF]/20">
              <h3 className="text-3xl font-bold mb-4">DLMM Liquidity Grid</h3>
              <p className="text-gray-400 text-lg mb-8">
                Dynamic Liquidity Market Maker (DLMM) pools bucket liquidity into adaptive bins, so LPs earn concentrated fees without manually rebalancing Uni v3-style ranges.
              </p>
              <ul className="space-y-3 text-gray-300 text-base">
                <li>• Programmable bins that tighten during volatility</li>
                <li>• Points multipliers for DLMM providers</li>
                <li>• Upcoming vaults for set-and-forget liquidity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="relative py-20 sm:py-32 bg-[#0F1419]/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">What do we do?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              DecaFlow is recognized as a trusted, private, and secure platform for multichain and privacy swaps.
            </p>
          </div>

          {/* Feature Image */}
          <div className="mb-12 flex justify-center">
            <div className="w-full max-w-3xl">
              <OptimizedImage 
                src="/images/illustrations/whatwedo.png" 
                alt="What We Do" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <div className="bg-[#1A1F2E]/50 rounded-3xl border border-[#47A1FF]/10 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Tabs */}
              <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-[#47A1FF]/10">
                {['Cross Chain Swap', 'Telegram Bot', 'Privacy Swap', 'DLMM Liquidity'].map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`w-full text-left px-6 sm:px-8 py-6 transition-all border-l-4 ${
                      activeTab === idx
                        ? 'bg-gradient-to-r from-[#3396FF]/20 to-transparent border-[#3396FF] text-white'
                        : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <h3 className="font-semibold text-base sm:text-lg">{tab}</h3>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="lg:w-2/3 p-6 sm:p-12">
                {activeTab === 0 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold">Cross Chain Swap</h3>
                    <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                      Embrace interoperability and unlock the full potential of DeFi with DecaFlow's Cross Chain Swap utilizing Base's infrastructure and bridging protocols to trade any token effortlessly between various leading blockchains, all within a single platform.
                    </p>
                    <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden">
                      <OptimizedImage src="/images/illustrations/cross-chain-swap.png" alt="Cross Chain Swap" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold">Telegram Bot</h3>
                    <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                      DecaFlow prioritizes user efficiency by incorporating technology built upon next-generation infrastructure into our Telegram Bot.
                    </p>
                    <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden">
                      <OptimizedImage src="/images/illustrations/telegram-bot.png" alt="Telegram Bot" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold">Privacy Swap</h3>
                    <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                      Unlike traditional swaps that leave visibility to all, DecaFlow utilizes advanced techniques to ensure Privacy and complete anonymity throughout the entire Swap process.
                    </p>
                    <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden">
                      <OptimizedImage src="/images/illustrations/privacy-swap.png" alt="Privacy Swap" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {activeTab === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold">DLMM Liquidity</h3>
                    <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                      Launch liquidity into adaptive DLMM bins that tighten or widen autonomously. LPs stay fully deployed, capture higher fee density, and still earn leaderboard points plus cash rewards.
                    </p>
                    <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden">
                      <OptimizedImage src="/images/illustrations/multichain-dex.png" alt="DLMM Liquidity" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CCIP Integration Section */}
      <section id="CardCCIP" className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-64 sm:h-80 lg:h-96 rounded-3xl overflow-hidden">
                <OptimizedImage src="/images/chainswap/ccip.png" alt="Chainlink CCIP" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Integrating Chainlink's Cross Chain Interoperability Protocol - CCIP
              </h2>
              <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                DecaFlow unlocks secure and efficient cross-chain swaps through Chainlink's CCIP. This innovative protocol boasts Level 5 Security through its decentralized network with an added "Risk Management Network" allowing for the seamless transfer of both data and tokens between blockchains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CCTP Section */}
      <section id="CardCCTP" className="relative py-20 sm:py-32 bg-[#0F1419]/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Circle's Cross Chain Transfer Protocol - CCTP
              </h2>
              <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                This protocol eliminates the need for complex conversions by facilitating direct USDC swaps between supported blockchains. CCTP prioritizes security by utilizing a reliable burn and mint mechanism. CCTP streamlines transactions, minimizing processing times and fees, allowing users to swap USDC across chains efficiently and cost-effectively.
              </p>
            </div>
            <div>
              <div className="w-full h-64 sm:h-80 lg:h-96 rounded-3xl overflow-hidden">
                <OptimizedImage src="/images/chainswap/cctp.png" alt="Circle CCTP" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DLMM Pools Section */}
      <section id="dlmm" className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">DLMM Pools built for Base volatility</h2>
              <p className="text-xl text-gray-400">
                Deploy liquidity once and let adaptive bins rebalance for you. DLMM concentrates inventory where trades actually clear, boosting fee APRs without the micromanagement normal AMMs demand.
              </p>
              <ul className="space-y-3 text-gray-300 text-base">
                <li>• Configurable bin width and incentives per pool</li>
                <li>• Privacy-enabled routing so LP alpha stays hidden</li>
                <li>• Leaderboard + quests reward LP depth weekly</li>
              </ul>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white px-8 py-4 rounded-xl"
                  onClick={() => window.location.href = '/app'}
                >
                  Provide Liquidity
                </Button>
                <Button 
                  variant="outline"
                  className="border-[#47A1FF] text-white px-8 py-4 rounded-xl"
                  onClick={() => window.open('https://docs.decaflow.xyz', '_blank')}
                >
                  Read DLMM Guide
                </Button>
              </div>
            </div>
            <div className="w-full h-full rounded-3xl overflow-hidden bg-[#0F1419]/70 border border-[#47A1FF]/20 p-6">
              <DlmmStatsPanel data={dlmmSnapshot} loading={dlmmStatsLoading} />
            </div>
          </div>
          <div className="mt-12">
            {dlmmLoading ? (
              <p className="text-center text-gray-500">Loading recommended DLMM partners…</p>
            ) : dlmmProviders.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dlmmProviders.map((provider) => (
                  <div key={provider.id} className="p-6 rounded-2xl border border-[#47A1FF]/20 bg-[#0F1419]/60">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-semibold">{provider.name}</h4>
                      <span className="text-xs uppercase tracking-wide text-[#47A1FF]">{provider.status}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{provider.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
                      {provider.supportedChains?.map((chain) => (
                        <span key={chain} className="px-3 py-1 bg-white/5 rounded-full">Chain #{chain}</span>
                      ))}
                      {provider.tags?.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-[#3396FF]/10 text-[#47A1FF] rounded-full">{tag}</span>
                      ))}
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full border-[#47A1FF] text-white"
                      onClick={() => window.open(provider.docsUrl, '_blank')}
                    >
                      Integration Docs
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No DLMM partners listed yet. Ping us if you operate a DLMM on Base.</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-[#3396FF]/20 via-[#47A1FF]/20 to-[#3396FF]/20 border-y border-[#47A1FF]/20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Start using DecaFlow today</h2>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:scale-105 hover:shadow-[0_0_30px_rgba(51,150,255,0.5)] text-white font-bold px-12 py-6 text-lg rounded-xl transition-all duration-300"
            onClick={() => window.location.href = '/app'}
          >
            Open DApp
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#0A0E1F] border-t border-[#47A1FF]/10 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3396FF] to-[#47A1FF] flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-xl font-bold">DECAFLOW</span>
              </div>
              <p className="text-sm text-gray-400">
                Where Privacy Meets Secure Cross Chain Swaps
              </p>
              <div className="flex gap-4">
                <SocialIcon icon="twitter" href="https://x.com/decaflow" />
                <SocialIcon icon="telegram" href="https://t.me/decaflowprotocol" />
              </div>
            </div>

            {/* Find Us */}
            <div>
              <h3 className="font-semibold mb-4">Find Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#47A1FF] transition">CoinMarketCap</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">CoinGecko</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">DexScreener</a></li>
                <li><a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#47A1FF] transition">Base Explorer</a></li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="font-semibold mb-4">Socials</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="https://t.me/decaflowprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-[#47A1FF] transition">Telegram</a></li>
                <li><a href="https://x.com/decaflow" target="_blank" rel="noopener noreferrer" className="hover:text-[#47A1FF] transition">Twitter/X</a></li>
                <li><a href="https://docs.decaflow.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#47A1FF] transition">Docs</a></li>
              </ul>
            </div>

            {/* Website */}
            <div>
              <h3 className="font-semibold mb-4">Website</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/" className="hover:text-[#47A1FF] transition">Home</a></li>
                <li><a href="#CardCCIP" className="hover:text-[#47A1FF] transition">CCIP</a></li>
                <li><a href="#CardCCTP" className="hover:text-[#47A1FF] transition">CCTP</a></li>
                <li><a href="/app" className="hover:text-[#47A1FF] transition">DApp</a></li>
              </ul>
            </div>

            {/* Developers */}
            <div>
              <h3 className="font-semibold mb-4">Developers</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="https://docs.decaflow.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#47A1FF] transition">GitBook</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">Audit</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">Report Bug</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">Support</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-[#47A1FF]/10 pt-8 text-center text-sm text-gray-500">
            <p>Copyright © DecaFlow 2025 | Powered by Base</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const formatCurrency = (value?: number, maximumFractionDigits = 0) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
  }).format(value);
};

function StatsCard({ number, label, subtext }: { number: string; label: string; subtext?: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-[#1A1F2E]/30 border border-[#47A1FF]/10 hover:border-[#47A1FF]/30 transition group">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#47A1FF] mb-2 group-hover:scale-110 transition">
        {number}
      </div>
      <div className="text-base sm:text-lg text-gray-200">{label}</div>
      {subtext && <div className="text-sm text-gray-500 mt-2">{subtext}</div>}
    </div>
  );
}

function PioneerProgressCard({ pioneerCount, target, progress, loading, weeklyVolume }: { pioneerCount: number; target: number; progress: number; loading: boolean; weeklyVolume?: number }) {
  return (
    <div className="p-6 rounded-3xl bg-[#1A1F2E]/60 border border-[#47A1FF]/15">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-[#47A1FF]">Pioneer 100</p>
          <h3 className="text-2xl font-bold">{loading ? '—' : `${pioneerCount} / ${target}`}</h3>
        </div>
        <span className="text-sm text-gray-400">Founding traders</span>
      </div>
      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#3396FF] to-[#47A1FF]" style={{ width: `${Math.min(progress * 100, 100)}%` }}></div>
      </div>
      <p className="text-sm text-gray-400 mt-4">First 100 wallets lock in 2x airdrop allocation and permanent Founding Trader status.</p>
      <p className="text-sm text-gray-500 mt-2">Weekly volume feeding prizes: {weeklyVolume ? formatCurrency(weeklyVolume, 1) : '—'}</p>
    </div>
  );
}

function UrgencyCard({ campaignStats, campaignLoading }: { campaignStats: { dailyTrades: number; dailyVolumeUsd: number; weeklyVolumeUsd: number; prizePoolUsd: number; privacySwapsToday: number; activeMultipliers: number; updatedAt: string } | null; campaignLoading: boolean }) {
  return (
    <div className="p-6 rounded-3xl bg-[#141B3D]/50 border border-[#47A1FF]/15">
      <p className="text-sm uppercase tracking-widest text-[#FFAB5E]">Live Campaign</p>
      <h3 className="text-3xl font-bold mt-2 mb-4">Privacy Sprint</h3>
      <p className="text-gray-300 text-base mb-6">Complete a privacy swap today and earn 3x points plus leaderboard priority. Cash rewards recycle from platform fees every week.</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Swaps today</p>
          <p className="text-2xl font-bold text-white">{campaignLoading || !campaignStats ? '—' : campaignStats.dailyTrades.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Prize pool (week)</p>
          <p className="text-2xl font-bold text-white">{campaignLoading || !campaignStats ? '—' : formatCurrency(campaignStats.prizePoolUsd, 1)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Privacy swaps today</p>
          <p className="text-2xl font-bold text-white">{campaignLoading || !campaignStats ? '—' : campaignStats.privacySwapsToday.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Active multipliers</p>
          <p className="text-2xl font-bold text-white">{campaignLoading || !campaignStats ? '—' : campaignStats.activeMultipliers}</p>
        </div>
      </div>
      <div className="mt-6 text-sm text-gray-400 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#47A1FF]"></span>
        {campaignLoading || !campaignStats ? 'Updating…' : `Last sync ${new Date(campaignStats.updatedAt).toLocaleTimeString()}`}
      </div>
    </div>
  );
}

function LogoCard({ name }: { name: string }) {
  const logoMap: Record<string, string> = {
    'Arbitrum': '/images/chains/arbitrum.png',
    'Base': '/images/chains/base.png',
    'Optimism': '/images/chains/optimism.png',
    'Polygon': '/images/chains/polygon.png',
    'Ethereum': '/images/chains/ethereum.png',
    'Avalanche': '/images/chains/avalanche.png'
  };
  
  return (
    <div className="flex-shrink-0 w-32 h-16 sm:w-40 sm:h-20 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:border-[#47A1FF]/50 transition group p-4">
      <OptimizedImage 
        src={logoMap[name]} 
        alt={name} 
        className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition"
        lazy={false}
      />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const iconMap: Record<string, string> = {
    '🔗': '/images/chainswap/introducing_1.png',
    '🛡️': '/images/chainswap/introducing_2.png',
    '⚡': '/images/chainswap/introducing_3.png'
  };
  
  return (
    <div className="p-8 rounded-2xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 hover:border-[#47A1FF]/30 transition-all group hover:scale-105 duration-300">
      <div className="w-32 h-32 mb-6 mx-auto">
        <OptimizedImage 
          src={iconMap[icon]} 
          alt={title} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <h3 className="text-2xl font-bold mb-4 group-hover:text-[#47A1FF] transition">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function SocialIcon({ icon, href }: { icon: string; href: string }) {
  const iconMap: Record<string, string> = {
    'twitter': '/images/social/twitter.png',
    'telegram': '/images/social/telegram.png',
    'discord': '/images/social/discord.png',
    'medium': '/images/social/medium.png'
  };
  
  return (
    <a 
      href={href} 
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#3396FF] border border-white/10 hover:border-[#3396FF] flex items-center justify-center transition-all p-2"
    >
      <OptimizedImage src={iconMap[icon]} alt={icon} className="w-full h-full object-contain" lazy={false} />
    </a>
  );
}

interface DlmmPool {
  id: string;
  poolAddress: string;
  token0: { symbol: string; address: string };
  token1: { symbol: string; address: string };
  liquidityUsd: number;
  dailyVolumeUsd: number;
  lastPrice?: number;
  apr?: number;
  fees: {
    makerFeeBps?: number;
    takerFeeBps?: number;
  };
  binWidthBps?: number;
  bins?: Array<{ id: string; lowerPrice: number; upperPrice: number; liquidityUsd: number }>;
  stats?: {
    bid?: number;
    ask?: number;
  };
  updatedAt?: string;
}

interface DlmmSnapshot {
  provider: string;
  pools: DlmmPool[];
  stats: {
    totalLiquidityUsd: number;
    totalVolumeUsd: number;
    averageFeeBps: number;
    poolCount: number;
    lastUpdated: string;
  };
}

function DlmmStatsPanel({ data, loading }: { data: DlmmSnapshot | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 rounded-xl bg-white/5"></div>
        ))}
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-gray-400">Unable to load live DLMM stats right now. Please try again shortly.</p>;
  }

  const topPools = data.pools.slice(0, 3);

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-[#47A1FF]">{data.provider}</p>
        <h3 className="text-2xl font-bold">Live DLMM Grid</h3>
        <p className="text-[11px] text-gray-500">Updated {new Date(data.stats.lastUpdated).toLocaleTimeString()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DlmmStatPill label="DLMM TVL" value={formatCompactCurrency(data.stats.totalLiquidityUsd)} sublabel="Across Base" />
        <DlmmStatPill label="24h Volume" value={formatCompactCurrency(data.stats.totalVolumeUsd)} sublabel="Adaptive bins" />
        <DlmmStatPill label="Avg. Fee" value={`${formatNumber(data.stats.averageFeeBps, 1)} bps`} sublabel="Maker share" />
      </div>

      <div className="flex-1 overflow-hidden">
        {topPools.length === 0 ? (
          <p className="text-sm text-gray-500">No Maverick pools detected yet.</p>
        ) : (
          <div className="space-y-3">
            {topPools.map((pool) => (
              <DlmmPoolRow key={pool.id} pool={pool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DlmmStatPill({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-2xl bg-[#111629] border border-white/5 p-4">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sublabel && <p className="text-[11px] text-gray-500 mt-1">{sublabel}</p>}
    </div>
  );
}

function DlmmPoolRow({ pool }: { pool: DlmmPool }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0F1E]/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">
            {pool.token0.symbol} / {pool.token1.symbol}
          </p>
          <p className="text-[11px] text-gray-500">
            Fee {pool.fees.makerFeeBps ? `${formatNumber(pool.fees.makerFeeBps, 1)} bps` : '—'} · Bin {pool.binWidthBps ? `${formatNumber(pool.binWidthBps, 1)} bps` : 'n/a'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-green-400">{pool.apr ? `${pool.apr}% APR` : '—'}</p>
          <p className="text-[11px] text-gray-500">{formatCompactCurrency(pool.dailyVolumeUsd)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4 text-xs text-gray-400">
        <div>
          <p className="uppercase text-[10px]">TVL</p>
          <p className="text-white text-sm">{formatCompactCurrency(pool.liquidityUsd)}</p>
        </div>
        <div>
          <p className="uppercase text-[10px]">Spread</p>
          <p className="text-white text-sm">
            {pool.stats?.bid && pool.stats?.ask ? `${formatNumber(pool.stats.ask - pool.stats.bid, 4)} Δ` : '—'}
          </p>
        </div>
        <div>
          <p className="uppercase text-[10px]">Last Price</p>
          <p className="text-white text-sm">{pool.lastPrice ? formatNumber(pool.lastPrice, 4) : '—'}</p>
        </div>
      </div>
    </div>
  );
}

function formatCompactCurrency(value?: number) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '—';
  }
  if (Math.abs(amount) >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

function formatNumber(value?: number, digits = 2) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '—';
  }
  return amount.toFixed(digits);
}

<style jsx>{`
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    animation: scroll 30s linear infinite;
    will-change: transform;
  }
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-1000 { animation-delay: 1s; }
`}</style>
