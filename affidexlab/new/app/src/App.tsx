import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swap from "./pages/Swap";
import Bridge from "./pages/Bridge";
import Pools from "./pages/Pools";
import CreatePool from "./pages/CreatePool";
import PrivacySwap from "./pages/PrivacySwap";
import Analytics from "./pages/Analytics";
import Landing from "./pages/Landing";
import { Menu, Settings } from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");

  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    if (path === "/" && !hash) {
      setCurrentPage("home");
    } else if (path === "/app" || hash === "#app") {
      setCurrentPage("app");
    } else if (path === "/app/privacy" || hash === "#privacy") {
      setCurrentPage("privacy");
    }
  }, []);

  if (currentPage === "home") {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* DApp Header */}
      <header className="sticky top-0 z-50 bg-[#0F1419]/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { setCurrentPage("home"); window.location.href = "/"; }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3396FF] to-[#47A1FF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-lg font-bold">DECAFLOW</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="/app" className="text-white hover:text-[#47A1FF] transition">Swap</a>
            <a href="/app#pools" className="text-gray-400 hover:text-[#47A1FF] transition">Pools</a>
            <a href="/app#bridge" className="text-gray-400 hover:text-[#47A1FF] transition">Bridge</a>
            <a href="/app#analytics" className="text-gray-400 hover:text-[#47A1FF] transition">Analytics</a>
            <a href="/" className="text-gray-400 hover:text-[#47A1FF] transition">Home</a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition">
              <Settings size={18} className="text-gray-400 hover:text-[#47A1FF]" />
            </button>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentPage === "privacy" ? (
          <section>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2">Privacy Swap</h1>
              <p className="text-gray-400">Trade with complete anonymity using MEV protection</p>
            </div>
            <PrivacySwap />
          </section>
        ) : (
          <>
            {/* Hero Banner */}
            <section className="mb-8 rounded-2xl bg-gradient-to-r from-[#3396FF]/10 via-[#47A1FF]/10 to-[#3396FF]/10 p-8 border border-[#47A1FF]/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3396FF]/20 border border-[#3396FF]/30 text-xs font-medium">
                  Powered by Arbitrum
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Defy Limits<br />Embrace Anonymity</h1>
              <p className="text-sm text-gray-400">
                Where Privacy Meets Secure Cross-Chain Swaps
              </p>
            </section>

            <Tabs defaultValue="swap" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-5 bg-[#1A1F2E] border border-[#47A1FF]/10">
                <TabsTrigger value="swap">Swap</TabsTrigger>
                <TabsTrigger value="pools">Pools</TabsTrigger>
                <TabsTrigger value="create">Create Pool</TabsTrigger>
                <TabsTrigger value="bridge">Bridge</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="swap"><Swap /></TabsContent>
              <TabsContent value="pools"><Pools /></TabsContent>
              <TabsContent value="create"><CreatePool /></TabsContent>
              <TabsContent value="bridge"><Bridge /></TabsContent>
              <TabsContent value="analytics"><Analytics /></TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-500">
        <p>Built for Arbitrum • Routing via 0x + CoW • Bridge via CCIP/CCTP with Socket fallback</p>
      </footer>
    </div>
  );
}
