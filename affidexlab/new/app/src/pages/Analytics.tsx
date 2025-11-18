export default function Analytics(){
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Analytics</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold">$0</div>
          <div className="text-xs text-muted-foreground">Volume</div>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs text-muted-foreground">Swaps</div>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs text-muted-foreground">Unique Wallets</div>
        </div>
      </div>
    </div>
  );
}
