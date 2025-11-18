import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { TokenSelector } from "@/components/TokenSelector";
import { ARBITRUM_TOKENS } from "@/lib/constants";
import { AlertCircle } from "lucide-react";

export default function CreatePool() {
  const [token0, setToken0] = useState(ARBITRUM_TOKENS[0]);
  const [token1, setToken1] = useState(ARBITRUM_TOKENS[2]);
  const [feeBps, setFeeBps] = useState("30");
  const [tvlCap, setTvlCap] = useState("25000");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Create Liquidity Pool</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Deploy a new constant-product AMM pool with custom parameters
      </p>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Token Pair</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Token 0</div>
              <TokenSelector selectedToken={token0} onSelect={setToken0} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Token 1</div>
              <TokenSelector selectedToken={token1} onSelect={setToken1} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fee Tier (basis points)</label>
          <Input
            type="number"
            placeholder="30"
            value={feeBps}
            onChange={(e) => setFeeBps(e.target.value)}
          />
          <div className="text-xs text-muted-foreground">
            Common tiers: 10 (0.1%), 30 (0.3%), 100 (1%)
            {feeBps && ` • Current: ${(Number(feeBps) / 100).toFixed(2)}%`}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">TVL Cap (USD)</label>
          <Input
            type="number"
            placeholder="25000"
            value={tvlCap}
            onChange={(e) => setTvlCap(e.target.value)}
          />
          <div className="text-xs text-muted-foreground">
            Maximum total value locked. Prevents excessive concentration.
          </div>
        </div>

        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="text-sm">
              <strong className="font-medium">Pool Parameters</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Pair: {token0.symbol}/{token1.symbol}</li>
                <li>• Fee: {feeBps ? `${(Number(feeBps) / 100).toFixed(2)}%` : "—"}</li>
                <li>• TVL Cap: ${tvlCap ? Number(tvlCap).toLocaleString() : "—"}</li>
                <li>• Initial liquidity must be added after creation</li>
              </ul>
            </div>
          </div>
        </div>

        <Button size="lg" className="w-full" disabled>
          Create Pool (Coming Soon)
        </Button>

        <div className="text-xs text-center text-muted-foreground">
          Pool creation will be enabled after smart contract deployment and audit
        </div>
      </Card>

      <Card className="mt-6 p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Why create a pool?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span>•</span>
            <span>Launch liquidity for new tokens with controlled TVL limits</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Earn trading fees from swaps through your pool</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Customize fee tiers to optimize for token volatility</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Build community-driven liquidity for campaign tokens</span>
          </li>
        </ul>
      </Card>

      <div className="mt-6 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
        <div className="flex gap-3">
          <div className="text-orange-500">⚠️</div>
          <div className="text-sm">
            <strong className="font-medium">Security Warning:</strong> Pool contracts are experimental and unaudited.
            Only deploy pools for testing or low-value campaigns. Liquidity providers assume all smart contract risks.
          </div>
        </div>
      </div>
    </div>
  );
}
