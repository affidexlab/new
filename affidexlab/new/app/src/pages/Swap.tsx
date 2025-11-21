import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TokenSelector } from "@/components/TokenSelector";
import { TOKENS_BY_CHAIN, CHAIN_IDS, CHAIN_METADATA, type Token, type ChainKey } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { ArrowDownUp, Loader2, Settings, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Swap() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const [fromChain, setFromChain] = useState<ChainKey>("ARBITRUM");
  const [toChain, setToChain] = useState<ChainKey>("ARBITRUM");
  const [fromToken, setFromToken] = useState<Token>(TOKENS_BY_CHAIN[CHAIN_IDS.ARBITRUM][0]);
  const [toToken, setToToken] = useState<Token>(TOKENS_BY_CHAIN[CHAIN_IDS.ARBITRUM][2]);
  const [amount, setAmount] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [needsChainSwitch, setNeedsChainSwitch] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

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
          privacy,
        });
        setQuote(quoteResult);
      } catch (error) {
        console.error("Quote error:", error);
        const errorMsg = error instanceof Error ? error.message : "Unable to fetch quote. Please try again.";
        setQuoteError(errorMsg);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [amount, fromToken, toToken, address, privacy, fromChain, isCrossChainSwap]);

  const needsApproval = !isCrossChainSwap && 
    fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && 
    amount && BigInt(0) < parseUnits(amount || "0", fromToken.decimals); // conservative; allowance checked during 0x quote

  const handleApprove = () => {
    if (!quote?.data?.allowanceTarget) {
      toast.error("Unable to approve", { description: "Quote data is missing" });
      return;
    }
    approve({
      address: fromToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [quote.data.allowanceTarget, BigInt(quote.data.sellAmount || parseUnits(amount, fromToken.decimals).toString())],
    });
  };

  const handleSwap = () => {
    if (!quote?.data) return;

    if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      sendTransaction({ to: quote.data.to, data: quote.data.data, value: BigInt(quote.data.value || "0") });
    } else {
      sendTransaction({ to: quote.data.to, data: quote.data.data });
    }
  };

  const handleMaxClick = () => { if (balance) setAmount(balance.formatted); };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleChainSwitch = async () => {
    try { await switchChain({ chainId: CHAIN_IDS[fromChain] }); } catch (e) { console.error(e); }
  };

  const explorers: Record<ChainKey, string> = {
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

      {/* Privacy Toggle */}
      {!isCrossChainSwap && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-[#1E2433]/50 p-3 border border-white/5">
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#47A1FF] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#3396FF] peer-checked:to-[#47A1FF]"></div>
            </div>
            <span className="font-medium">🔒 Privacy Mode</span>
          </label>
          <span className="text-xs text-gray-500">MEV Protection</span>
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
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center"><div className="text-2xl mb-2">🛡️</div><div className="text-xs font-semibold text-gray-400">MEV Protection</div></div>
      </div>
    </div>
  );
}
