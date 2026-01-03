import { useState } from "react";
import { Settings, ExternalLink } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SwapApp from "./SwapApp";
import Bridge from "./Bridge";
import Analytics from "./Analytics";
import Pools from "./Pools";
import PointsDashboard from "@/components/PointsDashboard";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampaignStats, type GlobalStats, type CampaignStats } from "@/hooks/useCampaignStats";

export default function AppPage() {
  const [activeTab, setActiveTab] = useState("swap");
  const { globalStats, campaignStats, loading: campaignLoading } = useCampaignStats(45000);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1426] via-[#0A0F1E] to-[#080D1A] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0F1E]/80 backdrop-blur-lg border-b border-white/5">
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

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="/" className="text-gray-400 hover:text-white transition">Home</a>
              <a href="/app" className="text-white transition">Swap</a>
              <a href="/leaderboard" className="text-gray-400 hover:text-white transition">Leaderboard</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Docs</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Support</a>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition border border-[#1E2940] bg-[#0D1624]">
                <Settings size={18} className="text-gray-400" />
              </button>
              <ConnectButton />
            </div>
          </div>
          <div className="py-4">
            <CampaignBanner globalStats={globalStats} campaignStats={campaignStats} loading={campaignLoading} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8 bg-[#0D1624] border border-[#1E2940] p-1 rounded-xl">
            <TabsTrigger 
              value="swap" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3396FF] data-[state=active]:to-[#47A1FF] data-[state=active]:text-white rounded-lg transition-all"
            >
              Swap
            </TabsTrigger>
            <TabsTrigger 
              value="bridge" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3396FF] data-[state=active]:to-[#47A1FF] data-[state=active]:text-white rounded-lg transition-all"
            >
              Bridge
            </TabsTrigger>
            <TabsTrigger 
              value="pools" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3396FF] data-[state=active]:to-[#47A1FF] data-[state=active]:text-white rounded-lg transition-all"
            >
              Pools
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3396FF] data-[state=active]:to-[#47A1FF] data-[state=active]:text-white rounded-lg transition-all"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="points" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3396FF] data-[state=active]:to-[#47A1FF] data-[state=active]:text-white rounded-lg transition-all"
            >
              Points
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="mt-0">
            <SwapApp />
          </TabsContent>

          <TabsContent value="bridge" className="mt-0">
            <Bridge />
          </TabsContent>

          <TabsContent value="pools" className="mt-0">
            <Pools />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <Analytics />
          </TabsContent>

          <TabsContent value="points" className="mt-0">
            <PointsDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
            {/* Left - Social Icons */}
            <div className="flex items-center gap-3">
              <a href="#" className="opacity-70 hover:opacity-100 transition">
                <OptimizedImage src="/images/social/medium.png" alt="Medium" className="w-6 h-6" />
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition">
                <OptimizedImage src="/images/social/telegram.png" alt="Telegram" className="w-6 h-6" />
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition">
                <OptimizedImage src="/images/social/twitter.png" alt="Twitter" className="w-6 h-6" />
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition">
                <OptimizedImage src="/images/social/discord.png" alt="Discord" className="w-6 h-6" />
              </a>
              <a 
                href="https://arbitrum.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E2940] hover:border-[#47A1FF]/50 transition bg-[#0D1624]"
              >
                <img src="/images/chains/arbitrum.png" alt="Base" className="w-4 h-4" />
                <span className="text-[10px] text-gray-400">Built on Arbitrum</span>
              </a>
            </div>

            {/* Center - Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-500">
              <a href="mailto:team@decaflow.tech" className="hover:text-[#47A1FF] transition">
                Email: team@decaflow.tech
              </a>
              <span className="hidden sm:inline text-gray-700">|</span>
              <span>ENS: Decaflow.base.eth</span>
            </div>

            {/* Right - Version */}
            <div className="flex items-center gap-2">
              <a href="#" className="text-gray-500 hover:text-[#47A1FF] transition flex items-center gap-1">
                Version 1.0.0
                <ExternalLink size={12} />
              </a>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const PIONEER_TARGET = 100;

function CampaignBanner({ globalStats, campaignStats, loading }: { globalStats: GlobalStats; campaignStats: CampaignStats; loading: boolean }) {
  const pioneerCount = globalStats?.uniqueWallets ?? 0;
  const prizePool = formatBannerCurrency(campaignStats?.prizePoolUsd ?? 0);
  const privacySwaps = campaignStats?.privacySwapsToday ?? 0;
  const multipliers = campaignStats?.activeMultipliers ?? 0;
  const progress = Math.min(pioneerCount / PIONEER_TARGET, 1);

  return (
    <div className="rounded-2xl border border-[#1E2940] bg-[#0D1624] p-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CampaignBannerStat label="Prize Pool" value={prizePool} loading={loading} sublabel="Weekly rewards" />
        <CampaignBannerStat label="Privacy Swaps" value={privacySwaps.toLocaleString()} loading={loading} sublabel="Today" />
        <CampaignBannerStat label="Active Multipliers" value={`${multipliers}x`} loading={loading} sublabel="Privacy Sprint" />
        <CampaignBannerStat label="Swaps Logged" value={globalStats.totalTrades.toLocaleString()} loading={loading} sublabel="Lifetime" />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Pioneer 100 Progress</span>
          <span>{loading ? '—' : `${pioneerCount}/${PIONEER_TARGET}`}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#3396FF] to-[#47A1FF]" style={{ width: `${Math.min(progress * 100, 100)}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function CampaignBannerStat({ label, value, sublabel, loading }: { label: string; value: string; sublabel?: string; loading: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#080D1A]/70 p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-white">{loading ? '—' : value}</p>
      {sublabel && <p className="text-[10px] text-gray-500">{sublabel}</p>}
    </div>
  );
}

function formatBannerCurrency(value: number) {
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

