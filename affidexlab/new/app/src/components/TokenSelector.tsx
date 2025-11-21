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
import { ChevronDown } from "lucide-react";

interface TokenSelectorProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
  tokens?: Token[];
}

export function TokenSelector({ selectedToken, onSelect, tokens }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { address } = useAccount();

  const tokenList = tokens || [];

  const filteredTokens = tokenList.filter((token) =>
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />
            <span>{selectedToken.symbol}</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name or symbol"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-80 overflow-y-auto space-y-1">
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
    chainId: token.chainId,
  });

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
        <div className="text-left">
          <div className="font-medium">{token.symbol}</div>
          <div className="text-xs text-muted-foreground">{token.name}</div>
        </div>
      </div>
      {balance && (
        <div className="text-right text-sm">
          {Number(balance.formatted).toFixed(4)}
        </div>
      )}
    </button>
  );
}
