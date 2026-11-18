import { useEffect, useRef, useState } from "react";
import "../../styles/brand.css";

export const PRODUCT_MENU = [
  { label: "Compliance", href: "/compliance", desc: "Screen wallets, work review cases, keep an audit trail.", tag: "" },
  { label: "Verify API", href: "/verify", desc: "One API call per wallet. 1,000 free checks a month.", tag: "Free tier" },
  { label: "Security Audit", href: "/audit", desc: "Get your smart contracts reviewed before launch.", tag: "" },
  { label: "Shield", href: "/shield", desc: "Keep watching deployed contracts after the audit.", tag: "Early access" },
  { label: "Autopilot", href: "/agents", desc: "Rules that send risky activity to a human reviewer.", tag: "" },
  { label: "Institutional", href: "/institutional", desc: "Identity and transfer rules for tokenized assets.", tag: "In development" },
];

export type SiteNavCta = { label: string; href?: string; onClick?: () => void };

type Props = {
  /** label of the current product page, to mark it in the menu */
  active?: string;
  cta?: SiteNavCta;
};

function Logo() {
  return (
    <a href="/" aria-label="DecaFlow home" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="none" stroke="rgba(164,174,224,0.35)" />
        <path d="M16 16 L7 9 M16 16 L25 11 M16 16 L22 25" stroke="#39e1c9" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="7" cy="9" r="2.4" fill="#222d73" stroke="#a4aee0" />
        <circle cx="25" cy="11" r="2.4" fill="#222d73" stroke="#a4aee0" />
        <circle cx="22" cy="25" r="2.4" fill="#222d73" stroke="#a4aee0" />
        <circle cx="16" cy="16" r="4.2" fill="#4c86ff" stroke="#fff" strokeWidth="1.5" />
      </svg>
      <span style={{ fontFamily: "var(--df-display)", fontWeight: 700, fontSize: "1.3rem", letterSpacing: "-0.02em", color: "#fff" }}>
        DecaFlow
      </span>
    </a>
  );
}

export default function SiteNav({ active, cta }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen && !sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); setSheetOpen(false); }
    };
    const onClick = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [menuOpen, sheetOpen]);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  const ctaNode = (cls: string, onAfter?: () => void) =>
    cta?.onClick ? (
      <button type="button" className={cls} onClick={() => { onAfter?.(); cta.onClick?.(); }}>{cta.label}</button>
    ) : (
      <a className={cls} href={cta?.href || "/#check"} onClick={onAfter}>{cta?.label || "Check a wallet free"}</a>
    );

  return (
    <header className="df df-nav">
      <div className="df-wrap df-nav-inner">
        <Logo />

        <nav aria-label="Main" className="df-nav-links" ref={menuRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="df-nav-link"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={() => setMenuOpen((v) => !v)}
          >
            Products
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <a className="df-nav-link" href="/#products">Pricing</a>
          <a className="df-nav-link" href="https://docs.decaflow.xyz" target="_blank" rel="noopener noreferrer">Docs</a>

          {menuOpen && (
            <div className="df-menu" role="menu">
              {PRODUCT_MENU.map((p) => (
                <a key={p.href} href={p.href} role="menuitem" aria-current={active === p.label ? "page" : undefined}>
                  <div className="df-menu-title">
                    {p.label}
                    {p.tag && <span className="df-tag">{p.tag}</span>}
                  </div>
                  <div className="df-menu-desc">{p.desc}</div>
                </a>
              ))}
            </div>
          )}
        </nav>

        <div className="df-nav-actions">
          <a className="df-nav-link df-hide-sm" href="/login">Sign in</a>
          <span className="df-hide-sm">{ctaNode("df-btn df-btn-primary")}</span>
          <button
            type="button"
            className="df-burger"
            aria-label={sheetOpen ? "Close menu" : "Open menu"}
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {sheetOpen
                ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                : <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {sheetOpen && (
        <div className="df-sheet">
          {PRODUCT_MENU.map((p) => (
            <a key={p.href} className="df-sheet-link" href={p.href} onClick={() => setSheetOpen(false)}>
              {p.label}
              <small>{p.desc}</small>
            </a>
          ))}
          <a className="df-sheet-link" href="/#products" onClick={() => setSheetOpen(false)}>Pricing</a>
          <a className="df-sheet-link" href="/login" onClick={() => setSheetOpen(false)}>Sign in</a>
          <div style={{ marginTop: "1.5rem" }}>{ctaNode("df-btn df-btn-primary", () => setSheetOpen(false))}</div>
        </div>
      )}
    </header>
  );
}
