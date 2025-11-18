import { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector } from "@/components/TokenSelector";
import { ARBITRUM_TOKENS } from "@/lib/constants";
import { bestRoute, QuoteResponse } from "@/lib/aggregators";
import { ArrowDownUp, Loader2 } from "lucide-react";

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

        // In production, use wagmi's useReadContract to check allowance
        // For now, stub
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
      // Native ETH swap
      sendTransaction({
        to: quote.data.to,
        data: quote.data.data,
        value: BigInt(quote.data.value || "0"),
      });
    } else {
      // ERC20 swap
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
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="text-muted-foreground">Please connect your wallet to start swapping</p>
      </div>
    );
  }

  if (chain?.id !== 42161) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="text-destructive">Please switch to Arbitrum network</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Swap</h1>
      <div className="space-y-4 rounded-xl border p-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>From</span>
            {balance && (
              <button onClick={handleMaxClick} className="hover:text-foreground">
                Balance: {Number(balance.formatted).toFixed(4)}
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <TokenSelector selectedToken={fromToken} onSelect={setFromToken} />
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

        {/* Switch Button */}
        <div className="flex justify-center">
          <Button variant="outline" size="icon" onClick={switchTokens}>
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">To</div>
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <TokenSelector selectedToken={toToken} onSelect={setToToken} />
            </div>
            <div className="col-span-3">
              <Input
                type="text"
                value={quote ? formatUnits(BigInt(quote.estimatedOutput), toToken.decimals) : "0.0"}
                readOnly
                className="text-right text-lg bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={privacy}
              onChange={(e) => setPrivacy(e.target.checked)}
            />
            Privacy Mode (MEV-safe)
          </label>
          <div className="text-xs text-muted-foreground">
            {quote ? `via ${quote.provider}` : "Router: 0x + CoW"}
          </div>
        </div>

        {/* Quote Preview */}
        {isQuoting && (
          <div className="rounded-md bg-muted/30 p-3 text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Fetching best route...
          </div>
        )}
        
        {quote && !isQuoting && (
          <div className="rounded-md bg-muted/30 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route:</span>
              <span>{quote.route}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Gas:</span>
              <span>{Number(quote.estimatedGas).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {needsApproval ? (
            <Button onClick={handleApprove} disabled={isApproving || !quote} className="w-full">
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Approving...
                </>
              ) : (
                `Approve ${fromToken.symbol}`
              )}
            </Button>
          ) : (
            <Button onClick={handleSwap} disabled={!quote || isSwapping || !amount} className="w-full">
              {isSwapping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Swapping...
                </>
              ) : (
                "Swap"
              )}
            </Button>
          )}
        </div>

        {/* Transaction Hashes */}
        {(approvalHash || swapHash) && (
          <div className="text-xs space-y-1">
            {approvalHash && (
              <a
                href={`https://arbiscan.io/tx/${approvalHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                View approval tx →
              </a>
            )}
            {swapHash && (
              <a
                href={`https://arbiscan.io/tx/${swapHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                View swap tx →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
