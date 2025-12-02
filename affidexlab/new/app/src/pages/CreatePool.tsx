import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnhancedTokenSelector } from "@/components/EnhancedTokenSelector";
import { ChainSelector } from "@/components/ChainSelector";
import { TOKENS_BY_CHAIN, CHAIN_IDS, type Token } from "@/lib/constants";
import { MINIMAL_FACTORY_ABI, isFactoryDeployed, getFactoryAddress } from "@/lib/contracts";
import { AlertCircle, Loader2, CheckCircle, Info, Rocket } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function CreatePool() {
  const { address, isConnected } = useAccount();
  const [selectedChainId, setSelectedChainId] = useState(CHAIN_IDS.BASE);
  const [token0, setToken0] = useState<Token>(TOKENS_BY_CHAIN[selectedChainId][0]);
  const [token1, setToken1] = useState<Token>(TOKENS_BY_CHAIN[selectedChainId][2]);
  const [feePercent, setFeePercent] = useState("0.3");
  const [tvlCapUSD, setTvlCapUSD] = useState("50000");

  const factoryDeployed = isFactoryDeployed(selectedChainId);
  const factoryAddress = getFactoryAddress(selectedChainId);

  const { data: createHash, writeContract: createPool, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: createHash });

  const handleCreatePool = async () => {
    if (!factoryAddress) {
      toast.error("Factory not deployed", {
        description: "MinimalFactory contract not available on this chain",
      });
      return;
    }

    if (token0.address === token1.address) {
      toast.error("Invalid pair", {
        description: "Cannot create pool with identical tokens",
      });
      return;
    }

    const feeNum = parseFloat(feePercent);
    if (isNaN(feeNum) || feeNum <= 0 || feeNum > 10) {
      toast.error("Invalid fee", {
        description: "Fee must be between 0% and 10%",
      });
      return;
    }

    const tvlNum = parseFloat(tvlCapUSD);
    if (isNaN(tvlNum) || tvlNum <= 0) {
      toast.error("Invalid TVL cap", {
        description: "TVL cap must be greater than 0",
      });
      return;
    }

    const feeBips = Math.floor(feeNum * 100);
    const tvlCapWei = BigInt(Math.floor(tvlNum));

    try {
      createPool({
        address: factoryAddress,
        abi: MINIMAL_FACTORY_ABI,
        functionName: "createPair",
        args: [
          token0.address as `0x${string}`,
          token1.address as `0x${string}`,
          feeBips,
          tvlCapWei,
        ],
      });
    } catch (error) {
      logger.error("Pool creation error", error);
      toast.error("Creation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-8 text-center">
          <div className="mb-4 text-5xl">🔌</div>
          <h3 className="mb-2 text-xl font-bold">Connect Your Wallet</h3>
          <p className="text-sm text-gray-400">Please connect your wallet to create pools</p>
        </div>
      </div>
    );
  }

  if (!factoryDeployed) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto">
              <Rocket size={32} className="text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3">MinimalFactory Not Deployed</h2>
          <p className="text-gray-400 mb-6">
            The MinimalPool factory contract has not been deployed to this chain yet.
            Contact the contract owner to deploy the factory.
          </p>
          <div className="text-left bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-blue-400 mb-1">Deployment Required</p>
                <p>See the deployment guide in the contracts folder to deploy MinimalFactory.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Liquidity Pool</h1>
        <p className="text-sm text-gray-400">
          Create a custom AMM pool with configurable fees and TVL caps
        </p>
      </div>

      <ChainSelector selectedChainId={selectedChainId} onChainChange={setSelectedChainId} />

      {/* Warning Banner */}
      <div className="mt-6 mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-400 mb-1">⚠️ Campaign Pools Only</p>
            <p className="text-gray-300">
              MinimalPool contracts are for small campaigns and testing only. 
              DO NOT use for production DeFi without a security audit.
              Recommended TVL cap: Under $50,000.
            </p>
          </div>
        </div>
      </div>

      {/* Factory Info */}
      <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-400 mb-1">✅ Factory Deployed</p>
            <div className="text-gray-300">
              <p className="mb-1">MinimalFactory: <code className="bg-[#1A2332] px-2 py-1 rounded text-xs">{factoryAddress}</code></p>
              <p className="text-xs text-gray-400">Only the factory owner can create pools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Creation Form */}
      <div className="space-y-6 rounded-2xl bg-[#0B1221] border border-[#1E2940] p-6">
        {/* Token Pair Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-400">Token Pair</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Token 0</label>
              <EnhancedTokenSelector 
                selectedToken={token0} 
                onSelect={setToken0} 
                tokens={TOKENS_BY_CHAIN[selectedChainId]}
                chainId={selectedChainId}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Token 1</label>
              <EnhancedTokenSelector 
                selectedToken={token1} 
                onSelect={setToken1} 
                tokens={TOKENS_BY_CHAIN[selectedChainId]}
                chainId={selectedChainId}
              />
            </div>
          </div>
          {token0.address === token1.address && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              Tokens must be different
            </p>
          )}
        </div>

        {/* Fee Tier */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Fee Tier (%)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.3"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              step="0.1"
              min="0.01"
              max="10"
              className="flex-1 bg-[#0D1624] border-[#1E2940]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFeePercent("0.3")}
              className="border-[#1E2940] hover:bg-[#3396FF]/10"
            >
              0.3%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFeePercent("0.5")}
              className="border-[#1E2940] hover:bg-[#3396FF]/10"
            >
              0.5%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFeePercent("1.0")}
              className="border-[#1E2940] hover:bg-[#3396FF]/10"
            >
              1%
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Standard tiers: 0.3% (most pairs), 0.5% (medium volatility), 1% (high volatility)
          </p>
        </div>

        {/* TVL Cap */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">TVL Cap (USD)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="50000"
              value={tvlCapUSD}
              onChange={(e) => setTvlCapUSD(e.target.value)}
              step="1000"
              min="100"
              className="flex-1 bg-[#0D1624] border-[#1E2940]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTvlCapUSD("10000")}
              className="border-[#1E2940] hover:bg-[#3396FF]/10"
            >
              $10k
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTvlCapUSD("25000")}
              className="border-[#1E2940] hover:bg-[#3396FF]/10"
            >
              $25k
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTvlCapUSD("50000")}
              className="border-[#1E2940] hover:bg-[#3396FF]/10"
            >
              $50k
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Recommended: Keep under $50k for campaign pools
          </p>
        </div>

        {/* Pool Summary */}
        <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-4">
          <h3 className="text-sm font-medium mb-3 text-gray-400">Pool Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Pair:</span>
              <span className="font-medium">{token0.symbol}/{token1.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fee:</span>
              <span className="font-medium">{feePercent}% ({Math.floor(parseFloat(feePercent || "0") * 100)} bips)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">TVL Cap:</span>
              <span className="font-medium">${parseFloat(tvlCapUSD || "0").toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreatePool}
          disabled={!factoryAddress || isPending || isConfirming || token0.address === token1.address}
          className="w-full bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90 disabled:opacity-50"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {isConfirming ? "Confirming..." : "Creating Pool..."}
            </>
          ) : (
            "Create Pool"
          )}
        </Button>

        {/* Transaction Hash */}
        {createHash && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
            <a
              href={`https://basescan.org/tx/${createHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-sm text-green-400 hover:text-green-300"
            >
              <span>View transaction</span>
              <span>→</span>
            </a>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
            <div className="flex gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-400 mb-1">Pool Created Successfully!</p>
                <p className="text-gray-300">
                  Your {token0.symbol}/{token1.symbol} pool is now live. Go to the Pools page to manage it.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-xs font-semibold text-gray-400">Campaign Pools</div>
        </div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-xs font-semibold text-gray-400">TVL Capped</div>
        </div>
        <div className="rounded-xl bg-[#1A1F2E]/50 border border-[#47A1FF]/10 p-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-xs font-semibold text-gray-400">Custom Fees</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex gap-3">
            <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-blue-400 mb-1">Owner Permissions</p>
              <p>
                Only the factory owner (deployer wallet) can create pools. 
                Ensure you're connected with the correct wallet.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex gap-3">
            <Info size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-purple-400 mb-1">After Pool Creation</p>
              <p>
                Once created, the pool will appear in the Pools page. 
                You'll need to add initial liquidity before trading can begin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
