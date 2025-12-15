import { useState, useEffect } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TokenSelector } from "@/components/TokenSelector";
import { TOKENS_BY_CHAIN, CHAIN_IDS, type ChainKey } from "@/lib/constants";
import { bestBridgeRoute, compareAllRoutes, BridgeQuote, executeBridge } from "@/lib/bridge";
import { Loader2, ArrowRight, Info, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { usePointsTracking } from "@/hooks/usePointsTracking";
import { getTokenPriceUSD } from "@/lib/prices";
import { useTransactionEvents } from "@/contexts/TransactionEventsContext";

export default function Bridge() {
  const { address, isConnected, chain } = useAccount();
  const { trackBridge } = usePointsTracking();
  const { emitTransactionComplete } = useTransactionEvents();
  const [fromChain, setFromChain] = useState<ChainKey>("BASE");
  const [toChain, setToChain] = useState<ChainKey>("ARBITRUM");
  const [token, setToken] = useState(TOKENS_BY_CHAIN[CHAIN_IDS.BASE][2]); // USDC
  const [amount, setAmount] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<"auto" | "cctp" | "ccip" | "lifi">("auto");
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [allQuotes, setAllQuotes] = useState<BridgeQuote[]>([]);
  const [isQuoting, setIsQuoting] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const { writeContract, data: txHash, isPending: isBridging } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Track bridge transactions after confirmation
  useEffect(() => {
    const trackTransaction = async () => {
      if (!txHash || !isSuccess || isConfirming) return;
      try {
        const amountNum = parseFloat(amount || "0");
        if (!amountNum || !token) return;
        const fromChainId = CHAIN_IDS[fromChain];
        const toChainId = CHAIN_IDS[toChain];
        const priceUSD = await getTokenPriceUSD(fromChainId, token.address);
        const amountUSD = amountNum * (priceUSD || 0);

        await trackBridge(
          txHash,
          fromChainId,
          toChainId,
          token.address,
          token.address,
          amountUSD
        );

        // Emit transaction event for real-time updates
        emitTransactionComplete({
          type: 'bridge',
          txHash,
          timestamp: Date.now(),
          amountUSD
        });
      } catch (e) {
        logger.error("Bridge tracking error", e);
      }
    };
    trackTransaction();
  }, [isSuccess, isConfirming, txHash]);

  // Fetch quotes when params change
  useEffect(() => {
    if (!amount || !token || !address) {
      setQuote(null);
      setAllQuotes([]);
      return;
    }

    const fetchQuotes = async () => {
      setIsQuoting(true);
      try {
        if (showComparison) {
          const quotes = await compareAllRoutes({
            fromChain,
            toChain,
            token: token.address,
            amount,
            fromAddress: address,
          });
          setAllQuotes(quotes);
          setQuote(quotes[0] || null);
        } else {
          const bestQuote = await bestBridgeRoute({
            fromChain,
            toChain,
            token: token.address,
            amount,
            fromAddress: address,
          });
          setQuote(bestQuote);
          setAllQuotes([bestQuote]);
        }
      } catch (error) {
        logger.error("Bridge quote error", error);
        setQuote(null);
        setAllQuotes([]);
        const errorMsg = error instanceof Error ? error.message : "Unable to fetch bridge quote";
        toast.error("Bridge Quote Failed", {
          description: errorMsg,
        });
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuotes, 500);
    return () => clearTimeout(debounce);
  }, [amount, token, fromChain, toChain, address, showComparison]);

  const handleBridge = async () => {
    if (!quote?.data || !address) {
      toast.error("Unable to bridge", {
        description: "Quote data not available. Please try again.",
      });
      return;
    }

    try {
      await executeBridge({
        quote,
        token,
        amount,
        fromChain,
        toChain,
        fromAddress: address,
        writeContract,
      });
      toast.success("Bridge Transaction Submitted", {
        description: "Your transaction has been submitted to the blockchain",
      });
    } catch (error) {
      logger.error("Bridge execution error", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error("Bridge Failed", {
        description: errorMsg,
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-gradient-to-b from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">🌉</div>
          <h3 className="mb-2 text-xl font-bold">Connect Your Wallet</h3>
          <p className="text-sm text-gray-400">Please connect your wallet to bridge assets cross-chain</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bridge</h1>
        <p className="text-gray-400 text-sm">Transfer assets across chains with best pricing</p>
      </div>
      
      <div className="space-y-4 rounded-3xl bg-gradient-to-b from-[#1A1F2E] to-[#141824] border border-[#47A1FF]/15 p-6 shadow-2xl">
        {/* Chain Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">From Chain</label>
            <Select value={fromChain} onValueChange={(v: any) => setFromChain(v)}>
              <SelectTrigger className="bg-[#0D1624] border-[#1E2940] h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D1624] border-[#1E2940]">
                <SelectItem value="ARBITRUM">Arbitrum</SelectItem>
                <SelectItem value="AVALANCHE">Avalanche</SelectItem>
                <SelectItem value="BASE">Base</SelectItem>
                <SelectItem value="OPTIMISM">Optimism</SelectItem>
                <SelectItem value="POLYGON">Polygon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">To Chain</label>
            <Select value={toChain} onValueChange={(v: any) => setToChain(v)}>
              <SelectTrigger className="bg-[#0D1624] border-[#1E2940] h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D1624] border-[#1E2940]">
                <SelectItem value="ARBITRUM">Arbitrum</SelectItem>
                <SelectItem value="AVALANCHE">Avalanche</SelectItem>
                <SelectItem value="BASE">Base</SelectItem>
                <SelectItem value="OPTIMISM">Optimism</SelectItem>
                <SelectItem value="POLYGON">Polygon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Token & Amount */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Token & Amount</label>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2">
              <TokenSelector selectedToken={token} onSelect={setToken} tokens={TOKENS_BY_CHAIN[CHAIN_IDS[fromChain]]} />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right text-xl bg-[#0D1624] border-[#1E2940] h-12 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Route Preference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400">Route Preference</label>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs text-[#47A1FF] hover:text-[#3396FF] transition"
            >
              {showComparison ? "Hide" : "Compare all routes"}
            </button>
          </div>
          <Tabs value={selectedRoute} onValueChange={(v: any) => setSelectedRoute(v)}>
            <TabsList className="grid w-full grid-cols-4 bg-[#0D1624] border border-[#1E2940] p-1">
              <TabsTrigger value="auto" className="data-[state=active]:bg-[#47A1FF] data-[state=active]:text-white">Auto</TabsTrigger>
              <TabsTrigger value="cctp" className="data-[state=active]:bg-[#47A1FF] data-[state=active]:text-white">CCTP</TabsTrigger>
              <TabsTrigger value="ccip" className="data-[state=active]:bg-[#47A1FF] data-[state=active]:text-white">CCIP</TabsTrigger>
              <TabsTrigger value="lifi" className="data-[state=active]:bg-[#47A1FF] data-[state=active]:text-white">Li.Fi</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quote Loading */}
        {isQuoting && (
          <div className="rounded-xl bg-[#3396FF]/10 border border-[#3396FF]/30 p-4 text-sm flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#47A1FF]" />
            <span className="text-gray-300">Finding best route...</span>
          </div>
        )}

        {/* Single Quote */}
        {quote && !isQuoting && !showComparison && (
          <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 font-semibold text-[#47A1FF]">
              <Info className="w-5 h-5" />
              Best Route: {quote.provider.toUpperCase()}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Path:</span>
                <span className="text-white font-medium">{quote.path}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ETA:</span>
                <span className="text-white font-medium">{quote.eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fee:</span>
                <span className="text-white font-medium">{quote.feeEstimate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Comparison View */}
        {showComparison && allQuotes.length > 0 && !isQuoting && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-300">Available Routes:</div>
            {allQuotes.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuote(q)}
                className={`w-full rounded-xl border p-4 text-left text-sm transition-all ${
                  quote === q 
                    ? "border-[#47A1FF] bg-[#47A1FF]/10 shadow-lg shadow-[#47A1FF]/20" 
                    : "border-[#1E2940] bg-[#0D1624] hover:border-[#47A1FF]/50 hover:bg-[#0D1624]/80"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold text-[#47A1FF]">{q.provider.toUpperCase()}</span>
                  <span className="text-xs text-gray-400">{q.eta}</span>
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="text-gray-400">{q.path}</div>
                  <div className="text-white font-medium">Fee: {q.feeEstimate}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleBridge}
          disabled={!quote || isBridging || isConfirming || !amount}
          className="w-full h-14 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg"
        >
          {isBridging || isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {isConfirming ? 'Confirming...' : 'Bridging...'}
            </>
          ) : (
            <>
              Bridge {token.symbol}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Transaction Hash */}
        {txHash && (
          <a
            href={`https://arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-green-400 hover:bg-green-500/20 transition"
          >
            <span>Bridge transaction</span>
            <span>View →</span>
          </a>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#0B1221] to-[#1A2332] border border-[#47A1FF]/20 p-6">
        <div className="font-semibold mb-3 text-white">Bridge Protocols:</div>
        <ul className="space-y-2.5 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-[#47A1FF] mt-0.5">•</span>
            <span><strong className="text-white">Li.Fi:</strong> Primary aggregator - best rates across all bridges</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#47A1FF] mt-0.5">•</span>
            <span><strong className="text-white">CCTP:</strong> Native USDC bridging (fastest, lowest fees)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#47A1FF] mt-0.5">•</span>
            <span><strong className="text-white">CCIP:</strong> Chainlink's secure cross-chain protocol</span>
          </li>

        </ul>
      </div>
    </div>
  );
}
