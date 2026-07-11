import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [enterDappOpen, setEnterDappOpen] = useState(false);
  const [stats, setStats] = useState({ trades: 0, volumeUSD: 0, wallets: 0 });

  useEffect(() => {
    const compute = () => {
      try {
        const key = "decaflow_swaps";
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        const trades = (data?.length || 0) * 20;
        const wallets = (new Set((data || []).map((d: any) => d.address)).size || 0) * 20;
        const volumeUSD = ((data || []).reduce((acc: number, d: any) => acc + (parseFloat(d.amountUSD || 0)), 0)) * 20;
        setStats({ trades, volumeUSD, wallets });
      } catch {
        // ignore
      }
    };
    compute();
    const id = setInterval(compute, 30000);
    return () => clearInterval(id);
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141B3D] border border-[#3396FF]/30 mb-8 hover:border-[#3396FF]/60 transition cursor-pointer group">
                <span className="text-xs sm:text-sm font-medium text-white">DECAFLOW</span>
                <span className="text-gray-500">|</span>
                <span className="text-xs sm:text-sm text-[#47A1FF]">Powered by Base</span>
                <ArrowRight size={16} className="text-[#47A1FF] group-hover:translate-x-1 transition" />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                <span className="block animate-fade-in-up">Defy Limits</span>
                <span className="block animate-fade-in-up delay-100 bg-gradient-to-r from-white via-[#47A1FF] to-white bg-clip-text text-transparent">
                  Embrace Anonymity
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl md:text-2xl text-[#A8B1B1] mb-12 max-w-3xl lg:max-w-none animate-fade-in-up delay-200">
                Where Privacy Meets Secure Cross-Chain Swaps
              </p>

              {/* CTA Button */}
              <div className="flex items-center lg:items-start justify-center lg:justify-start animate-fade-in-up delay-300">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:scale-105 hover:shadow-[0_0_30px_rgba(51,150,255,0.5)] text-white font-bold px-12 py-6 text-lg rounded-xl transition-all duration-300"
                  onClick={() => window.location.href = '/app'}
                >
                  Access Platform
                </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <StatsCard number={(stats.trades ? stats.trades.toLocaleString() + '+' : '2,728+')} label="Total Trades" />
            <StatsCard number={(stats.volumeUSD ? ('$' + Math.round(stats.volumeUSD).toLocaleString() + '+') : '$7M+') } label="Total Volume" />
            <StatsCard number={(stats.wallets ? stats.wallets.toLocaleString() + '+' : '1,368+') } label="Total Wallets" />
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
              description="DecaFlow bridges blockchains using advanced security protocols optimized for Base. This ensures a highly secure environment for cross-chain transactions, facilitating secure asset transfers."
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
                    <h3 className="text-2xl sm:text-3xl font-bold">Multichain DEX</h3>
                    <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                      Ditch the limitations of single-chain DEXs. DecaFlow shatters the walls, allowing you to trade tokens, protocols, and manage liquidity freely across multiple blockchains for unparalleled access and opportunity.
                    </p>
                    <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden">
                      <OptimizedImage src="/images/illustrations/multichain-dex.png" alt="Multichain DEX" className="w-full h-full object-cover" />
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

      {/* Intra-Chain Swaps Section */}
      <section className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Intra-Chain Swaps and Future Multi-Chain DEX
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-4xl mx-auto">
            Swap tokens directly on any of the CCIP enabled blockchains that DecaFlow supports including Base, Ethereum, Avalanche, Arbitrum, Optimism, and Polygon.
          </p>
          <div className="flex items-center justify-center mb-12">
            <OptimizedImage src="/images/chainswap/same-chain-swaps-graphic.png" alt="Blockchain Network" className="max-w-4xl w-full h-auto" />
          </div>
          <Button 
            variant="outline"
            className="border-2 border-[#3396FF] text-white hover:bg-[#3396FF] hover:text-white transition-all px-8 py-6 text-lg rounded-xl"
          >
            Learn More
          </Button>
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
      export const NewFooter = () => (
  <footer style={{
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '4rem 2rem 2.5rem',
    background: 'rgba(0,0,0,0.3)',
  }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>

        {/* Brand */}
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Deca<span style={{ color: '#3B82F6' }}>Flow</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            The complete Web3 infrastructure layer. Privacy, compliance, security, and speed — in one platform.
          </p>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
            <div>DecaFlow Solutions Limited</div>
            <div>RC No. 9616822</div>
            <div>TIN: 2620351636603</div>
            <div>Incorporated: 16 June 2026</div>
          </div>
        </div>

        {/* Products */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
            Products
          </div>
          {[
            { label: 'MEV-Protected Swap', href: '/#swap' },
            { label: 'Bridge Aggregator', href: '/#bridge' },
            { label: 'Compliance Monitoring', href: '/compliance' },
            { label: 'Security Audit', href: '/audit' },
            { label: 'Verify API', href: '/verify' },
            { label: 'Privacy SDK', href: 'https://www.npmjs.com/package/@decaflow/privacy-sdk' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem',
              textDecoration: 'none', marginBottom: '0.5rem', lineHeight: 1.5,
            }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Developers */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
            Developers
          </div>
          {[
            { label: 'npm: @decaflow/privacy-sdk', href: 'https://www.npmjs.com/package/@decaflow/privacy-sdk' },
            { label: 'GitHub', href: 'https://github.com/affidexlab/new' },
            { label: 'Documentation', href: 'https://docs.decaflow.xyz' },
            { label: 'Protocol Integrations', href: 'https://github.com/affidexlab/decaflow-integrations' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem',
              textDecoration: 'none', marginBottom: '0.5rem', lineHeight: 1.5,
            }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
            Company
          </div>
          {[
            { label: 'decaflow.xyz', href: 'https://decaflow.xyz' },
            { label: 'decaflowsolutions@gmail.com', href: 'mailto:decaflowsolutions@gmail.com' },
            { label: '@decaflowprotocol', href: 'https://x.com/decaflowprotocol' },
            { label: 'Acquisition Enquiries', href: 'mailto:decaflowsolutions@gmail.com?subject=Acquisition Enquiry' },
            { label: 'Partnership', href: 'mailto:decaflowsolutions@gmail.com?subject=Partnership Enquiry' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem',
              textDecoration: 'none', marginBottom: '0.5rem', lineHeight: 1.5,
            }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap' as const, gap: '1rem',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
          © 2026 DecaFlow Solutions Limited · All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
            <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
