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
import { ARBITRUM_TOKENS } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

type Token = typeof ARBITRUM_TOKENS[0];

interface TokenSelectorProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
}

export function TokenSelector({ selectedToken, onSelect }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { address } = useAccount();

  const filteredTokens = ARBITRUM_TOKENS.filter((token) =>
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.name.toLowerCase().includes(search.toLowerCase())
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
          <DialogTitle className="text-white">Select a token</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search name or paste address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 bg-[#1A2332] border-[#2A3644] text-white placeholder:text-gray-500"
        />
        <div className="max-h-96 overflow-y-auto space-y-1">
          {filteredTokens.map((token) => (
            <TokenItem
              key={token.address}
              token={token}
              address={address}
              onClick={() => {
                onSelect(token);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TokenItem({ token, address, onClick }: { token: Token; address?: `0x${string}`; onClick: () => void }) {
  const { data: balance } = useBalance({
    address,
    token: token.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? undefined : token.address as `0x${string}`,
  });

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 hover:bg-[#1A2332] rounded-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <img src={token.logo} alt={token.symbol} className="w-9 h-9 rounded-full" />
        <div className="text-left">
          <div className="font-medium text-white">{token.symbol}</div>
          <div className="text-xs text-gray-500">{token.name}</div>
        </div>
      </div>
      <div className="text-right text-sm text-gray-400">
        {balance ? Number(balance.formatted).toFixed(4) : '0'}
      </div>
    </button>
  );
}
