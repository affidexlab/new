import { useEffect, useRef, useState } from "react";
import "../styles/brand.css";
import SiteNav from "../components/site/SiteNav";
import SiteFooter from "../components/site/SiteFooter";
import WalletTrace, { type TraceTone } from "../components/site/WalletTrace";
import { useWalletCheck } from "../hooks/useWalletCheck";
import { API_BASE } from "../lib/apiBase";

// Example addresses for the quick-try chips. The first is listed on the public OFAC sanctions list.
const SANCTIONED_EXAMPLE = "0x0330070FD38Ec3bB94F58FA55D40368271E9e54A";
const PUBLIC_EXAMPLE = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

const PATHS = [
  {
    who: "I run an exchange, wallet or fintech",
    what: "Screen customers and transactions, work through review cases, and keep an audit trail regulators can follow.",
    product: "Compliance",
    price: "from $299/month",
    href: "/compliance",
  },
  {
    who: "I'm shipping smart contracts",
    what: "Get your code reviewed before launch, then keep watching it after. Solidity, Rust and Vyper.",
    product: "Security Audit and Shield",
    price: "audits from $800",
    href: "/audit",
  },
  {
    who: "I'm a developer adding wallet screening",
    what: "One API call per wallet returns a score and a clear approve, review or reject.",
    product: "Verify API",
    price: "1,000 free checks a month",
    href: "/verify",
  },
];

const STEPS = [
  { t: "Send a wallet address", d: "Paste it into the box above, or send it to the API in one request." },
  { t: "We check it", d: "Sanctions lists, scam and phishing reports, and the wallets it has dealt with up to five steps away." },
  { t: "You get an answer", d: "A risk score from 0 to 100 and a recommendation: approve, review or reject, with the reasons." },
];

const LOOKS_AT = [
  { t: "Sanctions lists", d: "Wallet addresses published by OFAC (US), the UN, the EU and the UK, across Bitcoin, Ethereum-style chains, Tron and more." },
  { t: "Scam and phishing reports", d: "Addresses flagged by public scam databases and community lists." },
  { t: "DecaFlow labels", d: "Addresses our own team has reviewed and tagged." },
  { t: "Transaction history", d: "How close a wallet is to flagged addresses, up to five steps away, on Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche and BNB Chain." },
];

const PRODUCTS = [
  { name: "Compliance", does: "Wallet screening, risk scoring, review cases and an audit trail.", status: "Available", s: "ok", price: "From $299/month", href: "/compliance" },
  { name: "Verify API", does: "Screen a wallet with one API call.", status: "Available", s: "ok", price: "1,000 free checks a month", href: "/verify" },
  { name: "Security Audit", does: "Manual review of Solidity, Rust and Vyper contracts with a written report.", status: "Available", s: "ok", price: "From $800 per audit", href: "/audit" },
  { name: "Shield", does: "Watches deployed contracts and alerts you when something looks wrong.", status: "Early access", s: "early", price: "From $500/month", href: "/shield" },
  { name: "Autopilot", does: "Rules that send risky activity to a human reviewer. It never acts on its own.", status: "Early access", s: "early", price: "From $500/month", href: "/agents" },
  { name: "Institutional", does: "Identity and transfer rules for tokenized assets (ERC-3643).", status: "In development", s: "early", price: "From $2,500/month", href: "/institutional" },
];

const FAQS = [
  { q: "How reliable is a wallet check?", a: "A check finds matches in the data we hold: sanctions lists, scam reports and our own labels, plus how close the wallet is to flagged addresses. It can't know about risks that aren't recorded anywhere. Treat a clean result as \"nothing found\", and keep your own review process for decisions." },
  { q: "Which chains do you cover?", a: "Sanctions-list address matching covers Bitcoin, Ethereum-style chains, Tron and others. Transaction-history analysis covers Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche and BNB Chain." },
  { q: "Can I try it before paying?", a: "Yes. The check at the top of this page is free and needs no sign-up. The Verify API includes 1,000 free checks a month with an API key." },
  { q: "How much does it cost?", a: "Compliance starts at $299 a month, Shield at $500 a month, and audits at $800 depending on the size of your contracts. The table above lists every product with its starting price." },
  { q: "Is DecaFlow a registered company?", a: "Yes. DecaFlow Solutions Limited is registered in Nigeria with the Corporate Affairs Commission. Contact us and we'll send the company documents." },
  { q: "Do you still offer MEV protection?", a: "Our npm SDK for MEV-protected swaps is still available for developers. Our main focus now is wallet screening, compliance and contract security." },
  { q: "Do you offer custom or enterprise plans?", a: "Yes. Use the contact page and tell us what you need. We'll reply with a quote." },
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

const VERDICT = {
  APPROVE: { tone: "ok" as TraceTone, title: "No known risk found", color: "var(--df-ok)" },
  REVIEW: { tone: "warn" as TraceTone, title: "Needs a closer look", color: "var(--df-warn)" },
  REJECT: { tone: "bad" as TraceTone, title: "High risk", color: "var(--df-bad)" },
};

export default function Landing() {
  const [address, setAddress] = useState("");
  const { state, check } = useWalletCheck();
  const inputRef = useRef<HTMLInputElement>(null);
  const steps = useInView<HTMLDivElement>();

  useEffect(() => {
    document.title = "DecaFlow: wallet screening, compliance and contract security";
    const hash = window.location.hash;
    if (hash === "#check" || hash === "#products") {
      // wait a frame so the section exists, then jump to it
      requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView();
        if (hash === "#check") inputRef.current?.focus({ preventScroll: true });
      });
    }
  }, []);

  useEffect(() => {
    if (state.status === "done" || state.status === "error") {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("check")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    }
  }, [state]);

  const run = (value?: string) => {
    const v = value ?? address;
    if (value) setAddress(value);
    void check(v);
  };

  const done = state.status === "done" ? state : null;
  const verdict = done ? VERDICT[done.result.recommendation] || VERDICT.REVIEW : null;
  const tone: TraceTone = verdict ? verdict.tone : null;
  const chipText = !done
    ? "Sanctions match, 3 steps away"
    : done.result.recommendation === "APPROVE"
      ? "No known risk found"
      : done.result.sanctionsMatch
        ? "Sanctions match"
        : done.result.recommendation === "REJECT" ? "High-risk exposure" : "Exposure to review";

  const goCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("check")?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="df">
      <SiteNav cta={{ label: "Check a wallet free", href: "/#check" }} />

      {/* ───────── Hero ───────── */}
      <section className="df-dark df-hero">
        <div className="df-wrap df-hero-grid">
          <div>
            <h1 className="df-h1" style={{ textWrap: "balance" }}>Know who you're dealing with <span style={{ whiteSpace: "nowrap" }}>on-chain.</span></h1>
            <p className="df-lede" style={{ marginTop: "1.25rem" }}>
              Check a wallet against sanctions lists, scam reports and its transaction history. You get a clear answer: approve, review or reject.
            </p>

            <div id="check" className="df-check" style={{ marginTop: "2rem", scrollMarginTop: "6rem" }}>
              <label htmlFor="wallet-input" style={{ display: "block", fontWeight: 650, marginBottom: "0.6rem" }}>
                Check a wallet
              </label>
              <form
                className="df-input-row"
                onSubmit={(e) => { e.preventDefault(); run(); }}
              >
                <input
                  id="wallet-input"
                  ref={inputRef}
                  className="df-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Paste a wallet address"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="check-help"
                />
                <button type="submit" className="df-btn df-btn-primary" disabled={state.status === "loading"}>
                  {state.status === "loading" ? "Checking…" : "Check wallet"}
                </button>
              </form>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.8rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--df-on-ink-muted)" }}>Not sure what to try?</span>
                <button type="button" className="df-chip-btn" onClick={() => run(SANCTIONED_EXAMPLE)}>A sanctioned address</button>
                <button type="button" className="df-chip-btn" onClick={() => run(PUBLIC_EXAMPLE)}>A well-known public wallet</button>
              </div>
              <p id="check-help" style={{ fontSize: "0.8rem", color: "var(--df-on-ink-muted)", marginTop: "0.8rem", lineHeight: 1.5 }}>
                Free preview, no sign-up. For compliance decisions, use the API.
              </p>

              <div aria-live="polite">
                {state.status === "error" && (
                  <div role="alert" className="df-verdict" data-tone="bad">
                    <div style={{ fontWeight: 650 }}>We couldn't run that check</div>
                    <p style={{ color: "var(--df-on-ink-muted)", fontSize: "0.9rem", marginTop: "0.35rem", lineHeight: 1.55 }}>{state.message}</p>
                  </div>
                )}

                {done && verdict && (
                  <div className="df-verdict" data-tone={verdict.tone} key={done.id}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                      <div>
                        <div style={{ fontFamily: "var(--df-display)", fontWeight: 700, fontSize: "1.3rem", color: verdict.color }}>{verdict.title}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--df-on-ink-muted)", marginTop: "0.15rem" }}>
                          API result: {done.result.recommendation} · {done.result.riskLevel.toLowerCase()} risk
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="df-verdict-score" style={{ color: verdict.color }}>{done.result.riskScore}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--df-on-ink-muted)" }}>out of 100</div>
                      </div>
                    </div>
                    <ul style={{ margin: "0.9rem 0 0", paddingLeft: "1.1rem", listStyleType: "disc", fontSize: "0.9rem", lineHeight: 1.6 }}>
                      {done.result.flags.length > 0
                        ? done.result.flags.map((f) => <li key={f}>{f}</li>)
                        : <li>No sanctions, scam or mixer links found{done.result.hopsAnalysed ? ` within ${done.result.hopsAnalysed} steps` : ""}.</li>}
                    </ul>
                    <p style={{ fontSize: "0.78rem", color: "var(--df-on-ink-muted)", marginTop: "0.8rem", lineHeight: 1.55 }}>
                      Based on DecaFlow's sanctions, scam and transaction data. A clean result means no match in our data. It isn't a guarantee.
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "0.9rem" }}>
                      <a className="df-btn df-btn-primary" href="/verify">Get a free API key</a>
                      <a className="df-btn df-btn-ghost-dark" href="/contact">Talk to us</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <WalletTrace
              tone={tone}
              address={done?.result.address}
              chipText={chipText}
              playKey={done ? `r${done.id}` : "idle"}
            />
            <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--df-on-ink-muted)", marginTop: "0.25rem" }}>
              {done ? "Trace for the wallet you checked (illustrative layout)." : "Illustration of how we trace a wallet across five steps."}
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Start here ───────── */}
      <section className="df-section df-paper" aria-labelledby="paths-h">
        <div className="df-wrap">
          <h2 id="paths-h" className="df-h2">Where do you want to start?</h2>
          <p className="df-sub" style={{ marginTop: "0.8rem", marginBottom: "2.5rem" }}>Pick the line that sounds like you. Each one leads to the right product.</p>
          <div>
            {PATHS.map((p) => (
              <a key={p.href} href={p.href} className="df-path">
                <div className="df-path-title">{p.who}</div>
                <div>
                  <p style={{ color: "var(--df-on-paper-muted)", lineHeight: 1.6 }}>{p.what}</p>
                  <p style={{ marginTop: "0.5rem", fontWeight: 600, fontSize: "0.92rem" }}>{p.product} <span style={{ fontWeight: 400, color: "var(--df-on-paper-muted)" }}>· {p.price}</span></p>
                </div>
                <span className="df-path-arrow" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </a>
            ))}
          </div>
          <p style={{ marginTop: "1.25rem", color: "var(--df-on-paper-muted)", fontSize: "0.92rem" }}>
            Looking for something else? <a href="#products" style={{ color: "var(--df-signal)", fontWeight: 600 }}>See every product</a> or <a href="/contact" style={{ color: "var(--df-signal)", fontWeight: 600 }}>talk to us</a>.
          </p>
        </div>
      </section>

      {/* ───────── How a check works ───────── */}
      <section className="df-section df-white" aria-labelledby="how-h">
        <div className="df-wrap">
          <h2 id="how-h" className="df-h2">How a check works</h2>
          <div ref={steps.ref} className={`df-steps ${steps.seen ? "df-in-view" : ""}`} style={{ marginTop: "2.75rem" }}>
            <div className="df-step-line" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <div key={s.t}>
                <span className="df-step-dot">{i + 1}</span>
                <h3 style={{ fontSize: "1.2rem", marginTop: "1rem" }}>{s.t}</h3>
                <p style={{ color: "var(--df-on-paper-muted)", marginTop: "0.5rem", lineHeight: 1.65 }}>{s.d}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "3.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.25rem" }}>
            <div>
              <div style={{ fontWeight: 650, marginBottom: "0.6rem" }}>Send a request</div>
              <pre className="df-code" aria-label="Example API request" style={{ margin: 0 }}>
<span className="k">curl</span> {API_BASE}/v1/verify/check \{"\n"}
{"  "}-H <span className="s">"x-api-key: YOUR_KEY"</span> \{"\n"}
{"  "}-H <span className="s">"Content-Type: application/json"</span> \{"\n"}
{"  "}-d <span className="s">'{`{"address": "0x…", "chain": "ethereum"}`}'</span>
              </pre>
            </div>
            <div>
              <div style={{ fontWeight: 650, marginBottom: "0.6rem" }}>Get an answer <span style={{ fontWeight: 400, color: "var(--df-on-paper-muted)" }}>(example response)</span></div>
              <pre className="df-code" aria-label="Example API response" style={{ margin: 0 }}>
{`{
  "success": true,
  "data": {
    "riskScore": 8,
    "riskLevel": "LOW",
    "recommendation": "APPROVE",
    "flags": []
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── What a check looks at ───────── */}
      <section className="df-section df-paper" aria-labelledby="looks-h">
        <div className="df-wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "3rem" }}>
          <div>
            <h2 id="looks-h" className="df-h2">What a check looks at</h2>
            <p className="df-sub" style={{ marginTop: "0.9rem" }}>
              Every result comes from data we can name. A clean result means we found no match in it. It isn't a guarantee a wallet is safe, and it doesn't replace your own compliance policy.
            </p>
          </div>
          <div>
            {LOOKS_AT.map((l) => (
              <div key={l.t} style={{ padding: "1.15rem 0", borderTop: "1px solid var(--df-line-light)" }}>
                <h3 style={{ fontSize: "1.1rem" }}>{l.t}</h3>
                <p style={{ color: "var(--df-on-paper-muted)", marginTop: "0.35rem", lineHeight: 1.6 }}>{l.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── All products ───────── */}
      <section id="products" className="df-section df-white" aria-labelledby="products-h" style={{ scrollMarginTop: "5rem" }}>
        <div className="df-wrap">
          <h2 id="products-h" className="df-h2">Every product, with its starting price</h2>
          <div style={{ marginTop: "2.25rem" }}>
            <table className="df-table">
              <thead>
                <tr><th>Product</th><th>What it does</th><th>Status</th><th>Price</th></tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p) => (
                  <tr key={p.name}>
                    <td style={{ fontWeight: 650 }}><a href={p.href} style={{ color: "var(--df-signal)" }}>{p.name}</a></td>
                    <td style={{ color: "var(--df-on-paper-muted)", lineHeight: 1.55, maxWidth: "32rem" }}>{p.does}</td>
                    <td><span className="df-status" data-s={p.s === "ok" ? undefined : "early"}>{p.status}</span></td>
                    <td style={{ whiteSpace: "nowrap" }}>{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="df-section df-paper" aria-labelledby="faq-h">
        <div className="df-wrap">
          <h2 id="faq-h" className="df-h2" style={{ marginBottom: "2rem" }}>Questions people ask</h2>
          <div className="df-faq" style={{ maxWidth: "860px" }}>
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div className="ans">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final call ───────── */}
      <section className="df-dark" style={{ padding: "5rem 0" }}>
        <div className="df-wrap" style={{ textAlign: "left", display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ maxWidth: "34rem" }}>
            <h2 className="df-h2">Start with one wallet.</h2>
            <p className="df-lede" style={{ marginTop: "0.9rem" }}>Run a free check now, or tell us about your platform and we'll point you to the right product.</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a className="df-btn df-btn-primary" href="/#check" onClick={goCheck}>Check a wallet</a>
            <a className="df-btn df-btn-ghost-dark" href="/contact">Talk to us</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
