import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUniswapV3LP, PoolData } from '@/hooks/useUniswapV3LP';
import { useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { LP_FEE_MANAGER_ADDRESSES } from '@/lib/uniswapV3Lp';
import { TokenSelector } from '@/components/TokenSelector';
import { TOKENS_BY_CHAIN, type Token } from '@/lib/constants';

interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPool?: PoolData | null;
  chainId: number;
}

export function AddLiquidityModal({ isOpen, onClose, selectedPool, chainId }: AddLiquidityModalProps) {
  const { address } = useAccount();
  const { addLiquidity, checkAllowance, approveToken, isProcessing, lpFeeRate } = useUniswapV3LP(chainId);
  
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [useFullRange, setUseFullRange] = useState(true);
  const [token0Approved, setToken0Approved] = useState(false);
  const [token1Approved, setToken1Approved] = useState(false);
  const [checkingApprovals, setCheckingApprovals] = useState(false);
  const [manualFee, setManualFee] = useState(3000);

  const availableTokens = TOKENS_BY_CHAIN[chainId] || [];
  const [manualToken0, setManualToken0] = useState<Token | null>(availableTokens[0] || null);
  const [manualToken1, setManualToken1] = useState<Token | null>(availableTokens[1] || availableTokens[0] || null);

  const token0Meta = selectedPool?.token0 || manualToken0;
  const token1Meta = selectedPool?.token1 || manualToken1;

  const token0Balance = useBalance({
    address,
    token: token0Meta?.address as `0x${string}` | undefined,
    chainId,
    enabled: !!address && !!token0Meta,
  });

  const token1Balance = useBalance({
    address,
    token: token1Meta?.address as `0x${string}` | undefined,
    chainId,
    enabled: !!address && !!token1Meta,
  });

  const lpFeeManagerAddress = LP_FEE_MANAGER_ADDRESSES[chainId];

  const resetState = () => {
    setToken0Amount('');
    setToken1Amount('');
    setToken0Approved(false);
    setToken1Approved(false);
    setCheckingApprovals(false);
    setManualFee(3000);
    setManualToken0(availableTokens[0] || null);
    setManualToken1(availableTokens[1] || availableTokens[0] || null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // Check allowances when amounts or tokens change
  useEffect(() => {
    if (!address || !lpFeeManagerAddress || !token0Amount || !token1Amount || !token0Meta || !token1Meta) {
      setToken0Approved(false);
      setToken1Approved(false);
      return;
    }

    const checkApprovals = async () => {
      setCheckingApprovals(true);
      try {
        const amount0Wei = parseUnits(token0Amount, token0Meta.decimals);
        const amount1Wei = parseUnits(token1Amount, token1Meta.decimals);

        const [allowance0, allowance1] = await Promise.all([
          checkAllowance(token0Meta.address, lpFeeManagerAddress),
          checkAllowance(token1Meta.address, lpFeeManagerAddress),
        ]);

        setToken0Approved(allowance0 >= amount0Wei);
        setToken1Approved(allowance1 >= amount1Wei);
      } catch (error) {
        console.error('Failed to check approvals:', error);
      } finally {
        setCheckingApprovals(false);
      }
    };

    checkApprovals();
  }, [token0Amount, token1Amount, token0Meta, token1Meta, address, lpFeeManagerAddress, checkAllowance]);

  const handleApproveToken0 = async () => {
    if (!token0Meta || !lpFeeManagerAddress || !token0Amount) return;
    const amount0Wei = parseUnits(token0Amount, token0Meta.decimals);
    const approvalAmount = amount0Wei * BigInt(10);
    const success = await approveToken(token0Meta.address, lpFeeManagerAddress, approvalAmount);
    if (success) {
      setTimeout(async () => {
        const allowance = await checkAllowance(token0Meta.address, lpFeeManagerAddress);
        setToken0Approved(allowance >= amount0Wei);
      }, 3000);
    }
  };

  const handleApproveToken1 = async () => {
    if (!token1Meta || !lpFeeManagerAddress || !token1Amount) return;
    const amount1Wei = parseUnits(token1Amount, token1Meta.decimals);
    const approvalAmount = amount1Wei * BigInt(10);
    const success = await approveToken(token1Meta.address, lpFeeManagerAddress, approvalAmount);
    if (success) {
      setTimeout(async () => {
        const allowance = await checkAllowance(token1Meta.address, lpFeeManagerAddress);
        setToken1Approved(allowance >= amount1Wei);
      }, 3000);
    }
  };

  const handleAddLiquidity = async () => {
    if (!address || !token0Meta || !token1Meta) return;

    try {
      const amount0Wei = parseUnits(token0Amount || '0', token0Meta.decimals);
      const amount1Wei = parseUnits(token1Amount || '0', token1Meta.decimals);

      await addLiquidity({
        poolAddress: selectedPool?.address || '0x0000000000000000000000000000000000000000',
        token0: token0Meta.address,
        token1: token1Meta.address,
        fee: selectedPool?.fee || manualFee,
        amount0: amount0Wei.toString(),
        amount1: amount1Wei.toString(),
      });

      resetState();
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Add liquidity failed:', error);
    }
  };

  const handleMaxToken0 = () => {
    if (token0Balance.data && token0Meta) {
      setToken0Amount(formatUnits(token0Balance.data.value, token0Meta.decimals));
    }
  };

  const handleMaxToken1 = () => {
    if (token1Balance.data && token1Meta) {
      setToken1Amount(formatUnits(token1Balance.data.value, token1Meta.decimals));
    }
  };

  const canAddLiquidity = !!token0Meta && !!token1Meta && !!token0Amount && !!token1Amount && token0Approved && token1Approved && !isProcessing;

  const feeAmount0 = token0Amount ? (parseFloat(token0Amount) * lpFeeRate / 10000).toFixed(6) : '0';
  const feeAmount1 = token1Amount ? (parseFloat(token1Amount) * lpFeeRate / 10000).toFixed(6) : '0';
  const netAmount0 = token0Amount ? (parseFloat(token0Amount) - parseFloat(feeAmount0)).toFixed(6) : '0';
  const netAmount1 = token1Amount ? (parseFloat(token1Amount) - parseFloat(feeAmount1)).toFixed(6) : '0';

  const isManual = !selectedPool;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D1624] border-[#1E2940] text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Liquidity</DialogTitle>
          <DialogDescription className="text-gray-400">
            {isManual
              ? 'Select a token pair and amount to provide liquidity to a Uniswap V3 pool.'
              : `Add liquidity to ${selectedPool?.token0.symbol}/${selectedPool?.token1.symbol} pool`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Pool / Pair Info */}
          <div className="rounded-xl bg-[#1A1F2E] border border-[#47A1FF]/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">
                {token0Meta && token1Meta
                  ? `${token0Meta.symbol} / ${token1Meta.symbol}`
                  : 'Select tokens'}
              </div>
              <div className="text-sm text-[#47A1FF]">
                Fee: {( (selectedPool?.fee || manualFee) / 10000).toFixed(2)}%
              </div>
            </div>
            {!isManual && selectedPool ? (
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
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Mode</span>
                  <span className="font-medium text-[#47A1FF]">Manual Pool Selection</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Fee Tier</span>
                  <select
                    value={manualFee}
                    onChange={(e) => setManualFee(Number(e.target.value))}
                    className="bg-[#0D1624] border border-[#1E2940] rounded-lg text-xs px-2 py-1"
                  >
                    <option value={100}>0.01%</option>
                    <option value={500}>0.05%</option>
                    <option value={3000}>0.30%</option>
                    <option value={10000}>1.00%</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Token selectors in manual mode */}
          {isManual && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Token 0</Label>
                <TokenSelector
                  selectedToken={manualToken0 || availableTokens[0]}
                  onSelect={setManualToken0}
                  tokens={availableTokens}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Token 1</Label>
                <TokenSelector
                  selectedToken={manualToken1 || availableTokens[1] || availableTokens[0]}
                  onSelect={setManualToken1}
                  tokens={availableTokens}
                />
              </div>
            </div>
          )}

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
              <div
                className={`w-5 h-5 rounded-full bg-white transition ${
                  useFullRange ? 'ml-6' : 'ml-1'
                }`}
              />
            </button>
          </div>

          {/* Token 0 Amount */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">
              {token0Meta ? `${token0Meta.symbol} Amount` : 'Token 0 Amount'}
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
            {token0Balance.data && token0Meta && (
              <div className="text-xs text-gray-400">
                Balance: {formatUnits(token0Balance.data.value, token0Meta.decimals)} {token0Meta.symbol}
              </div>
            )}
            {token0Amount && token0Meta && (
              <div className="flex items-center justify-between">
                <Button
                  onClick={handleApproveToken0}
                  disabled={token0Approved || isProcessing || checkingApprovals}
                  size="sm"
                  variant={token0Approved ? 'outline' : 'default'}
                  className={token0Approved ? 'border-green-500 text-green-400' : ''}
                >
                  {token0Approved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {token0Meta.symbol} Approved
                    </>
                  ) : (
                    <>Approve {token0Meta.symbol}</>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Token 1 Amount */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400">
              {token1Meta ? `${token1Meta.symbol} Amount` : 'Token 1 Amount'}
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
            {token1Balance.data && token1Meta && (
              <div className="text-xs text-gray-400">
                Balance: {formatUnits(token1Balance.data.value, token1Meta.decimals)} {token1Meta.symbol}
              </div>
            )}
            {token1Amount && token1Meta && (
              <div className="flex items-center justify-between">
                <Button
                  onClick={handleApproveToken1}
                  disabled={token1Approved || isProcessing || checkingApprovals}
                  size="sm"
                  variant={token1Approved ? 'outline' : 'default'}
                  className={token1Approved ? 'border-green-500 text-green-400' : ''}
                >
                  {token1Approved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {token1Meta.symbol} Approved
                    </>
                  ) : (
                    <>Approve {token1Meta.symbol}</>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Fee Breakdown */}
          {token0Amount && token1Amount && token0Meta && token1Meta && (
            <div className="rounded-xl bg-[#1A1F2E] border border-orange-500/30 p-4">
              <div className="text-sm font-medium mb-3 text-orange-400">Platform Fee (3%)</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee deducted ({token0Meta.symbol})</span>
                  <span className="font-medium text-orange-300">{feeAmount0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee deducted ({token1Meta.symbol})</span>
                  <span className="font-medium text-orange-300">{feeAmount1}</span>
                </div>
                <div className="border-t border-orange-500/20 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">You will deposit ({token0Meta.symbol})</span>
                    <span className="font-medium">{netAmount0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">You will deposit ({token1Meta.symbol})</span>
                    <span className="font-medium">{netAmount1}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              disabled={!canAddLiquidity}
              className="flex-1 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : !token0Amount || !token1Amount ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Liquidity
                </>
              ) : !token0Approved || !token1Approved ? (
                'Approve tokens first'
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
