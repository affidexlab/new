export default function Pools(){
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Pools</h1>
      <p className="text-sm text-muted-foreground">Minimal constant-product pools with small TVL caps for campaigns. Create and manage your pools.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="font-medium">ETH/USDC</div>
          <div className="text-xs text-muted-foreground">Fee 0.3% • TVL cap $25k</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="font-medium">ARB/ETH</div>
          <div className="text-xs text-muted-foreground">Fee 0.3% • TVL cap $10k</div>
        </div>
      </div>
    </div>
  );
}
