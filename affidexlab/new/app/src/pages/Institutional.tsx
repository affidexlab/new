import { useState, useEffect } from "react";

import { API_BASE } from "../lib/apiBase";
import ProductNav from "../components/ProductNav";

const FEATURES = [
  { icon: "🪪", title: "On-Chain Identity Registry", desc: "ERC-3643 (T-REX) identity registry — wallets carry a verified compliance status without exposing personal data on a public ledger." },
  { icon: "⚖️", title: "Programmable Transfer Compliance", desc: "Every transfer checks jurisdiction, investor limits, and whitelist status before it settles — restrictions enforced by the contract itself, not a policy document." },
  { icon: "🔐", title: "DecaFlow Native KYC & Accreditation", desc: "DecaFlow is your KYC/KYB/accreditation provider — no third-party dependency. Document verification, liveness checks, accredited investor verification, and on-chain identity attestations all handled internally." },
  { icon: "🧯", title: "Court-Ordered Freeze / Recovery", desc: "Multi-sig controlled forced-transfer capability for legitimate legal orders — a standard, often regulator-required feature of compliant security tokens, not a backdoor." },
  { icon: "📄", title: "Regulator-Ready Reporting", desc: "Pull on-chain holder and transfer data into exportable reports formatted for the regulators relevant to your offering." },
  { icon: "🏗️", title: "Issuer Portal (Roadmap)", desc: "A dashboard for whitelisting, holder distribution, and compliance health — planned for teams past initial integration." },
];

const PLANS = [
  { name: "Issuer", price: "$2,500", period: "/month", highlight: false,
    features: ["1 asset / token contract", "Identity registry access", "Standard compliance rule set", "Email support", "Best for a single RWA offering"] },
  { name: "Scale", price: "$10,000", period: "/month", highlight: true,
    features: ["Multiple assets", "Custom compliance rules per jurisdiction", "Priority engineering support", "Quarterly compliance review", "Best for issuers with several offerings"] },
  { name: "Enterprise", price: "Custom", period: "", highlight: false,
    features: ["Unlimited assets", "Dedicated compliance engineering", "Oracle & SDK integration", "Dedicated account manager"] },
];

const FAQS = [
  { q: "Is Institutional live yet?", a: "No — and we want to be exact about what that means. The identity registry and compliance contract architecture (ERC-3643 / T-REX standard) exist as reference implementations we're actively building, not audited, deployed infrastructure. Nothing here should be used to issue real securities until it's been through a real security audit and your own securities counsel has reviewed it for your specific offering and jurisdiction." },
  { q: "Does DecaFlow provide legal compliance?", a: "No. We provide compliance infrastructure — code that can enforce rules your legal team defines. We are not a law firm, we do not determine which securities exemption applies to your offering, and we do not replace your own securities counsel. That's true no matter what plan you're on." },
  { q: "What happens after I sign up?", a: "This isn't instant self-serve access. Someone from our team reaches out to scope your specific asset, jurisdiction, and compliance requirements before any integration work starts — this is a guided process, not a one-click deploy, at least until the underlying platform has matured well past where it is today." },
  { q: "What standard are you building on?", a: "ERC-3643 (the T-REX protocol) — the most widely adopted open standard for compliant security tokens, used by real institutional issuers. We're not inventing proprietary logic here; we're implementing a standard regulators and other platforms already recognize." },
];

export default function Institutional() {
  useEffect(() => { document.title = "Institutional — RWA Compliance Infrastructure | DecaFlow"; }, []);

  const checkoutStatus = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("checkout") : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formStep, setFormStep] = useState<"form" | "success" | "payment-info">("form");
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "bank" | "">("");
  const [paymentInfo, setPaymentInfo] = useState<{ walletAddress?: string; exactAmount?: string; chain?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ companyName: "", contactName: "", email: "", assetType: "", jurisdictions: [] as string[], message: "", plan: "" });
  const [formError, setFormError] = useState("");

  const openForm = (plan: string) => { setSelectedPlan(plan); setFormData(p => ({ ...p, plan })); setFormStep("form"); setFormOpen(true); document.body.style.overflow = "hidden"; };
  const closeForm = () => { setFormOpen(false); setPaymentMethod(""); document.body.style.overflow = ""; };
  const toggleJurisdiction = (c: string) => setFormData(p => ({ ...p, jurisdictions: p.jurisdictions.includes(c) ? p.jurisdictions.filter(x => x !== c) : [...p.jurisdictions, c] }));

  const isPaidPlan = selectedPlan === "Issuer" || selectedPlan === "Scale";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (isPaidPlan) {
      if (!paymentMethod) { setFormError("Choose a payment method first."); return; }

      setFormLoading(true);
      const endpoint = paymentMethod === "crypto" ? "/v1/institutional/nowpayments/create-invoice" : "/v1/institutional/payment-request";
      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, paymentMethod }),
        });
        const data = await res.json();
        if (data.success && paymentMethod === "crypto" && data.url) {
          window.location.href = data.url;
          return;
        }
        if (data.success) {
          setPaymentInfo(data);
          setFormStep("payment-info");
        } else {
          setFormError(data.error || "Could not submit request. Please try again.");
        }
      } catch {
        setFormError("Could not reach the server. Please try again or email us directly.");
      }
      setFormLoading(false);
      return;
    }

    setFormLoading(true);
    try {
      await fetch(`${API_BASE}/v1/institutional/waitlist`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, source: "institutional-page" }) });
    } catch {}
    setFormStep("success");
    setFormLoading(false);
  };

  const NAV_LINKS = [
    { label: "Compliance", href: "/compliance", active: false },
    { label: "Security Audit", href: "/audit", active: false },
    { label: "Shield", href: "/shield", active: false },
    { label: "Institutional", href: "/institutional", active: true },
    { label: "Verify API", href: "/verify", active: false },
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

      <ProductNav active="Institutional" ctaLabel="Talk to Us" onCta={() => openForm("Scale")} />

      <section className="hero-section" style={{ padding: "7rem 2rem 4rem", maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        {checkoutStatus === "success" && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", padding: "0.9rem 1.25rem", marginBottom: "2rem", color: "#86efac", fontSize: "0.9rem" }}>
            ✅ Payment received. Our team will reach out to scope your compliance requirements — this is a guided process, not instant access.
          </div>
        )}
        {checkoutStatus === "cancelled" && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "0.9rem 1.25rem", marginBottom: "2rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            Checkout was cancelled — no charge was made.
          </div>
        )}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "100px", padding: "0.4rem 1.1rem", fontSize: "0.78rem", color: "#93C5FD", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2rem" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Guardian-Audited Templates — Final Re-Review Per Engagement
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: "1.5rem" }}>
          The compliance layer{" "}
          <span style={{ background: "linear-gradient(135deg,#3B82F6 0%,#3B82F6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>for tokenized assets</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: "680px", margin: "0 auto 1.5rem", lineHeight: 1.75 }}>
          The complete RWA compliance suite: on-chain identity verification with Zero-Knowledge KYC attestations, automated accredited-investor compliance checks powered by DecaFlow risk intelligence, and pre-audited smart contract templates for tokenized securities.
        </p>
        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
          Not a substitute for securities counsel. Talk to your own lawyer before issuing anything.
        </p>
        <button onClick={() => openForm("Scale")} style={{ background: "#3B82F6", color: "#3a2404", padding: "0.95rem 2.25rem", borderRadius: "11px", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 700, boxShadow: "0 0 32px rgba(59,130,246,0.3)" }}>
          Talk to Us
        </button>
        <div style={{ marginTop: "1.5rem" }}>
          <a href="/institutional/portal" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", textDecoration: "underline" }}>Already have a deployed contract? Open the Issuer Portal →</a>
        </div>
      </section>

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

      <section style={{ padding: "2rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, marginBottom: "0.75rem" }}>Early pricing</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>Payment secures your place in the queue and starts a scoping conversation — not instant access.</p>
        </div>
        <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: p.highlight ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)", border: p.highlight ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{p.name}</h3>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, marginBottom: "1.25rem" }}>{p.price}<span style={{ fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>{p.period}</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {p.features.map(f => <li key={f} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", display: "flex", gap: "0.5rem" }}><span style={{ color: "#93C5FD" }}>✓</span>{f}</li>)}
              </ul>
              <button onClick={() => openForm(p.name)} style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: p.highlight ? "none" : "1px solid rgba(255,255,255,0.15)", background: p.highlight ? "#3B82F6" : "transparent", color: p.highlight ? "#3a2404" : "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>{p.name === "Enterprise" ? "Talk to Us" : "Get Started"}</button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "2rem 1.25rem 5rem", maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, marginBottom: "2.5rem" }}>Questions</h2>
        {FAQS.map(f => (
          <div key={f.q} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.25rem 0" }}>
            <h3 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: "0.5rem" }}>{f.q}</h3>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.7 }}>{f.a}</p>
          </div>
        ))}
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "2rem 1.25rem", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>
        © 2026 DecaFlow Solutions Limited · <a href="mailto:contact@decaflow.xyz" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>contact@decaflow.xyz</a>
      </footer>

      {formOpen && (
        <div onClick={e => e.target === e.currentTarget && closeForm()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: "#111827", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "20px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{formStep === "success" ? "Thanks — we'll be in touch" : isPaidPlan ? `Get Started — ${selectedPlan}` : `Talk to Us — ${selectedPlan}`}</h2>
                {formStep === "form" && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>{isPaidPlan ? "This starts a scoping conversation, not instant access." : "Tell us about your asset and we'll follow up."}</p>}
              </div>
              <button onClick={closeForm} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer" }}>✕</button>
            </div>
            {formStep === "payment-info" ? (
              <div style={{ padding: "2rem 1.5rem" }}>
                {paymentMethod === "crypto" ? (
                  <>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Send payment to proceed</h3>
                    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
                      <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.25rem" }}>Amount ({paymentInfo.chain})</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#93C5FD", marginBottom: "0.75rem" }}>${paymentInfo.exactAmount}</div>
                      <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.25rem" }}>To address</div>
                      <div style={{ fontSize: "0.85rem", fontFamily: "monospace", wordBreak: "break-all", color: "#fff" }}>{paymentInfo.walletAddress}</div>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>Once confirmed, our team reaches out to <strong>{formData.email}</strong> to scope your requirements — this secures your place in the queue, it does not grant system access.</p>
                    <button onClick={closeForm} style={{ background: "#3B82F6", color: "#3a2404", padding: "0.875rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700 }}>Got it</button>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Request received ✅</h3>
                    <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "1.5rem" }}>Our team will email <strong>{formData.email}</strong> with bank transfer details within one business day, then follow up to scope your requirements.</p>
                    <button onClick={closeForm} style={{ background: "#3B82F6", color: "#3a2404", padding: "0.875rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700 }}>Close</button>
                  </>
                )}
              </div>
            ) : formStep === "success" ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Thanks, {formData.contactName || "there"}.</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "2rem" }}>A member of the team will reach out to <strong>{formData.email}</strong> to talk through your asset and compliance needs.</p>
                <button onClick={closeForm} style={{ background: "#3B82F6", color: "#3a2404", padding: "0.875rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700 }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "0.875rem" }}>
                  {[
                    ["Company Name *", "companyName", "e.g. Acme Capital", "text"],
                    ["Your Name *", "contactName", "Full name", "text"],
                    ["Work Email *", "email", "you@company.com", "email"],
                    ["Asset Type", "assetType", "e.g. real estate, private credit", "text"],
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
                  <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem", fontWeight: 600 }}>Target jurisdiction(s)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {["United States", "European Union", "United Kingdom", "UAE", "Singapore", "Other"].map(c => (
                      <button key={c} type="button" onClick={() => toggleJurisdiction(c)} style={{ padding: "0.35rem 0.75rem", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: formData.jurisdictions.includes(c) ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.12)", background: formData.jurisdictions.includes(c) ? "rgba(59,130,246,0.2)" : "transparent", color: formData.jurisdictions.includes(c) ? "#93C5FD" : "rgba(255,255,255,0.6)" }}>{c}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.35rem", fontWeight: 600 }}>Tell us about the offering</label>
                  <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} rows={3} placeholder="What are you looking to tokenize, and where are you in the process?"
                    style={{ width: "100%", padding: "0.7rem 0.875rem", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" as const, fontFamily: "inherit" }} />
                </div>
                {isPaidPlan && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem", fontWeight: 600 }}>Pay with</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
                      <button type="button" onClick={() => setPaymentMethod("crypto")} style={{ padding: "0.7rem 0.5rem", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", border: paymentMethod === "crypto" ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.15)", background: paymentMethod === "crypto" ? "rgba(59,130,246,0.15)" : "transparent", color: paymentMethod === "crypto" ? "#93C5FD" : "rgba(255,255,255,0.75)" }}>Crypto</button>
                      <button type="button" onClick={() => setPaymentMethod("bank")} style={{ padding: "0.7rem 0.5rem", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", border: paymentMethod === "bank" ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.15)", background: paymentMethod === "bank" ? "rgba(59,130,246,0.15)" : "transparent", color: paymentMethod === "bank" ? "#93C5FD" : "rgba(255,255,255,0.75)" }}>Bank Transfer</button>
                      <button type="button" disabled title="Coming soon" style={{ padding: "0.7rem 0.5rem", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.3)" }}>
                        Card
                        <span style={{ display: "block", fontSize: "0.62rem", fontWeight: 500, marginTop: "0.15rem" }}>Coming soon</span>
                      </button>
                    </div>
                    {paymentMethod === "crypto" && <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.45)", marginTop: "0.6rem", lineHeight: 1.5 }}>Redirects to a secure NOWPayments invoice. This secures your place in the queue — our team reaches out afterward, nothing activates automatically.</p>}
                    {paymentMethod === "bank" && <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.45)", marginTop: "0.6rem", lineHeight: 1.5 }}>We'll follow up by email with transfer details within one business day.</p>}
                  </div>
                )}
                {formError && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", borderRadius: "8px", padding: "0.7rem 0.875rem", fontSize: "0.82rem", marginBottom: "1rem" }}>{formError}</div>}
                <button type="submit" disabled={formLoading} style={{ width: "100%", padding: "1rem", borderRadius: "10px", background: "#3B82F6", color: "#3a2404", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1rem", opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? (paymentMethod === "crypto" ? "Redirecting to NOWPayments..." : "Submitting...") : isPaidPlan ? "Continue" : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
