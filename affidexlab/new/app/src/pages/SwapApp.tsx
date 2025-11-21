import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TokenSelector } from "@/components/TokenSelector";
import { SlippageSettings, SlippageConfig, getSlippagePercentage } from "@/components/SlippageSettings";
import { ARBITRUM_TOKENS } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { ArrowDownUp, Loader2, FileText, Fuel, ChevronDown, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function SwapApp() {
  const { address, isConnected, chain } = useAccount();
  const [fromToken, setFromToken] = useState(ARBITRUM_TOKENS[0]);
  const [toToken, setToToken] = useState(ARBITRUM_TOKENS[2]);
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [slippageConfig, setSlippageConfig] = useState<SlippageConfig>({ mode: "smart", customValue: 0.5 });
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  const { data: fromBalance } = useBalance({
    address,
    token: fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : fromToken.address as `0x${string}`,
  });

  const { data: toBalance } = useBalance({
    address,
    token: toToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : toToken.address as `0x${string}`,
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
        action: {
          label: "View on Arbiscan",
          onClick: () => window.open(`https://arbiscan.io/tx/${approvalHash}`, '_blank'),
        },
      });
      refetchAllowance();
    }
  }, [isApprovalSuccess, approvalHash, refetchAllowance]);

  useEffect(() => {
    if (isSwapSuccess) {
      toast.success("Swap successful!", {
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`,
        action: {
          label: "View on Arbiscan",
          onClick: () => window.open(`https://arbiscan.io/tx/${swapHash}`, '_blank'),
        },
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
          chain: "arbitrum",
          privacy: false,
          slippagePercentage,
        });
        setQuote(quoteResult);
      } catch (error) {
        console.error("Quote error:", error);
        toast.error("Failed to get quote", {
          description: error instanceof Error ? error.message : "Please try again",
        });
        setQuote(null);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, address, slippageConfig]);

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
    return (gasCostEth * ethPriceUSD).toFixed(2);
  };

  const calculateSlippageAmount = () => {
    if (!quote) return "0";
    const slippagePercent = getSlippagePercentage(slippageConfig);
    const outputAmount = parseFloat(formatUnits(BigInt(quote.estimatedOutput), toToken.decimals));
    const slippageAmount = (outputAmount * slippagePercent) / 100;
    return slippageAmount.toFixed(6);
  };

  return (
    <div className="mx-auto max-w-[500px] px-4">
      <div className="rounded-3xl bg-[#0B1221]/80 backdrop-blur-sm border border-[#1E2940] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Swap</h2>
          <SlippageSettings value={slippageConfig} onChange={setSlippageConfig} />
        </div>

        <div className="mb-2 rounded-2xl bg-[#0D1624] border border-[#1E2940] p-4">
          <div className="mb-4 flex items-center justify-between">
            <Select value="arbitrum" disabled>
              <SelectTrigger className="w-[140px] border-0 bg-[#1A2332] h-9 hover:bg-[#1E2940]">
                <div className="flex items-center gap-2">
                  <img src="/images/chains/arbitrum.png" alt="Arbitrum" className="w-5 h-5 rounded-full" />
                  <span className="text-sm">Arbitrum</span>
                </div>
              </SelectTrigger>
            </Select>
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
              <TokenSelector selectedToken={fromToken} onSelect={setFromToken} />
            </div>
          </div>
          
          <div className="mt-3 text-right text-xs text-gray-600">
            Price: {fromAmount && parseFloat(fromAmount) > 0 ? `${parseFloat(fromAmount).toFixed(4)} ${fromToken.symbol}` : '0'}
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
            <Select value="arbitrum" disabled>
              <SelectTrigger className="w-[140px] border-0 bg-[#1A2332] h-9 hover:bg-[#1E2940]">
                <div className="flex items-center gap-2">
                  <img src="/images/chains/arbitrum.png" alt="Arbitrum" className="w-5 h-5 rounded-full" />
                  <span className="text-sm">Arbitrum</span>
                </div>
              </SelectTrigger>
            </Select>
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
              <TokenSelector selectedToken={toToken} onSelect={setToToken} />
            </div>
          </div>
          
          <div className="mt-3 text-right text-xs text-gray-600">
            Price: {toAmountDisplay && parseFloat(toAmountDisplay) > 0 ? `${parseFloat(toAmountDisplay).toFixed(4)} ${toToken.symbol}` : '0'}
          </div>
        </div>

        <div 
          className="mb-4 rounded-xl bg-[#0D1624] border border-[#1E2940] p-3 cursor-pointer hover:bg-[#0D1624]/80 transition"
          onClick={() => setShowFeeDetails(!showFeeDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <FileText size={16} className="text-[#47A1FF]" />
              <span className="text-gray-400">Fees & Slippage</span>
              <span className="text-green-400 font-medium">~${calculateFeeUSD()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Fuel size={16} className="text-[#47A1FF]" />
              <span className="text-gray-400">Gas</span>
              <span className="text-gray-300">~${calculateFeeUSD()}</span>
              <ChevronDown size={14} className={`text-gray-500 transition-transform ${showFeeDetails ? 'rotate-180' : ''}`} />
            </div>
          </div>
          
          {showFeeDetails && quote && (
            <div className="mt-4 pt-4 border-t border-[#1E2940] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Network Fee</span>
                <span className="text-gray-300">${calculateFeeUSD()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Max Slippage</span>
                <span className="text-gray-300">{getSlippagePercentage(slippageConfig)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Slippage Amount</span>
                <span className="text-gray-300">~{calculateSlippageAmount()} {toToken.symbol}</span>
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
        ) : chain?.id !== 42161 ? (
          <Button 
            className="w-full h-14 bg-red-500/20 border border-red-500/50 text-red-400 font-semibold text-base rounded-xl cursor-not-allowed"
            disabled
          >
            Switch to Arbitrum
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
                href={`https://arbiscan.io/tx/${approvalHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-[#47A1FF] transition"
              >
                View approval on Arbiscan
                <ExternalLink size={12} />
              </a>
            )}
            {swapHash && (
              <a 
                href={`https://arbiscan.io/tx/${swapHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-[#47A1FF] transition"
              >
                View swap on Arbiscan
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
