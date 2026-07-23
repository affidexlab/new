import { useState, useEffect } from "react";

const API_BASE = "https://decaflow-backend.onrender.com";

const FEATURES = [
  { icon: "📡", title: "Continuous On-Chain Monitoring", desc: "Your deployed contracts are watched on an ongoing basis, not checked once and forgotten. Balance, ownership, and admin-function changes are tracked automatically." },
  { icon: "🔎", title: "Automated Vulnerability Scanning", desc: "Static analysis runs on a schedule against your deployed bytecode, catching newly-disclosed vulnerability classes that didn't exist when you were first audited." },
  { icon: "🚨", title: "Real-Time Threat Alerts", desc: "Severity-tiered alerts the moment something anomalous happens — unusual fund flows, unexpected ownership transfers, or interaction with known-malicious addresses." },
  { icon: "🧭", title: "Incident Response Playbooks", desc: "When an alert fires, it doesn't just sit in an inbox. A defined triage workflow routes it to a human reviewer, with clear next steps." },
  { icon: "📊", title: "One Dashboard, Every Contract", desc: "A single view across every contract you've registered, with full alert history and exportable reports for your own investors or regulators." },
  { icon: "🤝", title: "Built On Your Audit", desc: "Shield picks up where a security audit leaves off. If you've already had a DecaFlow audit, onboarding is same-day — we already know your contracts." },
];

const PLANS = [
  { name: "Starter", price: "$500–1,500", period: "/month", highlight: false,
    features: ["1 contract monitored", "Daily automated scans", "Email alerts", "Monthly summary report", "Best for a single deployed protocol"] },
  { name: "Growth", price: "$3,000–8,000", period: "/month", highlight: true,
    features: ["Multiple contracts", "Real-time alerts", "Dashboard access", "Priority triage", "Best for teams with several live contracts"] },
  { name: "Enterprise", price: "Custom", period: "", highlight: false,
    features: ["Unlimited contracts", "Dedicated response SLA", "Multi-chain coverage", "Incident orchestration", "Dedicated account manager"] },
];

const FAQS = [
  { q: "Is Shield live yet?", a: "Shield is in early access. We're onboarding a small number of design partners now to build real monitoring workflows around real contracts, rather than shipping a dashboard first and figuring out what matters later. Joining early access gets you in that first cohort." },
  { q: "How is this different from a one-time audit?", a: "An audit is a snapshot — it tells you about your code as of one date. Shield is ongoing: your contracts, integrations, and the threat landscape all keep changing after that date, and Shield keeps watching after the audit report is filed away." },
  { q: "Do I need a DecaFlow audit first?", a: "No, but it helps — if we've already reviewed your contracts we understand your codebase and can onboard you same-day. Without a prior audit, we'll do a lightweight intake review before turning on monitoring." },
  { q: "What chains do you support?", a: "Monitoring is rolling out chain by chain, starting with Ethereum and Arbitrum. Tell us what you need in the waitlist form and we'll prioritize accordingly." },
];

export default function Shield() {
  useEffect(() => { document.title = "Shield — Continuous Security Monitoring | DecaFlow"; }, []);

  const checkoutStatus = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("checkout") : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formStep, setFormStep] = useState<"form" | "success">("form");
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ companyName: "", contactName: "", email: "", chains: [] as string[], contractAddress: "", contractCount: "", message: "", plan: "" });
  const [formError, setFormError] = useState("");

  const openForm = (plan: string) => { setSelectedPlan(plan); setFormData(p => ({ ...p, plan })); setFormStep("form"); setFormOpen(true); document.body.style.overflow = "hidden"; };
  const closeForm = () => { setFormOpen(false); document.body.style.overflow = ""; };
  const toggleChain = (c: string) => setFormData(p => ({ ...p, chains: p.chains.includes(c) ? p.chains.filter(x => x !== c) : [...p.chains, c] }));

  const isPaidPlan = selectedPlan === "Starter" || selectedPlan === "Growth";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (isPaidPlan) {
      // Starter/Growth: real Stripe Checkout. On success this redirects away from
      // the page entirely — there's no local "success" step to reach here.
      try {
        const res = await fetch(`${API_BASE}/v1/shield/checkout`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, chain: formData.chains[0] || "" }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url;
          return;
        }
        setFormError(data.error || "Could not start checkout. Please try again.");
      } catch {
        setFormError("Could not reach checkout. Please try again or email us directly.");
      }
      setFormLoading(false);
      return;
    }

    // Enterprise: no fixed price to check out with, stays on the waitlist flow.
    try {
      await fetch(`${API_BASE}/v1/shield/waitlist`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, source: "shield-page" }) });
    } catch {}
    setFormStep("success");
    setFormLoading(false);
  };

  const NAV_LINKS = [
    { label: "Compliance", href: "/compliance", active: false },
    { label: "Security Audit", href: "/audit", active: false },
    { label: "Verify API", href: "/verify", active: false },
    { label: "Shield", href: "/shield", active: true },
  ];

  return (
    <div style={{ background: "#0A0E27", color: "#fff", minHeight: "100vh", fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.3); }
        .mobile-btn { display: none !important; }
        .desktop-nav { display: flex !important; }
        @media (max-width: 768px) {
          .mobile-btn { display: flex !important; }
          .desktop-nav { display: none !important; }
          .hero-section { padding: 4rem 1.25rem 3rem !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, background: "rgba(10,14,39,0.97)", backdropFilter: "blur(14px)", zIndex: 200 }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>Deca<span style={{ color: "#3B82F6" }}>Flow</span></span>
        </a>
        <div className="desktop-nav" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} style={{ color: l.active ? "#fff" : "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>{l.label}</a>
          ))}
          <a href="#" onClick={(e) => { e.preventDefault(); openForm("Growth"); }} style={{ background: "#06b6d4", color: "#04202a", padding: "0.5rem 1.25rem", borderRadius: "8px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>Join Early Access</a>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-btn" style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: "1.4rem", cursor: "pointer" }}>{menuOpen ? "✕" : "☰"}</button>
      </nav>
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,14,39,0.98)", zIndex: 199, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
          {NAV_LINKS.map(l => <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", fontSize: "1.5rem", fontWeight: 700 }}>{l.label}</a>)}
        </div>
      )}

      {/* HERO */}
      <section className="hero-section" style={{ padding: "7rem 2rem 4rem", maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        {checkoutStatus === "success" && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", padding: "0.9rem 1.25rem", marginBottom: "2rem", color: "#86efac", fontSize: "0.9rem" }}>
            ✅ Payment received — you're subscribed. A confirmation is on its way to your email.
          </div>
        )}
        {checkoutStatus === "cancelled" && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "0.9rem 1.25rem", marginBottom: "2rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            Checkout was cancelled — no charge was made. Pick a plan below whenever you're ready.
          </div>
        )}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "100px", padding: "0.4rem 1.1rem", fontSize: "0.78rem", color: "#67e8f9", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2rem" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Early Access
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: "1.5rem" }}>
          Security monitoring that{" "}
          <span style={{ background: "linear-gradient(135deg,#06b6d4 0%,#3B82F6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>doesn't stop</span>
          {" "}at the audit report.
        </h1>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: "620px", margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
          A one-time audit tells you about your code on one day. Shield is DecaFlow's continuous monitoring layer for deployed contracts — real-time alerts, automated scans, and an incident workflow that doesn't end when the report does.
        </p>
        <button onClick={() => openForm("Growth")} style={{ background: "#06b6d4", color: "#04202a", padding: "0.95rem 2.25rem", borderRadius: "11px", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 700, boxShadow: "0 0 32px rgba(6,182,212,0.35)" }}>
          Join Early Access
        </button>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "4rem 2rem", maxWidth: "1150px", margin: "0 auto" }}>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.75rem" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIT VS SHIELD */}
      <section style={{ padding: "2rem 2rem 5rem", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, marginBottom: "2rem" }}>A snapshot vs. a watch.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", textAlign: "left" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.5rem" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>Security Audit</div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.7 }}>One-time review, formal report, point-in-time findings. Still the right first step for any new contract.</p>
          </div>
          <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: "14px", padding: "1.5rem" }}>
            <div style={{ color: "#67e8f9", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>Shield</div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: 1.7 }}>Ongoing monitoring for the life of the contract. Picks up where the audit leaves off.</p>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section style={{ padding: "2rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, marginBottom: "0.75rem" }}>Early-access pricing</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>Design partners help shape the product and lock in early-access rates.</p>
        </div>
        <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: p.highlight ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.03)", border: p.highlight ? "1px solid rgba(6,182,212,0.4)" : "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{p.name}</h3>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, marginBottom: "1.25rem" }}>{p.price}<span style={{ fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>{p.period}</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {p.features.map(f => <li key={f} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", display: "flex", gap: "0.5rem" }}><span style={{ color: "#67e8f9" }}>✓</span>{f}</li>)}
              </ul>
              <button onClick={() => openForm(p.name)} style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: p.highlight ? "none" : "1px solid rgba(255,255,255,0.15)", background: p.highlight ? "#06b6d4" : "transparent", color: p.highlight ? "#04202a" : "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>{p.name === "Enterprise" ? "Join Waitlist" : "Subscribe"}</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "2rem 1.25rem 5rem", maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, marginBottom: "2.5rem" }}>Questions</h2>
        {FAQS.map(f => (
          <div key={f.q} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.25rem 0" }}>
            <h3 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: "0.5rem" }}>{f.q}</h3>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.7 }}>{f.a}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "2rem 1.25rem", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>
        © 2026 DecaFlow Solutions Limited · <a href="mailto:contact@decaflow.xyz" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>contact@decaflow.xyz</a>
      </footer>

      {/* Form Modal */}
      {formOpen && (
        <div onClick={e => e.target === e.currentTarget && closeForm()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: "#111827", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "20px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{formStep === "success" ? "You're on the list! 🎉" : isPaidPlan ? `Subscribe — ${selectedPlan}` : `Join Early Access — ${selectedPlan}`}</h2>
                {formStep !== "success" && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>{isPaidPlan ? "You'll be redirected to secure Stripe checkout." : "We're onboarding design partners in small batches."}</p>}
              </div>
              <button onClick={closeForm} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer" }}>✕</button>
            </div>
            {formStep === "success" ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Thanks, {formData.contactName || "there"}.</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "2rem" }}>A member of the team will reach out to <strong>{formData.email}</strong> to scope your contracts and get monitoring set up.</p>
                <button onClick={closeForm} style={{ background: "#06b6d4", color: "#04202a", padding: "0.875rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700 }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "0.875rem" }}>
                  {[
                    ["Company Name *", "companyName", "e.g. Acme Protocol", "text"],
                    ["Your Name *", "contactName", "Full name", "text"],
                    ["Work Email *", "email", "you@company.com", "email"],
                    [isPaidPlan ? "Contract Address *" : "Contract Address", "contractAddress", "0x...", "text"],
                    ["Other Contracts", "contractCount", "e.g. 2 more", "text"],
                  ].map(([label, field, ph, type]) => (
                    <div key={field as string}>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.35rem", fontWeight: 600 }}>{label as string}</label>
                      <input required={(label as string).includes("*")} type={type as string} placeholder={ph as string} value={(formData as any)[field as string]}
                        onChange={e => setFormData(p => ({ ...p, [field as string]: e.target.value }))}
                        style={{ width: "100%", padding: "0.7rem 0.875rem", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: "0.875rem" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem", fontWeight: 600 }}>Chains</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {["Ethereum", "Arbitrum", "Base", "Optimism", "Polygon", "Avalanche", "BNB Chain"].map(c => (
                      <button key={c} type="button" onClick={() => toggleChain(c)} style={{ padding: "0.35rem 0.75rem", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: formData.chains.includes(c) ? "1px solid #06b6d4" : "1px solid rgba(255,255,255,0.12)", background: formData.chains.includes(c) ? "rgba(6,182,212,0.2)" : "transparent", color: formData.chains.includes(c) ? "#67e8f9" : "rgba(255,255,255,0.6)" }}>{c}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.35rem", fontWeight: 600 }}>Anything else?</label>
                  <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} rows={3} placeholder="Tell us about your contracts or what you'd want monitored..."
                    style={{ width: "100%", padding: "0.7rem 0.875rem", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" as const, fontFamily: "inherit" }} />
                </div>
                {formError && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", borderRadius: "8px", padding: "0.7rem 0.875rem", fontSize: "0.82rem", marginBottom: "1rem" }}>{formError}</div>}
                <button type="submit" disabled={formLoading} style={{ width: "100%", padding: "1rem", borderRadius: "10px", background: "#06b6d4", color: "#04202a", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1rem", opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? (isPaidPlan ? "Redirecting to checkout..." : "Submitting...") : (isPaidPlan ? `Continue to Payment — $${selectedPlan === "Starter" ? "750" : "5,000"}/mo` : "Join Early Access")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
