import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, DollarSign, ExternalLink } from 'lucide-react';
import { LPPosition } from '@/hooks/useUniswapV3LP';
import { RemoveLiquidityModal } from './RemoveLiquidityModal';

interface LPPositionsListProps {
  positions: LPPosition[];
  chainId: number;
  loading: boolean;
  onRemove: (tokenId: string, liquidity: string) => Promise<void>;
  onCollect: (tokenId: string) => Promise<void>;
  isProcessing: boolean;
}

export function LPPositionsList({ 
  positions, 
  chainId, 
  loading, 
  onRemove, 
  onCollect,
  isProcessing 
}: LPPositionsListProps) {
  const [selectedPosition, setSelectedPosition] = useState<LPPosition | null>(null);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);

  const handleManagePosition = (position: LPPosition) => {
    setSelectedPosition(position);
    setRemoveModalOpen(true);
  };

  const getExplorerUrl = (tokenId: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      8453: 'https://basescan.org',
      42161: 'https://arbiscan.io',
      10: 'https://optimistic.etherscan.io',
      137: 'https://polygonscan.com',
      43114: 'https://snowtrace.io'
    };
    
    const nftManagers: Record<number, string> = {
      1: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
      8453: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
      42161: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
      10: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
      137: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
      43114: '0x655C406EBFa14EE2006250925e54ec43AD184f8B'
    };

    return `${explorers[chainId]}/token/${nftManagers[chainId]}?a=${tokenId}`;
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-700 rounded"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-8">
        <div className="text-center py-8">
          <Wallet size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">No LP Positions</h3>
          <p className="text-sm text-gray-400 mb-4">
            You haven't added liquidity to any pools yet.
          </p>
          <p className="text-xs text-gray-500">
            Add liquidity to a pool to start earning trading fees.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wallet size={20} className="text-[#47A1FF]" />
            Your LP Positions
          </h2>
          <div className="text-sm text-gray-400">
            {positions.length} {positions.length === 1 ? 'position' : 'positions'}
          </div>
        </div>

        <div className="space-y-3">
          {positions.map((position) => {
            const currentToken0 = Number(position.currentToken0 ?? 0);
            const currentToken1 = Number(position.currentToken1 ?? 0);
            const fees0 = Number(position.feesEarned0 ?? 0);
            const fees1 = Number(position.feesEarned1 ?? 0);
            const hasUnclaimedFees = fees0 > 0 || fees1 > 0;
            
            return (
              <div 
                key={position.tokenId} 
                className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-5 hover:border-[#47A1FF]/30 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold mb-1">
                      {position.token0.symbol} / {position.token1.symbol}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Fee: {(position.fee / 10000).toFixed(2)}%</span>
                      <span>•</span>
                      <span className="text-[#47A1FF]">{position.protocol}</span>
                    </div>
                  </div>
                  <a
                    href={getExplorerUrl(position.tokenId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#47A1FF]"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>

                {/* Liquidity Amounts */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">{position.token0.symbol}</div>
                    <div className="text-sm font-medium">
                      {currentToken0.toFixed(4)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#1A1F2E] p-3">
                    <div className="text-xs text-gray-400 mb-1">{position.token1.symbol}</div>
                    <div className="text-sm font-medium">
                      {currentToken1.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Unclaimed Fees Badge */}
                {hasUnclaimedFees && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={14} className="text-green-400" />
                      <span className="text-xs font-medium text-green-400">Unclaimed Fees</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">{position.token0.symbol}: </span>
                        <span className="font-medium">{fees0.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">{position.token1.symbol}: </span>
                        <span className="font-medium">{fees1.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manage Button */}
                <Button
                  onClick={() => handleManagePosition(position)}
                  className="w-full bg-[#1A1F2E] hover:bg-[#47A1FF]/20 border border-[#47A1FF]/30 text-white"
                  variant="outline"
                >
                  Manage Position
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <RemoveLiquidityModal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        position={selectedPosition}
        onRemove={onRemove}
        onCollect={onCollect}
        isProcessing={isProcessing}
      />
    </>
  );
}
