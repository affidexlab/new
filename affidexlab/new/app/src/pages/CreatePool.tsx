import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreatePool(){
  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create Pool</h1>
      <div className="space-y-4 rounded-xl border p-4">
        <div className="grid grid-cols-2 gap-2">
          <Select defaultValue="ETH">
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="ARB">ARB</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="USDC">
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="ARB">ARB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input placeholder="Fee (e.g., 0.5%)" />
        <Input placeholder="TVL Cap (USD)" />
        <Button>Create</Button>
      </div>
    </div>
  )
}
