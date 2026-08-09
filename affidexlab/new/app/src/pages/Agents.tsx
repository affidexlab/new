import { useState, useEffect } from "react";

import { API_BASE } from "../lib/apiBase";
import ProductNav from "../components/ProductNav";

const FEATURES = [
  { icon: "⚙️", title: "Configurable Workflow Rules", desc: "Set conditions like \"if risk score > 80, flag for review\" — no code, applied automatically to every check that runs through your account." },
  { icon: "📥", title: "Human Review Queue", desc: "Matched items land in a queue, not a mailbox that gets ignored. Nothing is decided until someone on your team says so." },
  { icon: "🔔", title: "Real-Time Notifications", desc: "Rule triggers email your team immediately — no daily digest lag between a flag and a decision." },
  { icon: "📝", title: "Accountable Decisions", desc: "Every approve/reject is tied to a named reviewer and timestamped — a real audit trail, not a black box." },
  { icon: "🚫", title: "No Autonomous Action (By Design)", desc: "This system cannot freeze, block, or move anything on its own. That's deliberate — see the FAQ." },
  { icon: "🔮", title: "Full Autonomy (Roadmap)", desc: "Predictive auto-action is the eventual direction, gated on real regulatory clarity and your explicit opt-in per action type — not a default." },
];

const PLANS = [
  { name: "Starter", price: "$500", period: "/month", highlight: false,
    features: ["Up to 5 active rules", "Email notifications", "7-day review queue history", "Best for testing the workflow model"] },
  { name: "Growth", price: "$2,500", period: "/month", highlight: true,
    features: ["Unlimited rules", "Full review queue history", "Priority support", "Matches the roadmap's original Agentic tier pricing"] },
  { name: "Enterprise", price: "Custom", period: "", highlight: false,
    features: ["Multi-reviewer workflows", "Custom integrations", "Dedicated account manager"] },
];

const FAQS = [
  { q: "Do the agents freeze transactions automatically?", a: "No, and that's still true after Phase 3. What's new: the system can now notice you've made the same review decision consistently and ask if you want that specific pattern auto-resolved instead of queued — but it only ever asks, an explicit named person has to say yes, and even then it only speeds up a queue decision. It still cannot touch a real transaction. That capability lives nowhere in this system." },
  { q: "Is the risk scoring behind this real?", a: "Authenticated Verify checks now use DecaFlow's internal risk engine when production ingestion is configured. Public demo widgets are still demonstrations, so customers should treat production API responses and analyst review history as the compliance record." },
  { q: "Does this replace the Compliance product?", a: "No — this sits on top of it. Compliance provides the data and the score; this provides the workflow layer that decides what happens with that score, ending in a human decision. Think of Compliance as the foundation and this as the layer above it." },
];

export default function Agents() {
  useEffect(() => { document.title = "Autopilot — Agentic Compliance Workflows | DecaFlow"; }, []);

  const checkoutStatus = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("checkout") : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formStep, setFormStep] = useState<"form" | "success" | "payment-info">("form");
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "bank" | "">("");
  const [paymentInfo, setPaymentInfo] = useState<{ walletAddress?: string; exactAmount?: string; chain?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ companyName: "", contactName: "", email: "", message: "", plan: "" });
  const [formError, setFormError] = useState("");

  // Authenticated workflow console state. Production rule APIs require an org
  // session or scoped org API key; public email-only access is disabled.
  const [ruleEmail, setRuleEmail] = useState("");
  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ name: "", operator: ">", threshold: "80" });
  const [ruleBuilderError, setRuleBuilderError] = useState("");
  const [ruleBuilderLoading, setRuleBuilderLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [enablingId, setEnablingId] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState("");

  const loadSuggestions = async (email: string) => {
    if (!email.includes("@")) return;
    try {
      const res = await fetch(`${API_BASE}/v1/agents/suggestions?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) setSuggestions(data.suggestions);
    } catch { /* silent — demo widget */ }
  };

  const enableAuto = async (ruleId: number, decision: string) => {
    if (!reviewerName.trim()) { setRuleBuilderError("Enter your name first — automation needs a named, accountable owner."); return; }
    setEnablingId(ruleId);
    try {
      await fetch(`${API_BASE}/v1/agents/rules/${ruleId}/enable-auto`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, enabledBy: reviewerName }),
      });
      loadSuggestions(ruleEmail);
      loadRules(ruleEmail);
    } catch { /* silent */ }
    setEnablingId(null);
  };

  const loadRules = async (email: string) => {
    if (!email.includes("@")) return;
    try {
      const res = await fetch(`${API_BASE}/v1/agents/rules?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) setRules(data.rules);
    } catch { /* silent — this is a demo widget, not a critical path */ }
  };

  const createRule = async () => {
    setRuleBuilderError("");
    if (!ruleEmail.includes("@")) { setRuleBuilderError("Enter your email first — rules are scoped per account."); return; }
    if (!newRule.name.trim()) { setRuleBuilderError("Give the rule a name."); return; }
    setRuleBuilderLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/agents/rules`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ruleEmail, name: newRule.name, operator: newRule.operator, threshold: Number(newRule.threshold), action: "flag_for_review" }),
      });
      const data = await res.json();
      if (data.success) { setNewRule({ name: "", operator: ">", threshold: "80" }); loadRules(ruleEmail); }
      else setRuleBuilderError(data.error || "Could not create rule.");
    } catch { setRuleBuilderError("Could not reach the server."); }
    setRuleBuilderLoading(false);
  };

  const openForm = (plan: string) => { setSelectedPlan(plan); setFormData(p => ({ ...p, plan })); setFormStep("form"); setFormOpen(true); document.body.style.overflow = "hidden"; };
  const closeForm = () => { setFormOpen(false); setPaymentMethod(""); document.body.style.overflow = ""; };
  const isPaidPlan = selectedPlan === "Starter" || selectedPlan === "Growth";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (isPaidPlan) {
      if (!paymentMethod) { setFormError("Choose a payment method first."); return; }
      setFormLoading(true);
      const endpoint = paymentMethod === "crypto" ? "/v1/agents/nowpayments/create-invoice" : "/v1/agents/payment-request";
      try {
        const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, paymentMethod }) });
        const data = await res.json();
        if (data.success && paymentMethod === "crypto" && data.url) { window.location.href = data.url; return; }
        if (data.success) { setPaymentInfo(data); setFormStep("payment-info"); }
        else setFormError(data.error || "Could not submit request.");
      } catch { setFormError("Could not reach the server."); }
      setFormLoading(false);
      return;
    }

    setFormLoading(true);
    try { await fetch(`${API_BASE}/v1/agents/waitlist`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, source: "agents-page" }) }); } catch {}
    setFormStep("success");
    setFormLoading(false);
  };

  const NAV_LINKS = [
    { label: "Compliance", href: "/compliance" }, { label: "Shield", href: "/shield" },
    { label: "Institutional", href: "/institutional" }, { label: "Autopilot", href: "/agents" }, { label: "Verify API", href: "/verify" },
  ];

  return (
    <div style={{ background: "#0A0E27", color: "#fff", minHeight: "100vh", fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; } ::placeholder { color: rgba(255,255,255,0.3); }
        .mobile-btn { display: none !important; } .desktop-nav { display: flex !important; }
        @media (max-width: 768px) {
          .mobile-btn { display: flex !important; } .desktop-nav { display: none !important; }
          .hero-section { padding: 4rem 1.25rem 3rem !important; }
          .plans-grid, .features-grid, .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ProductNav active="Autopilot" ctaLabel="Get Started" onCta={() => openForm("Growth")} />

      <section className="hero-section" style={{ padding: "7rem 2rem 4rem", maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        {checkoutStatus === "success" && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", padding: "0.9rem 1.25rem", marginBottom: "2rem", color: "#86efac", fontSize: "0.9rem" }}>✅ Payment received — confirmation on its way to your email.</div>}
        {checkoutStatus === "cancelled" && <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "0.9rem 1.25rem", marginBottom: "2rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>Checkout was cancelled — no charge was made.</div>}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "100px", padding: "0.4rem 1.1rem", fontSize: "0.78rem", color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2rem" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Phase 3: Pattern Suggestions Live — Never Autonomous
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: "1.5rem" }}>
          DecaFlow <span style={{ background: "linear-gradient(135deg,#3B82F6 0%,#3B82F6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Autopilot</span> — agentic compliance
        </h1>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: "640px", margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
          Set rules on risk scores, route matches to a review queue, and keep a named human accountable for every decision. Autopilot learns your team's consistent patterns and asks before automating anything — automation is earned and approved, never assumed.
        </p>
        <button onClick={() => openForm("Growth")} style={{ background: "#3B82F6", color: "#fff", padding: "0.95rem 2.25rem", borderRadius: "11px", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 700, boxShadow: "0 0 32px rgba(59,130,246,0.35)" }}>Get Started</button>
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

      {/* Authenticated workflow console */}
      <section style={{ padding: "2rem 1.25rem 5rem", maxWidth: "700px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Authenticated workflow console</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "2rem" }}>Rule creation, review queues, suggestions, and automation opt-in now require an organization session or scoped API key.</p>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[
              ["Organization login", "Magic-link sessions are required for humans before members, rules, review queues, or API keys can be managed."],
              ["Scoped service keys", "Machine access uses org API keys with scopes such as verify:check, agents:rules, agents:evaluate, and agents:review."],
              ["Human-approved automation", "Pattern suggestions can still auto-resolve repeated decisions, but only after an owner/admin explicitly enables that rule."],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: "0.9rem 1rem", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.84rem", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "2rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, marginBottom: "2.5rem" }}>Pricing</h2>
        <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: p.highlight ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)", border: p.highlight ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{p.name}</h3>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, marginBottom: "1.25rem" }}>{p.price}<span style={{ fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>{p.period}</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {p.features.map(f => <li key={f} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", display: "flex", gap: "0.5rem" }}><span style={{ color: "#a5b4fc" }}>✓</span>{f}</li>)}
              </ul>
              <button onClick={() => openForm(p.name)} style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: p.highlight ? "none" : "1px solid rgba(255,255,255,0.15)", background: p.highlight ? "#3B82F6" : "transparent", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>{p.name === "Enterprise" ? "Talk to Us" : "Get Started"}</button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "2rem 1.25rem 5rem", maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, marginBottom: "2.5rem" }}>Questions</h2>
        {FAQS.map(f => <div key={f.q} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.25rem 0" }}><h3 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: "0.5rem" }}>{f.q}</h3><p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.7 }}>{f.a}</p></div>)}
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "2rem 1.25rem", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>
        © 2026 DecaFlow Solutions Limited · <a href="mailto:contact@decaflow.xyz" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>contact@decaflow.xyz</a>
      </footer>

      {formOpen && (
        <div onClick={e => e.target === e.currentTarget && closeForm()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: "#111827", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "20px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{formStep === "success" ? "Thanks!" : `${selectedPlan}`}</h2>
              <button onClick={closeForm} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer" }}>✕</button>
            </div>
            {formStep === "payment-info" ? (
              <div style={{ padding: "2rem 1.5rem" }}>
                {paymentMethod === "crypto" ? (
                  <>
                    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
                      <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)" }}>Amount ({paymentInfo.chain})</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#a5b4fc", margin: "0.25rem 0 0.75rem" }}>${paymentInfo.exactAmount}</div>
                      <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)" }}>To address</div>
                      <div style={{ fontSize: "0.85rem", fontFamily: "monospace", wordBreak: "break-all" }}>{paymentInfo.walletAddress}</div>
                    </div>
                    <button onClick={closeForm} style={{ background: "#3B82F6", color: "#fff", padding: "0.875rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700 }}>Got it</button>
                  </>
                ) : (
                  <><p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>Bank details are on their way to <strong>{formData.email}</strong>.</p><button onClick={closeForm} style={{ background: "#3B82F6", color: "#fff", padding: "0.875rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700 }}>Close</button></>
                )}
              </div>
            ) : formStep === "success" ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem" }}>We'll follow up at <strong>{formData.email}</strong>.</p>
                <button onClick={closeForm} style={{ background: "#3B82F6", color: "#fff", padding: "0.875rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700 }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "1rem" }}>
                  {[["Company *", "companyName", "text"], ["Name *", "contactName", "text"], ["Email *", "email", "email"], ["Message", "message", "text"]].map(([label, field, type]) => (
                    <input key={field as string} required={(label as string).includes("*")} type={type as string} placeholder={label as string} value={(formData as any)[field as string]} onChange={e => setFormData(p => ({ ...p, [field as string]: e.target.value }))}
                      style={{ padding: "0.7rem 0.875rem", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.875rem" }} />
                  ))}
                </div>
                {isPaidPlan && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
                      <button type="button" onClick={() => setPaymentMethod("crypto")} style={{ padding: "0.7rem", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", border: paymentMethod === "crypto" ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.15)", background: paymentMethod === "crypto" ? "rgba(59,130,246,0.15)" : "transparent", color: "#fff" }}>Crypto</button>
                      <button type="button" onClick={() => setPaymentMethod("bank")} style={{ padding: "0.7rem", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", border: paymentMethod === "bank" ? "1px solid #3B82F6" : "1px solid rgba(255,255,255,0.15)", background: paymentMethod === "bank" ? "rgba(59,130,246,0.15)" : "transparent", color: "#fff" }}>Bank</button>
                      <button type="button" disabled style={{ padding: "0.7rem", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>Card<span style={{ display: "block", fontSize: "0.6rem" }}>Coming soon</span></button>
                    </div>
                  </div>
                )}
                {formError && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", borderRadius: "8px", padding: "0.7rem", fontSize: "0.82rem", marginBottom: "1rem" }}>{formError}</div>}
                <button type="submit" disabled={formLoading} style={{ width: "100%", padding: "1rem", borderRadius: "10px", background: "#3B82F6", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", opacity: formLoading ? 0.6 : 1 }}>{formLoading ? "Submitting..." : "Continue"}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
