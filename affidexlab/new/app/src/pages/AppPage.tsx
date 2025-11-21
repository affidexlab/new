import { Settings, ExternalLink } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SwapApp from "./SwapApp";
import { OptimizedImage } from "@/components/OptimizedImage";

export default function AppPage() {
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
              <a href="#" className="text-gray-400 hover:text-white transition">Docs</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Support</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Revenue Share</a>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition border border-[#1E2940] bg-[#0D1624]">
                <Settings size={18} className="text-gray-400" />
              </button>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-20">
        <SwapApp />
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
                <img src="https://arbitrum.io/favicon.ico" alt="Arbitrum" className="w-4 h-4" />
                <span className="text-[10px] text-gray-400">Powered by Arbitrum</span>
              </a>
            </div>

            {/* Center - Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-500">
              <a href="mailto:team@decaflow.tech" className="hover:text-[#47A1FF] transition">
                Email: team@decaflow.tech
              </a>
              <span className="hidden sm:inline text-gray-700">|</span>
              <span>ENS: Decaflow.arb</span>
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
