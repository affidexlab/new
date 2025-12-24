import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ExternalLink, Zap, Droplets, TrendingUp, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChainSelector } from "@/components/ChainSelector";
import { CHAIN_IDS, CHAIN_METADATA, type ChainKey } from "@/lib/constants";
import { useUniswapV3LP, PoolData, DLMMPool } from "@/hooks/useUniswapV3LP";
import { AddLiquidityModal } from "@/components/AddLiquidityModal";
import { LPPositionsList } from "@/components/LPPositionsList";

export default function Pools() {
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const [selectedChainId, setSelectedChainId] = useState(currentChainId || CHAIN_IDS.BASE);
  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);

  const {
    positions,
    pools,
    dlmmPools,
    loading,
    removeLiquidity,
    collectFees,
    isProcessing,
  } = useUniswapV3LP(selectedChainId);

  const getChainName = (chainId: number): string => {
    const entry = Object.entries(CHAIN_IDS).find(([, id]) => id === chainId);
    return entry ? CHAIN_METADATA[entry[0] as ChainKey].name : "Unknown";
  };

  const handleSelectPool = (pool: PoolData) => {
    setSelectedPool(pool);
    setAddLiquidityOpen(true);
  };

  const handleGlobalAddLiquidity = () => {
    if (pools.length > 0) {
      handleSelectPool(pools[0]);
    } else {
      setSelectedPool(null);
      setAddLiquidityOpen(true);
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-3xl bg-gradient-to-b from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">💧</div>
          <h3 className="mb-2 text-xl font-bold">Connect Your Wallet</h3>
          <p className="text-sm text-gray-400">Please connect your wallet to provide liquidity and earn fees</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Liquidity Pools</h1>
          <p className="text-sm text-gray-400 mt-2">
            Provide liquidity to Uniswap V3 pools and earn trading fees
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ChainSelector selectedChainId={selectedChainId} onChainChange={setSelectedChainId} />
          <Button
            onClick={handleGlobalAddLiquidity}
            className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Liquidity
          </Button>
        </div>
      </div>

      {/* Your LP Positions */}
      {isConnected && (
        <div className="mb-6">
          <LPPositionsList
            positions={positions}
            chainId={selectedChainId}
            loading={loading}
            onRemove={removeLiquidity}
            onCollect={collectFees}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* Maverick DLMM Pools */}
      {dlmmPools && dlmmPools.pools.length > 0 && (
        <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap size={20} className="text-[#3396FF]" />
                Maverick DLMM Pools - {getChainName(selectedChainId)}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Dynamic Liquidity Market Maker with concentrated liquidity bins
              </p>
            </div>
            {dlmmPools.stats && (
              <div className="text-right text-xs text-gray-400">
                <div>${dlmmPools.stats.totalLiquidityUsd.toLocaleString()} TVL</div>
                <div>{dlmmPools.stats.poolCount} pools</div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {dlmmPools.pools.map((pool: DLMMPool) => (
              <div
                key={pool.id}
                className="rounded-xl bg-[#0D1624] border border-[#3396FF]/20 p-5 hover:border-[#3396FF]/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold mb-1">
                      {pool.token0.symbol} / {pool.token1.symbol}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Bin Width: {pool.binWidthBps} bps</span>
                      <span>•</span>
                      <span className="text-[#3396FF]">Maverick DLMM</span>
                    </div>
                  </div>
                  <a
                    href={`https://app.mav.xyz/?chain=${selectedChainId}&pool=${pool.poolAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#3396FF] hover:underline flex items-center gap-1"
                  >
                    Trade on Maverick <ExternalLink size={12} />
                  </a>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">Liquidity</div>
                    <div className="text-sm font-medium">
                      ${pool.liquidityUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">APR</div>
                    <div className="text-sm font-medium text-green-400">{pool.apr.toFixed(2)}%</div>
                  </div>
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                    <div className="text-sm font-medium">
                      ${pool.dailyVolumeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">Bins</div>
                    <div className="text-sm font-medium text-[#3396FF]">{pool.bins.length}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Pools */}
      <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Droplets size={20} className="text-[#47A1FF]" />
              Uniswap V3 Pools - {getChainName(selectedChainId)}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Concentrated liquidity pools with custom fee tiers
            </p>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Droplets size={48} className="mx-auto mb-4 opacity-30" />
            <p>No pools available on this chain yet.</p>
            <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto">
              You can still add liquidity manually using the button above. Select your token pair and fee tier to
              create a custom Uniswap V3 position.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-5 hover:border-[#47A1FF]/30 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold mb-1">
                      {pool.token0.symbol} / {pool.token1.symbol}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Fee: {(pool.fee / 10000).toFixed(2)}%</span>
                      <span>•</span>
                      <span className="text-[#47A1FF]">{pool.protocol}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSelectPool(pool)}
                    className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Liquidity
                  </Button>
                </div>

                {/* Pool Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">TVL</div>
                    <div className="text-sm font-medium">
                      ${parseFloat(pool.tvl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">APR</div>
                    <div className="text-sm font-medium text-green-400">{pool.apr}%</div>
                  </div>
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                    <div className="text-sm font-medium">
                      ${parseFloat(pool.volumeUSD).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="mt-6 rounded-2xl bg-[#0B1221] border border-[#1E2940] p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-[#47A1FF]" />
          How Liquidity Provision Works
        </h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3396FF]/20 flex items-center justify-center text-[#47A1FF] font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Select a Pool or Pair</h3>
              <p className="text-sm text-gray-400">
                Choose a featured pool based on TVL and APR, or use the global Add Liquidity button to manually select your
                token pair and fee tier.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3396FF]/20 flex items-center justify-center text-[#47A1FF] font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Provide Liquidity</h3>
              <p className="text-sm text-gray-400">
                Deposit an equal value of both tokens into the pool. You'll receive an LP NFT representing your position and
                share of the pool.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3396FF]/20 flex items-center justify-center text-[#47A1FF] font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Earn Trading Fees</h3>
              <p className="text-sm text-gray-400">
                Every time someone swaps tokens in the pool, you earn a portion of the trading fees proportional to your
                share of the pool's liquidity.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3396FF]/20 flex items-center justify-center text-[#47A1FF] font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Collect & Withdraw</h3>
              <p className="text-sm text-gray-400">
                At any time, you can collect your earned fees or remove your liquidity. Removing liquidity returns your
                tokens (plus fees) to your wallet.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-orange-500/10 border border-orange-500/30 p-4">
          <div className="flex items-start gap-2">
            <div className="text-orange-400 text-lg">⚠️</div>
            <div className="flex-1 text-xs text-orange-300">
              <div className="font-medium mb-1">Impermanent Loss Risk</div>
              <div>
                Providing liquidity exposes you to impermanent loss if token prices diverge. Only provide liquidity if you
                understand these risks.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Info */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#0B1221] to-[#1A2332] border border-[#47A1FF]/20 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3396FF] to-[#47A1FF] flex items-center justify-center">
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Production-Ready Liquidity</h2>
            <p className="text-sm text-gray-400">
              DecaFlow integrates directly with Uniswap V3's battle-tested smart contracts. Your liquidity is managed by
              audited, industry-standard protocols with billions in TVL.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF007A]/20 flex items-center justify-center">
                <span className="text-2xl">🦄</span>
              </div>
              <div>
                <h3 className="font-semibold">Uniswap V3</h3>
                <p className="text-xs text-gray-400">All Chains</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              Concentrated liquidity with capital efficiency. Provide liquidity in custom price ranges for higher returns.
            </p>
            <a
              href="https://docs.uniswap.org/contracts/v3/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#47A1FF] hover:text-[#3396FF]"
            >
              Learn More <ExternalLink size={12} />
            </a>
          </div>

          <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#3396FF]/20 flex items-center justify-center">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h3 className="font-semibold">Aerodrome</h3>
                <p className="text-xs text-gray-400">Base Only</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              Base's leading DEX with optimized pools for ecosystem tokens. ve(3,3) model provides additional rewards for
              LPs.
            </p>
            <a
              href="https://aerodrome.finance/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#47A1FF] hover:text-[#3396FF]"
            >
              Learn More <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <AddLiquidityModal
        isOpen={addLiquidityOpen}
        onClose={() => {
          setAddLiquidityOpen(false);
          setSelectedPool(null);
        }}
        selectedPool={selectedPool}
        chainId={selectedChainId}
      />
    </div>
  );
}
