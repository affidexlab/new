import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TokenSelector } from '@/components/TokenSelector';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { useUniswapV3LP, PoolData } from '@/hooks/useUniswapV3LP';
import { useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPool?: PoolData | null;
  chainId: number;
}

export function AddLiquidityModal({ isOpen, onClose, selectedPool, chainId }: AddLiquidityModalProps) {
  const { address } = useAccount();
  const { addLiquidity, isProcessing } = useUniswapV3LP(chainId);
  
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [useFullRange, setUseFullRange] = useState(true);
  
  const token0Balance = useBalance({
    address,
    token: selectedPool?.token0.address as `0x${string}`,
  });

  const token1Balance = useBalance({
    address,
    token: selectedPool?.token1.address as `0x${string}`,
  });

  const handleAddLiquidity = async () => {
    if (!selectedPool || !address) return;

    try {
      const amount0Wei = parseUnits(token0Amount || '0', selectedPool.token0.decimals);
      const amount1Wei = parseUnits(token1Amount || '0', selectedPool.token1.decimals);

      await addLiquidity({
        poolAddress: selectedPool.address,
        token0: selectedPool.token0.address,
        token1: selectedPool.token1.address,
        fee: selectedPool.fee,
        amount0: amount0Wei.toString(),
        amount1: amount1Wei.toString(),
      });

      setToken0Amount('');
      setToken1Amount('');
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Add liquidity failed:', error);
    }
  };

  const handleMaxToken0 = () => {
    if (token0Balance.data) {
      setToken0Amount(formatUnits(token0Balance.data.value, token0Balance.data.decimals));
    }
  };

  const handleMaxToken1 = () => {
    if (token1Balance.data) {
      setToken1Amount(formatUnits(token1Balance.data.value, token1Balance.data.decimals));
    }
  };

  if (!selectedPool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1624] border-[#1E2940] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Liquidity</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add liquidity to {selectedPool.token0.symbol}/{selectedPool.token1.symbol} pool
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Pool Info */}
          <div className="rounded-xl bg-[#1A1F2E] border border-[#47A1FF]/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">
                {selectedPool.token0.symbol} / {selectedPool.token1.symbol}
              </div>
              <div className="text-sm text-[#47A1FF]">
                Fee: {(selectedPool.fee / 10000).toFixed(2)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-400">TVL</div>
                <div className="font-medium">${parseFloat(selectedPool.tvl).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400">APR</div>
                <div className="font-medium text-green-400">{selectedPool.apr}%</div>
              </div>
            </div>
          </div>

          {/* Full Range Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1F2E] border border-[#47A1FF]/10">
            <div>
              <div className="text-sm font-medium">Full Range</div>
              <div className="text-xs text-gray-400">Provide liquidity across all prices</div>
            </div>
            <button
              onClick={() => setUseFullRange(!useFullRange)}
              className={`w-12 h-6 rounded-full transition ${
                useFullRange ? 'bg-[#47A1FF]' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition ${
                useFullRange ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>

          {/* Token 0 Amount */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">
              {selectedPool.token0.symbol} Amount
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={token0Amount}
                onChange={(e) => setToken0Amount(e.target.value)}
                placeholder="0.0"
                className="bg-[#0D1624] border-[#1E2940] h-14 pr-20 text-lg"
              />
              <button
                onClick={handleMaxToken0}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#47A1FF] hover:text-[#3396FF]"
              >
                MAX
              </button>
            </div>
            {token0Balance.data && (
              <div className="text-xs text-gray-400">
                Balance: {formatUnits(token0Balance.data.value, token0Balance.data.decimals)} {selectedPool.token0.symbol}
              </div>
            )}
          </div>

          {/* Token 1 Amount */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">
              {selectedPool.token1.symbol} Amount
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={token1Amount}
                onChange={(e) => setToken1Amount(e.target.value)}
                placeholder="0.0"
                className="bg-[#0D1624] border-[#1E2940] h-14 pr-20 text-lg"
              />
              <button
                onClick={handleMaxToken1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#47A1FF] hover:text-[#3396FF]"
              >
                MAX
              </button>
            </div>
            {token1Balance.data && (
              <div className="text-xs text-gray-400">
                Balance: {formatUnits(token1Balance.data.value, token1Balance.data.decimals)} {selectedPool.token1.symbol}
              </div>
            )}
          </div>

          {/* Warning */}
          {!useFullRange && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <AlertCircle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-300">
                <div className="font-medium mb-1">Custom Range</div>
                <div>Custom price ranges require advanced knowledge. Use full range for simplicity.</div>
              </div>
            </div>
          )}

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
              onClick={handleAddLiquidity}
              disabled={!token0Amount || !token1Amount || isProcessing}
              className="flex-1 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Liquidity
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
