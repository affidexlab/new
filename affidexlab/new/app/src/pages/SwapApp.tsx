import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSignTypedData } from "wagmi";
import { parseUnits, formatUnits, erc20Abi, createPublicClient, http } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnhancedTokenSelector } from "@/components/EnhancedTokenSelector";
import { ChainSelector } from "@/components/ChainSelector";
import { SlippageSettings, SlippageConfig, getSlippagePercentage } from "@/components/SlippageSettings";
import { DustWarning, TransactionTimeoutSettings } from "@/components/DustWarning";
import { TOKENS_BY_CHAIN, CHAIN_IDS, SECURITY_SETTINGS, API_ENDPOINTS, TREASURY_WALLET, SWAP_FEE_BPS, ROUTER_ADDRESSES, COW_SETTLEMENTS, ZEROX_SAFE_TO_ADDRESSES } from "@/lib/constants";
import { getNativePriceUSD, getTokenPriceUSD } from "@/lib/prices";
import { mainnet as viemMainnet, arbitrum as viemArbitrum, avalanche as viemAvalanche, base as viemBase, optimism as viemOptimism, polygon as viemPolygon } from "viem/chains";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { getLiquidityRouterAddress, LIQUIDITY_ROUTER_ABI, LIQUIDITY_ROUTER_ADDRESSES } from "@/lib/liquidityRouter";
import { calculateMinimumOutput } from "@/lib/routerIntegration";
import { ArrowDownUp, Loader2, FileText, Fuel, ChevronDown, Wallet, ExternalLink, Shield, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
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
  const publicClients = {
    [CHAIN_IDS.BASE]: createPublicClient({ chain: viemBase, transport: http("https://mainnet.base.org") }),
    [CHAIN_IDS.ETHEREUM]: createPublicClient({ chain: viemMainnet, transport: http("https://eth.llamarpc.com") }),
    [CHAIN_IDS.ARBITRUM]: createPublicClient({ chain: viemArbitrum, transport: http("https://arbitrum.llamarpc.com") }),
    [CHAIN_IDS.AVALANCHE]: createPublicClient({ chain: viemAvalanche, transport: http("https://api.avax.network/ext/bc/C/rpc") }),
    [CHAIN_IDS.OPTIMISM]: createPublicClient({ chain: viemOptimism, transport: http("https://mainnet.optimism.io") }),
    [CHAIN_IDS.POLYGON]: createPublicClient({ chain: viemPolygon, transport: http("https://polygon-rpc.com") }),
  } as const;
  const [selectedChainId, setSelectedChainId] = useState(CHAIN_IDS.BASE);
  const [fromToken, setFromToken] = useState(TOKENS_BY_CHAIN[CHAIN_IDS.BASE][0]);
  const [toToken, setToToken] = useState(TOKENS_BY_CHAIN[CHAIN_IDS.BASE][2]);
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [fromBalanceFallback, setFromBalanceFallback] = useState<string | null>(null);
  const [toBalanceFallback, setToBalanceFallback] = useState<string | null>(null);
  const [isFromFallbackLoading, setIsFromFallbackLoading] = useState(false);
  const [isToFallbackLoading, setIsToFallbackLoading] = useState(false);
  const [slippageConfig, setSlippageConfig] = useState<SlippageConfig>({ mode: "smart", customValue: 0.5 });
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState(20);
  const [showSettings, setShowSettings] = useState(false);
  const [nativePriceUSD, setNativePriceUSD] = useState<number>(0);
  const [fromTokenPriceUSD, setFromTokenPriceUSD] = useState<number>(0);
  const [feeAmountWei, setFeeAmountWei] = useState<bigint>(0n);
  const [netAmountWei, setNetAmountWei] = useState<bigint>(0n);

  const cowSupported = !!API_ENDPOINTS[selectedChainId]?.cow;

  useEffect(() => {
    if (isConnected && chain?.id) {
      const supportedChains = Object.values(CHAIN_IDS);
      if (supportedChains.includes(chain.id) && chain.id !== selectedChainId) {
        setSelectedChainId(chain.id);
      }
    }
  }, [isConnected, chain?.id, selectedChainId]);

  useEffect(() => {
    const tokens = TOKENS_BY_CHAIN[selectedChainId];
    if (tokens) {
      setFromToken(tokens[0]);
      setToToken(tokens[2] || tokens[1]);
      setFromAmount("");
      setQuote(null);
    }
    (async () => {
      try {
        const p = await getNativePriceUSD(selectedChainId);
        setNativePriceUSD(p || 0);
      } catch {
        setNativePriceUSD(0);
      }
    })();
  }, [selectedChainId]);

  const { data: fromBalance, isLoading: isFromBalanceLoading, refetch: refetchFromBalance, isError: isFromBalanceError } = useBalance({
    address,
    token: fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : fromToken.address as `0x${string}`,
    chainId: selectedChainId,
    enabled: !!address && !!fromToken && isConnected && chain?.id === selectedChainId,
    refetchInterval: 10000,
  });

  const { data: toBalance, isLoading: isToBalanceLoading, refetch: refetchToBalance, isError: isToBalanceError } = useBalance({
    address,
    token: toToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : toToken.address as `0x${string}`,
    chainId: selectedChainId,
    enabled: !!address && !!toToken && isConnected && chain?.id === selectedChainId,
    refetchInterval: 10000,
  });

  useEffect(() => {
    const shouldFetch = !!address && !!fromToken && isConnected && chain?.id === selectedChainId;
    if (!shouldFetch) {
      setFromBalanceFallback(null);
      setIsFromFallbackLoading(false);
      return;
    }

    if (!isFromBalanceError) {
      setFromBalanceFallback(null);
      return;
    }

    const client = publicClients[selectedChainId];
    if (!client) return;

    let cancelled = false;
    setIsFromFallbackLoading(true);

    (async () => {
      try {
        let rawBalance: bigint;
        if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
          rawBalance = await client.getBalance({ address: address as `0x${string}` });
        } else {
          rawBalance = await client.readContract({
            address: fromToken.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address as `0x${string}`],
          }) as bigint;
        }
        if (!cancelled) {
          setFromBalanceFallback(formatUnits(rawBalance, fromToken.decimals));
        }
      } catch (error) {
        console.error("Fallback from balance error", error);
        if (!cancelled) {
          setFromBalanceFallback(null);
        }
      } finally {
        if (!cancelled) {
          setIsFromFallbackLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, chain?.id, fromToken, isConnected, isFromBalanceError, selectedChainId]);

  useEffect(() => {
    const shouldFetch = !!address && !!toToken && isConnected && chain?.id === selectedChainId;
    if (!shouldFetch) {
      setToBalanceFallback(null);
      setIsToFallbackLoading(false);
      return;
    }

    if (!isToBalanceError) {
      setToBalanceFallback(null);
      return;
    }

    const client = publicClients[selectedChainId];
    if (!client) return;

    let cancelled = false;
    setIsToFallbackLoading(true);

    (async () => {
      try {
        let rawBalance: bigint;
        if (toToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
          rawBalance = await client.getBalance({ address: address as `0x${string}` });
        } else {
          rawBalance = await client.readContract({
            address: toToken.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address as `0x${string}`],
          }) as bigint;
        }
        if (!cancelled) {
          setToBalanceFallback(formatUnits(rawBalance, toToken.decimals));
        }
      } catch (error) {
        console.error("Fallback to balance error", error);
        if (!cancelled) {
          setToBalanceFallback(null);
        }
      } finally {
        if (!cancelled) {
          setIsToFallbackLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, chain?.id, toToken, isConnected, isToBalanceError, selectedChainId]);

  const allowanceSpender = quote?.routerData
    ? getLiquidityRouterAddress(selectedChainId)
    : quote?.data?.allowanceTarget;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? fromToken.address as `0x${string}` : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && allowanceSpender ? [address, allowanceSpender as `0x${string}`] : undefined,
    enabled: !!address && !!allowanceSpender && fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  });

  const { data: approvalHash, writeContract: approve } = useWriteContract();
  const { data: swapHash, sendTransaction } = useSendTransaction();
  const { data: feeHash, sendTransaction: sendFeeTransaction } = useSendTransaction();
  const { data: feeTokenHash, writeContract: sendFeeTokenTransaction } = useWriteContract();
  const { writeContract: writeContractGeneric } = useWriteContract();
  const { isLoading: isApproving, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ hash: approvalHash });
  const { isLoading: isSwapping, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({ hash: swapHash });
  const { isLoading: isSendingFee, isSuccess: isFeeSuccess } = useWaitForTransactionReceipt({ hash: feeHash });
  const { isLoading: isSendingFeeToken, isSuccess: isFeeTokenSuccess } = useWaitForTransactionReceipt({ hash: feeTokenHash });
  const { signTypedDataAsync } = useSignTypedData();
  const [pendingSwapData, setPendingSwapData] = useState<{ to: string; data: string; value?: bigint } | null>(null);

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
      refetchFromBalance();
      refetchToBalance();
      setPendingSwapData(null);
    }
  }, [isSwapSuccess, refetchFromBalance, refetchToBalance]);

  // After fee transaction completes, execute the actual swap
  useEffect(() => {
    if ((isFeeSuccess || isFeeTokenSuccess) && pendingSwapData) {
      toast.success("Fee sent to treasury!", {
        description: "Now executing swap...",
      });
      sendTransaction(pendingSwapData);
    }
  }, [isFeeSuccess, isFeeTokenSuccess, pendingSwapData, sendTransaction]);

  useEffect(() => {
    if (isConnected && address) {
      refetchFromBalance();
      refetchToBalance();
    }
  }, [isConnected, address, selectedChainId, fromToken, toToken, refetchFromBalance, refetchToBalance]);

  useEffect(() => {
    if (isSwapSuccess) {
      toast.success("Swap successful!", {
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`,
      });
      setFromAmount("");
      setQuote(null);
    }
  }, [isSwapSuccess, swapHash, fromAmount, fromToken.symbol, toToken.symbol]);

  const requestCountRef = { current: 0 } as { current: number };
  const lastResetRef = { current: Date.now() } as { current: number };

  useEffect(() => {
    if (!fromAmount || !fromToken || !toToken || !address) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      // Rate limit: max 30 requests/min
      const now = Date.now();
      if (now - lastResetRef.current > 60000) {
        lastResetRef.current = now;
        requestCountRef.current = 0;
      }
      if (requestCountRef.current >= 30) {
        toast.error("Too many requests, please wait");
        return;
      }
      requestCountRef.current++;

      // Validate inputs
      const amountNum = parseFloat(fromAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setQuote(null);
        return;
      }
      if (fromToken.decimals < 0 || fromToken.decimals > 18) {
        toast.error("Invalid token decimals");
        setQuote(null);
        return;
      }

      setIsQuoting(true);
      try {
        const grossWei = parseUnits(fromAmount, fromToken.decimals);
        if (grossWei === 0n) throw new Error("Amount too small");
        const fee = (grossWei * BigInt(SWAP_FEE_BPS)) / 10000n;
        if (fee === 0n) throw new Error("Amount too small to pay fee");
        const net = grossWei - fee;
        if (net === 0n) throw new Error("Amount insufficient after fee");
        setFeeAmountWei(fee);
        setNetAmountWei(net);
        const slippagePercentage = getSlippagePercentage(slippageConfig);
        const isNativeFrom = fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        const isNativeTo = toToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        const canUseDirectRouter = !!LIQUIDITY_ROUTER_ADDRESSES[selectedChainId] && !isNativeFrom && !isNativeTo;
        const quoteResult = await bestRoute({
          fromToken: fromToken.address,
          toToken: toToken.address,
          amount: net.toString(),
          fromAddress: address,
          chainId: selectedChainId,
          privacy: !canUseDirectRouter && privacyMode && cowSupported,
          slippagePercentage,
          timeoutMs: Math.max(SECURITY_SETTINGS.MIN_TIMEOUT_MS, Math.min(timeoutMinutes * 60 * 1000, SECURITY_SETTINGS.MAX_TIMEOUT_MS)),
          useDirectRouter: canUseDirectRouter,
        });
        setQuote(quoteResult);
      } catch (error) {
        logger.error("Quote error", error);
        if (error instanceof Error && error.name === "AbortError") {
          toast.error("Request timed out", {
            description: `Quote request exceeded ${timeoutMinutes} minute timeout`,
          });
        } else {
          toast.error("Failed to get quote", {
            description: "Unable to fetch quote. Please adjust amount or try again.",
          });
        }
        setQuote(null);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 1000);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, address, slippageConfig, selectedChainId, privacyMode, cowSupported, timeoutMinutes]);

  const needsApproval = fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && 
                       allowanceSpender &&
                       (!allowance || BigInt(allowance.toString()) < (netAmountWei || 0n));

  const handleApprove = () => {
    if (!allowanceSpender) {
      toast.error("Missing approval target");
      return;
    }
    
    try {
      approve({
        address: fromToken.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [allowanceSpender as `0x${string}`, parseUnits(fromAmount, fromToken.decimals)],
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

  const handleSwap = async () => {
    if (!quote) {
      toast.error("No quote available");
      return;
    }

    const routerAddress = ROUTER_ADDRESSES[selectedChainId];
    if (quote.routerData && routerAddress) {
      try {
        const deadline = Math.floor(Date.now() / 1000) + 1200;
        const amountIn = parseUnits(fromAmount, fromToken.decimals);
        const slippagePercent = getSlippagePercentage(slippageConfig);
        const amountOutMin = calculateMinimumOutput(quote.routerData.estimatedOutput, slippagePercent);
        const routerData = quote.routerData;

        if (routerData.provider === "uniswap_v3" && routerData.fee) {
          await approve({
            address: routerAddress as `0x${string}`,
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
          await approve({
            address: routerAddress as `0x${string}`,
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

        toast.info("Swap submitted", {
          description: "Please confirm in your wallet",
        });
      } catch (error) {
        toast.error("Swap failed", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
      return;
    }

    if (!quote.data) {
      toast.error("No quote available");
      return;
    }

    // Privacy mode via CoW Protocol
    if (privacyMode && quote.provider === "cow") {
      try {
        // CoW settlement contract by chain
        const cowSettlement = (COW_SETTLEMENTS as any)[selectedChainId] as `0x${string}` | undefined;
        if (!cowSettlement) {
          toast.error("CoW Protocol not supported on this chain");
          return;
        }
        // CoW only supports ERC20
        if (fromToken.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
          // Step 1: Transfer fee to treasury (if fee > 0)
          if (feeAmountWei > 0n) {
            try {
              await writeContractGeneric({
                address: fromToken.address as `0x${string}`,
                abi: erc20Abi,
                functionName: "transfer",
                args: [TREASURY_WALLET, feeAmountWei],
              });
              toast.success("Fee sent to treasury", { description: "Now approving CoW settlement..." });
            } catch (feeError) {
              toast.error("Fee transfer failed", { description: "Please try again" });
              return;
            }
          }

          // Step 2: Ensure approval for ERC20 sell token to settlement (net amount)
          if (!allowance || BigInt(allowance.toString()) < netAmountWei) {
            approve({
              address: fromToken.address as `0x${string}`,
              abi: erc20Abi,
              functionName: "approve",
              args: [cowSettlement, netAmountWei],
            });
            toast.info("Approval requested for CoW", { description: "Please confirm in your wallet" });
            return; // wait user to approve then swap again
          }
        }

        // Build CoW order
        const sellAmount = netAmountWei; // swap only net amount
        const estOut = BigInt(quote.estimatedOutput);
        const slippagePercent = getSlippagePercentage(slippageConfig);
        const minBuy = estOut - (estOut * BigInt(Math.floor(slippagePercent * 1000)) / BigInt(1000 * 100));

        const validTo = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes
        const order = {
          sellToken: fromToken.address,
          buyToken: toToken.address,
          sellAmount: sellAmount.toString(),
          buyAmount: minBuy.toString(),
          validTo,
          appData: "0x" + "0".repeat(64),
          feeAmount: "0",
          kind: "sell" as const,
          partiallyFillable: false,
          sellTokenBalance: "erc20",
          buyTokenBalance: "erc20",
          from: address as `0x${string}`,
          receiver: address as `0x${string}`,
        };

        // EIP-712 signing
        const domain = { name: "Gnosis Protocol", version: "v2", chainId: selectedChainId, verifyingContract: cowSettlement } as const;
        const types = {
          Order: [
            { name: "sellToken", type: "address" },
            { name: "buyToken", type: "address" },
            { name: "receiver", type: "address" },
            { name: "sellAmount", type: "uint256" },
            { name: "buyAmount", type: "uint256" },
            { name: "validTo", type: "uint32" },
            { name: "appData", type: "bytes32" },
            { name: "feeAmount", type: "uint256" },
            { name: "kind", type: "string" },
            { name: "partiallyFillable", type: "bool" },
            { name: "sellTokenBalance", type: "string" },
            { name: "buyTokenBalance", type: "string" },
          ],
        } as const;

        const signature = await signTypedDataAsync({ domain, types, primaryType: "Order", message: order });

        // Submit to CoW
        const res = await fetch("https://api.cow.fi/arbitrum/api/v1/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...order, signature, signingScheme: "eip712" }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.description || res.statusText);
        }
        const uid = await res.json();
        toast.success("Privacy order submitted", {
          description: `Order UID: ${uid}`,
        });
        return;
      } catch (error) {
        toast.error("Privacy swap failed", {
          description: error instanceof Error ? error.message : "Please try again",
        });
        return;
      }
    }

    // If Router is configured, use single-tx batching when possible
    const router = ROUTER_ADDRESSES[selectedChainId];
    if (router && quote.provider === "0x") {
      const ZEROX_ALLOWANCE = quote.data.allowanceTarget as `0x${string}`;
      const ZEROX_TO = quote.data.to as `0x${string}`;
      const ZEROX_DATA = quote.data.data as `0x${string}`;

      // Validate 0x targets
      const { getAddress, isHex } = await import("viem");
      try {
        const toChecksum = getAddress(ZEROX_TO);
        const allowChecksum = getAddress(ZEROX_ALLOWANCE);
        const safeSet = ZEROX_SAFE_TO_ADDRESSES[selectedChainId];
        if (!safeSet || !safeSet.has(toChecksum.toLowerCase())) {
          toast.error("Unrecognized 0x contract", { description: toChecksum });
          return;
        }
        if (!isHex(ZEROX_DATA)) {
          toast.error("Invalid transaction data");
          return;
        }
      } catch {
        toast.error("Invalid 0x quote data");
        return;
      }

      const feeBps = SWAP_FEE_BPS;
      const grossWei = parseUnits(fromAmount, fromToken.decimals);

      const routerAbi = [
        { "type":"function","name":"execute0xWithFee","inputs":[
          {"name":"sellToken","type":"address"},
          {"name":"grossAmount","type":"uint256"},
          {"name":"feeBps","type":"uint256"},
          {"name":"treasury","type":"address"},
          {"name":"allowanceTarget","type":"address"},
          {"name":"target","type":"address"},
          {"name":"data","type":"bytes"}
        ],"outputs":[],"stateMutability":"nonpayable"},
        { "type":"function","name":"execute0xWithFeeETH","inputs":[
          {"name":"feeBps","type":"uint256"},
          {"name":"treasury","type":"address"},
          {"name":"target","type":"address"},
          {"name":"data","type":"bytes"}
        ],"outputs":[],"stateMutability":"payable"}
      ] as const;

      try {
        if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
          await writeContractGeneric({
            abi: routerAbi,
            address: router as `0x${string}`,
            functionName: "execute0xWithFeeETH",
            args: [BigInt(feeBps), TREASURY_WALLET as `0x${string}`, ZEROX_TO, ZEROX_DATA],
            value: grossWei,
          });
        } else {
          // Ensure user approval to router for gross amount
          // This uses the existing approval flow if needed
          if (!allowance || BigInt(allowance.toString()) < grossWei) {
            await approve({
              address: fromToken.address as `0x${string}`,
              abi: erc20Abi,
              functionName: "approve",
              args: [router as `0x${string}`, grossWei],
            });
            toast.info("Approved router for token spend. Please confirm swap.");
            return;
          }

          await writeContractGeneric({
            abi: routerAbi,
            address: router as `0x${string}`,
            functionName: "execute0xWithFee",
            args: [
              fromToken.address as `0x${string}`,
              grossWei,
              BigInt(feeBps),
              TREASURY_WALLET as `0x${string}`,
              ZEROX_ALLOWANCE,
              ZEROX_TO,
              ZEROX_DATA,
            ],
          });
        }
        toast.info("Swap requested", { description: "Please confirm in your wallet" });
        return;
      } catch (routerError) {
        logger.error("FeeRouter swap failed, using fallback", routerError);
        toast.warning("Using alternative swap method", { description: "Primary router unavailable" });
        // Fallback to direct swap below
      }
    }

    // Fallback: Two-transaction flow (Fee → Swap)
    // This path should rarely be hit since FeeRouter is deployed on most chains
    // Fee is sent first, then swap executes after confirmation
    try {
      if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        // Native ETH: Send fee to treasury first
        if (feeAmountWei > 0n) {
          // Store swap data for execution after fee completes
          setPendingSwapData({
            to: quote.data.to,
            data: quote.data.data,
            value: netAmountWei,
          });
          // Send fee transaction (will wait for confirmation before swap)
          sendFeeTransaction({
            to: TREASURY_WALLET,
            value: feeAmountWei,
          });
          toast.info("Sending fee to treasury...", { 
            description: "Swap will execute automatically after fee confirmation" 
          });
        } else {
          // No fee, direct swap
          sendTransaction({
            to: quote.data.to,
            data: quote.data.data,
            value: netAmountWei,
          });
          toast.info("Swap requested", { description: "Please confirm in your wallet" });
        }
      } else {
        // ERC20: Ensure approval for net amount to 0x first
        const allowanceTarget = quote.data.allowanceTarget as `0x${string}`;
        if (!allowance || BigInt(allowance.toString()) < netAmountWei) {
          approve({
            address: fromToken.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [allowanceTarget, netAmountWei],
          });
          toast.info("Approval requested", { description: "Please confirm and retry swap" });
          return;
        }
        
        // Send fee to treasury first
        if (feeAmountWei > 0n) {
          // Store swap data for execution after fee completes
          setPendingSwapData({
            to: quote.data.to,
            data: quote.data.data,
          });
          // Send fee token transaction (will wait for confirmation before swap)
          sendFeeTokenTransaction({
            address: fromToken.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "transfer",
            args: [TREASURY_WALLET, feeAmountWei],
          });
          toast.info("Sending fee to treasury...", { 
            description: "Swap will execute automatically after fee confirmation" 
          });
        } else {
          // No fee, direct swap
          sendTransaction({
            to: quote.data.to,
            data: quote.data.data,
          });
          toast.info("Swap requested", { description: "Please confirm in your wallet" });
        }
      }
    } catch (error) {
      logger.error("Swap error", error);
      toast.error("Swap failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      setPendingSwapData(null);
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

  useEffect(() => {
    (async () => {
      try {
        if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
          // native token uses native price we already fetched
          setFromTokenPriceUSD(nativePriceUSD || 0);
        } else {
          const p = await getTokenPriceUSD(selectedChainId, fromToken.address);
          setFromTokenPriceUSD(p || 0);
        }
      } catch {
        setFromTokenPriceUSD(0);
      }
    })();
  }, [fromToken, selectedChainId, nativePriceUSD]);

  const calculateFeeUSD = () => {
    if (!quote) return 0;
    
    // For direct router quotes (Aerodrome/Uniswap V3)
    if (quote.routerData) {
      const estimatedGas = quote.routerData.estimatedGas || "150000";
      // Use a reasonable gas price for L2s (Base is ~0.001 Gwei typically)
      const gasPrice = selectedChainId === CHAIN_IDS.BASE ? "1000000" : "50000000000";
      const gasCostWei = BigInt(estimatedGas) * BigInt(gasPrice);
      const gasCostNative = parseFloat(formatUnits(gasCostWei, 18));
      const price = nativePriceUSD || 0;
      return gasCostNative * price;
    }
    
    // For 0x quotes
    if (!quote?.data?.estimatedGas) return 0;
    const gasPrice = quote.data.gasPrice || "50000000000";
    const gasCostWei = BigInt(quote.data.estimatedGas) * BigInt(gasPrice);
    const gasCostNative = parseFloat(formatUnits(gasCostWei, 18));
    const price = nativePriceUSD || 0;
    return gasCostNative * price;
  };

  const calculateValueUSD = () => {
    const amount = parseFloat(fromAmount || "0");
    const price = fromTokenPriceUSD || 0;
    return amount * price;
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
                Balance: {isConnected && chain?.id && chain.id !== selectedChainId ? (
                  <span className="text-orange-400">Switch Chain</span>
                ) : (isFromBalanceLoading || isFromFallbackLoading) ? (
                  <Loader2 className="w-3 h-3 inline animate-spin" />
                ) : fromBalance ? (
                  Number(fromBalance.formatted).toFixed(4)
                ) : fromBalanceFallback ? (
                  Number(fromBalanceFallback).toFixed(4)
                ) : isFromBalanceError ? (
                  <span className="text-red-400">Error</span>
                ) : (
                  '0.0000'
                )}
              </span>
              <button 
                onClick={handleMaxClick}
                disabled={!fromBalance || isFromBalanceLoading}
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
              Balance: {isConnected && chain?.id && chain.id !== selectedChainId ? (
                <span className="text-orange-400">Switch Chain</span>
              ) : (isToBalanceLoading || isToFallbackLoading) ? (
                <Loader2 className="w-3 h-3 inline animate-spin" />
              ) : toBalance ? (
                Number(toBalance.formatted).toFixed(4)
              ) : toBalanceFallback ? (
                Number(toBalanceFallback).toFixed(4)
              ) : isToBalanceError ? (
                <span className="text-red-400">Error</span>
              ) : (
                '0.0000'
              )}
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
                <span className="text-gray-500">Platform Fee</span>
                <span className="text-gray-300">{fromAmount ? (Number(formatUnits(feeAmountWei, fromToken.decimals)).toFixed(6) + ' ' + fromToken.symbol) : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Swapped</span>
                <span className="text-gray-300">{fromAmount ? (Number(formatUnits(netAmountWei, fromToken.decimals)).toFixed(6) + ' ' + fromToken.symbol) : '0'}</span>
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

        {/* Two-step process indicator */}
        {(isSendingFee || isSendingFeeToken || pendingSwapData) && (
          <div className="mb-4 rounded-xl bg-blue-500/10 border border-blue-500/30 p-4">
            <div className="flex items-start gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-300 mb-1">
                  {isSendingFee || isSendingFeeToken ? "Step 1/2: Sending fee to treasury..." : "Step 2/2: Executing swap..."}
                </p>
                <p className="text-xs text-gray-300">
                  {isSendingFee || isSendingFeeToken 
                    ? "Please wait for fee transaction to confirm. Swap will execute automatically."
                    : "Fee confirmed! Executing your swap now..."}
                </p>
              </div>
            </div>
          </div>
        )}

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
        ) : (isSwapping || isSendingFee || isSendingFeeToken) ? (
          <Button 
            className="w-full h-14 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] text-white font-semibold text-base rounded-xl"
            disabled
          >
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {isSendingFee || isSendingFeeToken ? "Sending fee to treasury..." : "Swapping..."}
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

        {(approvalHash || feeHash || feeTokenHash || swapHash) && (
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
            {(feeHash || feeTokenHash) && (
              <a 
                href={getExplorerUrl(feeHash || feeTokenHash || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-green-400 hover:text-green-300 transition"
              >
                View fee transaction (1.5% to treasury)
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
