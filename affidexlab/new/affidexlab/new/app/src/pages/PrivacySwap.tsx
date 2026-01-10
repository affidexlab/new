import Swap from "./Swap";

export default function PrivacySwap(){
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Privacy Swap</h1>
      <p className="mb-4 text-sm text-muted-foreground">Trades are routed with intents/private submission to reduce MEV and hide orderflow until settlement.</p>
      <Swap />
    </div>
  );
}
