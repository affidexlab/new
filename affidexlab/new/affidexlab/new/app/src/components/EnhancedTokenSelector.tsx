import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Token } from "@/lib/constants";
import { ChevronDown, Plus, X, Loader2, AlertCircle } from "lucide-react";
import { 
  getCustomTokens, 
  saveCustomToken, 
  removeCustomToken, 
  isCustomToken,
  fetchTokenMetadata,
  isValidAddress,
  searchTokens,
} from "@/lib/tokenUtils";
import { toast } from "sonner";

interface EnhancedTokenSelectorProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
  tokens: Token[];
  chainId: number;
}

export function EnhancedTokenSelector({ selectedToken, onSelect, tokens, chainId }: EnhancedTokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importAddress, setImportAddress] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { address } = useAccount();

  const customTokens = getCustomTokens().filter((t) => t.chainId === chainId);
  const allTokens = [...tokens, ...customTokens];
  const filteredTokens = searchTokens(allTokens, search);

  const handleImport = async () => {
    if (!isValidAddress(importAddress)) {
      toast.error("Invalid address", { description: "Please enter a valid Ethereum address" });
      return;
    }

    setIsImporting(true);
    try {
      const metadata = await fetchTokenMetadata(importAddress, chainId);
      const newToken: Token = {
        symbol: metadata.symbol!,
        name: metadata.name!,
        address: importAddress,
        decimals: metadata.decimals!,
        logo: metadata.logo!,
        chainId,
      };

      saveCustomToken(newToken);
      toast.success("Token imported successfully!", {
        description: `${newToken.symbol} (${newToken.name})`,
      });
      
      setImportAddress("");
      setShowImport(false);
      setSearch("");
    } catch (error) {
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "Failed to import token",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleRemoveCustomToken = (token: Token) => {
    removeCustomToken(token.address, token.chainId);
    toast.success("Token removed", { description: `${token.symbol} has been removed from your list` });
  };

  const isAddressInSearch = isValidAddress(search) && !filteredTokens.some(
    (t) => t.address.toLowerCase() === search.toLowerCase()
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="min-w-[140px] justify-between bg-[#1A2332] hover:bg-[#1E2940] border border-[#2A3644] text-white h-11 px-4 rounded-xl"
        >
          {selectedToken ? (
            <div className="flex items-center gap-2">
              <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />
              <span className="font-medium">{selectedToken.symbol}</span>
            </div>
          ) : (
            <span className="text-gray-400">Select Token</span>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0D1624] border-[#1E2940] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>Select a token</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImport(!showImport)}
              className="text-[#47A1FF] hover:text-[#3396FF] hover:bg-[#3396FF]/10"
            >
              <Plus size={16} className="mr-1" />
              Import
            </Button>
          </DialogTitle>
        </DialogHeader>

        {showImport ? (
          <div className="space-y-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-2">
              <AlertCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-300">
                Import custom tokens by entering their contract address. Always verify token contracts before importing.
              </p>
            </div>
            <Input
              placeholder="Token contract address (0x...)"
              value={importAddress}
              onChange={(e) => setImportAddress(e.target.value)}
              className="bg-[#1A2332] border-[#2A3644] text-white placeholder:text-gray-500"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={isImporting || !importAddress}
                className="flex-1 bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import Token"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowImport(false);
                  setImportAddress("");
                }}
                variant="outline"
                className="border-[#2A3644] hover:bg-[#1A2332]"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Input
              placeholder="Search name, symbol, or paste address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3 bg-[#1A2332] border-[#2A3644] text-white placeholder:text-gray-500"
            />
            
            {isAddressInSearch && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-400" />
                    <span className="text-sm text-gray-300">Token not found</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setImportAddress(search);
                      setShowImport(true);
                    }}
                    className="text-xs bg-[#3396FF] hover:bg-[#2986EF]"
                  >
                    Import
                  </Button>
                </div>
              </div>
            )}
            
            <div className="max-h-96 overflow-y-auto space-y-1">
              {filteredTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No tokens found</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImport(true)}
                    className="mt-2 text-[#47A1FF]"
                  >
                    Import custom token
                  </Button>
                </div>
              ) : (
                filteredTokens.map((token) => (
                  <TokenItem
                    key={`${token.address}-${token.chainId}`}
                    token={token}
                    address={address}
                    isCustom={isCustomToken(token.address, token.chainId)}
                    onRemove={() => handleRemoveCustomToken(token)}
                    onClick={() => {
                      onSelect(token);
                      setOpen(false);
                      setSearch("");
                    }}
                  />
                ))
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TokenItem({ 
  token, 
  address, 
  isCustom,
  onRemove,
  onClick 
}: { 
  token: Token; 
  address?: `0x${string}`; 
  isCustom: boolean;
  onRemove: () => void;
  onClick: () => void;
}) {
  const { data: balance } = useBalance({
    address,
    token: token.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : token.address as `0x${string}`,
    chainId: token.chainId,
  });

  return (
    <div className="w-full flex items-center justify-between p-3 hover:bg-[#1A2332] rounded-xl transition-colors group">
      <button
        onClick={onClick}
        className="flex items-center gap-3 flex-1"
      >
        <img 
          src={token.logo} 
          alt={token.symbol} 
          className="w-9 h-9 rounded-full" 
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/36/1A2332/47A1FF?text=" + token.symbol[0];
          }}
        />
        <div className="text-left">
          <div className="font-medium text-white flex items-center gap-2">
            {token.symbol}
            {isCustom && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#3396FF]/20 text-[#47A1FF] rounded">
                Custom
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">{token.name}</div>
        </div>
      </button>
      <div className="flex items-center gap-2">
        <div className="text-right text-sm text-gray-400">
          {balance ? Number(balance.formatted).toFixed(4) : '0'}
        </div>
        {isCustom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
          >
            <X size={14} className="text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}
