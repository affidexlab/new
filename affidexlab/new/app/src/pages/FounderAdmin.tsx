import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/apiBase";

type Overview = { counts: Record<string, number>; recent: Record<string, any[]>; actions: Record<string, string> };
type ProductSetting = { product_key: string; product_name: string; public_status: string; accepting_customers: boolean; priority: string; owner?: string; ops_notes?: string; public_message?: string };

type Tab = "overview" | "products" | "customers" | "members" | "keys" | "shield" | "risk" | "payments" | "audit" | "ops";

const cardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.75rem 0.85rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none" };
const buttonStyle: React.CSSProperties = { padding: "0.75rem 1rem", borderRadius: 10, border: 0, background: "#3B82F6", color: "#fff", fontWeight: 800, cursor: "pointer" };

function pretty(key: string) { return key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()); }

export default function FounderAdmin() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("decaflow_founder_admin_key") || "");
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem("decaflow_founder_admin_key")));
  const [overview, setOverview] = useState<Overview | null>(null);
  const [products, setProducts] = useState<ProductSetting[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [orgKeys, setOrgKeys] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditFilter, setAuditFilter] = useState({ principal: "", scope: "", allowed: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [newOrg, setNewOrg] = useState({ name: "", ownerEmail: "", ownerName: "", scopes: "verify:check,risk:screen" });
  const [newAdminKey, setNewAdminKey] = useState({ name: "", scopes: "*" });
  const [createdSecret, setCreatedSecret] = useState("");
  const [riskLabel, setRiskLabel] = useState({ chain: "ethereum", address: "", category: "scam", label: "", severity: "high", source: "founder-dashboard", evidence: "" });

  const headers = useMemo(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` }), [adminKey]);
  const api = async (path: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
  };

  const loadAll = async () => {
    if (!adminKey.trim()) return;
    setLoading(true); setError("");
    try {
      const [overviewData, productData, customerData, paymentData, memberData, keyData, auditData] = await Promise.all([
        api("/v1/admin/overview"), api("/v1/admin/products"), api("/v1/admin/customers"), api("/v1/admin/payments"), api("/v1/admin/members"), api("/v1/admin/org-api-keys"), api("/v1/admin/audit-logs")
      ]);
      setOverview(overviewData); setProducts(productData.products || []); setCustomers(customerData.customers || []); setPayments(paymentData.payments || []); setMembers(memberData.members || []); setOrgKeys(keyData.keys || []); setAuditLogs(auditData.logs || []);
      setAuthenticated(true); localStorage.setItem("decaflow_founder_admin_key", adminKey.trim());
    } catch (err: any) { setError(err.message || "Could not load dashboard"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authenticated) loadAll(); }, []);

  const logout = () => { localStorage.removeItem("decaflow_founder_admin_key"); setAuthenticated(false); setAdminKey(""); setOverview(null); };
  const createOrg = async () => { const data = await api("/v1/orgs", { method: "POST", body: JSON.stringify({ name: newOrg.name, ownerEmail: newOrg.ownerEmail, ownerName: newOrg.ownerName }) }); const key = await api(`/v1/orgs/${data.organization.id}/api-keys`, { method: "POST", body: JSON.stringify({ name: "Default API Key", scopes: newOrg.scopes.split(",").map(s => s.trim()).filter(Boolean) }) }); setCreatedSecret(key.apiKey); setNewOrg({ name: "", ownerEmail: "", ownerName: "", scopes: "verify:check,risk:screen" }); loadAll(); };
  const createAdminKey = async () => { const data = await api("/v1/admin/keys", { method: "POST", body: JSON.stringify({ name: newAdminKey.name, scopes: newAdminKey.scopes.split(",").map(s => s.trim()).filter(Boolean) }) }); setCreatedSecret(data.adminKey); setNewAdminKey({ name: "", scopes: "*" }); loadAll(); };
  const addRiskLabel = async () => { await api("/v1/risk/labels", { method: "POST", body: JSON.stringify({ ...riskLabel, confidence: 0.85, metadata: { createdFrom: "founder-dashboard" } }) }); setRiskLabel({ chain: "ethereum", address: "", category: "scam", label: "", severity: "high", source: "founder-dashboard", evidence: "" }); loadAll(); };
  const runShieldScan = async () => { await api("/v1/shield/scan/security", { method: "POST", body: "{}" }); loadAll(); };
  const loadAuditLogs = async () => { const q = new URLSearchParams(Object.entries(auditFilter).filter(([,v]) => v).map(([k,v]) => [k,v])); const data = await api(`/v1/admin/audit-logs?${q.toString()}`); setAuditLogs(data.logs || []); };

  const tabs: Tab[] = ["overview", "products", "customers", "members", "keys", "shield", "risk", "payments", "audit", "ops"];

  if (!authenticated) return <Shell><div style={{ ...cardStyle, maxWidth: 620, margin: "12vh auto" }}><h1>Founder login</h1><p style={{ color: "rgba(255,255,255,0.65)" }}>Paste your `df_admin_...` key. It stays in this browser only.</p><input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="df_admin_..." style={inputStyle} /><button onClick={loadAll} style={{ ...buttonStyle, marginTop: "1rem" }}>{loading ? "Checking..." : "Open founder dashboard"}</button>{error && <p style={{ color: "#FCA5A5" }}>{error}</p>}</div></Shell>;

  return <Shell><div style={{ maxWidth: 1320, margin: "0 auto", padding: "2rem 1.25rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}><div><div style={{ color: "#60A5FA", fontWeight: 900, letterSpacing: 1, fontSize: "0.75rem" }}>DECAFLOW FOUNDER CONTROL CENTER</div><h1 style={{ margin: "0.25rem 0", fontSize: "clamp(1.8rem,4vw,3rem)" }}>Internal operating console</h1><p style={{ color: "rgba(255,255,255,0.6)", margin: 0 }}>Control products, customers, members, keys, incidents, payments, risk labels, ingestion, and audit logs.</p></div><div style={{ display: "flex", gap: "0.5rem" }}><button onClick={loadAll} style={buttonStyle}>{loading ? "Loading..." : "Refresh"}</button><button onClick={logout} style={{ ...buttonStyle, background: "rgba(239,68,68,0.75)" }}>Lock</button></div></div>
    {error && <div style={{ ...cardStyle, borderColor: "rgba(239,68,68,0.4)", color: "#FCA5A5", marginBottom: "1rem" }}>{error}</div>}
    {createdSecret && <div style={{ ...cardStyle, borderColor: "rgba(34,197,94,0.45)", color: "#BBF7D0", marginBottom: "1rem" }}><strong>Copy this secret now:</strong><pre style={{ whiteSpace: "pre-wrap" }}>{createdSecret}</pre><button style={buttonStyle} onClick={() => setCreatedSecret("")}>I saved it</button></div>}
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>{tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...buttonStyle, background: activeTab === tab ? "#3B82F6" : "rgba(255,255,255,0.08)" }}>{pretty(tab)}</button>)}</div>

    {activeTab === "overview" && overview && <><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "1rem", marginBottom: "1rem" }}>{Object.entries(overview.counts).map(([k, v]) => <div key={k} style={cardStyle}><div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>{pretty(k)}</div><div style={{ fontSize: "2rem", fontWeight: 900 }}>{v}</div></div>)}</div><Recent title="Recent Shield Alerts" rows={overview.recent.alerts || []} /><Recent title="Recent Risk Screenings" rows={overview.recent.screenings || []} /></>}
    {activeTab === "products" && <Grid>{products.map(product => <ProductCard key={product.product_key} product={product} api={api} reload={loadAll} />)}</Grid>}
    {activeTab === "customers" && <Recent title="Customers, orgs, and enquiries" rows={customers} />}
    {activeTab === "payments" && <Recent title="NOWPayments / customer payment records" rows={payments} />}
    {activeTab === "members" && <><div style={cardStyle}><h2>Create organization/customer</h2><FieldGrid><input style={inputStyle} placeholder="Organization name" value={newOrg.name} onChange={e => setNewOrg({ ...newOrg, name: e.target.value })} /><input style={inputStyle} placeholder="Owner email" value={newOrg.ownerEmail} onChange={e => setNewOrg({ ...newOrg, ownerEmail: e.target.value })} /><input style={inputStyle} placeholder="Owner name" value={newOrg.ownerName} onChange={e => setNewOrg({ ...newOrg, ownerName: e.target.value })} /><input style={inputStyle} placeholder="Scopes" value={newOrg.scopes} onChange={e => setNewOrg({ ...newOrg, scopes: e.target.value })} /></FieldGrid><button onClick={createOrg} style={{ ...buttonStyle, marginTop: "0.75rem" }}>Create org + API key</button></div><EditableMembers rows={members} api={api} reload={loadAll} /></>}
    {activeTab === "keys" && <><div style={cardStyle}><h2>Create founder/admin key</h2><FieldGrid><input style={inputStyle} placeholder="Key name" value={newAdminKey.name} onChange={e => setNewAdminKey({ ...newAdminKey, name: e.target.value })} /><input style={inputStyle} placeholder="Scopes" value={newAdminKey.scopes} onChange={e => setNewAdminKey({ ...newAdminKey, scopes: e.target.value })} /></FieldGrid><button onClick={createAdminKey} style={{ ...buttonStyle, marginTop: "0.75rem" }}>Create admin key</button></div><ApiKeys rows={orgKeys} api={api} reload={loadAll} /></>}
    {activeTab === "shield" && <><div style={cardStyle}><h2>Shield controls</h2><button onClick={runShieldScan} style={buttonStyle}>Run Shield security scan now</button></div><EditableIncidents rows={overview?.recent.incidents || []} api={api} reload={loadAll} /></>}
    {activeTab === "risk" && <div style={cardStyle}><h2>Add DecaFlow risk label</h2><FieldGrid>{Object.keys(riskLabel).map(key => <input key={key} style={inputStyle} placeholder={key} value={(riskLabel as any)[key]} onChange={e => setRiskLabel({ ...riskLabel, [key]: e.target.value })} />)}</FieldGrid><button onClick={addRiskLabel} style={{ ...buttonStyle, marginTop: "0.75rem" }}>Add label</button></div>}
    {activeTab === "audit" && <div style={cardStyle}><h2>Audit log filters</h2><FieldGrid><input style={inputStyle} placeholder="principal contains" value={auditFilter.principal} onChange={e => setAuditFilter({ ...auditFilter, principal: e.target.value })} /><input style={inputStyle} placeholder="scope exact" value={auditFilter.scope} onChange={e => setAuditFilter({ ...auditFilter, scope: e.target.value })} /><select style={inputStyle} value={auditFilter.allowed} onChange={e => setAuditFilter({ ...auditFilter, allowed: e.target.value })}><option value="">allowed: any</option><option value="true">allowed only</option><option value="false">denied only</option></select></FieldGrid><button onClick={loadAuditLogs} style={{ ...buttonStyle, marginTop: "0.75rem" }}>Apply filters</button><Recent title="Admin audit logs" rows={auditLogs} /></div>}
    {activeTab === "ops" && overview && <div style={cardStyle}><h2>Production operations and ingestion run history</h2><p style={{ color: "rgba(255,255,255,0.6)" }}>GitHub keeps the authoritative ingestion and scanner run history. These links open the exact run pages.</p><Grid>{Object.entries(overview.actions).map(([k, url]) => <a key={k} href={url} target="_blank" rel="noreferrer" style={{ ...cardStyle, color: "#93C5FD", textDecoration: "none" }}>{pretty(k)} ↗</a>)}</Grid></div>}
  </div></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) { return <div style={{ minHeight: "100vh", background: "#07111f", color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}>{children}</div>; }
function Grid({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "1rem" }}>{children}</div>; }
function FieldGrid({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.75rem" }}>{children}</div>; }

function ProductCard({ product, api, reload }: { product: ProductSetting; api: (path: string, options?: RequestInit) => Promise<any>; reload: () => void }) {
  const [draft, setDraft] = useState({ publicStatus: product.public_status, acceptingCustomers: product.accepting_customers, priority: product.priority, owner: product.owner || "", opsNotes: product.ops_notes || "", publicMessage: product.public_message || "" });
  const save = async () => { await api(`/v1/admin/products/${product.product_key}`, { method: "PATCH", body: JSON.stringify(draft) }); await reload(); };
  return <div style={cardStyle}><h2>{product.product_name}</h2><p style={{ color: "rgba(255,255,255,0.5)" }}>{product.product_key}</p><FieldGrid><select style={inputStyle} value={draft.publicStatus} onChange={e => setDraft({ ...draft, publicStatus: e.target.value })}>{['active','beta','pre-production','paused','internal-only'].map(v => <option key={v} value={v}>{v}</option>)}</select><select style={inputStyle} value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value })}>{['high','normal','low'].map(v => <option key={v} value={v}>{v}</option>)}</select><input style={inputStyle} value={draft.owner} placeholder="Owner" onChange={e => setDraft({ ...draft, owner: e.target.value })} /></FieldGrid><label style={{ display: "block", margin: "0.75rem 0" }}><input type="checkbox" checked={draft.acceptingCustomers} onChange={e => setDraft({ ...draft, acceptingCustomers: e.target.checked })} /> Accepting customers</label><textarea style={{ ...inputStyle, minHeight: 70 }} value={draft.publicMessage} placeholder="Public message" onChange={e => setDraft({ ...draft, publicMessage: e.target.value })} /><textarea style={{ ...inputStyle, minHeight: 90, marginTop: "0.65rem" }} value={draft.opsNotes} placeholder="Internal ops notes" onChange={e => setDraft({ ...draft, opsNotes: e.target.value })} /><button style={{ ...buttonStyle, marginTop: "0.75rem" }} onClick={save}>Save</button></div>;
}

function EditableMembers({ rows, api, reload }: { rows: any[]; api: (path: string, options?: RequestInit) => Promise<any>; reload: () => void }) {
  const update = async (id: number, body: any) => { await api(`/v1/admin/members/${id}`, { method: "PATCH", body: JSON.stringify(body) }); reload(); };
  return <DataTable title="Members and roles" rows={rows} actions={(row) => <><select style={inputStyle} defaultValue={row.role} onChange={e => update(row.id, { role: e.target.value })}>{['owner','admin','analyst','viewer','billing'].map(r => <option key={r} value={r}>{r}</option>)}</select><button style={{ ...buttonStyle, background: row.status === 'active' ? '#DC2626' : '#16A34A' }} onClick={() => update(row.id, { status: row.status === 'active' ? 'disabled' : 'active' })}>{row.status === 'active' ? 'Disable' : 'Enable'}</button></>} />;
}

function ApiKeys({ rows, api, reload }: { rows: any[]; api: (path: string, options?: RequestInit) => Promise<any>; reload: () => void }) {
  const revoke = async (id: number, active: boolean) => { await api(`/v1/admin/org-api-keys/${id}`, { method: "PATCH", body: JSON.stringify({ active }) }); reload(); };
  return <DataTable title="Organization API keys" rows={rows} actions={(row) => <button style={{ ...buttonStyle, background: row.active ? '#DC2626' : '#16A34A' }} onClick={() => revoke(row.id, !row.active)}>{row.active ? 'Revoke' : 'Reactivate'}</button>} />;
}

function EditableIncidents({ rows, api, reload }: { rows: any[]; api: (path: string, options?: RequestInit) => Promise<any>; reload: () => void }) {
  const update = async (id: number, body: any) => { await api(`/v1/admin/shield-incidents/${id}`, { method: "PATCH", body: JSON.stringify(body) }); reload(); };
  return <DataTable title="Shield incidents" rows={rows} actions={(row) => <><select style={inputStyle} defaultValue={row.status} onChange={e => update(row.id, { status: e.target.value })}>{['triage','investigating','resolved','closed'].map(s => <option key={s} value={s}>{s}</option>)}</select><input style={inputStyle} placeholder="Assign to" defaultValue={row.assigned_to || ''} onBlur={e => e.target.value && update(row.id, { assignedTo: e.target.value })} /></>} />;
}

function DataTable({ title, rows, actions }: { title: string; rows: any[]; actions?: (row: any) => React.ReactNode }) {
  return <div style={{ ...cardStyle, marginTop: "1rem", overflowX: "auto" }}><h2>{title}</h2>{!rows.length && <p style={{ color: "rgba(255,255,255,0.5)" }}>No rows yet.</p>}{rows.length > 0 && <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}><tbody>{rows.map((row, i) => <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)", verticalAlign: "top" }}><td style={{ padding: "0.65rem", color: "rgba(255,255,255,0.75)", minWidth: 520 }}><pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{JSON.stringify(row, null, 2)}</pre></td>{actions && <td style={{ padding: "0.65rem", minWidth: 220, display: "grid", gap: "0.5rem" }}>{actions(row)}</td>}</tr>)}</tbody></table>}</div>;
}
function Recent({ title, rows }: { title: string; rows: any[] }) { return <DataTable title={title} rows={rows} />; }
