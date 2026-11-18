import { useCallback, useRef, useState } from "react";
import { API_BASE } from "../lib/apiBase";

export type CheckResult = {
  address: string;
  chain: string;
  riskScore: number;
  riskLevel: string;
  recommendation: "APPROVE" | "REVIEW" | "REJECT";
  sanctionsMatch: boolean;
  flags: string[];
  hopsAnalysed: number;
  checkedAt: string;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: CheckResult; id: number }
  | { status: "error"; message: string };

const B58 = "[1-9A-HJ-NP-Za-km-z]";

/** Picks a chain name for the API from the address format. EVM addresses are sent as ethereum. */
export function guessChain(address: string): string {
  const a = address.trim();
  if (/^0x[0-9a-fA-F]{40}$/.test(a)) return "ethereum";
  if (new RegExp(`^T${B58}{33}$`).test(a)) return "tron";
  if (/^bc1[0-9a-z]{20,90}$/i.test(a) || new RegExp(`^[13]${B58}{25,34}$`).test(a)) return "bitcoin";
  return "";
}

/**
 * Runs a public wallet check against the real backend preview endpoint.
 * It never invents a result: on any failure (or if the server reports sample/demo data)
 * it returns an error state with a plain-language message.
 */
export function useWalletCheck() {
  const [state, setState] = useState<State>({ status: "idle" });
  const counter = useRef(0);

  const check = useCallback(async (raw: string) => {
    const address = raw.trim();
    if (address.length < 20) {
      setState({ status: "error", message: "Paste a full wallet address (for example one starting with 0x)." });
      return;
    }
    const chain = guessChain(address);
    if (!chain) {
      setState({ status: "error", message: "That doesn't look like an Ethereum-style, Bitcoin or Tron address. Check it and try again." });
      return;
    }

    setState({ status: "loading" });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${API_BASE}/v1/verify/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chain }),
        signal: controller.signal,
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setState({ status: "error", message: "Too many checks from your network. Wait a minute and try again." });
        return;
      }
      if (!res.ok || !body?.data) {
        setState({ status: "error", message: body?.error || "The check service couldn't complete that request. Try again in a moment." });
        return;
      }
      const d = body.data;
      if (d.provider === "demo") {
        // Server is returning built-in sample data, which is not a real screening result.
        setState({ status: "error", message: "Live screening isn't available right now, so we can't show a real result. Please try again later." });
        return;
      }
      counter.current += 1;
      setState({
        status: "done",
        id: counter.current,
        result: {
          address: d.address || address,
          chain: d.chain || chain,
          riskScore: Number(d.riskScore ?? 0),
          riskLevel: String(d.riskLevel || "LOW"),
          recommendation: d.recommendation || "REVIEW",
          sanctionsMatch: !!d.sanctionsMatch,
          flags: Array.isArray(d.flags) ? d.flags.slice(0, 4).map(String) : [],
          hopsAnalysed: Number(d.hopsAnalysed || 0),
          checkedAt: d.checkedAt || new Date().toISOString(),
        },
      });
    } catch (e: any) {
      setState({
        status: "error",
        message: e?.name === "AbortError"
          ? "The check took too long. Try again in a moment."
          : "Couldn't reach the screening service. Check your connection and try again.",
      });
    } finally {
      clearTimeout(timer);
    }
  }, []);

  return { state, check };
}
