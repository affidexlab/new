import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Minus, DollarSign } from 'lucide-react';
import { LPPosition } from '@/hooks/useUniswapV3LP';
import { formatUnits } from 'viem';

interface RemoveLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: LPPosition | null;
  onRemove: (tokenId: string, liquidity: string) => Promise<void>;
  onCollect: (tokenId: string) => Promise<void>;
  isProcessing: boolean;
}

export function RemoveLiquidityModal({ 
  isOpen, 
  onClose, 
  position, 
  onRemove, 
  onCollect,
  isProcessing 
}: RemoveLiquidityModalProps) {
  const [removePercentage, setRemovePercentage] = useState('100');

  if (!position) return null;

  const handleRemove = async () => {
    const percentage = parseFloat(removePercentage) / 100;
    const liquidityToRemove = (BigInt(position.liquidity) * BigInt(Math.floor(percentage * 10000)) / BigInt(10000)).toString();
    
    await onRemove(position.tokenId, liquidityToRemove);
    setTimeout(() => onClose(), 2000);
  };

  const handleCollectFees = async () => {
    await onCollect(position.tokenId);
    setTimeout(() => onClose(), 2000);
  };

  const hasUnclaimedFees = parseFloat(position.feesEarned0) > 0 || parseFloat(position.feesEarned1) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1624] border-[#1E2940] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Manage Position</DialogTitle>
          <DialogDescription className="text-gray-400">
            {position.token0.symbol}/{position.token1.symbol} Position
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Position Details */}
          <div className="rounded-xl bg-[#1A1F2E] border border-[#47A1FF]/20 p-4">
            <div className="text-xs text-gray-400 mb-3">Current Position</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400 text-xs mb-1">{position.token0.symbol}</div>
                <div className="font-medium">
                  {parseFloat(formatUnits(BigInt(position.currentToken0), position.token0.decimals)).toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">{position.token1.symbol}</div>
                <div className="font-medium">
                  {parseFloat(formatUnits(BigInt(position.currentToken1), position.token1.decimals)).toFixed(4)}
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-[#47A1FF]/10">
              <div className="text-xs text-gray-400 mb-2">Fee Tier</div>
              <div className="font-medium text-[#47A1FF]">{(position.fee / 10000).toFixed(2)}%</div>
            </div>
          </div>

          {/* Unclaimed Fees */}
          {hasUnclaimedFees && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-green-400">Unclaimed Fees</div>
                <DollarSign size={16} className="text-green-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400 text-xs mb-1">{position.token0.symbol}</div>
                  <div className="font-medium">
                    {parseFloat(formatUnits(BigInt(position.feesEarned0), position.token0.decimals)).toFixed(6)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">{position.token1.symbol}</div>
                  <div className="font-medium">
                    {parseFloat(formatUnits(BigInt(position.feesEarned1), position.token1.decimals)).toFixed(6)}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCollectFees}
                disabled={isProcessing}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Collect Fees'
                )}
              </Button>
            </div>
          )}

          {/* Remove Liquidity */}
          <div className="space-y-3">
            <Label className="text-sm text-gray-400">Remove Liquidity</Label>
            
            {/* Percentage Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Amount to Remove</span>
                <span className="text-sm font-bold text-[#47A1FF]">{removePercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={removePercentage}
                onChange={(e) => setRemovePercentage(e.target.value)}
                className="w-full h-2 bg-[#1A1F2E] rounded-lg appearance-none cursor-pointer accent-[#47A1FF]"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Expected Amounts */}
            {removePercentage !== '0' && (
              <div className="rounded-xl bg-[#1A1F2E] border border-[#47A1FF]/10 p-3">
                <div className="text-xs text-gray-400 mb-2">You will receive</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{position.token0.symbol}</span>
                    <span className="font-medium">
                      {(parseFloat(formatUnits(BigInt(position.currentToken0), position.token0.decimals)) * parseFloat(removePercentage) / 100).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{position.token1.symbol}</span>
                    <span className="font-medium">
                      {(parseFloat(formatUnits(BigInt(position.currentToken1), position.token1.decimals)) * parseFloat(removePercentage) / 100).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 border-[#1E2940] hover:bg-[#1A1F2E]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemove}
              disabled={removePercentage === '0' || isProcessing}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
