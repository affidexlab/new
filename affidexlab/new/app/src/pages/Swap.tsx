import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector } from "@/components/TokenSelector";
import { ARBITRUM_TOKENS } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { ArrowDownUp, Loader2, Settings, Info } from "lucide-react";

export default function Swap() {
  const { address, isConnected, chain } = useAccount();
  const [fromToken, setFromToken] = useState(ARBITRUM_TOKENS[0]); // ETH
  const [toToken, setToToken] = useState(ARBITRUM_TOKENS[2]); // USDC
  const [amount, setAmount] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [allowance, setAllowance] = useState("0");

  const { data: balance } = useBalance({
    address,
    token: fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : fromToken.address as `0x${string}`,
  });

  const { data: approvalHash, writeContract: approve } = useWriteContract();
  const { data: swapHash, sendTransaction } = useSendTransaction();
  
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approvalHash });
  const { isLoading: isSwapping } = useWaitForTransactionReceipt({ hash: swapHash });

  // Fetch quote when amount or tokens change
  useEffect(() => {
    if (!amount || !fromToken || !toToken || !address) return;
    
    const fetchQuote = async () => {
      setIsQuoting(true);
      try {
        const amountWei = parseUnits(amount, fromToken.decimals).toString();
        const quoteResult = await bestRoute({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount: amountWei,
          fromAddress: address,
          chain: "arbitrum",
          privacy,
        });
        setQuote(quoteResult);
      } catch (error) {
        console.error("Quote error:", error);
        setQuote(null);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [amount, fromToken, toToken, address, privacy]);

  // Check allowance for ERC20 tokens
  useEffect(() => {
    if (!address || fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      setAllowance("0");
      return;
    }

    const checkAllowance = async () => {
      try {
        const response = await fetch(
          `https://arbitrum.api.0x.org/swap/v1/quote?${new URLSearchParams({
            sellToken: fromToken.address,
            buyToken: toToken.address,
            sellAmount: "1",
          })}`
        );
        const data = await response.json();
        const spender = data.allowanceTarget;
        setAllowance("0");
      } catch (error) {
        console.error("Allowance check error:", error);
      }
    };

    checkAllowance();
  }, [address, fromToken, toToken]);

  const needsApproval = fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && 
                       BigInt(allowance) < parseUnits(amount || "0", fromToken.decimals);

  const handleApprove = () => {
    if (!quote?.data.allowanceTarget) return;
    
    approve({
      address: fromToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [quote.data.allowanceTarget, BigInt(quote.data.sellAmount)],
    });
  };

  const handleSwap = () => {
    if (!quote?.data) return;

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
          <button className="rounded-xl p-2 hover:bg-white/5 transition">
            <Settings size={20} className="text-gray-400 hover:text-[#47A1FF]" />
          </button>
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

        {/* Privacy Mode Toggle */}
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
            <div className="border-t border-white/10 my-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Platform Fee</span>
                <span className="font-medium text-[#47A1FF]">{quote.feePercentage}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Fee Amount</span>
                <span className="text-gray-500">{formatUnits(BigInt(quote.feeAmount), fromToken.decimals)} {fromToken.symbol}</span>
              </div>
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
          <div className="text-xs font-semibold text-gray-400">MEV Protection</div>
        </div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-xs font-semibold text-gray-400">Smart Routing</div>
        </div>
      </div>
    </div>
  );
}
