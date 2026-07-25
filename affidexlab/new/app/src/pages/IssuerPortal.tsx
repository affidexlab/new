import { useState } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Minimal ABIs — just the functions/events this portal actually calls.
// Matches /contracts/rwa-institutional/*.sol exactly; keep in sync if those change.
const TOKEN_ABI = [
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "complianceRules", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "event", name: "ForcedTransfer", inputs: [{ name: "from", type: "address", indexed: true }, { name: "to", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }, { name: "reason", type: "string", indexed: false }] },
] as const;

const COMPLIANCE_ABI = [
  { type: "function", name: "maxHolders", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "currentHolders", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "identityRegistry", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

const IDENTITY_ABI = [
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "isVerifier", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "setIdentity", stateMutability: "nonpayable", inputs: [{ type: "address", name: "wallet" }, { type: "bytes2", name: "countryCode" }, { type: "bool", name: "accreditedInvestor" }], outputs: [] },
] as const;

const isAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim());
const countryToBytes2 = (code: string) => {
  const c = code.trim().toUpperCase().slice(0, 2).padEnd(2, "\0");
  return ("0x" + Array.from(c).map(ch => ch.charCodeAt(0).toString(16).padStart(2, "0")).join("")) as `0x${string}`;
};

export default function IssuerPortal() {
  const { address, isConnected, chainId } = useAccount();
  const [tokenAddress, setTokenAddress] = useState("");
  const [wlAddress, setWlAddress] = useState("");
  const [wlCountry, setWlCountry] = useState("");
  const [wlAccredited, setWlAccredited] = useState(false);
  const [events, setEvents] = useState<{ type: string; text: string }[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const publicClient = usePublicClient();

  const validToken = isAddress(tokenAddress);
  const token = validToken ? (tokenAddress.trim() as `0x${string}`) : undefined;

  const { data: tokenReads, isLoading: tokenLoading } = useReadContracts({
    contracts: token ? [
      { address: token, abi: TOKEN_ABI, functionName: "name" },
      { address: token, abi: TOKEN_ABI, functionName: "symbol" },
      { address: token, abi: TOKEN_ABI, functionName: "totalSupply" },
      { address: token, abi: TOKEN_ABI, functionName: "owner" },
      { address: token, abi: TOKEN_ABI, functionName: "paused" },
      { address: token, abi: TOKEN_ABI, functionName: "complianceRules" },
    ] : [],
    query: { enabled: !!token },
  });

  const [name, symbol, totalSupply, tokenOwner, paused, complianceAddr] = tokenReads?.map(r => r.result) ?? [];
  const complianceHealthy = tokenReads?.every(r => r.status === "success") ?? false;

  const { data: complianceReads } = useReadContracts({
    contracts: complianceAddr ? [
      { address: complianceAddr as `0x${string}`, abi: COMPLIANCE_ABI, functionName: "maxHolders" },
      { address: complianceAddr as `0x${string}`, abi: COMPLIANCE_ABI, functionName: "currentHolders" },
      { address: complianceAddr as `0x${string}`, abi: COMPLIANCE_ABI, functionName: "identityRegistry" },
    ] : [],
    query: { enabled: !!complianceAddr },
  });
  const [maxHolders, currentHolders, identityAddr] = complianceReads?.map(r => r.result) ?? [];

  const { data: isVerifier } = useReadContract({
    address: identityAddr as `0x${string}` | undefined,
    abi: IDENTITY_ABI,
    functionName: "isVerifier",
    args: address ? [address] : undefined,
    query: { enabled: !!identityAddr && !!address },
  });
  const canWhitelist = isVerifier || (address && tokenOwner && address.toLowerCase() === (tokenOwner as string).toLowerCase());

  const { writeContract, data: txHash, isPending: writePending, error: writeError } = useWriteContract();
  const { isLoading: txConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const submitWhitelist = () => {
    if (!identityAddr || !isAddress(wlAddress)) return;
    writeContract({
      address: identityAddr as `0x${string}`,
      abi: IDENTITY_ABI,
      functionName: "setIdentity",
      args: [wlAddress.trim() as `0x${string}`, countryToBytes2(wlCountry || "??"), wlAccredited],
    });
  };

  const loadEvents = async () => {
    if (!token || !publicClient) return;
    setEventsLoading(true);
    try {
      const latest = await publicClient.getBlockNumber();
      const fromBlock = latest > 50000n ? latest - 50000n : 0n; // recent window only — no indexer behind this
      const logs = await publicClient.getLogs({ address: token, event: TOKEN_ABI[6], fromBlock, toBlock: latest });
      setEvents(logs.map(l => ({ type: "ForcedTransfer", text: `${l.args.from} → ${l.args.to}: ${l.args.amount} (${l.args.reason})` })));
    } catch (err) {
      console.error(err);
      setEvents([{ type: "error", text: "Could not fetch logs — RPC provider may limit historical log range on this chain." }]);
    }
    setEventsLoading(false);
  };

  const downloadCsv = () => {
    const csv = "type,detail\n" + events.map(e => `${e.type},"${e.text.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `decaflow-report-${tokenAddress.slice(0, 8)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: "#0A0E27", color: "#fff", minHeight: "100vh", fontFamily: "Inter,system-ui,sans-serif" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <a href="/institutional" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}>← Deca<span style={{ color: "#f59e0b" }}>Flow</span> Issuer Portal</a>
        <ConnectButton />
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "2rem", fontSize: "0.85rem", color: "#fbbf24", lineHeight: 1.6 }}>
          ⚠️ Connects to <strong>unaudited reference contracts</strong> (see <code>/contracts/rwa-institutional/README.md</code>). Real on-chain reads, not mock data — but do not point this at a contract holding real securities.
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem", fontWeight: 600 }}>Token contract address</label>
          <input value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} placeholder="0x..."
            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "monospace", fontSize: "0.9rem" }} />
          {tokenAddress && !validToken && <p style={{ color: "#fca5a5", fontSize: "0.78rem", marginTop: "0.4rem" }}>Not a valid address.</p>}
        </div>

        {!isConnected && <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "2rem 0" }}>Connect a wallet to interact with a deployed contract.</p>}

        {validToken && tokenLoading && <p style={{ color: "rgba(255,255,255,0.5)" }}>Reading contract...</p>}

        {validToken && tokenReads && !complianceHealthy && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "1rem", color: "#fca5a5", fontSize: "0.85rem" }}>
            Could not read this address as an RWAToken contract on the connected chain (chain ID {chainId}). Check the address and that your wallet is on the right network.
          </div>
        )}

        {validToken && complianceHealthy && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem", marginBottom: "2rem" }}>
              {[
                ["Asset", `${name} (${symbol})`],
                ["Total Supply", totalSupply?.toString()],
                ["Holders", `${currentHolders ?? "…"} / ${maxHolders === 0n ? "∞" : maxHolders ?? "…"}`],
                ["Status", paused ? "⏸ Paused" : "✅ Active"],
              ].map(([label, value]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.35rem" }}>{label}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{value ?? "—"}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Whitelist an investor</h3>
              {!canWhitelist && isConnected && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Connected wallet isn't an authorized verifier or the contract owner — this is enforced on-chain, not just hidden in the UI.</p>}
              {canWhitelist && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <input value={wlAddress} onChange={e => setWlAddress(e.target.value)} placeholder="Investor wallet address (0x...)"
                    style={{ padding: "0.65rem 0.9rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "monospace", fontSize: "0.85rem" }} />
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <input value={wlCountry} onChange={e => setWlCountry(e.target.value)} placeholder="Country (e.g. US)" maxLength={2}
                      style={{ flex: 1, padding: "0.65rem 0.9rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.85rem" }} />
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                      <input type="checkbox" checked={wlAccredited} onChange={e => setWlAccredited(e.target.checked)} /> Accredited
                    </label>
                  </div>
                  <button onClick={submitWhitelist} disabled={!isAddress(wlAddress) || writePending || txConfirming}
                    style={{ background: "#f59e0b", color: "#3a2404", padding: "0.75rem", borderRadius: "8px", border: "none", fontWeight: 700, cursor: "pointer", opacity: (!isAddress(wlAddress) || writePending || txConfirming) ? 0.5 : 1 }}>
                    {writePending ? "Confirm in wallet..." : txConfirming ? "Confirming..." : "Whitelist wallet"}
                  </button>
                  {writeError && <p style={{ color: "#fca5a5", fontSize: "0.8rem" }}>{writeError.message.split("\n")[0]}</p>}
                  {txSuccess && <p style={{ color: "#86efac", fontSize: "0.8rem" }}>✅ Confirmed on-chain.</p>}
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    This records the outcome of a KYC/accreditation check you've already done — it does not perform verification itself. See IdentityRegistry.sol's NatSpec.
                  </p>
                </div>
              )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Compliance events (recent)</h3>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={loadEvents} disabled={eventsLoading} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "0.4rem 0.9rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>{eventsLoading ? "Loading..." : "Load"}</button>
                  {events.length > 0 && <button onClick={downloadCsv} style={{ background: "#f59e0b", color: "#3a2404", border: "none", padding: "0.4rem 0.9rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>Export CSV</button>}
                </div>
              </div>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem" }}>Reads recent forced-transfer events directly from the chain — no indexer behind this yet, so very old events on a long-lived contract may be out of range.</p>
              {events.length === 0 ? <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No events loaded yet.</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", fontFamily: "monospace", maxHeight: "200px", overflowY: "auto" }}>
                  {events.map((e, i) => <div key={i} style={{ padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>{e.text}</div>)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
