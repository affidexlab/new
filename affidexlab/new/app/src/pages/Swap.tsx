import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector } from "@/components/TokenSelector";
import { SlippageSettings, SlippageConfig, getSlippagePercentage } from "@/components/SlippageSettings";
import { ARBITRUM_TOKENS } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { ArrowDownUp, Loader2, Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Swap() {
  const { address, isConnected, chain } = useAccount();
  const [fromToken, setFromToken] = useState(ARBITRUM_TOKENS[0]);
  const [toToken, setToToken] = useState(ARBITRUM_TOKENS[2]);
  const [amount, setAmount] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [slippageConfig, setSlippageConfig] = useState<SlippageConfig>({ mode: "smart", customValue: 0.5 });

  const { data: balance } = useBalance({
    address,
    token: fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : fromToken.address as `0x${string}`,
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
        description: `Swapped ${amount} ${fromToken.symbol} for ${toToken.symbol}`,
        action: {
          label: "View on Arbiscan",
          onClick: () => window.open(`https://arbiscan.io/tx/${swapHash}`, '_blank'),
        },
      });
      setAmount("");
      setQuote(null);
    }
  }, [isSwapSuccess, swapHash, amount, fromToken.symbol, toToken.symbol]);

  useEffect(() => {
    if (!amount || !fromToken || !toToken || !address) {
      setQuote(null);
      return;
    }
    
    const fetchQuote = async () => {
      setIsQuoting(true);
      try {
        const amountWei = parseUnits(amount, fromToken.decimals).toString();
        const slippagePercentage = getSlippagePercentage(slippageConfig);
        const quoteResult = await bestRoute({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount: amountWei,
          fromAddress: address,
          chain: "arbitrum",
          privacy,
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
  }, [amount, fromToken, toToken, address, privacy, slippageConfig]);

  const needsApproval = fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && 
                       quote?.data?.allowanceTarget &&
                       (!allowance || BigInt(allowance.toString()) < parseUnits(amount || "0", fromToken.decimals));

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
        args: [quote.data.allowanceTarget, parseUnits(amount, fromToken.decimals)],
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
    if (balance) {
      const maxAmount = fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        ? Math.max(0, parseFloat(balance.formatted) - 0.001).toString()
        : balance.formatted;
      setAmount(maxAmount);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const calculateFeeUSD = () => {
    if (!quote?.data?.estimatedGas) return "0.00";
    const gasPrice = quote.data.gasPrice || "50000000000";
    const gasCostWei = BigInt(quote.data.estimatedGas) * BigInt(gasPrice);
    const gasCostEth = parseFloat(formatUnits(gasCostWei, 18));
    const ethPriceUSD = 3500;
    return (gasCostEth * ethPriceUSD).toFixed(2);
  };

  const calculateMinimumReceived = () => {
    if (!quote) return "0";
    const outputAmount = parseFloat(formatUnits(BigInt(quote.estimatedOutput), toToken.decimals));
    const slippagePercent = getSlippagePercentage(slippageConfig);
    const minReceived = outputAmount * (1 - slippagePercent / 100);
    return minReceived.toFixed(6);
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-gradient-to-b from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">🔌</div>
          <h3 className="mb-2 text-xl font-bold">Connect Your Wallet</h3>
          <p className="text-sm text-gray-400">Please connect your wallet to start swapping tokens</p>
        </div>
      </div>
    );
  }

  if (chain?.id !== 42161) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-gradient-to-b from-[#1A1F2E] to-[#141824] border border-red-500/30 p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">⚠️</div>
          <h3 className="mb-2 text-xl font-bold text-red-400">Wrong Network</h3>
          <p className="text-sm text-gray-400">Please switch to Arbitrum network in your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-3xl bg-gradient-to-b from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Swap</h2>
          <SlippageSettings value={slippageConfig} onChange={setSlippageConfig} />
        </div>

        <div className="mb-4 rounded-2xl bg-[#1E2433] p-4 border border-white/5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">From</span>
            {balance && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Balance: {Number(balance.formatted).toFixed(4)}
                </span>
                <button 
                  onClick={handleMaxClick}
                  className="rounded-lg border border-[#47A1FF]/50 px-3 py-1 text-xs font-bold text-[#47A1FF] hover:bg-[#47A1FF]/10 transition"
                >
                  MAX
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <TokenSelector selectedToken={fromToken} onSelect={setFromToken} />
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 border-0 bg-transparent text-right text-3xl font-bold focus-visible:ring-0"
            />
          </div>
          <div className="mt-2 text-right text-xs text-gray-500">
            {amount && parseFloat(amount) > 0 ? `${parseFloat(amount).toFixed(4)} ${fromToken.symbol}` : "$0.00"}
          </div>
        </div>

        <div className="relative flex justify-center -my-2">
          <button
            onClick={switchTokens}
            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2A3141] to-[#1E2433] border-2 border-[#47A1FF]/30 hover:border-[#47A1FF] hover:scale-110 transition-all duration-300 group"
          >
            <ArrowDownUp size={20} className="text-[#47A1FF] group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-[#1E2433] p-4 border border-white/5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">To</span>
          </div>
          <div className="flex items-center gap-3">
            <TokenSelector selectedToken={toToken} onSelect={setToToken} />
            <Input
              type="text"
              value={quote ? formatUnits(BigInt(quote.estimatedOutput), toToken.decimals) : "0.0"}
              readOnly
              className="flex-1 border-0 bg-transparent text-right text-3xl font-bold text-gray-400 focus-visible:ring-0"
            />
          </div>
          <div className="mt-2 text-right text-xs text-gray-500">
            {quote ? `${parseFloat(formatUnits(BigInt(quote.estimatedOutput), toToken.decimals)).toFixed(4)} ${toToken.symbol}` : "$0.00"}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-[#1E2433]/50 p-3 border border-white/5">
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#47A1FF] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#3396FF] peer-checked:to-[#47A1FF]"></div>
            </div>
            <span className="font-medium">🔒 Privacy Mode</span>
          </label>
          <span className="text-xs text-gray-500">MEV Protection</span>
        </div>

        {isQuoting && (
          <div className="mb-4 rounded-xl bg-[#3396FF]/10 border border-[#3396FF]/30 p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#47A1FF]" />
            <span className="text-sm text-gray-300">Fetching best price...</span>
          </div>
        )}
        
        {quote && !isQuoting && (
          <div className="mb-4 space-y-2 rounded-xl bg-[#1E2433]/50 p-4 border border-white/5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Info size={14} />
                <span>Route</span>
              </div>
              <span className="font-medium text-[#47A1FF]">{quote.route}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Provider</span>
              <span className="font-medium">{quote.provider}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Est. Gas</span>
              <span className="font-medium">${calculateFeeUSD()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Max Slippage</span>
              <span className="font-medium">{getSlippagePercentage(slippageConfig)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Minimum Received</span>
              <span className="font-medium text-green-400">{calculateMinimumReceived()} {toToken.symbol}</span>
            </div>
          </div>
        )}

        {needsApproval ? (
          <Button 
            onClick={handleApprove} 
            disabled={isApproving || !quote}
            className="w-full h-14 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 hover:scale-[1.02] text-white font-bold text-lg rounded-xl transition-all shadow-lg"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Approving {fromToken.symbol}...
              </>
            ) : (
              `Approve ${fromToken.symbol}`
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleSwap} 
            disabled={!quote || isSwapping || !amount}
            className="w-full h-14 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Swapping...
              </>
            ) : !amount ? (
              "Enter an amount"
            ) : !quote ? (
              "Select tokens"
            ) : (
              "Swap"
            )}
          </Button>
        )}

        {(approvalHash || swapHash) && (
          <div className="mt-4 space-y-2 text-sm">
            {approvalHash && (
              <a
                href={`https://arbiscan.io/tx/${approvalHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-green-400 hover:bg-green-500/20 transition"
              >
                <span>Approval transaction</span>
                <ExternalLink size={16} />
              </a>
            )}
            {swapHash && (
              <a
                href={`https://arbiscan.io/tx/${swapHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-green-400 hover:bg-green-500/20 transition"
              >
                <span>Swap transaction</span>
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">✨</div>
          <div className="text-xs font-semibold text-gray-400">Best Pricing</div>
        </div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <div className="text-xs font-semibold text-gray-400">MEV Protection</div>
        </div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-xs font-semibold text-gray-400">Low Fees</div>
        </div>
      </div>
    </div>
  );
}
