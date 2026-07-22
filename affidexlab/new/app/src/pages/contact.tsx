import { useState, useEffect } from "react";

const API_BASE = "https://decaflow-backend.onrender.com";

export default function Contact() {
  useEffect(() => { document.title = "Contact Us | DecaFlow"; }, []);

  const [formStep, setFormStep] = useState<"form" | "success">("form");
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", company: "", subject: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await fetch(`${API_BASE}/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "contact-page", to: "contact@decaflow.xyz" }),
      });
    } catch {}
    setFormStep("success");
    setFormLoading(false);
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "0.875rem 1rem", borderRadius: "10px",
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{ background: "#0A0E27", color: "#fff", minHeight: "100vh", fontFamily: "Inter,system-ui,sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, background: "rgba(10,14,39,0.97)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="/logo.png" alt="DecaFlow" style={{ width: 36, height: 36, objectFit: "contain" }} />
          <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>Deca<span style={{ color: "#3B82F6" }}>Flow</span></span>
        </a>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {[["Compliance", "/compliance"], ["Security Audit", "/audit"], ["Verify API", "/verify"]].map(([l, h]) => (
            <a key={l} href={h} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.9rem" }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* Content */}
      <section style={{ padding: "5rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem", alignItems: "start" }}>

          {/* Left — info */}
          <div>
            <div style={{ display: "inline-block", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "100px", padding: "0.4rem 1rem", fontSize: "0.78rem", color: "#93C5FD", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Get in Touch
            </div>
            <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
              We'd love to hear from you.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2.5rem" }}>
              Whether you have a question about our products, need a custom quote, or want to explore a partnership — our team is ready to help.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { icon: "📧", label: "General Enquiries", value: "contact@decaflow.xyz", href: "mailto:contact@decaflow.xyz" },
                { icon: "🤝", label: "Partnerships", value: "partnership@decaflow.xyz", href: "mailto:partnership@decaflow.xyz" },
                { icon: "🔐", label: "Security Audits", value: "decaflowsolutions@gmail.com", href: "mailto:decaflowsolutions@gmail.com" },
                { icon: "🐦", label: "Twitter / X", value: "@decaflowprotocol", href: "https://x.com/decaflowprotocol" },
              ].map((item) => (
                <a key={item.label} href={item.href} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", textDecoration: "none" }}>
                  <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>{item.label}</div>
                    <div style={{ fontSize: "0.9rem", color: "#fff", fontWeight: 500 }}>{item.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "20px", padding: "2.5rem" }}>
            {formStep === "success" ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.75rem" }}>Message sent!</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "2rem" }}>
                  Thanks for reaching out. We'll get back to <strong>{formData.email}</strong> within 24 hours.
                </p>
                <button onClick={() => { setFormStep("form"); setFormData({ name:"",email:"",company:"",subject:"",message:"" }); }}
                  style={{ background: "#3B82F6", color: "#fff", padding: "0.875rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 700 }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.25rem" }}>Send us a message</h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>We respond within 24 hours.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.4rem", fontWeight: 600 }}>Your Name *</label>
                    <input required type="text" placeholder="Full name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.4rem", fontWeight: 600 }}>Email *</label>
                    <input required type="email" placeholder="you@company.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} style={inp} />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.4rem", fontWeight: 600 }}>Company / Project</label>
                  <input type="text" placeholder="Your company or project name" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} style={inp} />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.4rem", fontWeight: 600 }}>Subject *</label>
                  <select required value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                    style={{ ...inp, background: "#1f2937", cursor: "pointer" }}>
                    <option value="" disabled>Select a topic</option>
                    {["Compliance API Enquiry", "Security Audit Request", "Verify API Enquiry", "Partnership Opportunity", "Technical Support", "General Question", "Other"].map(o => (
                      <option key={o} value={o} style={{ background: "#1f2937" }}>{o}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.4rem", fontWeight: 600 }}>Message *</label>
                  <textarea required value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} rows={5}
                    placeholder="Tell us how we can help..."
                    style={{ ...inp, resize: "vertical" }} />
                </div>

                <button type="submit" disabled={formLoading}
                  style={{ width: "100%", padding: "1rem", borderRadius: "10px", background: "#3B82F6", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1rem", opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? "Sending..." : "Send Message"}
                </button>
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                  🔒 We never share your information with third parties.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>
        © 2026 DecaFlow Solutions Limited ·{" "}
        <a href="mailto:contact@decaflow.xyz" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>contact@decaflow.xyz</a>
      </footer>
    </div>
  );
}
