import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, TrendingUp } from "lucide-react";

const MOCK_POOLS = [
  {
    name: "ETH/USDC",
    token0: "ETH",
    token1: "USDC",
    fee: "0.3%",
    tvl: "$0",
    volume24h: "$0",
    apy: "0%",
    address: "0x...",
  },
  {
    name: "ARB/ETH",
    token0: "ARB",
    token1: "ETH",
    fee: "0.3%",
    tvl: "$0",
    volume24h: "$0",
    apy: "0%",
    address: "0x...",
  },
];

export default function Pools() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liquidity Pools</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Minimal constant-product AMM pools with TVL caps for token campaigns
          </p>
        </div>
        <Button size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Pool
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4" />
            <span>Total TVL</span>
          </div>
          <div className="text-2xl font-bold">$0</div>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>24h Volume</span>
          </div>
          <div className="text-2xl font-bold">$0</div>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Plus className="h-4 w-4" />
            <span>Active Pools</span>
          </div>
          <div className="text-2xl font-bold">{MOCK_POOLS.length}</div>
        </Card>
      </div>

      <div className="space-y-4">
        {MOCK_POOLS.map((pool, i) => (
          <Card key={i} className="p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-semibold">
                    {pool.token0}
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-xs font-semibold">
                    {pool.token1}
                  </div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{pool.name}</div>
                  <div className="text-sm text-muted-foreground">Fee: {pool.fee}</div>
                </div>
              </div>
              <div className="hidden sm:flex gap-8">
                <div>
                  <div className="text-xs text-muted-foreground">TVL</div>
                  <div className="text-lg font-semibold">{pool.tvl}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">24h Volume</div>
                  <div className="text-lg font-semibold">{pool.volume24h}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">APY</div>
                  <div className="text-lg font-semibold text-green-500">{pool.apy}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">View</Button>
                <Button>Add Liquidity</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-8 bg-primary/5 border-primary/20">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-2">Ready to provide liquidity?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create custom AMM pools with configurable fees and TVL caps. Perfect for token launches and community campaigns.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your Pool
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="https://docs.decaflow.vercel.app/pools" target="_blank" rel="noopener">
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
        <div className="flex gap-3">
          <div className="text-orange-500">⚠️</div>
          <div className="text-sm">
            <strong className="font-medium">Testnet Notice:</strong> Pool contracts are deployed on Arbitrum testnet.
            Exercise caution and only deposit small amounts. Smart contracts have not been audited.
          </div>
        </div>
      </div>
    </div>
  );
}
