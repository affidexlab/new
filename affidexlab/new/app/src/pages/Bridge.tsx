import { useState, useEffect } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TokenSelector } from "@/components/TokenSelector";
import { ARBITRUM_TOKENS, CHAIN_IDS } from "@/lib/constants";
import { bestBridgeRoute, compareAllRoutes, BridgeQuote, executeBridge } from "@/lib/bridge";
import { Loader2, ArrowRight, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Bridge() {
  const { address, isConnected, chain } = useAccount();
  const [fromChain, setFromChain] = useState<keyof typeof CHAIN_IDS>("ARBITRUM");
  const [toChain, setToChain] = useState<keyof typeof CHAIN_IDS>("BASE");
  const [token, setToken] = useState(ARBITRUM_TOKENS[2]); // USDC
  const [amount, setAmount] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<"auto" | "cctp" | "ccip" | "socket">("auto");
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [allQuotes, setAllQuotes] = useState<BridgeQuote[]>([]);
  const [isQuoting, setIsQuoting] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const { writeContract, data: txHash, isPending: isBridging } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

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
        console.error("Bridge quote error:", error);
        setQuote(null);
        setAllQuotes([]);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuotes, 500);
    return () => clearTimeout(debounce);
  }, [amount, token, fromChain, toChain, address, showComparison]);

  const handleBridge = async () => {
    if (!quote?.data || !address) {
      alert("Quote data not available. Please try again.");
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
    } catch (error) {
      console.error("Bridge execution error:", error);
      alert(`Bridge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="text-muted-foreground">Please connect your wallet to bridge assets</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Bridge</h1>
      
      <div className="space-y-4 rounded-xl border p-4">
        {/* Chain Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">From Chain</label>
            <Select value={fromChain} onValueChange={(v: any) => setFromChain(v)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARBITRUM">Arbitrum</SelectItem>
                <SelectItem value="AVALANCHE">Avalanche</SelectItem>
                <SelectItem value="BASE">Base</SelectItem>
                <SelectItem value="BSC">BNB Smart Chain</SelectItem>
                <SelectItem value="OPTIMISM">Optimism</SelectItem>
                <SelectItem value="POLYGON">Polygon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">To Chain</label>
            <Select value={toChain} onValueChange={(v: any) => setToChain(v)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARBITRUM">Arbitrum</SelectItem>
                <SelectItem value="AVALANCHE">Avalanche</SelectItem>
                <SelectItem value="BASE">Base</SelectItem>
                <SelectItem value="BSC">BNB Smart Chain</SelectItem>
                <SelectItem value="OPTIMISM">Optimism</SelectItem>
                <SelectItem value="POLYGON">Polygon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Token & Amount */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Token & Amount</label>
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <TokenSelector selectedToken={token} onSelect={setToken} />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right text-lg"
              />
            </div>
          </div>
        </div>

        {/* Route Preference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Route Preference</label>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs text-primary hover:underline"
            >
              {showComparison ? "Hide" : "Compare all routes"}
            </button>
          </div>
          <Tabs value={selectedRoute} onValueChange={(v: any) => setSelectedRoute(v)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="auto">Auto</TabsTrigger>
              <TabsTrigger value="cctp">CCTP</TabsTrigger>
              <TabsTrigger value="ccip">CCIP</TabsTrigger>
              <TabsTrigger value="socket">Socket</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quote Loading */}
        {isQuoting && (
          <div className="rounded-md bg-muted/30 p-3 text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Finding best route...
          </div>
        )}

        {/* Single Quote */}
        {quote && !isQuoting && !showComparison && (
          <div className="rounded-md bg-muted/30 p-3 text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <Info className="w-4 h-4" />
              Best Route: {quote.provider.toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Path:</span>
                <span>{quote.path}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ETA:</span>
                <span>{quote.eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bridge Fee:</span>
                <span>{quote.feeEstimate}</span>
              </div>
              {quote.platformFeePercentage && (
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="text-muted-foreground">Platform Fee:</span>
                  <span className="font-medium text-primary">{quote.platformFeePercentage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison View */}
        {showComparison && allQuotes.length > 0 && !isQuoting && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Available Routes:</div>
            {allQuotes.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuote(q)}
                className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                  quote === q ? "border-primary bg-primary/10" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{q.provider.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">{q.eta}</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="text-muted-foreground">{q.path}</div>
                  <div>Bridge Fee: {q.feeEstimate}</div>
                  {q.platformFeePercentage && (
                    <div>Platform Fee: <span className="text-primary">{q.platformFeePercentage}</span></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleBridge}
          disabled={!quote || isBridging || isConfirming || !amount}
          className="w-full"
        >
          {isBridging || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {isConfirming ? 'Confirming...' : 'Bridging...'}
            </>
          ) : (
            <>
              Bridge {token.symbol}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {/* Transaction Hash */}
        {txHash && (
          <a
            href={`https://arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline block text-center"
          >
            View transaction →
          </a>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 rounded-lg bg-muted/30 p-4 text-xs space-y-2">
        <div className="font-medium">Bridge Protocols:</div>
        <ul className="space-y-1 text-muted-foreground">
          <li>• <strong>CCTP:</strong> Native USDC bridging (fastest, lowest fees)</li>
          <li>• <strong>CCIP:</strong> Chainlink's secure cross-chain protocol</li>
          <li>• <strong>Socket:</strong> Aggregator with multi-bridge routing</li>
        </ul>
      </div>
    </div>
  );
}
