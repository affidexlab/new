import { useState } from "react";

type ProductNavProps = {
  active: "Compliance" | "Verify API" | "Shield" | "Autopilot" | "Institutional" | "Security Audit";
  ctaLabel: string;
  onCta: () => void;
};

const PRODUCT_LINKS = [
  { label: "Compliance", href: "/compliance" },
  { label: "Verify API", href: "/verify" },
  { label: "Shield", href: "/shield" },
  { label: "Autopilot", href: "/agents" },
  { label: "Institutional", href: "/institutional" },
  { label: "Security Audit", href: "/audit" },
  { label: "Sign in", href: "/login" },
];

export default function ProductNav({ active, ctaLabel, onCta }: ProductNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const runCta = () => {
    setMenuOpen(false);
    onCta();
  };

  return (
    <>
      <style>{`
        .product-nav-mobile-btn { display: none !important; }
        .product-nav-desktop { display: flex !important; }
        @media (max-width: 1060px) {
          .product-nav-mobile-btn { display: flex !important; }
          .product-nav-desktop { display: none !important; }
          .product-nav-shell { padding: 0.9rem 1rem !important; }
          .product-nav-logo { font-size: 1.15rem !important; }
        }
        @media (max-width: 640px) {
          section { padding-left: 1rem !important; padding-right: 1rem !important; }
          h1 { overflow-wrap: anywhere; }
          input, select, textarea { font-size: 16px !important; }
          .modal-inner { width: calc(100vw - 1rem) !important; max-height: 92vh !important; overflow: auto !important; }
        }
      `}</style>
      <nav
        className="product-nav-shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          background: "rgba(10,14,39,0.97)",
          backdropFilter: "blur(14px)",
          zIndex: 200,
        }}
      >
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img
            src="/logo.png"
            alt="DecaFlow"
            style={{ width: 36, height: 36, objectFit: "contain" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="product-nav-logo" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>
            Deca<span style={{ color: "#3B82F6" }}>Flow</span>
          </span>
        </a>

        <div className="product-nav-desktop" style={{ gap: "1.05rem", alignItems: "center" }}>
          {PRODUCT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                color: link.label === active ? "#3B82F6" : "rgba(255,255,255,0.68)",
                textDecoration: "none",
                fontSize: "0.86rem",
                fontWeight: link.label === active ? 700 : 500,
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={runCta}
            style={{
              background: "#3B82F6",
              color: "#fff",
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {ctaLabel}
          </button>
        </div>

        <button
          className="product-nav-mobile-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open product menu"
          aria-expanded={menuOpen}
          style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer", padding: "0.25rem" }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,14,39,0.98)",
            zIndex: 199,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            gap: "0.75rem",
            padding: "6rem 1.25rem 2rem",
            overflowY: "auto",
          }}
        >
          {PRODUCT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: link.label === active ? "#93C5FD" : "#fff",
                textDecoration: "none",
                fontSize: "1.15rem",
                fontWeight: 800,
                padding: "0.95rem 1rem",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                background: link.label === active ? "rgba(59,130,246,0.14)" : "rgba(255,255,255,0.04)",
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={runCta}
            style={{
              background: "#3B82F6",
              color: "#fff",
              padding: "1rem",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 800,
              marginTop: "0.5rem",
            }}
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </>
  );
}
