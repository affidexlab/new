import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/apiBase";

type Overview = {
  counts: Record<string, number>;
  recent: Record<string, any[]>;
  actions: Record<string, string>;
};

const cardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.75rem 0.85rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none" };
const buttonStyle: React.CSSProperties = { padding: "0.75rem 1rem", borderRadius: 10, border: 0, background: "#3B82F6", color: "#fff", fontWeight: 800, cursor: "pointer" };

function pretty(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
}

export default function FounderAdmin() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("decaflow_founder_admin_key") || "");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orgs" | "risk" | "shield" | "keys" | "ops">("overview");
  const [newOrg, setNewOrg] = useState({ name: "", ownerEmail: "", ownerName: "", scopes: "verify:check,risk:screen" });
  const [newAdminKey, setNewAdminKey] = useState({ name: "", scopes: "*" });
  const [createdSecret, setCreatedSecret] = useState("");
  const [riskLabel, setRiskLabel] = useState({ chain: "ethereum", address: "", category: "scam", label: "", severity: "high", source: "founder-dashboard", evidence: "" });

  const headers = useMemo(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` }), [adminKey]);

  const saveKey = () => {
    localStorage.setItem("decaflow_founder_admin_key", adminKey.trim());
    loadOverview();
  };

  const api = async (path: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
  };

  const loadOverview = async () => {
    if (!adminKey.trim()) return;
    setLoading(true); setError("");
    try {
      const data = await api("/v1/admin/overview");
      setOverview(data);
    } catch (err: any) {
      setError(err.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOverview(); }, []);

  const createOrg = async () => {
    const data = await api("/v1/orgs", { method: "POST", body: JSON.stringify({ name: newOrg.name, ownerEmail: newOrg.ownerEmail, ownerName: newOrg.ownerName }) });
    const key = await api(`/v1/orgs/${data.organization.id}/api-keys`, { method: "POST", body: JSON.stringify({ name: "Default API Key", scopes: newOrg.scopes.split(",").map(s => s.trim()).filter(Boolean) }) });
    setCreatedSecret(key.apiKey);
    setNewOrg({ name: "", ownerEmail: "", ownerName: "", scopes: "verify:check,risk:screen" });
    loadOverview();
  };

  const createAdminKey = async () => {
    const data = await api("/v1/admin/keys", { method: "POST", body: JSON.stringify({ name: newAdminKey.name, scopes: newAdminKey.scopes.split(",").map(s => s.trim()).filter(Boolean) }) });
    setCreatedSecret(data.adminKey);
    setNewAdminKey({ name: "", scopes: "*" });
    loadOverview();
  };

  const addRiskLabel = async () => {
    await api("/v1/risk/labels", { method: "POST", body: JSON.stringify({ ...riskLabel, confidence: 0.85, metadata: { createdFrom: "founder-dashboard" } }) });
    setRiskLabel({ chain: "ethereum", address: "", category: "scam", label: "", severity: "high", source: "founder-dashboard", evidence: "" });
    loadOverview();
  };

  const runShieldScan = async () => {
    await api("/v1/shield/scan/security", { method: "POST", body: "{}" });
    loadOverview();
  };

  const tabs = ["overview", "orgs", "risk", "shield", "keys", "ops"] as const;

  return <div style={{ minHeight: "100vh", background: "#07111f", color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}>
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#60A5FA", fontWeight: 900, letterSpacing: 1, fontSize: "0.75rem" }}>DECAFLOW FOUNDER CONTROL CENTER</div>
          <h1 style={{ margin: "0.25rem 0", fontSize: "clamp(1.8rem,4vw,3rem)" }}>Behind-the-scenes admin dashboard</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: 0 }}>Operate orgs, API keys, risk labels, Shield incidents, scans, and ops links from one private surface.</p>
        </div>
        <button onClick={loadOverview} style={buttonStyle}>{loading ? "Loading..." : "Refresh"}</button>
      </div>

      <div style={{ ...cardStyle, marginBottom: "1rem" }}>
        <label style={{ display: "block", color: "rgba(255,255,255,0.65)", fontSize: "0.8rem", marginBottom: 8 }}>Founder admin key</label>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="df_admin_..." style={{ ...inputStyle, flex: "1 1 360px" }} />
          <button onClick={saveKey} style={buttonStyle}>Save privately in this browser</button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: 0, fontSize: "0.8rem" }}>This is stored only in your browser localStorage. Do not use this dashboard on a shared computer.</p>
      </div>

      {error && <div style={{ ...cardStyle, borderColor: "rgba(239,68,68,0.4)", color: "#FCA5A5", marginBottom: "1rem" }}>{error}</div>}
      {createdSecret && <div style={{ ...cardStyle, borderColor: "rgba(34,197,94,0.45)", color: "#BBF7D0", marginBottom: "1rem" }}><strong>Copy this secret now:</strong><pre style={{ whiteSpace: "pre-wrap" }}>{createdSecret}</pre><button style={buttonStyle} onClick={() => setCreatedSecret("")}>I saved it</button></div>}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>{tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...buttonStyle, background: activeTab === tab ? "#3B82F6" : "rgba(255,255,255,0.08)" }}>{pretty(tab)}</button>)}</div>

      {activeTab === "overview" && overview && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "1rem", marginBottom: "1rem" }}>
          {Object.entries(overview.counts).map(([k, v]) => <div key={k} style={cardStyle}><div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>{pretty(k)}</div><div style={{ fontSize: "2rem", fontWeight: 900 }}>{v}</div></div>)}
        </div>
        <Recent title="Recent Shield Alerts" rows={overview.recent.alerts || []} />
        <Recent title="Recent Risk Screenings" rows={overview.recent.screenings || []} />
      </>}

      {activeTab === "orgs" && <div style={cardStyle}>
        <h2>Create organization/customer</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.75rem" }}>
          <input style={inputStyle} placeholder="Organization name" value={newOrg.name} onChange={e => setNewOrg({ ...newOrg, name: e.target.value })} />
          <input style={inputStyle} placeholder="Owner email" value={newOrg.ownerEmail} onChange={e => setNewOrg({ ...newOrg, ownerEmail: e.target.value })} />
          <input style={inputStyle} placeholder="Owner name" value={newOrg.ownerName} onChange={e => setNewOrg({ ...newOrg, ownerName: e.target.value })} />
          <input style={inputStyle} placeholder="Scopes" value={newOrg.scopes} onChange={e => setNewOrg({ ...newOrg, scopes: e.target.value })} />
        </div>
        <button onClick={createOrg} style={{ ...buttonStyle, marginTop: "0.75rem" }}>Create org + API key</button>
        {overview && <Recent title="Recent organizations" rows={overview.recent.organizations || []} />}
      </div>}

      {activeTab === "risk" && <div style={cardStyle}>
        <h2>Add DecaFlow risk label</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem" }}>
          {Object.keys(riskLabel).map(key => <input key={key} style={inputStyle} placeholder={key} value={(riskLabel as any)[key]} onChange={e => setRiskLabel({ ...riskLabel, [key]: e.target.value })} />)}
        </div>
        <button onClick={addRiskLabel} style={{ ...buttonStyle, marginTop: "0.75rem" }}>Add label</button>
      </div>}

      {activeTab === "shield" && <>
        <div style={cardStyle}><h2>Shield controls</h2><button onClick={runShieldScan} style={buttonStyle}>Run Shield security scan now</button></div>
        {overview && <Recent title="Recent incidents" rows={overview.recent.incidents || []} />}
      </>}

      {activeTab === "keys" && <div style={cardStyle}>
        <h2>Create founder/admin key</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.75rem" }}>
          <input style={inputStyle} placeholder="Key name" value={newAdminKey.name} onChange={e => setNewAdminKey({ ...newAdminKey, name: e.target.value })} />
          <input style={inputStyle} placeholder="Scopes" value={newAdminKey.scopes} onChange={e => setNewAdminKey({ ...newAdminKey, scopes: e.target.value })} />
        </div>
        <button onClick={createAdminKey} style={{ ...buttonStyle, marginTop: "0.75rem" }}>Create admin key</button>
        {overview && <Recent title="Recent admin audit logs" rows={overview.recent.auditLogs || []} />}
      </div>}

      {activeTab === "ops" && overview && <div style={cardStyle}>
        <h2>Production operations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "0.75rem" }}>
          {Object.entries(overview.actions).map(([k, url]) => <a key={k} href={url} target="_blank" rel="noreferrer" style={{ ...cardStyle, color: "#93C5FD", textDecoration: "none" }}>{pretty(k)} ↗</a>)}
        </div>
      </div>}
    </div>
  </div>;
}

function Recent({ title, rows }: { title: string; rows: any[] }) {
  return <div style={{ ...cardStyle, marginTop: "1rem", overflowX: "auto" }}>
    <h2>{title}</h2>
    {!rows.length && <p style={{ color: "rgba(255,255,255,0.5)" }}>No rows yet.</p>}
    {rows.length > 0 && <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}><tbody>{rows.map((row, i) => <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}><td style={{ padding: "0.65rem", color: "rgba(255,255,255,0.75)" }}><pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{JSON.stringify(row, null, 2)}</pre></td></tr>)}</tbody></table>}
  </div>;
}
