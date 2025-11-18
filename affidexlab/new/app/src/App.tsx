import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swap from "./pages/Swap";
import Bridge from "./pages/Bridge";
import Pools from "./pages/Pools";
import CreatePool from "./pages/CreatePool";
import PrivacySwap from "./pages/PrivacySwap";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="text-lg font-semibold">DeFiSwap</div>
          <nav className="hidden gap-6 sm:flex text-sm">
            <a href="#swap" className="hover:text-primary">Swap</a>
            <a href="#pools" className="hover:text-primary">Pools</a>
            <a href="#create" className="hover:text-primary">Create Pool</a>
            <a href="#bridge" className="hover:text-primary">Bridge</a>
            <a href="#analytics" className="hover:text-primary">Analytics</a>
          </nav>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent p-6">
          <h1 className="text-3xl font-bold">Trade with Zero Compromise</h1>
          <p className="text-sm text-muted-foreground">Dynamic routing, MEV-safe privacy option, and cross-chain bridging with CCIP/CCTP.</p>
        </section>

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
        Built for Arbitrum • Routing via 0x + CoW • Bridge via CCIP/CCTP with Socket fallback
      </footer>
    </div>
  );
}
