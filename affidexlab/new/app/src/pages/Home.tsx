import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Zap, Globe, TrendingUp, Users, DollarSign } from "lucide-react";

interface HomeProps {
  onLaunchApp: () => void;
}

export default function Home({ onLaunchApp }: HomeProps) {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDBjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6bS0xMiAwYzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02em0yNC0xMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDMiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Live on Arbitrum Mainnet</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Trade with{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Zero Compromise
              </span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
              Best execution across DEXs, privacy-first MEV protection, and seamless cross-chain bridging.
              <br className="hidden sm:inline" />
              Your trades, your way.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={onLaunchApp} className="text-lg">
                Launch App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://docs.decaflow.vercel.app" target="_blank" rel="noopener">
                  Read Docs
                </a>
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Card className="p-6 text-center backdrop-blur-sm">
                <div className="mb-2 text-3xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
              </Card>
              <Card className="p-6 text-center backdrop-blur-sm">
                <div className="mb-2 text-3xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Total Swaps</div>
              </Card>
              <Card className="p-6 text-center backdrop-blur-sm">
                <div className="mb-2 text-3xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Why DecaFlow?</h2>
            <p className="text-lg text-muted-foreground">
              Built for traders who demand the best execution and privacy
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Best Pricing</h3>
              <p className="text-muted-foreground">
                Aggregates quotes from 0x, CoW Protocol, and native pools to find you the best rate on every trade.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">MEV Protection</h3>
              <p className="text-muted-foreground">
                Optional privacy mode routes trades through CoW intents and Flashbots Protect to shield you from front-running.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Cross-Chain Bridging</h3>
              <p className="text-muted-foreground">
                Bridge assets via CCTP (USDC native), CCIP (Chainlink), or Socket aggregator with real-time route comparison.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Smart Routing</h3>
              <p className="text-muted-foreground">
                Automatically selects the best liquidity source and route to minimize slippage and maximize output.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Low Fees</h3>
              <p className="text-muted-foreground">
                Built on Arbitrum for fast, cheap transactions. No protocol fees—only pay gas and DEX fees.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Community Pools</h3>
              <p className="text-muted-foreground">
                Create and provide liquidity to custom AMM pools with flexible fee tiers and TVL caps.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Supported Chains
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Swap and bridge seamlessly across major Ethereum L2s
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "Arbitrum", color: "#28A0F0" },
                { name: "Base", color: "#0052FF" },
                { name: "Optimism", color: "#FF0420" },
                { name: "Polygon", color: "#8247E5" },
              ].map((chain) => (
                <div
                  key={chain.name}
                  className="flex items-center gap-2 rounded-full border bg-card px-6 py-3"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: chain.color }}
                  />
                  <span className="font-medium">{chain.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Ready to trade?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join traders who choose privacy, speed, and best execution
            </p>
            <Button size="lg" onClick={onLaunchApp} className="text-lg">
              Launch DecaFlow
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
