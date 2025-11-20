import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TokenSelector } from "@/components/TokenSelector";
import { ARBITRUM_TOKENS } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { ArrowDownUp, Loader2, Sparkles, FileText, Fuel, ChevronDown, Wallet } from "lucide-react";

export default function SwapApp() {
  const { address, isConnected, chain } = useAccount();
  const [fromToken, setFromToken] = useState(ARBITRUM_TOKENS[0]);
  const [toToken, setToToken] = useState(ARBITRUM_TOKENS[2]);
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const { data: fromBalance } = useBalance({
    address,
    token: fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : fromToken.address as `0x${string}`,
  });

  const { data: toBalance } = useBalance({
    address,
    token: toToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : toToken.address as `0x${string}`,
  });

  const { data: approvalHash, writeContract: approve } = useWriteContract();
  const { data: swapHash, sendTransaction } = useSendTransaction();
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approvalHash });
  const { isLoading: isSwapping } = useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (!fromAmount || !fromToken || !toToken || !address) {
      setQuote(null);
      return;
    }
    
    const fetchQuote = async () => {
      setIsQuoting(true);
      try {
        const amountWei = parseUnits(fromAmount, fromToken.decimals).toString();
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
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, address]);

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
    if (fromBalance) {
      setFromAmount(fromBalance.formatted);
    }
  };

  const switchTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
  };

  const toAmountDisplay = quote ? formatUnits(BigInt(quote.estimatedOutput), toToken.decimals) : "0";

  return (
    <div className="mx-auto max-w-[500px] px-4">
      {/* Swap Card */}
      <div className="rounded-3xl bg-[#0B1221]/80 backdrop-blur-sm border border-[#1E2940] p-6 shadow-2xl">
        {/* Header with Smart Badge */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Swap</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3396FF]/20 border border-[#3396FF]/50">
            <Sparkles size={14} className="text-[#47A1FF]" />
            <span className="text-sm font-medium text-[#47A1FF]">Smart</span>
          </div>
        </div>

        {/* FROM Section */}
        <div className="mb-2 rounded-2xl bg-[#0D1624] border border-[#1E2940] p-4">
          {/* Chain, Balance, MAX */}
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
          
          {/* Amount and Token */}
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
          
          {/* Price */}
          <div className="mt-3 text-right text-xs text-gray-600">
            Price: {fromAmount && parseFloat(fromAmount) > 0 ? `$${(parseFloat(fromAmount) * 2000).toFixed(2)}` : '0'}
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="relative flex justify-center -my-3 z-10">
          <button
            onClick={switchTokens}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2332] border-2 border-[#0B1221] hover:bg-[#1E2940] transition-all"
          >
            <ArrowDownUp size={18} className="text-[#47A1FF]" />
          </button>
        </div>

        {/* TO Section */}
        <div className="mb-4 rounded-2xl bg-[#0D1624] border border-[#1E2940] p-4">
          {/* Chain and Balance */}
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
          
          {/* Amount and Token */}
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
          
          {/* Price */}
          <div className="mt-3 text-right text-xs text-gray-600">
            Price: {toAmountDisplay && parseFloat(toAmountDisplay) > 0 ? `$${(parseFloat(toAmountDisplay) * 1).toFixed(2)}` : '0'}
          </div>
        </div>

        {/* Fees & Gas Row */}
        <div className="mb-4 rounded-xl bg-[#0D1624] border border-[#1E2940] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <FileText size={16} className="text-[#47A1FF]" />
            <span className="text-gray-400">Fees & Slippage</span>
            <span className="text-green-400 font-medium">-$0</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Fuel size={16} className="text-[#47A1FF]" />
            <span className="text-gray-400">Gas</span>
            <span className="text-gray-300">- $0</span>
            <ChevronDown size={14} className="text-gray-500" />
          </div>
        </div>

        {/* Action Button */}
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
      </div>
    </div>
  );
}
