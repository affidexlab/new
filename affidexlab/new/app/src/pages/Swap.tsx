import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector } from "@/components/TokenSelector";
import { ARBITRUM_TOKENS } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { ArrowDownUp, Loader2, Settings, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Swap() {
  const { address, isConnected, chain } = useAccount();
  const [fromToken, setFromToken] = useState(ARBITRUM_TOKENS[0]); // ETH
  const [toToken, setToToken] = useState(ARBITRUM_TOKENS[2]); // USDC
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5"); // Default 0.5% slippage
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const { data: balance } = useBalance({
    address,
    token: fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : fromToken.address as `0x${string}`,
  });

  const { data: approvalHash, writeContract: approve, error: approvalError } = useWriteContract();
  const { data: swapHash, sendTransaction, error: swapError } = useSendTransaction();
  
  const { isLoading: isApproving, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ hash: approvalHash });
  const { isLoading: isSwapping, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({ hash: swapHash });

  // Read allowance for ERC20 tokens
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? fromToken.address as `0x${string}` : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && quote?.data.allowanceTarget ? [address, quote.data.allowanceTarget as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!quote?.data.allowanceTarget && fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    },
  });

  // Fetch quote when amount or tokens change
  useEffect(() => {
    if (!amount || !fromToken || !toToken || !address) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    
    const fetchQuote = async () => {
      setIsQuoting(true);
      setQuoteError(null);
      try {
        const amountWei = parseUnits(amount, fromToken.decimals).toString();
        const quoteResult = await bestRoute({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount: amountWei,
          fromAddress: address,
          chain: "arbitrum",
          privacy: false,
        });
        setQuote(quoteResult);
      } catch (error) {
        console.error("Quote error:", error);
        setQuote(null);
        const errorMsg = error instanceof Error ? error.message : "Unable to fetch quote. Please try again.";
        setQuoteError(errorMsg);
        toast.error("Quote Failed", {
          description: errorMsg,
        });
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [amount, fromToken, toToken, address]);

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isApprovalSuccess) {
      refetchAllowance();
      toast.success("Approval Successful", {
        description: `${fromToken.symbol} approved for swapping`,
      });
    }
  }, [isApprovalSuccess, refetchAllowance, fromToken.symbol]);

  // Show swap success notification
  useEffect(() => {
    if (isSwapSuccess) {
      toast.success("Swap Successful!", {
        description: "Your transaction has been confirmed",
      });
    }
  }, [isSwapSuccess]);

  // Show error notifications
  useEffect(() => {
    if (approvalError) {
      toast.error("Approval Failed", {
        description: approvalError.message || "Transaction was rejected",
      });
    }
  }, [approvalError]);

  useEffect(() => {
    if (swapError) {
      toast.error("Swap Failed", {
        description: swapError.message || "Transaction was rejected",
      });
    }
  }, [swapError]);

  const allowance = allowanceData as bigint | undefined;
  const needsApproval = fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && 
                       amount && 
                       (!allowance || allowance < parseUnits(amount, fromToken.decimals));

  const handleApprove = () => {
    if (!quote?.data.allowanceTarget) {
      toast.error("Unable to approve", {
        description: "Quote data is missing",
      });
      return;
    }
    
    // Use max uint256 for approval to avoid frequent approvals
    const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    approve({
      address: fromToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [quote.data.allowanceTarget as `0x${string}`, maxApproval],
    });
  };

  const handleSwap = () => {
    if (!quote?.data) {
      toast.error("Unable to swap", {
        description: "Quote data is missing",
      });
      return;
    }

    // Validate slippage
    const expectedOutput = BigInt(quote.estimatedOutput);
    const slippagePercent = parseFloat(slippage);
    const minOutput = expectedOutput * BigInt(Math.floor((100 - slippagePercent) * 100)) / BigInt(10000);
    
    console.log("Expected output:", expectedOutput.toString());
    console.log("Min output with slippage:", minOutput.toString());

    if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      sendTransaction({
        to: quote.data.to as `0x${string}`,
        data: quote.data.data as `0x${string}`,
        value: BigInt(quote.data.value || "0"),
      });
    } else {
      sendTransaction({
        to: quote.data.to as `0x${string}`,
        data: quote.data.data as `0x${string}`,
      });
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      setAmount(balance.formatted);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
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
      {/* Swap Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Swap</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded-xl p-2 hover:bg-white/5 transition">
                <Settings size={20} className="text-gray-400 hover:text-[#47A1FF]" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#1A1F2E] border-[#47A1FF]/20">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Transaction Settings</h3>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Slippage Tolerance</label>
                  <div className="flex gap-2">
                    {["0.1", "0.5", "1.0"].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSlippage(val)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          slippage === val
                            ? "bg-[#47A1FF] text-white"
                            : "bg-[#1E2433] text-gray-400 hover:bg-[#2A3141]"
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                    <Input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      placeholder="Custom"
                      className="w-20 bg-[#1E2433] border-[#47A1FF]/20 text-sm"
                      step="0.1"
                      min="0.1"
                      max="50"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Your transaction will revert if the price changes unfavorably by more than this percentage.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* FROM Section */}
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
            {amount && parseFloat(amount) > 0 ? `≈ $${(parseFloat(amount) * 2000).toFixed(2)}` : "$0.00"}
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="relative flex justify-center -my-2">
          <button
            onClick={switchTokens}
            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2A3141] to-[#1E2433] border-2 border-[#47A1FF]/30 hover:border-[#47A1FF] hover:scale-110 transition-all duration-300 group"
          >
            <ArrowDownUp size={20} className="text-[#47A1FF] group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* TO Section */}
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
            {quote ? `≈ $${(parseFloat(formatUnits(BigInt(quote.estimatedOutput), toToken.decimals)) * 1).toFixed(2)}` : "$0.00"}
          </div>
        </div>

        {/* Quote Error */}
        {quoteError && !isQuoting && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="text-sm text-red-400">
              <div className="font-medium">Unable to fetch quote</div>
              <div className="text-xs text-red-300 mt-1">{quoteError}</div>
            </div>
          </div>
        )}

        {/* Quote Details */}
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
              <span className="font-medium">{Number(quote.estimatedGas).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Slippage Tolerance</span>
              <span className="font-medium">{slippage}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Min. Received</span>
              <span className="font-medium">
                {(parseFloat(formatUnits(BigInt(quote.estimatedOutput), toToken.decimals)) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
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

        {/* Transaction Links */}
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
                <span>View →</span>
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
                <span>View →</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">✨</div>
          <div className="text-xs font-semibold text-gray-400">Best Pricing</div>
        </div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <div className="text-xs font-semibold text-gray-400">Secure Swaps</div>
        </div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-xs font-semibold text-gray-400">Smart Routing</div>
        </div>
      </div>
    </div>
  );
}
