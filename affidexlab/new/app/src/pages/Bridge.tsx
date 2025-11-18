import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Bridge() {
  const [fromChain, setFromChain] = useState("arbitrum");
  const [toChain, setToChain] = useState("optimism");
  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [stack, setStack] = useState<"ccip-cctp-socket" | "ccip-cctp" | "socket">("ccip-cctp-socket");
  const [quote, setQuote] = useState<string | null>(null);

  async function getQuote() {
    setQuote(`Fetching route via ${stack.toUpperCase()} (stub)...`);
    setTimeout(() => setQuote("Best path: CCTP native USDC → target chain (stub). ETA 2-5 mins."), 600);
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Bridge</h1>
      <div className="space-y-4 rounded-xl border p-4">
        <div className="grid grid-cols-2 gap-2">
          <Select value={fromChain} onValueChange={setFromChain}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="arbitrum">Arbitrum</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="optimism">Optimism</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
            </SelectContent>
          </Select>
          <Select value={toChain} onValueChange={setToChain}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="optimism">Optimism</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select value={token} onValueChange={setToken}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select value={stack} onValueChange={(v: any) => setStack(v)}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ccip-cctp-socket">CCIP + CCTP + Socket fallback</SelectItem>
              <SelectItem value="ccip-cctp">CCIP + CCTP only</SelectItem>
              <SelectItem value="socket">Socket only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={getQuote}>Preview Route</Button>
          <Button>Bridge</Button>
        </div>
        {quote && <div className="rounded-md bg-muted/30 p-3 text-sm">{quote}</div>}
      </div>
    </div>
  );
}
