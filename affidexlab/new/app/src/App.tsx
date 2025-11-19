import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGeoBlock } from "@/hooks/useGeoBlock";
import { GeoBlockModal } from "@/components/GeoBlockModal";
import Home from "./pages/Home";
import Swap from "./pages/Swap";
import Bridge from "./pages/Bridge";
import Pools from "./pages/Pools";
import CreatePool from "./pages/CreatePool";
import PrivacySwap from "./pages/PrivacySwap";
import Analytics from "./pages/Analytics";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

type Page = "home" | "app" | "terms" | "privacy";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { blocked, loading, country } = useGeoBlock();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === "terms") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setCurrentPage("home")}
              className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-cyan-500 transition-all"
            >
              DECAFLOW
            </button>
            <nav className="hidden gap-8 sm:flex text-sm font-medium">
              <button onClick={() => setCurrentPage("terms")} className="hover:text-blue-400 transition-colors">Terms</button>
              <button onClick={() => setCurrentPage("privacy")} className="text-blue-400">Privacy</button>
            </nav>
          </div>
        </header>
        <Terms />
        <footer className="border-t py-8 text-center text-xs text-muted-foreground">
          <div className="container mx-auto px-4">
            <div className="mb-4">
              Built for Arbitrum • Routing via 0x + CoW • Bridge via CCIP/CCTP with Socket fallback
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => setCurrentPage("terms")} className="hover:text-foreground">
                Terms of Service
              </button>
              <button onClick={() => setCurrentPage("privacy")} className="hover:text-foreground">
                Privacy Policy
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (currentPage === "privacy") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <button
              onClick={() => setCurrentPage("home")}
              className="text-lg font-semibold hover:text-primary transition-colors"
            >
              DECAFLOW
            </button>
            <nav className="hidden gap-6 sm:flex text-sm">
              <button onClick={() => setCurrentPage("terms")} className="hover:text-primary">Terms</button>
              <button onClick={() => setCurrentPage("privacy")} className="text-primary">Privacy</button>
            </nav>
          </div>
        </header>
        <Privacy />
        <footer className="border-t py-8 text-center text-xs text-muted-foreground">
          <div className="container mx-auto px-4">
            <div className="mb-4">
              Built for Arbitrum • Routing via 0x + CoW • Bridge via CCIP/CCTP with Socket fallback
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => setCurrentPage("terms")} className="hover:text-foreground">
                Terms of Service
              </button>
              <button onClick={() => setCurrentPage("privacy")} className="hover:text-foreground">
                Privacy Policy
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (currentPage === "home") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <GeoBlockModal open={blocked} country={country} />
        
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setCurrentPage("home")}
              className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-cyan-500 transition-all"
            >
              DECAFLOW
            </button>
            <nav className="hidden gap-8 sm:flex text-sm font-medium">
              <button onClick={() => setCurrentPage("app")} className="hover:text-blue-400 transition-colors">App</button>
              <button onClick={() => setCurrentPage("terms")} className="hover:text-blue-400 transition-colors">Terms</button>
              <button onClick={() => setCurrentPage("privacy")} className="hover:text-blue-400 transition-colors">Privacy</button>
            </nav>
            <ConnectButton />
          </div>
        </header>

        <main>
          <Home onLaunchApp={() => !blocked && setCurrentPage("app")} />
        </main>

        <footer className="border-t py-8 text-center text-xs text-muted-foreground">
          <div className="container mx-auto px-4">
            <div className="mb-4">
              Built for Arbitrum • Routing via 0x + CoW • Bridge via CCIP/CCTP with Socket fallback
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => setCurrentPage("terms")} className="hover:text-foreground">
                Terms of Service
              </button>
              <button onClick={() => setCurrentPage("privacy")} className="hover:text-foreground">
                Privacy Policy
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GeoBlockModal open={blocked} country={country} />
      
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <button
            onClick={() => setCurrentPage("home")}
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-cyan-500 transition-all"
          >
            DECAFLOW
          </button>
          <nav className="hidden gap-8 sm:flex text-sm font-medium">
            <a href="#swap" className="hover:text-blue-400 transition-colors">Swap</a>
            <a href="#pools" className="hover:text-blue-400 transition-colors">Pools</a>
            <a href="#create" className="hover:text-blue-400 transition-colors">Create Pool</a>
            <a href="#bridge" className="hover:text-blue-400 transition-colors">Bridge</a>
            <a href="#analytics" className="hover:text-blue-400 transition-colors">Analytics</a>
          </nav>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-5">
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

        <section id="privacy" className="mt-12">
          <h2 className="mb-2 text-xl font-semibold">Privacy Swap</h2>
          <PrivacySwap />
        </section>
      </main>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            Built for Arbitrum • Routing via 0x + CoW • Bridge via CCIP/CCTP with Socket fallback
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={() => setCurrentPage("terms")} className="hover:text-foreground">
              Terms of Service
            </button>
            <button onClick={() => setCurrentPage("privacy")} className="hover:text-foreground">
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
