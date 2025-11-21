import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { AlertCircle, ExternalLink, BookOpen, Rocket, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChainSelector } from "@/components/ChainSelector";
import { CHAIN_IDS, CHAIN_METADATA, type ChainKey } from "@/lib/constants";
import { isFactoryDeployed, getFactoryAddress, MINIMAL_FACTORY_ABI } from "@/lib/contracts";

export default function Pools() {
  const { address, chain } = useAccount();
  const [selectedChainId, setSelectedChainId] = useState(CHAIN_IDS.ARBITRUM);
  const factoryDeployed = isFactoryDeployed(selectedChainId);
  const factoryAddress = getFactoryAddress(selectedChainId);

  const { data: allPairsCount } = useReadContract({
    address: factoryAddress,
    abi: MINIMAL_FACTORY_ABI,
    functionName: "allPairs",
    args: [0n],
    query: {
      enabled: factoryDeployed && !!factoryAddress,
    },
  });

  const getChainName = (chainId: number): string => {
    const entry = Object.entries(CHAIN_IDS).find(([, id]) => id === chainId);
    return entry ? CHAIN_METADATA[entry[0] as ChainKey].name : "Unknown";
  };

  if (!factoryDeployed) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Liquidity Pools</h1>
            <p className="text-sm text-gray-400 mt-2">
              Create and manage custom AMM pools with configurable fees
            </p>
          </div>
          <ChainSelector selectedChainId={selectedChainId} onChainChange={setSelectedChainId} />
        </div>

        <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                <Rocket size={32} className="text-amber-400" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">MinimalPool Not Deployed</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                The MinimalPool AMM contracts have not been deployed to {getChainName(selectedChainId)} yet.
                Deploy the contracts to enable pool creation and management.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 max-w-2xl mx-auto">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-left text-sm text-gray-300">
                  <p className="font-medium text-blue-400 mb-1">Deployment Required</p>
                  <p>
                    To use liquidity pools on {getChainName(selectedChainId)}, you need to deploy the MinimalFactory contract.
                    Follow the deployment guide to get started.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <h3 className="font-semibold text-lg">Quick Deployment Options</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#0D1624] border border-[#1E2940] rounded-xl p-4 text-left hover:border-[#3396FF]/50 transition">
                  <div className="font-medium mb-2">🌐 Remix IDE</div>
                  <p className="text-xs text-gray-400 mb-3">
                    Browser-based deployment. Best for beginners.
                  </p>
                  <a
                    href="https://remix.ethereum.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#47A1FF] hover:text-[#3396FF] flex items-center gap-1"
                  >
                    Open Remix <ExternalLink size={12} />
                  </a>
                </div>

                <div className="bg-[#0D1624] border border-[#1E2940] rounded-xl p-4 text-left hover:border-[#3396FF]/50 transition">
                  <div className="font-medium mb-2">⚡ Foundry</div>
                  <p className="text-xs text-gray-400 mb-3">
                    Command-line deployment for developers.
                  </p>
                  <a
                    href="https://book.getfoundry.sh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#47A1FF] hover:text-[#3396FF] flex items-center gap-1"
                  >
                    View Docs <ExternalLink size={12} />
                  </a>
                </div>

                <div className="bg-[#0D1624] border border-[#1E2940] rounded-xl p-4 text-left hover:border-[#3396FF]/50 transition">
                  <div className="font-medium mb-2">🔨 Hardhat</div>
                  <p className="text-xs text-gray-400 mb-3">
                    JavaScript-based deployment framework.
                  </p>
                  <a
                    href="https://hardhat.org/getting-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#47A1FF] hover:text-[#3396FF] flex items-center gap-1"
                  >
                    View Docs <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="https://github.com/affidexlab/new/blob/main/contracts/DEPLOYMENT_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90">
                  <BookOpen size={18} className="mr-2" />
                  View Full Deployment Guide
                </Button>
              </a>
            </div>

            <div className="pt-6 border-t border-[#1E2940]">
              <h3 className="font-semibold text-sm mb-3">After Deployment</h3>
              <div className="text-xs text-gray-400 space-y-2 max-w-xl mx-auto text-left">
                <p>1. Copy the deployed MinimalFactory contract address</p>
                <p>2. Update <code className="bg-[#1A2332] px-2 py-1 rounded">app/src/lib/contracts.ts</code> with the address</p>
                <p>3. Redeploy the app or refresh the configuration</p>
                <p>4. Pools tab will become functional automatically</p>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs text-gray-500">
                Contract code available at:{" "}
                <code className="bg-[#1A2332] px-2 py-1 rounded">contracts/MinimalPool.sol</code>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-amber-400 mb-1">⚠️ Security Notice</p>
              <p>
                MinimalPool contracts are designed for campaigns and testing purposes only.
                DO NOT use in production without a comprehensive security audit.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liquidity Pools</h1>
          <p className="text-sm text-gray-400 mt-2">
            Create and manage custom AMM pools with configurable fees
          </p>
        </div>
        <ChainSelector selectedChainId={selectedChainId} onChainChange={setSelectedChainId} />
      </div>

      <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-400 mb-1">✅ Contracts Deployed</p>
            <p className="text-gray-300">
              MinimalFactory deployed at:{" "}
              <code className="bg-[#1A2332] px-2 py-1 rounded text-xs">{factoryAddress}</code>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0B1221] border border-[#1E2940] p-6">
        <h2 className="text-xl font-semibold mb-4">Active Pools</h2>
        
        <div className="space-y-3">
          <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-4 hover:border-[#3396FF]/50 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#627EEA] border-2 border-[#0D1624] flex items-center justify-center text-xs font-bold">
                    ETH
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#2775CA] border-2 border-[#0D1624] flex items-center justify-center text-xs font-bold">
                    USDC
                  </div>
                </div>
                <div>
                  <div className="font-medium">ETH/USDC</div>
                  <div className="text-xs text-gray-400">Fee 0.3% • TVL cap $50k</div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-[#2A3644] hover:bg-[#1A2332]">
                Manage
              </Button>
            </div>
          </div>

          <div className="rounded-xl bg-[#0D1624] border border-[#1E2940] p-4 hover:border-[#3396FF]/50 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#2E3338] border-2 border-[#0D1624] flex items-center justify-center text-xs font-bold">
                    ARB
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#627EEA] border-2 border-[#0D1624] flex items-center justify-center text-xs font-bold">
                    ETH
                  </div>
                </div>
                <div>
                  <div className="font-medium">ARB/ETH</div>
                  <div className="text-xs text-gray-400">Fee 0.5% • TVL cap $25k</div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-[#2A3644] hover:bg-[#1A2332]">
                Manage
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button className="bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90">
            Create New Pool
          </Button>
        </div>
      </div>

      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-blue-400 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-1">Pool Management</p>
            <p>
              Only the factory owner can create new pools. Contact the contract owner to create custom pools
              for your trading campaigns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
