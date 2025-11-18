import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// NOTE: For MVP we stub 0x + CoW endpoints for Arbitrum.
// 0x: https://arbitrum.api.0x.org/swap/v1/quote
// CoW Intents: https://api.cow.fi/mainnet/api/v1/quote (Arbitrum support may vary)

export default function Swap() {
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [privacy, setPrivacy] = useState(true);
  const [routePreview, setRoutePreview] = useState<string | null>(null);

  async function quote() {
    setRoutePreview("Fetching best route via 0x + CoW (stub)...");
    // TODO: call backend worker or directly 0x/Cow APIs and compute best price
    setTimeout(() => setRoutePreview("Best route: 0x → UniswapV3, est. output 1,234.56 USDC (stub)."), 600);
  }

  async function submit() {
    // TODO: build tx data and submit via wallet
    // If privacy enabled: submit via CoW intent or private RPC relayer
    alert(`Submitting ${amount} ${fromToken} → ${toToken} with privacy=${privacy} (stub)`);
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Swap</h1>
      <div className="space-y-4 rounded-xl border p-4">
        <div className="grid grid-cols-3 gap-2">
          <Select value={fromToken} onValueChange={setFromToken}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="ARB">ARB</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select value={toToken} onValueChange={setToToken}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="ARB">ARB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-primary" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
            Privacy Swap (MEV-safe submission)
          </label>
          <div className="text-xs text-muted-foreground">Router: 0x + CoW</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={quote} variant="secondary">Preview Route</Button>
          <Button onClick={submit}>Swap</Button>
        </div>
        {routePreview && (
          <div className="rounded-md bg-muted/30 p-3 text-sm">{routePreview}</div>
        )}
      </div>
    </div>
  );
}
