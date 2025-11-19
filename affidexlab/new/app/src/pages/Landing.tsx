import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E27]/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#3396FF] to-[#47A1FF] flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">D</span>
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">DECAFLOW</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <a href="/" className="text-white hover:text-[#47A1FF] transition">Home</a>
              <a href="#CardArbitrum" className="text-gray-400 hover:text-[#47A1FF] transition">Arbitrum</a>
              <a href="#CardBridge" className="text-gray-400 hover:text-[#47A1FF] transition">Bridge</a>
              <Button 
                className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 text-white font-semibold px-6"
                onClick={() => window.location.href = '/app'}
              >
                ENTER DAPP
              </Button>
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
              <a href="#CardArbitrum" className="block text-gray-400 hover:text-[#47A1FF] transition py-2">Arbitrum</a>
              <a href="#CardBridge" className="block text-gray-400 hover:text-[#47A1FF] transition py-2">Bridge</a>
              <Button 
                className="w-full bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 text-white font-semibold"
                onClick={() => window.location.href = '/app'}
              >
                ENTER DAPP
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 sm:pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#141B3D] to-[#0A0E27]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3396FF] rounded-full filter blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#47A1FF] rounded-full filter blur-[120px] animate-pulse delay-1000"></div>
          </div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(71,161,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(71,161,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141B3D] border border-[#3396FF]/30 mb-8 hover:border-[#3396FF]/60 transition cursor-pointer group">
            <span className="text-xs sm:text-sm font-medium text-white">DECAFLOW</span>
            <span className="text-gray-500">|</span>
            <span className="text-xs sm:text-sm text-[#47A1FF]">Powered by Arbitrum</span>
            <ArrowRight size={16} className="text-[#47A1FF] group-hover:translate-x-1 transition" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="block animate-fade-in-up">Defy Limits</span>
            <span className="block animate-fade-in-up delay-100 bg-gradient-to-r from-white via-[#47A1FF] to-white bg-clip-text text-transparent">
              Embrace Anonymity
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-[#A8B1B1] mb-12 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Where Privacy Meets Secure Cross-Chain Swaps
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:scale-105 hover:shadow-[0_0_30px_rgba(51,150,255,0.5)] text-white font-bold px-12 py-6 text-lg rounded-xl transition-all duration-300"
              onClick={() => window.location.href = '/app'}
            >
              Access Platform
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-[#3396FF] text-white hover:bg-[#3396FF]/10 font-semibold px-8 py-6 text-lg rounded-xl transition-all"
              onClick={() => window.location.href = '/app/privacy'}
            >
              🔒 Privacy Swap
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 sm:py-20 bg-[#0F1419]/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <StatsCard number="2,728+" label="Total Trades" />
            <StatsCard number="$7M+" label="Total Volume" />
            <StatsCard number="1,368+" label="Total Wallets" />
          </div>

          {/* Partner Logos Carousel */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8 sm:gap-12">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-8 sm:gap-12 items-center">
                  <LogoCard name="Arbitrum" />
                  <LogoCard name="Base" />
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

      {/* Introducing DecaFlow */}
      <section className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Introducing DecaFlow</h2>
            <p className="text-xl text-gray-400">A New Era of Interoperability and Privacy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🔗"
              title="Integration Challenges"
              description="Web3's evolution requires asset movement across blockchains, however, the fragmented ecosystem is complex and risky, hindering widespread crypto adoption."
            />
            <FeatureCard 
              icon="🛡️"
              title="DecaFlow Solution"
              description="DecaFlow bridges blockchains using advanced security protocols optimized for Arbitrum. This ensures a highly secure environment for cross-chain transactions, facilitating secure asset transfers."
            />
            <FeatureCard 
              icon="⚡"
              title="Simplified Transactions"
              description="DecaFlow supports secure swaps through a multi-chain DEX. It enables cross-chain swaps, privacy-focused transactions, and smooth token distribution in one environment."
            />
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

          <div className="bg-[#1A1F2E]/50 rounded-3xl border border-[#47A1FF]/10 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Tabs */}
              <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-[#47A1FF]/10">
                {['Cross Chain Swap', 'Telegram Bot', 'Privacy Swap', 'Multichain DEX'].map((tab, idx) => (
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
                      Embrace interoperability and unlock the full potential of DeFi with DecaFlow's Cross Chain Swap utilizing Arbitrum's infrastructure and bridging protocols to trade any token effortlessly between various leading blockchains, all within a single platform.
                    </p>
                    <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-[#3396FF]/20 to-[#47A1FF]/10 rounded-2xl flex items-center justify-center border border-[#47A1FF]/20">
                      <span className="text-6xl sm:text-8xl">🌉</span>
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold">Telegram Bot</h3>
                    <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                      DecaFlow prioritizes user efficiency by incorporating technology built upon next-generation infrastructure into our Telegram Bot.
                    </p>
                    <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-[#3396FF]/20 to-[#47A1FF]/10 rounded-2xl flex items-center justify-center border border-[#47A1FF]/20">
                      <span className="text-6xl sm:text-8xl">💬</span>
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold">Privacy Swap</h3>
                    <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                      Unlike traditional swaps that leave visibility to all, DecaFlow utilizes advanced techniques to ensure Privacy and complete anonymity throughout the entire Swap process.
                    </p>
                    <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-[#3396FF]/20 to-[#47A1FF]/10 rounded-2xl flex items-center justify-center border border-[#47A1FF]/20">
                      <span className="text-6xl sm:text-8xl">🔐</span>
                    </div>
                  </div>
                )}
                {activeTab === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold">Multichain DEX</h3>
                    <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                      Ditch the limitations of single-chain DEXs. DecaFlow shatters the walls, allowing you to trade tokens, protocols, and manage liquidity freely across multiple blockchains for unparalleled access and opportunity.
                    </p>
                    <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-[#3396FF]/20 to-[#47A1FF]/10 rounded-2xl flex items-center justify-center border border-[#47A1FF]/20">
                      <span className="text-6xl sm:text-8xl">🌐</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arbitrum Integration Section */}
      <section id="CardArbitrum" className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-[#3396FF]/30 to-[#47A1FF]/20 rounded-3xl flex items-center justify-center border border-[#47A1FF]/30">
                <span className="text-[120px] sm:text-[160px]">⚡</span>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Integrating Arbitrum's Layer 2 Scaling Solution
              </h2>
              <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                DecaFlow leverages Arbitrum's cutting-edge Layer 2 technology for secure and efficient cross-chain swaps. This innovative protocol boasts industry-leading security through its decentralized network and optimistic rollup architecture, allowing for the seamless transfer of both data and tokens between blockchains with minimal fees and maximum speed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bridge Protocol Section */}
      <section id="CardBridge" className="relative py-20 sm:py-32 bg-[#0F1419]/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Multi-Protocol Bridging - CCTP, CCIP & Socket
              </h2>
              <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                DecaFlow supports multiple bridging protocols for maximum flexibility. Circle's CCTP eliminates the need for complex conversions by facilitating direct USDC swaps between supported blockchains. Combined with Chainlink's CCIP and Socket aggregator, we offer the most comprehensive bridging solution with a reliable burn and mint mechanism. Our protocol streamlines transactions, minimizing processing times and fees, allowing users to swap assets across chains efficiently and cost-effectively.
              </p>
            </div>
            <div>
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-[#47A1FF]/30 to-[#3396FF]/20 rounded-3xl flex items-center justify-center border border-[#47A1FF]/30">
                <span className="text-[120px] sm:text-[160px]">🌉</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intra-Chain Swaps Section */}
      <section className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Intra-Chain Swaps and Future Multi-Chain DEX
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-4xl mx-auto">
            Swap tokens directly on any of the supported blockchains that DecaFlow integrates including Arbitrum, Ethereum, Avalanche, Binance Smart Chain, Optimism, Polygon, and Base.
          </p>
          <Button 
            variant="outline"
            className="border-2 border-[#3396FF] text-white hover:bg-[#3396FF] hover:text-white transition-all px-8 py-6 text-lg rounded-xl"
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#0A0E1F] border-t border-[#47A1FF]/10 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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
                <SocialIcon>𝕏</SocialIcon>
                <SocialIcon>TG</SocialIcon>
                <SocialIcon>DC</SocialIcon>
                <SocialIcon>M</SocialIcon>
              </div>
            </div>

            {/* Find Us */}
            <div>
              <h3 className="font-semibold mb-4">Find Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#47A1FF] transition">CoinMarketCap</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">CoinGecko</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">DexScreener</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">Arbitrum Explorer</a></li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="font-semibold mb-4">Socials</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#47A1FF] transition">Telegram</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">Twitter/X</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">Discord</a></li>
                <li><a href="#" className="hover:text-[#47A1FF] transition">Medium</a></li>
              </ul>
            </div>

            {/* Website */}
            <div>
              <h3 className="font-semibold mb-4">Website</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/" className="hover:text-[#47A1FF] transition">Home</a></li>
                <li><a href="#CardArbitrum" className="hover:text-[#47A1FF] transition">Arbitrum</a></li>
                <li><a href="#CardBridge" className="hover:text-[#47A1FF] transition">Bridge</a></li>
                <li><a href="/app" className="hover:text-[#47A1FF] transition">DApp</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-[#47A1FF]/10 pt-8 text-center text-sm text-gray-500">
            <p>Copyright © DecaFlow 2024 | Powered by Arbitrum</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatsCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-[#1A1F2E]/30 border border-[#47A1FF]/10 hover:border-[#47A1FF]/30 transition group">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#47A1FF] mb-2 group-hover:scale-110 transition">
        {number}
      </div>
      <div className="text-base sm:text-lg text-gray-400">{label}</div>
    </div>
  );
}

function LogoCard({ name }: { name: string }) {
  return (
    <div className="flex-shrink-0 w-32 h-16 sm:w-40 sm:h-20 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:border-[#47A1FF]/50 transition group">
      <span className="text-xs sm:text-sm font-semibold text-gray-400 group-hover:text-[#47A1FF] transition">
        {name}
      </span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 hover:border-[#47A1FF]/30 transition-all group hover:scale-105 duration-300">
      <div className="text-6xl mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 group-hover:text-[#47A1FF] transition">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <a 
      href="#" 
      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#3396FF] border border-white/10 hover:border-[#3396FF] flex items-center justify-center transition-all text-sm font-bold"
    >
      {children}
    </a>
  );
}

<style jsx>{`
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    animation: scroll 30s linear infinite;
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
