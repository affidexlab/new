import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { getNativePriceUSD, getTokenPriceUSD } from "@/lib/prices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TokenSelector } from "@/components/TokenSelector";
import { TOKENS_BY_CHAIN, CHAIN_IDS, CHAIN_METADATA, type Token, type ChainKey } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { getLiquidityRouterAddress, LIQUIDITY_ROUTER_ABI } from "@/lib/contracts";
import { calculateMinimumOutput } from "@/lib/routerIntegration";
import { ArrowDownUp, Loader2, Settings, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { usePointsTracking } from "@/hooks/usePointsTracking";

export default function Swap() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { trackSwap } = usePointsTracking();
  
  const [fromChain, setFromChain] = useState<ChainKey>("BASE");
  const [toChain, setToChain] = useState<ChainKey>("BASE");
  const [fromToken, setFromToken] = useState<Token>(TOKENS_BY_CHAIN[CHAIN_IDS.BASE][0]);
  const [toToken, setToToken] = useState<Token>(TOKENS_BY_CHAIN[CHAIN_IDS.BASE][2]);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [needsChainSwitch, setNeedsChainSwitch] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [useDirectRouter, setUseDirectRouter] = useState(true);
  const [slippage, setSlippage] = useState(0.5);

  const { data: balance } = useBalance({
    address,
    token: fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : fromToken.address as `0x${string}`,
    chainId: CHAIN_IDS[fromChain],
  });

  const { data: approvalHash, writeContract: approve } = useWriteContract();
  const { data: swapHash, sendTransaction } = useSendTransaction();
  
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approvalHash });
  const { isLoading: isSwapping } = useWaitForTransactionReceipt({ hash: swapHash });

  const isCrossChainSwap = fromChain !== toChain;

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" 
      ? fromToken.address as `0x${string}` 
      : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && quote?.data?.allowanceTarget
      ? [address, quote.data.allowanceTarget as `0x${string}`]
      : undefined,
  });

  useEffect(() => {
    if (isApproving === false && approvalHash) {
      refetchAllowance();
    }
  }, [isApproving, approvalHash, refetchAllowance]);

  // Check if user is on the correct chain
  useEffect(() => {
    if (isConnected && chain) {
      const expectedChainId = CHAIN_IDS[fromChain];
      setNeedsChainSwitch(chain.id !== expectedChainId);
    }
  }, [chain, fromChain, isConnected]);

  // Update token when chain changes
  useEffect(() => {
    const fromChainTokens = TOKENS_BY_CHAIN[CHAIN_IDS[fromChain]];
    const toChainTokens = TOKENS_BY_CHAIN[CHAIN_IDS[toChain]];
    
    if (fromChainTokens && fromChainTokens.length > 0) setFromToken(fromChainTokens[0]);
    if (toChainTokens && toChainTokens.length > 0) {
      const usdcToken = toChainTokens.find(t => t.symbol === "USDC");
      setToToken(usdcToken || toChainTokens[0]);
    }
  }, [fromChain, toChain]);

  // Fetch quote when amount or tokens change (same-chain only)
  useEffect(() => {
    if (!amount || !fromToken || !toToken || !address || isCrossChainSwap) {
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
          chainId: CHAIN_IDS[fromChain],
          privacy: false,
          useDirectRouter,
          slippagePercentage: slippage,
        });
        setQuote(quoteResult);
      } catch (error) {
        logger.error("Quote error", error);
        const errorMsg = error instanceof Error ? error.message : "Unable to fetch quote. Please try again.";
        setQuoteError(errorMsg);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [amount, fromToken, toToken, address, fromChain, isCrossChainSwap]);

  const amountBigInt = amount ? parseUnits(amount, fromToken.decimals) : BigInt(0);
  const currentAllowance = allowanceData ? BigInt(allowanceData.toString()) : BigInt(0);
  
  const allowanceTarget = useDirectRouter && quote?.routerData
    ? getLiquidityRouterAddress(CHAIN_IDS[fromChain])
    : quote?.data?.allowanceTarget;
  
  const needsApproval = !isCrossChainSwap && 
    fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && 
    amount && 
    allowanceTarget &&
    currentAllowance < amountBigInt;

  const handleApprove = () => {
    if (!allowanceTarget) {
      toast.error("Unable to approve", { description: "Quote data is missing" });
      return;
    }
    approve({
      address: fromToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [allowanceTarget as `0x${string}`, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")],
    });
  };

  const handleSwap = () => {
    if (!quote) return;

    if (useDirectRouter && quote.routerData) {
      handleDirectRouterSwap();
    } else if (quote.data) {
      if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        sendTransaction({ to: quote.data.to, data: quote.data.data, value: BigInt(quote.data.value || "0") });
      } else {
        sendTransaction({ to: quote.data.to, data: quote.data.data });
      }
    }
  };

  const handleDirectRouterSwap = () => {
    if (!quote?.routerData) return;
    
    const routerAddress = getLiquidityRouterAddress(CHAIN_IDS[fromChain]);
    if (!routerAddress) {
      toast.error("Router not deployed", { description: `LiquidityRouter not available on ${CHAIN_METADATA[fromChain].name}` });
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + 1200;
    const amountIn = parseUnits(amount, fromToken.decimals);
    const amountOutMin = calculateMinimumOutput(quote.routerData.estimatedOutput, slippage);

    const routerData = quote.routerData;

    if (routerData.provider === "uniswap_v3" && routerData.fee) {
      approve({
        address: routerAddress,
        abi: LIQUIDITY_ROUTER_ABI,
        functionName: "swapExactInputUniswapV3",
        args: [
          fromToken.address as `0x${string}`,
          toToken.address as `0x${string}`,
          routerData.fee,
          amountIn,
          amountOutMin,
          BigInt(deadline),
        ],
      });
    } else if (routerData.provider === "aerodrome" && routerData.aerodromeRoutes) {
      approve({
        address: routerAddress,
        abi: LIQUIDITY_ROUTER_ABI,
        functionName: "swapExactInputAerodrome",
        args: [
          routerData.aerodromeRoutes,
          amountIn,
          amountOutMin,
          BigInt(deadline),
        ],
      });
    }
  };

  const handleMaxClick = () => { if (balance) setAmount(balance.formatted); };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromChain(toChain);
    setToChain(fromChain);
  };

  // Persist swap to analytics after on-chain confirmation
  useEffect(() => {
    const persist = async () => {
      if (!swapHash || isSwapping) return;
      try {
        const amountNum = parseFloat(amount || "0");
        if (!amountNum || !fromToken) return;
        const chainId = CHAIN_IDS[fromChain];
        const priceUSD = fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          ? await getNativePriceUSD(chainId)
          : await getTokenPriceUSD(chainId, fromToken.address);
        const amountUSD = amountNum * (priceUSD || 0);
        const entry = {
          hash: swapHash,
          address,
          type: "swap",
          amount: amountNum.toString(),
          amountUSD: amountUSD.toFixed(2),
          timestamp: Date.now(),
          fromToken: fromToken.symbol,
          chainId,
        };
        const key = "decaflow_swaps";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.push(entry);
        localStorage.setItem(key, JSON.stringify(prev));

        // Track points for this swap transaction
        await trackSwap(
          swapHash,
          fromToken.address,
          toToken.address,
          amountUSD,
          chainId
        );
      } catch (e) {
        // ignore analytics failures
      }
    };
    persist();
  }, [isSwapping, swapHash]);

  const handleChainSwitch = async () => {
    try { await switchChain({ chainId: CHAIN_IDS[fromChain] }); } catch (e) { logger.error("Chain switch error", e); }
  };

  const explorers: Record<ChainKey, string> = {
    ETHEREUM: "https://etherscan.io",
    ARBITRUM: "https://arbiscan.io",
    AVALANCHE: "https://snowtrace.io",
    BASE: "https://basescan.org",
    OPTIMISM: "https://optimistic.etherscan.io",
    POLYGON: "https://polygonscan.com",
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

  return (
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Swap</h2>
        <button className="rounded-xl p-2 hover:bg-white/5 transition">
          <Settings size={20} className="text-gray-400 hover:text-[#47A1FF]" />
        </button>
      </div>

      {/* Direct Router Info */}
      {useDirectRouter && getLiquidityRouterAddress(CHAIN_IDS[fromChain]) && (
        <div className="mb-4 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 p-4">
          <div className="flex items-start gap-3">
            <div className="text-xl">⚡</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-300 mb-1">
                Production Router Enabled
              </p>
              <p className="text-xs text-gray-300">
                Using Uniswap V3 {CHAIN_IDS[fromChain] === 8453 && "+ Aerodrome"} for optimal pricing and deep liquidity
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wrong Network Warning */}
      {needsChainSwitch && (
        <div className="mb-4 rounded-xl bg-orange-500/10 border border-orange-500/30 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-orange-300 mb-2">Please switch to <strong>{CHAIN_METADATA[fromChain].name}</strong></p>
              <Button onClick={handleChainSwitch} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">Switch Network</Button>
            </div>
          </div>
        </div>
      )}

      {/* FROM */}
      <div className="mb-4 rounded-2xl bg-[#1E2433] p-4 border border-white/5">
        <div className="mb-3 grid grid-cols-2 gap-3">
          <Select value={fromChain} onValueChange={(v: any) => setFromChain(v)}>
            <SelectTrigger className="bg-[#0F1419] border-white/10">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <img src={CHAIN_METADATA[fromChain].logo} alt={CHAIN_METADATA[fromChain].name} className="w-5 h-5 rounded-full" />
                  <span>{CHAIN_METADATA[fromChain].name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CHAIN_IDS) as ChainKey[]).map((ck) => (
                <SelectItem key={ck} value={ck}>
                  <div className="flex items-center gap-2">
                    <img src={CHAIN_METADATA[ck].logo} alt={CHAIN_METADATA[ck].name} className="w-5 h-5 rounded-full" />
                    <span>{CHAIN_METADATA[ck].name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {balance && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-gray-500">Balance: {Number(balance.formatted).toFixed(4)}</span>
              <button onClick={handleMaxClick} className="rounded-lg border border-[#47A1FF]/50 px-3 py-1 text-xs font-bold text-[#47A1FF] hover:bg-[#47A1FF]/10 transition">MAX</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <TokenSelector selectedToken={fromToken} onSelect={setFromToken} tokens={TOKENS_BY_CHAIN[CHAIN_IDS[fromChain]]} />
          <Input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 border-0 bg-transparent text-right text-3xl font-bold focus-visible:ring-0" />
        </div>
      </div>

      {/* Swap Direction */}
      <div className="relative flex justify-center -my-2">
        <button onClick={switchTokens} className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2A3141] to-[#1E2433] border-2 border-[#47A1FF]/30 hover:border-[#47A1FF] hover:scale-110 transition-all duration-300 group">
          <ArrowDownUp size={20} className="text-[#47A1FF] group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>

      {/* TO */}
      <div className="mb-4 rounded-2xl bg-[#1E2433] p-4 border border-white/5">
        <div className="mb-3">
          <Select value={toChain} onValueChange={(v: any) => setToChain(v)}>
            <SelectTrigger className="bg-[#0F1419] border-white/10">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <img src={CHAIN_METADATA[toChain].logo} alt={CHAIN_METADATA[toChain].name} className="w-5 h-5 rounded-full" />
                  <span>{CHAIN_METADATA[toChain].name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CHAIN_IDS) as ChainKey[]).map((ck) => (
                <SelectItem key={ck} value={ck}>
                  <div className="flex items-center gap-2">
                    <img src={CHAIN_METADATA[ck].logo} alt={CHAIN_METADATA[ck].name} className="w-5 h-5 rounded-full" />
                    <span>{CHAIN_METADATA[ck].name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <TokenSelector selectedToken={toToken} onSelect={setToToken} tokens={TOKENS_BY_CHAIN[CHAIN_IDS[toChain]]} />
          <Input type="text" value={quote && !isCrossChainSwap ? formatUnits(BigInt(quote.estimatedOutput), toToken.decimals) : "0.0"} readOnly className="flex-1 border-0 bg-transparent text-right text-3xl font-bold text-gray-400 focus-visible:ring-0" />
        </div>
      </div>

      {/* Cross-Chain Notice */}
      {isCrossChainSwap && (
        <div className="mb-4 rounded-xl bg-blue-500/10 border border-blue-500/30 p-4 flex gap-3">
          <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Cross-Chain Swap Detected</p>
            <p className="text-xs">For cross-chain transfers, use the Bridge tab (CCTP/CCIP/Socket).</p>
          </div>
        </div>
      )}



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
      {isQuoting && !isCrossChainSwap && (
        <div className="mb-4 rounded-xl bg-[#3396FF]/10 border border-[#3396FF]/30 p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#47A1FF]" />
          <span className="text-sm text-gray-300">Fetching best price...</span>
        </div>
      )}
      
      {quote && !isQuoting && !isCrossChainSwap && (
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
        </div>
      )}

      {/* Action Button */}
      {isCrossChainSwap ? (
        <Button disabled className="w-full h-14 bg-gray-600 text-white font-bold text-lg rounded-xl cursor-not-allowed">Use Bridge Tab for Cross-Chain</Button>
      ) : needsApproval ? (
        <Button onClick={handleApprove} disabled={isApproving || needsChainSwitch} className="w-full h-14 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg">
          {isApproving ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" /> Approving...</>) : "Approve " + fromToken.symbol}
        </Button>
      ) : (
        <Button onClick={handleSwap} disabled={!quote || isSwapping || !amount || needsChainSwitch} className="w-full h-14 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg">
          {isSwapping ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" /> Swapping...</>) : (!amount ? "Enter an amount" : (!quote ? "Select tokens" : "Swap"))}
        </Button>
      )}

      {/* Transaction Links */}
      {(approvalHash || swapHash) && (
        <div className="mt-4 space-y-2 text-sm">
          {approvalHash && (
            <a href={`${explorers[fromChain]}/tx/${approvalHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-green-400 hover:bg-green-500/20 transition"><span>Approval transaction</span><span>View →</span></a>
          )}
          {swapHash && (
            <a href={`${explorers[fromChain]}/tx/${swapHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-green-400 hover:bg-green-500/20 transition"><span>Swap transaction</span><span>View →</span></a>
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center"><div className="text-2xl mb-2">🌐</div><div className="text-xs font-semibold text-gray-400">Multi-Chain</div></div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center"><div className="text-2xl mb-2">✨</div><div className="text-xs font-semibold text-gray-400">Best Pricing</div></div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center"><div className="text-2xl mb-2">🛡️</div><div className="text-xs font-semibold text-gray-400">Secure Swaps</div></div>
      </div>
    </div>
  );
}
