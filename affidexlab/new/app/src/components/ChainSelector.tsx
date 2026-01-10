import { useState } from "react";
import { useSwitchChain, useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { CHAIN_IDS, CHAIN_METADATA, type ChainKey } from "@/lib/constants";

interface ChainSelectorProps {
  selectedChainId: number;
  onChainChange: (chainId: number) => void;
}

export function ChainSelector({ selectedChainId, onChainChange }: ChainSelectorProps) {
  const [open, setOpen] = useState(false);
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();

  const handleChainSelect = (chainId: number) => {
    onChainChange(chainId);
    if (chain?.id !== chainId && switchChain) {
      switchChain({ chainId });
    }
    setOpen(false);
  };

  const getChainName = (chainId: number): string => {
    const entry = Object.entries(CHAIN_IDS).find(([, id]) => id === chainId);
    return entry ? CHAIN_METADATA[entry[0] as ChainKey].name : "Unknown";
  };

  const getChainLogo = (chainId: number): string => {
    const entry = Object.entries(CHAIN_IDS).find(([, id]) => id === chainId);
    return entry ? CHAIN_METADATA[entry[0] as ChainKey].logo : "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="min-w-[140px] justify-between bg-[#1A2332] hover:bg-[#1E2940] border border-[#2A3644] text-white h-11 px-4 rounded-xl"
        >
          <div className="flex items-center gap-2">
            <img 
              src={getChainLogo(selectedChainId)} 
              alt={getChainName(selectedChainId)} 
              className="w-5 h-5 rounded-full" 
            />
            <span className="font-medium">{getChainName(selectedChainId)}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0D1624] border-[#1E2940] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Select Network</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {Object.entries(CHAIN_IDS).map(([key, chainId]) => {
            const metadata = CHAIN_METADATA[key as ChainKey];
            const isSelected = chainId === selectedChainId;
            
            return (
              <button
                key={chainId}
                onClick={() => handleChainSelect(chainId)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isSelected
                    ? "bg-[#3396FF]/20 border border-[#3396FF]/50"
                    : "hover:bg-[#1A2332] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={metadata.logo} 
                    alt={metadata.name} 
                    className="w-8 h-8 rounded-full" 
                  />
                  <div className="text-left">
                    <div className="font-medium text-white">{metadata.name}</div>
                    <div className="text-xs text-gray-500">{metadata.nativeCurrency}</div>
                  </div>
                </div>
                {isSelected && <Check size={18} className="text-[#47A1FF]" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
