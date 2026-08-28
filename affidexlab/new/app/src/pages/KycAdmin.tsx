/**
 * DecaFlow KYC Admin Page
 * Review queue for KYC/KYB/Accreditation applications
 */

import { useEffect, useState } from "react";
import { API_BASE } from "../lib/apiBase";

const cardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1rem" };
const inputStyle: React.CSSProperties = { padding: "0.65rem 0.8rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none" };
const buttonStyle: React.CSSProperties = { padding: "0.65rem 1rem", borderRadius: 10, border: 0, fontWeight: 700, cursor: "pointer" };

type Application = {
  application_id: string;
  email: string;
  wallet_address?: string;
  application_type: string;
  full_name: string;
  country?: string;
  status: string;
  created_at: string;
  document_count?: number;
  documents?: { type: string; status: string }[];
};

export default function KycAdmin() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("decaflow_founder_admin_key") || "");
  const [authenticated, setAuthenticated] = useState(false);
  const [queue, setQueue] = useState<Application[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [fullApp, setFullApp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState({ action: "approved", notes: "", rejectionReason: "", additionalInfo: "" });
  const [statusFilter, setStatusFilter] = useState("documents_submitted");

  useEffect(() => { document.title = "KYC Admin — DecaFlow"; }, []);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` };

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const [queueRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/v1/kyc/admin/queue?status=${statusFilter}`, { headers }),
        fetch(`${API_BASE}/v1/kyc/admin/stats`, { headers })
      ]);
      const queueData = await queueRes.json();
      const statsData = await statsRes.json();
      if (!queueRes.ok) throw new Error(queueData.error || "Failed to load queue");
      setQueue(queueData.queue || []);
      setStats(statsData.stats || null);
      setAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const loadFullApplication = async (appId: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/kyc/admin/applications/${appId}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load application");
      setFullApp(data.application);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submitReview = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/kyc/admin/applications/${selected.application_id}/review`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          decision: decision.action,
          reviewNotes: decision.notes,
          rejectionReason: decision.action === "rejected" ? decision.rejectionReason : null,
          additionalInfoRequired: decision.action === "additional_info_required" ? decision.additionalInfo : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");
      setSelected(null);
      setFullApp(null);
      setDecision({ action: "approved", notes: "", rejectionReason: "", additionalInfo: "" });
      loadQueue();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#07111f", color: "#fff", fontFamily: "Inter, system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...cardStyle, maxWidth: 500, width: "100%" }}>
          <h1 style={{ margin: "0 0 1rem" }}>KYC Admin Login</h1>
          <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="df_admin_..." style={{ ...inputStyle, width: "100%", marginBottom: "0.75rem" }} />
          <button onClick={loadQueue} style={{ ...buttonStyle, background: "#3B82F6", color: "#fff", width: "100%" }}>{loading ? "Loading..." : "Access KYC Queue"}</button>
          {error && <p style={{ color: "#FCA5A5", marginTop: "0.75rem" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#07111f", color: "#fff", fontFamily: "Inter, system-ui, sans-serif", padding: "2rem 1.25rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ color: "#60A5FA", fontWeight: 900, letterSpacing: 1, fontSize: "0.75rem" }}>DECAFLOW KYC PROVIDER</div>
            <h1 style={{ margin: "0.25rem 0", fontSize: "clamp(1.6rem,3.5vw,2.5rem)" }}>KYC Review Queue</h1>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, minWidth: 180 }}>
              <option value="documents_submitted">Documents Submitted</option>
              <option value="pending_documents">Pending Documents</option>
              <option value="under_review">Under Review</option>
              <option value="additional_info_required">Additional Info Required</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={loadQueue} style={{ ...buttonStyle, background: "#3B82F6", color: "#fff" }}>{loading ? "..." : "Refresh"}</button>
          </div>
        </div>

        {error && <div style={{ ...cardStyle, borderColor: "rgba(239,68,68,0.4)", color: "#FCA5A5", marginBottom: "1rem" }}>{error}</div>}

        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {Object.entries(stats.kyc || {}).map(([k, v]) => (
              <div key={k} style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{String(v)}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "1rem" }}>
          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 1rem" }}>Applications ({queue.length})</h2>
            {queue.length === 0 && <p style={{ color: "rgba(255,255,255,0.5)" }}>No applications in this status.</p>}
            {queue.map(app => (
              <div
                key={app.application_id}
                onClick={() => { setSelected(app); loadFullApplication(app.application_id); }}
                style={{
                  padding: "0.75rem",
                  background: selected?.application_id === app.application_id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                  marginBottom: "0.5rem",
                  cursor: "pointer",
                  border: selected?.application_id === app.application_id ? "1px solid rgba(59,130,246,0.5)" : "1px solid transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{app.full_name}</strong>
                  <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: 6, background: app.application_type === "business" ? "rgba(168,85,247,0.2)" : "rgba(59,130,246,0.2)", color: app.application_type === "business" ? "#C4B5FD" : "#93C5FD" }}>
                    {app.application_type.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginTop: "0.25rem" }}>{app.email}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>
                  {app.document_count || 0} documents · {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={cardStyle}>
              <h2 style={{ margin: "0 0 1rem" }}>Review: {selected.full_name}</h2>
              
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                  <strong>Email:</strong> {selected.email}<br />
                  <strong>Wallet:</strong> {selected.wallet_address || "Not provided"}<br />
                  <strong>Country:</strong> {selected.country || "Not specified"}<br />
                  <strong>Type:</strong> {selected.application_type}<br />
                  <strong>Status:</strong> {selected.status}
                </div>
              </div>

              {fullApp?.documents && (
                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "0.9rem", margin: "0 0 0.5rem" }}>Documents</h3>
                  {fullApp.documents.map((doc: any, i: number) => (
                    <div key={i} style={{ padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: "0.35rem", fontSize: "0.8rem" }}>
                      <strong>{doc.document_type}</strong> — {doc.status}
                      {doc.document_url?.startsWith("data:") && (
                        <a href={doc.document_url} target="_blank" rel="noreferrer" style={{ marginLeft: "0.5rem", color: "#60A5FA" }}>View</a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {fullApp?.accreditationClaims?.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "0.9rem", margin: "0 0 0.5rem" }}>Accreditation Claims</h3>
                  {fullApp.accreditationClaims.map((claim: any, i: number) => (
                    <div key={i} style={{ padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: "0.35rem", fontSize: "0.8rem" }}>
                      <strong>{claim.accreditation_basis}</strong> — {claim.status}
                      {claim.claimed_amount && <span> · ${claim.claimed_amount}</span>}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", marginTop: "1rem" }}>
                <h3 style={{ fontSize: "0.9rem", margin: "0 0 0.75rem" }}>Decision</h3>
                <select value={decision.action} onChange={e => setDecision({ ...decision, action: e.target.value })} style={{ ...inputStyle, width: "100%", marginBottom: "0.65rem" }}>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="additional_info_required">Request Additional Info</option>
                </select>
                <textarea
                  value={decision.notes}
                  onChange={e => setDecision({ ...decision, notes: e.target.value })}
                  placeholder="Review notes..."
                  style={{ ...inputStyle, width: "100%", minHeight: 70, marginBottom: "0.65rem", resize: "vertical" }}
                />
                {decision.action === "rejected" && (
                  <textarea
                    value={decision.rejectionReason}
                    onChange={e => setDecision({ ...decision, rejectionReason: e.target.value })}
                    placeholder="Rejection reason (will be sent to applicant)"
                    style={{ ...inputStyle, width: "100%", minHeight: 50, marginBottom: "0.65rem", resize: "vertical" }}
                  />
                )}
                {decision.action === "additional_info_required" && (
                  <textarea
                    value={decision.additionalInfo}
                    onChange={e => setDecision({ ...decision, additionalInfo: e.target.value })}
                    placeholder="What additional information is needed?"
                    style={{ ...inputStyle, width: "100%", minHeight: 50, marginBottom: "0.65rem", resize: "vertical" }}
                  />
                )}
                <button
                  onClick={submitReview}
                  disabled={loading}
                  style={{
                    ...buttonStyle,
                    width: "100%",
                    background: decision.action === "approved" ? "#16A34A" : decision.action === "rejected" ? "#DC2626" : "#D97706",
                    color: "#fff",
                  }}
                >
                  {loading ? "Submitting..." : `Submit: ${decision.action.replace(/_/g, " ").toUpperCase()}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
