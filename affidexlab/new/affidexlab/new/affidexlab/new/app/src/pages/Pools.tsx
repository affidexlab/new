import { useState } from "react";
import { useAccount } from "wagmi";
import { ExternalLink, Zap, Droplets, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChainSelector } from "@/components/ChainSelector";
import { CHAIN_IDS, CHAIN_METADATA, type ChainKey } from "@/lib/constants";
import { getLiquidityRouterAddress } from "@/lib/contracts";
import { getAerodromeRouterAddress } from "@/lib/liquidityRouter";

export default function Pools() {
  const { address, chain } = useAccount();
  const [selectedChainId, setSelectedChainId] = useState(CHAIN_IDS.BASE);
  
  const routerAddress = getLiquidityRouterAddress(selectedChainId);
  const aerodromeAvailable = !!getAerodromeRouterAddress(selectedChainId);

  const getChainName = (chainId: number): string => {
    const entry = Object.entries(CHAIN_IDS).find(([, id]) => id === chainId);
    return entry ? CHAIN_METADATA[entry[0] as ChainKey].name : "Unknown";
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liquidity Pools</h1>
          <p className="text-sm text-gray-400 mt-2">
            Production-ready liquidity routing powered by Uniswap V3 and Aerodrome
          </p>
        </div>
        <ChainSelector selectedChainId={selectedChainId} onChainChange={setSelectedChainId} />
      </div>

      {/* Integration Overview */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#0B1221] to-[#1A2332] border border-[#47A1FF]/20 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3396FF] to-[#47A1FF] flex items-center justify-center">
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Smart Liquidity Layer</h2>
            <p className="text-gray-400">
              DecaFlow integrates audited, battle-tested AMM protocols to provide the best execution for your swaps.
              Our smart router automatically finds the optimal route across multiple liquidity sources.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Uniswap V3 Card */}
          <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-6 hover:border-[#3396FF]/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#FF007A]/20 flex items-center justify-center">
                <span className="text-2xl">🦄</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Uniswap V3</h3>
                <p className="text-xs text-gray-400">Primary Router</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              The most widely adopted DEX protocol with billions in TVL. Provides deep liquidity
              across all major tokens and chains with concentrated liquidity for optimal pricing.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Available on:</span>
                <span className="text-[#47A1FF] font-medium">All Chains</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fee Tiers:</span>
                <span className="text-[#47A1FF] font-medium">0.01%, 0.05%, 0.3%, 1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-medium">✅ Integrated</span>
              </div>
            </div>
            <a
              href="https://docs.uniswap.org/contracts/v3/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1 text-xs text-[#47A1FF] hover:text-[#3396FF]"
            >
              View Documentation <ExternalLink size={12} />
            </a>
          </div>

          {/* Aerodrome Card */}
          <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-6 hover:border-[#3396FF]/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#3396FF]/20 flex items-center justify-center">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Aerodrome</h3>
                <p className="text-xs text-gray-400">Secondary Router (Base)</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Base's leading DEX optimized for ecosystem tokens and stable pairs. Offers excellent
              pricing for Base-native tokens and ve(3,3) incentivized pools.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Available on:</span>
                <span className="text-[#47A1FF] font-medium">Base Only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pool Types:</span>
                <span className="text-[#47A1FF] font-medium">Volatile & Stable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={aerodromeAvailable ? "text-green-400 font-medium" : "text-gray-500"}>
                  {aerodromeAvailable ? "✅ Integrated" : "⏳ Base Only"}
                </span>
              </div>
            </div>
            <a
              href="https://aerodrome.finance/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1 text-xs text-[#47A1FF] hover:text-[#3396FF]"
            >
              View Documentation <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Router Status */}
      <div className="mb-6 rounded-2xl bg-[#0B1221] border border-[#1E2940] p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Droplets size={20} className="text-[#47A1FF]" />
          Router Status - {getChainName(selectedChainId)}
        </h2>
        
        {routerAddress ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="font-medium text-green-400">LiquidityRouter Deployed</span>
              </div>
              <p className="text-xs text-gray-300 mb-3">
                Contract Address: <code className="bg-[#1A2332] px-2 py-1 rounded">{routerAddress}</code>
              </p>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Uniswap V3:</span>
                  <span className="text-green-400">✅ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aerodrome:</span>
                  <span className={aerodromeAvailable ? "text-green-400" : "text-gray-500"}>
                    {aerodromeAvailable ? "✅ Active" : "❌ Not Available"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-4">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-sm font-medium mb-1">Optimal Routing</div>
                <p className="text-xs text-gray-400">
                  Automatically finds best prices across all available pools
                </p>
              </div>
              <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-4">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm font-medium mb-1">Audited Protocols</div>
                <p className="text-xs text-gray-400">
                  Only integrates battle-tested, audited DEX protocols
                </p>
              </div>
              <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-4">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-medium mb-1">Deep Liquidity</div>
                <p className="text-xs text-gray-400">
                  Access billions in TVL across multiple liquidity sources
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              <span className="font-medium text-orange-400">Router Not Deployed</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              The LiquidityRouter has not been deployed to {getChainName(selectedChainId)} yet.
              Deploy it to enable production-ready swap routing.
            </p>
            <Button
              className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90"
              size="sm"
            >
              View Deployment Guide
            </Button>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-[#47A1FF]" />
          How Smart Routing Works
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3396FF]/20 flex items-center justify-center text-[#47A1FF] font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Quote All Sources</h3>
              <p className="text-sm text-gray-400">
                When you request a swap, we simultaneously query all available liquidity sources
                (Uniswap V3 with all fee tiers, Aerodrome stable & volatile pools) to find the best rate.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3396FF]/20 flex items-center justify-center text-[#47A1FF] font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Select Best Route</h3>
              <p className="text-sm text-gray-400">
                Our router compares all quotes and automatically selects the route that gives you
                the most tokens out after fees and gas costs.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3396FF]/20 flex items-center justify-center text-[#47A1FF] font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Execute Swap</h3>
              <p className="text-sm text-gray-400">
                The swap is executed through our secure LiquidityRouter contract which handles
                fee collection and routes to the selected protocol - all in one transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
