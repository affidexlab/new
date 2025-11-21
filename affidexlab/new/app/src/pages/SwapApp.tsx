import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnhancedTokenSelector } from "@/components/EnhancedTokenSelector";
import { ChainSelector } from "@/components/ChainSelector";
import { SlippageSettings, SlippageConfig, getSlippagePercentage } from "@/components/SlippageSettings";
import { DustWarning, TransactionTimeoutSettings } from "@/components/DustWarning";
import { TOKENS_BY_CHAIN, CHAIN_IDS, SECURITY_SETTINGS, API_ENDPOINTS } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { ArrowDownUp, Loader2, FileText, Fuel, ChevronDown, Wallet, ExternalLink, Shield, Settings2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function SwapApp() {
  const { address, isConnected, chain } = useAccount();
  const [selectedChainId, setSelectedChainId] = useState(CHAIN_IDS.ARBITRUM);
  const [fromToken, setFromToken] = useState(TOKENS_BY_CHAIN[selectedChainId][0]);
  const [toToken, setToToken] = useState(TOKENS_BY_CHAIN[selectedChainId][2]);
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [slippageConfig, setSlippageConfig] = useState<SlippageConfig>({ mode: "smart", customValue: 0.5 });
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState(20);
  const [showSettings, setShowSettings] = useState(false);

  const cowSupported = !!API_ENDPOINTS[selectedChainId]?.cow;

  useEffect(() => {
    const tokens = TOKENS_BY_CHAIN[selectedChainId];
    if (tokens) {
      setFromToken(tokens[0]);
      setToToken(tokens[2] || tokens[1]);
      setFromAmount("");
      setQuote(null);
    }
  }, [selectedChainId]);

  const { data: fromBalance } = useBalance({
    address,
    token: fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : fromToken.address as `0x${string}`,
    chainId: selectedChainId,
  });

  const { data: toBalance } = useBalance({
    address,
    token: toToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : toToken.address as `0x${string}`,
    chainId: selectedChainId,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? fromToken.address as `0x${string}` : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && quote?.data?.allowanceTarget ? [address, quote.data.allowanceTarget as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!quote?.data?.allowanceTarget && fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    },
  });

  const { data: approvalHash, writeContract: approve } = useWriteContract();
  const { data: swapHash, sendTransaction } = useSendTransaction();
  const { isLoading: isApproving, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ hash: approvalHash });
  const { isLoading: isSwapping, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (isApprovalSuccess) {
      toast.success("Approval successful!", {
        description: "You can now proceed with the swap",
      });
      refetchAllowance();
    }
  }, [isApprovalSuccess, approvalHash, refetchAllowance]);

  useEffect(() => {
    if (isSwapSuccess) {
      toast.success("Swap successful!", {
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`,
      });
      setFromAmount("");
      setQuote(null);
    }
  }, [isSwapSuccess, swapHash, fromAmount, fromToken.symbol, toToken.symbol]);

  useEffect(() => {
    if (!fromAmount || !fromToken || !toToken || !address) {
      setQuote(null);
      return;
    }
    
    const fetchQuote = async () => {
      setIsQuoting(true);
      try {
        const amountWei = parseUnits(fromAmount, fromToken.decimals).toString();
        const slippagePercentage = getSlippagePercentage(slippageConfig);
        const quoteResult = await bestRoute({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount: amountWei,
          fromAddress: address,
          chainId: selectedChainId,
          privacy: privacyMode && cowSupported,
          slippagePercentage,
          timeoutMs: timeoutMinutes * 60 * 1000,
        });
        setQuote(quoteResult);
      } catch (error) {
        console.error("Quote error:", error);
        if (error instanceof Error && error.name === "AbortError") {
          toast.error("Request timed out", {
            description: `Quote request exceeded ${timeoutMinutes} minute timeout`,
          });
        } else {
          toast.error("Failed to get quote", {
            description: error instanceof Error ? error.message : "Please try again",
          });
        }
        setQuote(null);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, address, slippageConfig, selectedChainId, privacyMode, cowSupported, timeoutMinutes]);

  const needsApproval = fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && 
                       quote?.data?.allowanceTarget &&
                       (!allowance || BigInt(allowance.toString()) < parseUnits(fromAmount || "0", fromToken.decimals));

  const handleApprove = () => {
    if (!quote?.data?.allowanceTarget) {
      toast.error("Missing approval target");
      return;
    }
    
    try {
      approve({
        address: fromToken.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [quote.data.allowanceTarget, parseUnits(fromAmount, fromToken.decimals)],
      });
      toast.info("Approval requested", {
        description: "Please confirm in your wallet",
      });
    } catch (error) {
      toast.error("Approval failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleSwap = () => {
    if (!quote?.data) {
      toast.error("No quote available");
      return;
    }

    try {
      if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        sendTransaction({
          to: quote.data.to,
          data: quote.data.data,
          value: BigInt(quote.data.value || "0"),
        });
      } else {
        sendTransaction({
          to: quote.data.to,
          data: quote.data.data,
        });
      }
      toast.info("Swap requested", {
        description: "Please confirm in your wallet",
      });
    } catch (error) {
      toast.error("Swap failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleMaxClick = () => {
    if (fromBalance) {
      const maxAmount = fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        ? Math.max(0, parseFloat(fromBalance.formatted) - 0.001).toString()
        : fromBalance.formatted;
      setFromAmount(maxAmount);
    }
  };

  const switchTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
  };

  const toAmountDisplay = quote ? formatUnits(BigInt(quote.estimatedOutput), toToken.decimals) : "0";

  const calculateFeeUSD = () => {
    if (!quote?.data?.estimatedGas) return 0;
    const gasPrice = quote.data.gasPrice || "50000000000";
    const gasCostWei = BigInt(quote.data.estimatedGas) * BigInt(gasPrice);
    const gasCostEth = parseFloat(formatUnits(gasCostWei, 18));
    const ethPriceUSD = 3500;
    return gasCostEth * ethPriceUSD;
  };

  const calculateValueUSD = () => {
    const amount = parseFloat(fromAmount || "0");
    const tokenPriceUSD = 1;
    return amount * tokenPriceUSD;
  };

  const calculateSlippageAmount = () => {
    if (!quote) return "0";
    const slippagePercent = getSlippagePercentage(slippageConfig);
    const outputAmount = parseFloat(formatUnits(BigInt(quote.estimatedOutput), toToken.decimals));
    const slippageAmount = (outputAmount * slippagePercent) / 100;
    return slippageAmount.toFixed(6);
  };

  const getExplorerUrl = (hash: string) => {
    const explorers: Record<number, string> = {
      [CHAIN_IDS.ARBITRUM]: "https://arbiscan.io/tx/",
      [CHAIN_IDS.AVALANCHE]: "https://snowtrace.io/tx/",
      [CHAIN_IDS.BASE]: "https://basescan.org/tx/",
      [CHAIN_IDS.OPTIMISM]: "https://optimistic.etherscan.io/tx/",
      [CHAIN_IDS.POLYGON]: "https://polygonscan.com/tx/",
    };
    return explorers[selectedChainId] + hash;
  };

  return (
    <div className="mx-auto max-w-[500px] px-4">
      <div className="rounded-3xl bg-[#0B1221]/80 backdrop-blur-sm border border-[#1E2940] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Swap</h2>
          <div className="flex items-center gap-2">
            {cowSupported && (
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition ${
                  privacyMode
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-gray-500/20 border-gray-500/50 text-gray-400"
                }`}
              >
                <Shield size={14} />
                <span className="text-xs font-medium">Privacy</span>
              </button>
            )}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <button className="p-2 hover:bg-white/5 rounded-lg transition">
                  <Settings2 size={18} className="text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#0B1221] border border-[#1E2940] text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Transaction Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Slippage Tolerance</h3>
                    <SlippageSettings value={slippageConfig} onChange={setSlippageConfig} />
                  </div>
                  <div className="border-t border-[#1E2940] pt-6">
                    <TransactionTimeoutSettings
                      timeoutMinutes={timeoutMinutes}
                      onChange={setTimeoutMinutes}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-2 rounded-2xl bg-[#0D1624] border border-[#1E2940] p-4">
          <div className="mb-4 flex items-center justify-between">
            <ChainSelector 
              selectedChainId={selectedChainId} 
              onChainChange={setSelectedChainId}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Balance: {fromBalance ? Number(fromBalance.formatted).toFixed(4) : '0'}
              </span>
              <button 
                onClick={handleMaxClick}
                disabled={!fromBalance}
                className="px-2.5 py-1 rounded-md border border-[#47A1FF]/40 bg-[#47A1FF]/5 text-[#47A1FF] hover:bg-[#47A1FF]/10 text-xs font-medium transition disabled:opacity-40"
              >
                MAX
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Input
              type="number"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 border-0 bg-transparent text-5xl font-medium placeholder:text-gray-700 focus-visible:ring-0 px-0 h-auto"
            />
            <div className="flex-shrink-0">
              <EnhancedTokenSelector 
                selectedToken={fromToken} 
                onSelect={setFromToken} 
                tokens={TOKENS_BY_CHAIN[selectedChainId] || []}
                chainId={selectedChainId}
              />
            </div>
          </div>
        </div>

        <div className="relative flex justify-center -my-3 z-10">
          <button
            onClick={switchTokens}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2332] border-2 border-[#0B1221] hover:bg-[#1E2940] transition-all"
          >
            <ArrowDownUp size={18} className="text-[#47A1FF]" />
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-[#0D1624] border border-[#1E2940] p-4">
          <div className="mb-4 flex items-center justify-between">
            <ChainSelector 
              selectedChainId={selectedChainId} 
              onChainChange={setSelectedChainId}
            />
            <span className="text-xs text-gray-500">
              Balance: {toBalance ? Number(toBalance.formatted).toFixed(4) : '0'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Input
              type="text"
              value={toAmountDisplay}
              readOnly
              placeholder="0"
              className="flex-1 border-0 bg-transparent text-5xl font-medium text-gray-500 placeholder:text-gray-700 focus-visible:ring-0 px-0 h-auto cursor-default"
            />
            <div className="flex-shrink-0">
              <EnhancedTokenSelector 
                selectedToken={toToken} 
                onSelect={setToToken} 
                tokens={TOKENS_BY_CHAIN[selectedChainId] || []}
                chainId={selectedChainId}
              />
            </div>
          </div>
        </div>

        {fromAmount && parseFloat(fromAmount) > 0 && quote && (
          <div className="mb-4">
            <DustWarning
              valueUSD={calculateValueUSD()}
              estimatedGasCostUSD={calculateFeeUSD()}
            />
          </div>
        )}

        <div 
          className="mb-4 rounded-xl bg-[#0D1624] border border-[#1E2940] p-3 cursor-pointer hover:bg-[#0D1624]/80 transition"
          onClick={() => setShowFeeDetails(!showFeeDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <FileText size={16} className="text-[#47A1FF]" />
              <span className="text-gray-400">Route</span>
              <span className="text-green-400 font-medium text-xs">{quote?.provider.toUpperCase() || "0x"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Fuel size={16} className="text-[#47A1FF]" />
              <span className="text-gray-400">Gas</span>
              <span className="text-gray-300">~${calculateFeeUSD().toFixed(2)}</span>
              <ChevronDown size={14} className={`text-gray-500 transition-transform ${showFeeDetails ? 'rotate-180' : ''}`} />
            </div>
          </div>
          
          {showFeeDetails && quote && (
            <div className="mt-4 pt-4 border-t border-[#1E2940] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Network Fee</span>
                <span className="text-gray-300">${calculateFeeUSD().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Max Slippage</span>
                <span className="text-gray-300">{getSlippagePercentage(slippageConfig)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timeout</span>
                <span className="text-gray-300">{timeoutMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Minimum Received</span>
                <span className="text-green-400 font-medium">
                  {(parseFloat(toAmountDisplay) - parseFloat(calculateSlippageAmount())).toFixed(6)} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Route</span>
                <span className="text-gray-300 text-right max-w-[200px] truncate">{quote.route}</span>
              </div>
            </div>
          )}
        </div>

        {!isConnected ? (
          <Button 
            className="w-full h-14 bg-[#4A5B7D] hover:bg-[#556891] text-white font-semibold text-base rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Wallet size={20} />
            Connect Wallet
          </Button>
        ) : chain?.id !== selectedChainId ? (
          <Button 
            className="w-full h-14 bg-amber-500/20 border border-amber-500/50 text-amber-400 font-semibold text-base rounded-xl"
            onClick={() => {
              toast.info("Please switch network", {
                description: "Switch to the selected network in your wallet",
              });
            }}
          >
            Wrong Network - Switch Required
          </Button>
        ) : needsApproval ? (
          <Button 
            onClick={handleApprove}
            disabled={isApproving || !quote}
            className="w-full h-14 bg-gradient-to-r from-[#FF9500] to-[#FFB800] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl transition-all"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Approving...
              </>
            ) : (
              `Approve ${fromToken.symbol}`
            )}
          </Button>
        ) : isSwapping ? (
          <Button 
            className="w-full h-14 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white font-semibold text-base rounded-xl"
            disabled
          >
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Swapping...
          </Button>
        ) : (
          <Button 
            onClick={handleSwap}
            disabled={!quote || !fromAmount || isQuoting}
            className="w-full h-14 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl transition-all"
          >
            {isQuoting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Getting quote...
              </>
            ) : !fromAmount ? (
              "Enter an amount"
            ) : !quote ? (
              "Select tokens"
            ) : (
              "Swap"
            )}
          </Button>
        )}

        {(approvalHash || swapHash) && (
          <div className="mt-4 space-y-2">
            {approvalHash && (
              <a 
                href={getExplorerUrl(approvalHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-[#47A1FF] transition"
              >
                View approval transaction
                <ExternalLink size={12} />
              </a>
            )}
            {swapHash && (
              <a 
                href={getExplorerUrl(swapHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-[#47A1FF] transition"
              >
                View swap transaction
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
