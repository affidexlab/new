import { useEffect, useState } from "react";
import { API_BASE } from "../lib/apiBase";

const SESSION_KEY = "decaflow_session_token";

const PRODUCT_LINKS = [
  { name: "Verify API", href: "/verify", desc: "Wallet screening API — use your org API key with POST /v1/verify/check." },
  { name: "Compliance", href: "/compliance", desc: "Screening workflows, review queues, and evidence trails." },
  { name: "Shield", href: "/shield", desc: "Continuous contract monitoring, alerts, and incident workflow." },
  { name: "Autopilot", href: "/agents", desc: "Agentic compliance workflows with human-approved automation." },
  { name: "Institutional / RWA", href: "/institutional", desc: "ZK-KYC attestations, investor checks, and pre-audited contract templates." },
  { name: "Security Audits", href: "/audit", desc: "Scoped smart-contract audit engagements." },
];

const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.25rem" };
const input: React.CSSProperties = { width: "100%", padding: "0.75rem 1rem", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" };
const btn: React.CSSProperties = { background: "#3B82F6", color: "#fff", padding: "0.7rem 1.4rem", borderRadius: "9px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" };

const short = (a: string) => (a && a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-4)}` : a || "—");
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "No expiry";

function DashSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1rem", marginTop: "1rem" }}>
      <h3 style={{ fontSize: "0.92rem", fontWeight: 700, marginBottom: "0.7rem", color: "#93C5FD" }}>{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.6)", margin: "0 0 0.6rem" }}><strong style={{ color: "#fff" }}>{label}:</strong> {value}</p>;
}

function MiniTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  if (!rows.length) return <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", margin: "0 0 0.6rem" }}>{empty}</p>;
  return (
    <div style={{ overflowX: "auto", marginBottom: "0.75rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
        <thead><tr>{headers.map(h => <th key={h} style={{ textAlign: "left", padding: "0.35rem 0.6rem", color: "rgba(255,255,255,0.45)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((cell, j) => <td key={j} style={{ padding: "0.4rem 0.6rem", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.75)" }}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CustomerPortal() {
  useEffect(() => { document.title = "Customer Portal | DecaFlow"; }, []);

  const [session, setSession] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [account, setAccount] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [keyPolicy, setKeyPolicy] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState("");
  const [createdKeyExpiresAt, setCreatedKeyExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [screenWalletAddr, setScreenWalletAddr] = useState("");
  const [screenResult, setScreenResult] = useState<any>(null);
  const [newRule, setNewRule] = useState({ name: "", operator: ">", threshold: "80" });
  const [newContract, setNewContract] = useState({ chain: "arbitrum", address: "", label: "" });
  const [attWallet, setAttWallet] = useState("");
  const [attAccredited, setAttAccredited] = useState(true);
  const [checkWallet, setCheckWallet] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [newPolicy, setNewPolicy] = useState({ name: "Default AML policy", autoReviewScore: "70", autoRejectScore: "90", escalationEmail: "" });
  const [newCase, setNewCase] = useState({ walletAddress: "", chain: "ethereum", assignedTo: "", priority: "normal", notes: "" });
  const [busy, setBusy] = useState("");

  const authHeaders = (token: string) => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

  const reloadDashboard = (token: string) => {
    fetch(`${API_BASE}/v1/orgs/me/dashboard`, { headers: authHeaders(token) })
      .then(r => r.json()).then(d => { if (d.success) setDashboard(d); }).catch(() => {});
  };

  const act = async (label: string, path: string, body: any, after?: (data: any) => void) => {
    if (!session) return;
    setBusy(label); setError("");
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: authHeaders(session), body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) setError(data.error || `${label} failed.`);
      else { after?.(data); reloadDashboard(session); }
    } catch { setError("Could not reach the server."); }
    setBusy("");
  };

  const loadAccount = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/orgs/me`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!data.success) { localStorage.removeItem(SESSION_KEY); setSession(null); return; }
      setAccount(data.account);
      const [mRes, kRes] = await Promise.all([
        fetch(`${API_BASE}/v1/orgs/me/members`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/v1/orgs/me/api-keys`, { headers: authHeaders(token) }),
      ]);
      const mData = await mRes.json();
      const kData = await kRes.json();
      if (mData.success) setMembers(mData.members);
      if (kData.success) { setKeys(kData.keys); setKeyPolicy(kData.keyPolicy || null); }
      fetch(`${API_BASE}/v1/orgs/me/dashboard`, { headers: authHeaders(token) })
        .then(r => r.json()).then(d => { if (d.success) setDashboard(d); }).catch(() => {});
    } catch { setError("Could not load your account. Try again."); }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token && !session) {
      setVerifying(true);
      fetch(`${API_BASE}/v1/org-auth/magic-link/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      }).then(r => r.json()).then(data => {
        if (data.success && data.sessionToken) {
          localStorage.setItem(SESSION_KEY, data.sessionToken);
          setSession(data.sessionToken);
          window.history.replaceState({}, "", "/account");
        } else {
          setError(data.error || "Login link is invalid or expired. Request a new one.");
        }
      }).catch(() => setError("Could not verify login link.")).finally(() => setVerifying(false));
    }
  }, []);

  useEffect(() => { if (session) loadAccount(session); }, [session]);

  const requestLink = async () => {
    setStatus(""); setError("");
    if (!email.includes("@")) { setError("Enter the email on your DecaFlow account."); return; }
    try {
      const res = await fetch(`${API_BASE}/v1/org-auth/magic-link/request`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) setStatus("Login link sent. Check your email — the link expires in 15 minutes.");
      else setError(data.error || "Could not send login link.");
    } catch { setError("Could not reach the server."); }
  };

  const createKey = async () => {
    if (!session || !newKeyName.trim()) { setError("Give the API key a name."); return; }
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/orgs/me/api-keys`, {
        method: "POST", headers: authHeaders(session), body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.success) { setCreatedKey(data.apiKey); setCreatedKeyExpiresAt(data.expiresAt || data.record?.expires_at || ""); setNewKeyName(""); loadAccount(session); }
      else setError(data.error || "Could not create API key.");
    } catch { setError("Could not reach the server."); }
  };

  const toggleKey = async (id: number, active: boolean) => {
    if (!session) return;
    await fetch(`${API_BASE}/v1/orgs/me/api-keys/${id}`, {
      method: "PATCH", headers: authHeaders(session), body: JSON.stringify({ active }),
    }).catch(() => {});
    loadAccount(session);
  };

  const exportCompliance = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_BASE}/v1/orgs/me/compliance/export`, { headers: authHeaders(session) });
      if (!res.ok) throw new Error("Export failed.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "decaflow-compliance-cases.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch { setError("Could not export compliance cases."); }
  };

  const logout = () => { localStorage.removeItem(SESSION_KEY); setSession(null); setAccount(null); };

  return (
    <div style={{ background: "#0A0E27", color: "#fff", minHeight: "100vh", fontFamily: "Inter,system-ui,sans-serif" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>Deca<span style={{ color: "#3B82F6" }}>Flow</span></span>
        </a>
        {session && <button onClick={logout} style={{ ...btn, background: "rgba(255,255,255,0.08)" }}>Sign out</button>}
      </nav>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 1.25rem 5rem" }}>
        {!session && (
          <div style={{ maxWidth: "460px", margin: "3rem auto" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>Customer login</h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Enter your account email and we'll send a secure one-time login link. No passwords.
            </p>
            {verifying && <p style={{ color: "#93C5FD", fontSize: "0.88rem" }}>Verifying your login link…</p>}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <input style={input} type="email" placeholder="you@company.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && requestLink()} />
              <button style={btn} onClick={requestLink}>Send link</button>
            </div>
            {status && <p style={{ color: "#86efac", fontSize: "0.85rem", marginTop: "1rem" }}>{status}</p>}
            {error && <p style={{ color: "#fca5a5", fontSize: "0.85rem", marginTop: "1rem" }}>{error}</p>}
          </div>
        )}

        {session && account && (
          <>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.35rem" }}>{account.organization_name}</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Signed in as {account.email} · role: <strong style={{ color: "#93C5FD" }}>{account.role}</strong>
            </p>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Your products</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "0.9rem" }}>
                {PRODUCT_LINKS.map(p => (
                  <a key={p.name} href={p.href} style={{ textDecoration: "none", color: "#fff", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem" }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>{p.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", lineHeight: 1.55 }}>{p.desc}</div>
                  </a>
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", marginTop: "1rem", marginBottom: 0 }}>
                To activate an additional paid product, open its page and complete checkout with this same account email — access is linked by email and organization.
              </p>
            </div>

            {dashboard && (
              <div style={card}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.35rem" }}>Product dashboards</h2>
                {dashboard.isFounderTest && (
                  <p style={{ color: "#93C5FD", fontSize: "0.78rem", marginBottom: "1rem" }}>Founder test account — showing the same product dashboards selected in founder-control, matching paid-user access for those products.</p>
                )}

	                {dashboard.products.verify?.access && (
	                  <DashSection title="Verify API">
	                    <Stat label="Plans" value={dashboard.products.verify.records.map((r: any) => `${r.plan} (${r.status})`).join(", ") || "—"} />
	                    {dashboard.products.verify.quota && <Stat label="Monthly usage" value={`${dashboard.products.verify.quota.used.toLocaleString()} / ${dashboard.products.verify.quota.limit === null ? "unlimited" : dashboard.products.verify.quota.limit.toLocaleString()} checks`} />}
	                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                      <input style={{ ...input, flex: 1, minWidth: "220px" }} placeholder="0x... wallet to screen" value={screenWalletAddr} onChange={e => setScreenWalletAddr(e.target.value)} />
                      <button style={btn} disabled={busy === "screen"} onClick={() => act("screen", "/v1/orgs/me/verify/screen", { address: screenWalletAddr }, (d) => { setScreenResult(d.data); setScreenWalletAddr(""); })}>
                        {busy === "screen" ? "Screening…" : "Run screening"}
                      </button>
                    </div>
                    {screenResult && (
                      <p style={{ fontSize: "0.83rem", color: screenResult.recommendation === "REJECT" ? "#fca5a5" : screenResult.recommendation === "REVIEW" ? "#fcd34d" : "#86efac", marginBottom: "0.75rem" }}>
                        {short(screenResult.address)} — score {screenResult.riskScore}/100 · {screenResult.riskLevel} · {screenResult.recommendation}{screenResult.sanctionsMatch ? " · SANCTIONS MATCH" : ""}
                      </p>
                    )}
                    <MiniTable
                      headers={["Wallet", "Score", "Level", "Recommendation"]}
                      rows={dashboard.products.verify.recentScreenings.map((s: any) => [short(s.wallet_address), String(s.risk_score), s.risk_level, s.recommendation])}
                      empty="No screenings yet — run your first one above."
                    />
                  </DashSection>
                )}

                {dashboard.products.shield?.access && (
                  <DashSection title="Shield Monitoring">
                    <Stat label="Watched contracts" value={dashboard.products.shield.contracts.length ? dashboard.products.shield.contracts.map((c: any) => `${c.chain}:${short(c.address)}`).join(", ") : "None yet — add your first contract below"} />
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                      <select style={{ ...input, width: "130px" }} value={newContract.chain} onChange={e => setNewContract(p => ({ ...p, chain: e.target.value }))}>
                        {["ethereum", "arbitrum", "base", "polygon", "avalanche", "optimism"].map(c => <option key={c} value={c} style={{ background: "#1f2937" }}>{c}</option>)}
                      </select>
                      <input style={{ ...input, flex: 1, minWidth: "180px" }} placeholder="0x... contract address" value={newContract.address} onChange={e => setNewContract(p => ({ ...p, address: e.target.value }))} />
                      <input style={{ ...input, width: "150px" }} placeholder="Label" value={newContract.label} onChange={e => setNewContract(p => ({ ...p, label: e.target.value }))} />
                      <button style={btn} disabled={busy === "contract"} onClick={() => act("contract", "/v1/orgs/me/shield/contracts", newContract, () => setNewContract({ chain: "arbitrum", address: "", label: "" }))}>
                        {busy === "contract" ? "Adding…" : "Watch contract"}
                      </button>
                    </div>
                    <MiniTable
                      headers={["Severity", "Type", "Message"]}
                      rows={dashboard.products.shield.recentAlerts.map((a: any) => [a.severity, a.alert_type, String(a.message || "").slice(0, 70)])}
                      empty="No alerts yet — scans run every 15 minutes."
                    />
                    <MiniTable
                      headers={["Incident", "Severity", "Status"]}
                      rows={dashboard.products.shield.recentIncidents.map((i: any) => [String(i.title || "").slice(0, 60), i.severity, i.status])}
                      empty="No incidents."
                    />
                  </DashSection>
                )}

                {dashboard.products.agents?.access && (
                  <DashSection title="Autopilot (Agentic Compliance)">
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                      <input style={{ ...input, flex: 2, minWidth: "170px" }} placeholder="Rule name" value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} />
                      <span style={{ alignSelf: "center", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>risk score</span>
                      <select style={{ ...input, width: "70px" }} value={newRule.operator} onChange={e => setNewRule(p => ({ ...p, operator: e.target.value }))}>
                        {[">", ">=", "<", "<=", "=="].map(o => <option key={o} value={o} style={{ background: "#1f2937" }}>{o}</option>)}
                      </select>
                      <input style={{ ...input, width: "75px" }} type="number" value={newRule.threshold} onChange={e => setNewRule(p => ({ ...p, threshold: e.target.value }))} />
                      <button style={btn} disabled={busy === "rule"} onClick={() => act("rule", "/v1/agents/rules", { name: newRule.name, operator: newRule.operator, threshold: Number(newRule.threshold), action: "flag_for_review" }, () => setNewRule({ name: "", operator: ">", threshold: "80" }))}>
                        {busy === "rule" ? "Adding…" : "+ Add rule"}
                      </button>
                    </div>
                    <MiniTable
                      headers={["Rule", "Condition", "Auto"]}
                      rows={dashboard.products.agents.rules.map((r: any) => [r.name, `riskScore ${r.operator} ${r.threshold}`, r.auto_decision ? `auto-${r.auto_decision}` : "manual"])}
                      empty="No rules yet — create your first rule above."
                    />
                    <h4 style={{ fontSize: "0.82rem", fontWeight: 700, margin: "0.6rem 0 0.4rem", color: "rgba(255,255,255,0.6)" }}>Review queue</h4>
                    {dashboard.products.agents.reviewQueue.length === 0 && <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>Review queue is empty.</p>}
                    {dashboard.products.agents.reviewQueue.map((q: any) => (
                      <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.7rem", background: "rgba(255,255,255,0.03)", borderRadius: "9px", marginBottom: "0.4rem", fontSize: "0.8rem", flexWrap: "wrap" }}>
                        <span>{short(q.wallet_address)} · score {q.risk_score} ({q.risk_level}) · <span style={{ color: q.status === "pending" ? "#fcd34d" : "rgba(255,255,255,0.5)" }}>{q.status}</span></span>
                        {q.status === "pending" && account && (
                          <span style={{ display: "flex", gap: "0.4rem" }}>
                            <button style={{ ...btn, padding: "0.3rem 0.8rem", fontSize: "0.75rem", background: "rgba(34,197,94,0.2)", color: "#86efac" }} disabled={busy === `q${q.id}`}
                              onClick={() => act(`q${q.id}`, `/v1/agents/review-queue/${q.id}/decide`, { decision: "approved", reviewedBy: account.email })}>Approve</button>
                            <button style={{ ...btn, padding: "0.3rem 0.8rem", fontSize: "0.75rem", background: "rgba(239,68,68,0.2)", color: "#fca5a5" }} disabled={busy === `q${q.id}`}
                              onClick={() => act(`q${q.id}`, `/v1/agents/review-queue/${q.id}/decide`, { decision: "rejected", reviewedBy: account.email })}>Reject</button>
                          </span>
                        )}
                      </div>
                    ))}
                  </DashSection>
                )}

                {dashboard.products.institutional?.access && (
                  <DashSection title="Institutional / RWA">
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                      <input style={{ ...input, flex: 1, minWidth: "200px" }} placeholder="0x... investor wallet to attest" value={attWallet} onChange={e => setAttWallet(e.target.value)} />
                      <label style={{ alignSelf: "center", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        <input type="checkbox" checked={attAccredited} onChange={e => setAttAccredited(e.target.checked)} /> accredited
                      </label>
                      <button style={btn} disabled={busy === "attest"} onClick={() => act("attest", "/v1/orgs/me/institutional/attestations", { walletAddress: attWallet, accreditedInvestor: attAccredited, jurisdictionEligible: true }, () => setAttWallet(""))}>
                        {busy === "attest" ? "Recording…" : "Record attestation"}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                      <input style={{ ...input, flex: 1, minWidth: "200px" }} placeholder="0x... wallet to check eligibility" value={checkWallet} onChange={e => setCheckWallet(e.target.value)} />
                      <button style={btn} disabled={busy === "check"} onClick={() => act("check", "/v1/orgs/me/institutional/check-investor", { walletAddress: checkWallet }, (d) => { setCheckResult(d); setCheckWallet(""); })}>
                        {busy === "check" ? "Checking…" : "Check investor"}
                      </button>
                    </div>
                    {checkResult && (
                      <p style={{ fontSize: "0.83rem", color: checkResult.decision === "REJECT" ? "#fca5a5" : checkResult.decision === "REVIEW" ? "#fcd34d" : "#86efac", marginBottom: "0.75rem" }}>
                        Decision: {checkResult.decision}{checkResult.reasons?.length ? ` — ${checkResult.reasons.join(" ")}` : ""}
                      </p>
                    )}
                    <MiniTable
                      headers={["Wallet", "KYC", "Jurisdiction", "Accredited"]}
                      rows={dashboard.products.institutional.attestations.map((a: any) => [short(a.wallet_address), a.kyc_status, a.jurisdiction_eligible ? "eligible" : "no", a.accredited_investor ? "yes" : "no"])}
                      empty="No identity attestations yet — record your first one above."
                    />
                    <MiniTable
                      headers={["Wallet", "Decision", "Score"]}
                      rows={dashboard.products.institutional.investorChecks.map((c: any) => [short(c.wallet_address), c.decision, String(c.risk_score)])}
                      empty="No investor checks yet — run one above."
                    />
                  </DashSection>
                )}

	                {dashboard.products.compliance?.access && (
	                  <DashSection title="Compliance">
	                    <Stat label="Engagements" value={dashboard.products.compliance.records.map((r: any) => `${r.plan} (${r.status})`).join(", ") || "—"} />
	                    {dashboard.products.compliance.quota && <Stat label="Screening quota" value={`${dashboard.products.compliance.quota.used.toLocaleString()} / ${dashboard.products.compliance.quota.limit === null ? "unlimited" : dashboard.products.compliance.quota.limit.toLocaleString()} monthly checks`} />}
	                    <h4 style={{ fontSize: "0.82rem", fontWeight: 700, margin: "0.8rem 0 0.45rem", color: "rgba(255,255,255,0.6)" }}>Configurable policies</h4>
	                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
	                      <input style={{ ...input, flex: 2, minWidth: "170px" }} placeholder="Policy name" value={newPolicy.name} onChange={e => setNewPolicy(p => ({ ...p, name: e.target.value }))} />
	                      <input style={{ ...input, width: "110px" }} type="number" placeholder="Review ≥" value={newPolicy.autoReviewScore} onChange={e => setNewPolicy(p => ({ ...p, autoReviewScore: e.target.value }))} />
	                      <input style={{ ...input, width: "110px" }} type="number" placeholder="Reject ≥" value={newPolicy.autoRejectScore} onChange={e => setNewPolicy(p => ({ ...p, autoRejectScore: e.target.value }))} />
	                      <input style={{ ...input, flex: 1, minWidth: "180px" }} placeholder="Escalation email" value={newPolicy.escalationEmail} onChange={e => setNewPolicy(p => ({ ...p, escalationEmail: e.target.value }))} />
	                      <button style={btn} disabled={busy === "policy"} onClick={() => act("policy", "/v1/orgs/me/compliance/policies", { name: newPolicy.name, autoReviewScore: Number(newPolicy.autoReviewScore), autoRejectScore: Number(newPolicy.autoRejectScore), escalationEmail: newPolicy.escalationEmail || null }, () => setNewPolicy({ name: "Default AML policy", autoReviewScore: "70", autoRejectScore: "90", escalationEmail: "" }))}>Save policy</button>
	                    </div>
	                    <MiniTable
	                      headers={["Policy", "Review", "Reject", "Escalation"]}
	                      rows={(dashboard.products.compliance.policies || []).map((p: any) => [p.name, `≥ ${p.auto_review_score}`, `≥ ${p.auto_reject_score}`, p.escalation_email || "—"])}
	                      empty="No policies yet — create one above."
	                    />
	                    <h4 style={{ fontSize: "0.82rem", fontWeight: 700, margin: "0.8rem 0 0.45rem", color: "rgba(255,255,255,0.6)" }}>Case management</h4>
	                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
	                      <input style={{ ...input, flex: 1, minWidth: "190px" }} placeholder="0x... wallet" value={newCase.walletAddress} onChange={e => setNewCase(p => ({ ...p, walletAddress: e.target.value }))} />
	                      <select style={{ ...input, width: "125px" }} value={newCase.chain} onChange={e => setNewCase(p => ({ ...p, chain: e.target.value }))}>{["ethereum", "arbitrum", "base", "polygon", "avalanche", "optimism"].map(c => <option key={c} value={c} style={{ background: "#1f2937" }}>{c}</option>)}</select>
	                      <input style={{ ...input, flex: 1, minWidth: "170px" }} placeholder="Assign to email" value={newCase.assignedTo} onChange={e => setNewCase(p => ({ ...p, assignedTo: e.target.value }))} />
	                      <select style={{ ...input, width: "115px" }} value={newCase.priority} onChange={e => setNewCase(p => ({ ...p, priority: e.target.value }))}>{["normal", "high", "urgent"].map(p => <option key={p} value={p} style={{ background: "#1f2937" }}>{p}</option>)}</select>
	                      <button style={btn} disabled={busy === "case"} onClick={() => act("case", "/v1/orgs/me/compliance/cases", { ...newCase, assignedTo: newCase.assignedTo || null }, () => setNewCase({ walletAddress: "", chain: "ethereum", assignedTo: "", priority: "normal", notes: "" }))}>Open case</button>
	                    </div>
	                    <MiniTable
	                      headers={["Wallet", "Score", "Status", "Assigned", "Escalation"]}
	                      rows={(dashboard.products.compliance.cases || []).map((c: any) => [short(c.wallet_address), `${c.risk_score ?? "—"} ${c.risk_level || ""}`, c.status, c.assigned_to || "unassigned", c.escalation_state || "none"])}
	                      empty="No compliance cases yet — open one above."
	                    />
	                    {(dashboard.products.compliance.cases || []).slice(0, 5).map((c: any) => (
	                      <div key={c.id} style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
	                        <button style={{ ...btn, padding: "0.3rem 0.65rem", fontSize: "0.72rem" }} onClick={() => act(`approve${c.id}`, `/v1/orgs/me/compliance/cases/${c.id}`, { status: "closed", decision: "approved" })}>Approve</button>
	                        <button style={{ ...btn, padding: "0.3rem 0.65rem", fontSize: "0.72rem", background: "rgba(239,68,68,0.2)", color: "#fca5a5" }} onClick={() => act(`reject${c.id}`, `/v1/orgs/me/compliance/cases/${c.id}`, { status: "closed", decision: "rejected" })}>Reject</button>
	                        <button style={{ ...btn, padding: "0.3rem 0.65rem", fontSize: "0.72rem", background: "rgba(245,158,11,0.2)", color: "#fcd34d" }} onClick={() => act(`esc${c.id}`, `/v1/orgs/me/compliance/cases/${c.id}/escalate`, { escalatedTo: c.assigned_to || account.email, reason: "Escalated from customer dashboard" })}>Escalate</button>
	                      </div>
	                    ))}
	                    <button style={{ ...btn, padding: "0.45rem 0.8rem", fontSize: "0.78rem", background: "rgba(59,130,246,0.18)", color: "#93C5FD" }} onClick={exportCompliance}>Export regulator CSV</button>
	                  </DashSection>
	                )}

                {dashboard.products.audit?.access && (
                  <DashSection title="Security Audit">
                    <Stat label="Engagements" value={dashboard.products.audit.records.map((r: any) => `${r.plan} (${r.status})`).join(", ") || "—"} />
                  </DashSection>
                )}
              </div>
            )}

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>API keys</h2>
              {createdKey && (
	                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "0.9rem 1rem", marginBottom: "1rem" }}>
	                  <div style={{ fontSize: "0.8rem", color: "#86efac", marginBottom: "0.4rem" }}>Copy this key now — it will not be shown again:</div>
	                  <code style={{ fontSize: "0.78rem", wordBreak: "break-all" }}>{createdKey}</code>
	                  <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginTop: "0.45rem" }}>Expires: {formatDate(createdKeyExpiresAt)}. Create a replacement before then to keep integrations running.</div>
	                </div>
	              )}
	              <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}>
	                <input style={input} placeholder="New key name (e.g. Production Backend)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
	                <button style={btn} onClick={createKey}>Create</button>
	              </div>
	              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", marginTop: "-0.4rem" }}>
	                {keyPolicy ? `Plan: ${keyPolicy.plan}. Active keys: ${keyPolicy.activeKeyCount}/${keyPolicy.limit === null ? "unlimited" : keyPolicy.limit}. ` : ""}
	                Customer-created keys expire after 90 days. Revoke leaked keys immediately and create a replacement before expiry.
	              </p>
	              {keys.map(k => (
	                <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "9px", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
	                  <span>{k.name} <span style={{ color: k.active ? "#86efac" : "#fca5a5", fontSize: "0.75rem" }}>· {k.active ? "active" : "revoked"} · expires {formatDate(k.expires_at)}</span></span>
                  <button onClick={() => toggleKey(k.id, !k.active)} style={{ ...btn, padding: "0.35rem 0.9rem", fontSize: "0.78rem", background: k.active ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: k.active ? "#fca5a5" : "#86efac" }}>
                    {k.active ? "Revoke" : "Reactivate"}
                  </button>
                </div>
              ))}
              {!keys.length && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.83rem" }}>No API keys yet.</p>}
            </div>

            <div style={card}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Team members</h2>
              {members.map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "9px", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                  <span>{m.name || m.email} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>· {m.email}</span></span>
                  <span style={{ color: "#93C5FD", fontSize: "0.78rem" }}>{m.role} · {m.status}</span>
                </div>
              ))}
            </div>
            {error && <p style={{ color: "#fca5a5", fontSize: "0.85rem" }}>{error}</p>}
          </>
        )}
      </main>
    </div>
  );
}
