import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavLink { label: string; href: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_LINKS: NavLink[] = [
  { label: "Compliance", href: "/compliance" },
  { label: "Security Audit", href: "/audit" },
  { label: "Shield", href: "/shield" },
  { label: "Verify API", href: "/verify" },
];

const STATS = [
  { val: "$1.4B+", label: "Lost to MEV annually across DeFi", color: "#ef4444" },
  { val: "$154B+", label: "Illicit crypto volume detected globally (2025)", color: "#3B82F6" },
  { val: "188K+", label: "Transactions hit by MEV monthly on Arbitrum", color: "#f97316" },
  { val: "7", label: "Chains protected by DecaFlow infrastructure", color: "#8b5cf6" },
  { val: "500+", label: "GitHub commits of active development", color: "#22c55e" },
];

const PRODUCTS = [
  {
    accent: "#22c55e",
    accentBg: "rgba(34,197,94,0.1)",
    accentBorder: "rgba(34,197,94,0.25)",
    icon: "🛡️",
    badge: "New",
    title: "Compliance & Transaction Monitoring",
    desc: "Real-time AML compliance engine for crypto exchanges, fintechs, and DeFi protocols. Sanctions screening, risk scoring 0–100, and audit-ready PDF reports — built to global standards, including MiCA.",
    bullets: ["OFAC, UN, EU sanctions screening", "Risk score 0–100 per transaction", "Regulator-ready PDF reports", "From $299/month"],
    cta: "Explore Compliance",
    href: "/compliance",
  },
  {
    accent: "#ef4444",
    accentBg: "rgba(239,68,68,0.1)",
    accentBorder: "rgba(239,68,68,0.25)",
    icon: "🔐",
    badge: "New",
    title: "Smart Contract Security Audit",
    desc: "Professional security audits for Solidity, Rust, and Vyper contracts. 10 vulnerability categories. 7-day turnaround. Formal report on company letterhead — publishable, investor-ready, regulator-ready.",
    bullets: ["Reentrancy, oracle, flash loan checks", "Access control & governance review", "Fix verification included", "From $800 per audit"],
    cta: "Request an Audit",
    href: "/audit",
  },
  {
    accent: "#06b6d4",
    accentBg: "rgba(6,182,212,0.1)",
    accentBorder: "rgba(6,182,212,0.25)",
    icon: "📡",
    badge: "Early Access",
    title: "DecaFlow Shield",
    desc: "Continuous monitoring for deployed contracts — real-time alerts and automated scans that pick up where a one-time audit leaves off.",
    bullets: ["Continuous on-chain monitoring", "Automated vulnerability scans", "Real-time alerts", "From $500/month"],
    cta: "Join Early Access",
    href: "/shield",
  },
  {
    accent: "#8b5cf6",
    accentBg: "rgba(139,92,246,0.1)",
    accentBorder: "rgba(139,92,246,0.25)",
    icon: "🔍",
    badge: "New · API",
    title: "DecaFlow Verify API",
    desc: "Global wallet screening API. Sanctions checking, mixer detection, darknet exposure, and jurisdiction risk scoring across 7 chains. Sub-100ms. First 1,000 checks completely free.",
    bullets: ["50+ global sanctions lists", "5-hop transaction graph analysis", "APPROVE / REVIEW / REJECT output", "1,000 free checks to start"],
    cta: "Get Free API Key",
    href: "/verify",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01", accent: "#3B82F6",
    title: "Choose your product",
    desc: "Whether you need MEV-protected trading, AML compliance, a smart contract audit, or wallet screening — DecaFlow has a dedicated product for each.",
  },
  {
    step: "02", accent: "#22c55e",
    title: "Integrate in minutes",
    desc: "Our SDK, API, and UI components are built for fast integration. Compliance and Verify APIs connect with a single npm install.",
  },
  {
    step: "03", accent: "#8b5cf6",
    title: "Get protected instantly",
    desc: "From the first transaction, your users are protected from MEV, your compliance engine is running, and your contracts are documented and secured.",
  },
];

const FAQS = [
  { q: "What chains does DecaFlow support?", a: "Our MEV protection and Verify API cover Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, and BNB Chain. Smart contract audits cover all EVM chains plus Solana (Rust/Anchor)." },
  { q: "Is DecaFlow a registered company?", a: "Yes. DecaFlow Solutions Limited is a duly incorporated legal entity with full corporate documentation — certificate of incorporation, Articles of Association, and Board Resolution — available on request." },
  { q: "How does MEV protection actually work?", a: "When a user initiates a swap, instead of broadcasting to the public mempool (where bots can see it), our SDK routes the transaction through a private RPC endpoint or CoW Protocol's batch auction system. Bots never see it coming. Users get better execution prices." },
  { q: "How fast can I integrate the Compliance API?", a: "Most integrations take a single afternoon. Install the npm package, add your API key, and wrap your transaction processing logic with our screenWallet() call. Full documentation and working examples are included." },
  { q: "Can I publish the security audit report?", a: "Yes — the report belongs to you. Many projects publish it on their website and GitHub as part of their launch transparency. We can co-publish an announcement if it helps your marketing." },
  { q: "Do you offer enterprise pricing?", a: "Yes. Contact us at decaflowsolutions@gmail.com for custom pricing on all products. Enterprise plans include dedicated infrastructure, custom chain support, SLA guarantees, and a dedicated account manager." },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Landing() {
  useEffect(() => {
    document.title = "DecaFlow — Web3 Infrastructure · Privacy · Compliance · Security";
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoWallet, setDemoWallet] = useState("");
  const [demoScore, setDemoScore] = useState<null | { score: number; level: string; rec: string }>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const heroRef = useRef<HTMLElement>(null);

  const runQuickDemo = () => {
    if (!demoWallet.trim()) return;
    setDemoLoading(true);
    setTimeout(() => {
      const seed = demoWallet.charCodeAt(2) || 65;
      const score = seed % 3 === 0 ? 9 : seed % 3 === 1 ? 61 : 88;
      const level = score < 30 ? "LOW" : score < 70 ? "MEDIUM" : "HIGH";
      const rec = score < 30 ? "APPROVE" : score < 70 ? "REVIEW" : "REJECT";
      setDemoScore({ score, level, rec });
      setDemoLoading(false);
    }, 1200);
  };

  const levelColor = (l: string) =>
    l === "LOW" ? "#22c55e" : l === "MEDIUM" ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ background: "#0A0E27", color: "#fff", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ════════════════════════════════════
          NAV
         ════════════════════════════════════ */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky", top: 0, background: "rgba(10,14,39,0.97)",
        backdropFilter: "blur(14px)", zIndex: 200,
      }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>
            Deca<span style={{ color: "#3B82F6" }}>Flow</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
              {l.label}
            </a>
          ))}
          <a href="/compliance" style={{ background: "#3B82F6", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "8px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: "1.4rem", cursor: "pointer" }}
          className="mobile-menu-btn">
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,14,39,0.98)", zIndex: 199, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", fontSize: "1.5rem", fontWeight: 700 }}>{l.label}</a>
          ))}
          <a href="/compliance" onClick={() => setMenuOpen(false)} style={{ background: "#3B82F6", color: "#fff", padding: "0.875rem 2.5rem", borderRadius: "12px", textDecoration: "none", fontSize: "1rem", fontWeight: 700 }}>
            Get Started
          </a>
        </div>
      )}

      {/* ════════════════════════════════════
          HERO
         ════════════════════════════════════ */}
      <section ref={heroRef} style={{ padding: "7rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.6rem",
          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: "100px", padding: "0.4rem 1.1rem", fontSize: "0.78rem",
          color: "#93C5FD", fontWeight: 600, letterSpacing: "0.06em",
          textTransform: "uppercase", marginBottom: "2rem",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
          Privacy · Compliance · Security · MEV Protection
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(2.4rem,5.5vw,4.4rem)", fontWeight: 900,
          lineHeight: 1.06, letterSpacing: "-0.04em", marginBottom: "1.75rem",
        }}>
          The Complete{" "}
          <span style={{
            background: "linear-gradient(135deg,#3B82F6 0%,#818CF8 55%,#a78bfa 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Web3 Infrastructure
          </span>
          {" "}Layer
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "1.2rem", color: "rgba(255,255,255,0.6)",
          maxWidth: "700px", margin: "0 auto 3rem", lineHeight: 1.75,
        }}>
          Real-time AML compliance. Smart contract security audits.
          Global wallet screening. One platform — built for the next generation of Web3.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}>
          <a href="/compliance" style={{
            background: "#3B82F6", color: "#fff", padding: "0.95rem 2.25rem",
            borderRadius: "11px", textDecoration: "none", fontSize: "1rem", fontWeight: 700,
            boxShadow: "0 0 32px rgba(59,130,246,0.35)",
          }}>
            Explore Our Products
          </a>
        </div>

        {/* Mini wallet demo */}
        <div style={{
          maxWidth: "580px", margin: "0 auto",
          background: "rgba(255,255,255,0.04)", borderRadius: "16px",
          border: "1px solid rgba(59,130,246,0.2)", padding: "1.5rem",
        }}>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Try the Verify API — Instant Wallet Risk Check
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Enter any wallet address (0x...)"
              value={demoWallet}
              onChange={(e) => setDemoWallet(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runQuickDemo()}
              style={{
                flex: "1", padding: "0.75rem 1rem", borderRadius: "9px",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: "0.875rem", outline: "none", minWidth: "200px",
                fontFamily: "monospace",
              }}
            />
            <button onClick={runQuickDemo} disabled={demoLoading || !demoWallet.trim()} style={{
              background: "#3B82F6", color: "#fff", padding: "0.75rem 1.25rem",
              borderRadius: "9px", border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: "0.875rem",
              opacity: (demoLoading || !demoWallet.trim()) ? 0.5 : 1,
            }}>
              {demoLoading ? "Checking..." : "Check Risk"}
            </button>
          </div>
          {demoScore && (
            <div style={{
              marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem",
              padding: "0.875rem", borderRadius: "10px",
              background: `${levelColor(demoScore.level)}12`,
              border: `1px solid ${levelColor(demoScore.level)}30`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${levelColor(demoScore.level)}20`,
                border: `2px solid ${levelColor(demoScore.level)}`,
                fontSize: "0.95rem", fontWeight: 800, color: levelColor(demoScore.level),
              }}>
                {demoScore.score}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  Risk Score: {demoScore.score}/100 —{" "}
                  <span style={{ color: levelColor(demoScore.level) }}>{demoScore.level} RISK</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: "0.15rem" }}>
                  Recommendation:{" "}
                  <strong style={{ color: levelColor(demoScore.level) }}>{demoScore.rec}</strong>
                  {" · "}
                  <a href="/verify" style={{ color: "#3B82F6", textDecoration: "none" }}>Full report →</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════
          PRODUCTS — 4 EQUAL CARDS
         ════════════════════════════════════ */}
      <section style={{ padding: "6rem 2rem", maxWidth: "1150px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-block", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "100px", padding: "0.35rem 1rem", fontSize: "0.75rem", color: "#93C5FD", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
            Full-Stack Web3 Infrastructure
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: "1rem" }}>
            Everything your protocol needs.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: "580px", margin: "0 auto", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Privacy, compliance, security, and verification — in one platform, from a single incorporated company.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
          {PRODUCTS.map((p, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px", padding: "2rem", display: "flex", flexDirection: "column",
              transition: "border-color 0.2s, transform 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.accentBorder; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {/* Icon */}
              <div style={{ width: 52, height: 52, borderRadius: "14px", marginBottom: "1.25rem", background: p.accentBg, border: `1px solid ${p.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                {p.icon}
              </div>
              {/* Badge */}
              <div style={{ display: "inline-block", background: p.accentBg, borderRadius: "6px", padding: "0.2rem 0.6rem", fontSize: "0.7rem", color: p.accent, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.75rem", width: "fit-content" }}>
                {p.badge}
              </div>
              {/* Title & desc */}
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem", lineHeight: 1.3 }}>{p.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1.5rem", flex: 1 }}>{p.desc}</p>
              {/* Bullets */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {p.bullets.map((b, j) => (
                  <li key={j} style={{ display: "flex", gap: "0.5rem", fontSize: "0.83rem", color: "rgba(255,255,255,0.65)" }}>
                    <span style={{ color: p.accent, flexShrink: 0 }}>✓</span> {b}
                  </li>
                ))}
              </ul>
              {/* CTA */}
              <a href={p.href} style={{
                display: "block", textAlign: "center", padding: "0.8rem",
                borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem",
                background: p.accentBg, color: p.accent, border: `1px solid ${p.accentBorder}`,
                transition: "background 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = p.accent.replace(")", ",0.25)").replace("rgb", "rgba"))}
                onMouseLeave={(e) => (e.currentTarget.style.background = p.accentBg)}
              >
                {p.cta} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          STATS
         ════════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "0.75rem" }}>The numbers that drive us</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "3.5rem", fontSize: "1rem" }}>The problems DecaFlow was built to solve are not theoretical.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1.25rem" }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.75rem 1.25rem" }}>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: s.color, letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>{s.val}</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
         ════════════════════════════════════ */}
      <section style={{ padding: "6rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "0.75rem" }}>How it works</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>Three steps from zero to fully protected.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", padding: "1.75rem" }}>
              <div style={{ width: 52, height: 52, borderRadius: "14px", background: `${step.accent}18`, border: `1px solid ${step.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 800, color: step.accent, flexShrink: 0 }}>
                {step.step}
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.4rem" }}>{step.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          SDK SECTION
         ════════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "100px", padding: "0.35rem 1rem", fontSize: "0.75rem", color: "#93C5FD", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Developer SDK
            </div>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "1rem", lineHeight: 1.2 }}>
              Built for developers.<br />Ready in minutes.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Our published npm SDK (<code style={{ color: "#3B82F6" }}>@decaflow/privacy-sdk</code>) gives any developer instant access to MEV protection, private routing, and partner analytics — with React components and hooks included.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a href="https://www.npmjs.com/package/@decaflow/privacy-sdk" style={{ background: "#3B82F6", color: "#fff", padding: "0.7rem 1.25rem", borderRadius: "9px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>
                View on npm
              </a>
              <a href="https://github.com/affidexlab/new" style={{ background: "rgba(255,255,255,0.07)", color: "#fff", padding: "0.7rem 1.25rem", borderRadius: "9px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.12)" }}>
                GitHub →
              </a>
            </div>
          </div>
          <div style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "0.7rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "0.4rem" }}>
              {["#ef4444","#f59e0b","#22c55e"].map((c,i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              <span style={{ marginLeft: "0.5rem", color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>swap-with-protection.ts</span>
            </div>
            <pre style={{ margin: 0, padding: "1.25rem", fontSize: "0.78rem", lineHeight: 1.75, color: "#e2e8f0", overflowX: "auto" }}>
{`import { PrivacyClient } from 
  '@decaflow/privacy-sdk';

const client = new PrivacyClient({
  apiKey: process.env.DECAFLOW_KEY,
  chainId: 42161, // Arbitrum
});

// Check MEV risk before swapping
const risk = await client
  .getMEVRiskScore(txParams);
// { score: 23, level: 'LOW',
//   estimatedLoss: '$0.12' }

// Execute with protection
const tx = await client.executeSwap({
  ...txParams,
  slippage: 0.5,
});
// tx.mevSaved: '$2.40'`}
            </pre>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FAQ
         ════════════════════════════════════ */}
      <section style={{ padding: "6rem 2rem", maxWidth: "780px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, textAlign: "center", marginBottom: "3rem", letterSpacing: "-0.025em" }}>Frequently asked questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", background: "none", border: "none", color: "#fff", cursor: "pointer", textAlign: "left", gap: "1rem" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{ fontSize: "1.2rem", color: "#3B82F6", flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          FINAL CTA
         ════════════════════════════════════ */}
      <section style={{
        padding: "7rem 2rem", textAlign: "center",
        background: "linear-gradient(180deg,rgba(59,130,246,0.06) 0%,rgba(10,14,39,0) 100%)",
        borderTop: "1px solid rgba(59,130,246,0.15)",
      }}>
        <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.1 }}>
          The infrastructure layer<br />Web3 has been missing.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.1rem", maxWidth: "560px", margin: "0 auto 3rem", lineHeight: 1.7 }}>
          One incorporated company. Four products. Full-stack protection for your protocol, your users, and your compliance team.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/compliance" style={{ background: "#3B82F6", color: "#fff", padding: "1rem 2.5rem", borderRadius: "12px", textDecoration: "none", fontSize: "1.05rem", fontWeight: 700, boxShadow: "0 0 32px rgba(59,130,246,0.3)" }}>
            Get Started Today
          </a>
          <a href="mailto:decaflowsolutions@gmail.com" style={{ background: "rgba(255,255,255,0.07)", color: "#fff", padding: "1rem 2.5rem", borderRadius: "12px", textDecoration: "none", fontSize: "1.05rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.14)" }}>
            Talk to Us
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
         ════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "4rem 2rem 2.5rem", background: "rgba(0,0,0,0.25)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "3rem", marginBottom: "4rem" }}>
            {/* Brand */}
            <div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
                Deca<span style={{ color: "#3B82F6" }}>Flow</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                The complete Web3 infrastructure layer. Privacy, compliance, security, and speed — in one platform.
              </p>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.8 }}>
                <div>DecaFlow Solutions Limited</div>
              </div>
            </div>
            {/* Products */}
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>Products</div>
              {[["Compliance Monitoring", "/compliance"], ["Security Audit", "/audit"], ["Verify API", "/verify"], ["Privacy SDK (npm)", "https://www.npmjs.com/package/@decaflow/privacy-sdk"]].map(([l, h]) => (
                <a key={l} href={h} style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", textDecoration: "none", marginBottom: "0.5rem" }}>{l}</a>
              ))}
            </div>
            {/* Developers */}
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>Developers</div>
              {[["npm: @decaflow/privacy-sdk", "https://www.npmjs.com/package/@decaflow/privacy-sdk"], ["Documentation", "https://docs.decaflow.xyz"]].map(([l, h]) => (
                <a key={l} href={h} style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", textDecoration: "none", marginBottom: "0.5rem" }}>{l}</a>
              ))}
            </div>
            {/* Company */}
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>Company</div>
              {[["decaflow.xyz", "https://decaflow.xyz"], ["Contact Us", "/contact"], ["@decaflowprotocol", "https://x.com/decaflowprotocol"], ["Partnership", "mailto:partnership@decaflow.xyz"]].map(([l, h]) => (
                <a key={l} href={h} style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", textDecoration: "none", marginBottom: "0.5rem" }}>{l}</a>
              ))}
            </div>
          </div>
          {/* Bottom */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.8rem" }}>
              © 2026 DecaFlow Solutions Limited · All rights reserved.
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Privacy Policy", "Terms of Service", "Security"].map((l) => (
                <a key={l} href="#" style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.8rem", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive styles injected */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #1f2937; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0E27; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.4); border-radius: 3px; }
      `}</style>
    </div>
  );
}
