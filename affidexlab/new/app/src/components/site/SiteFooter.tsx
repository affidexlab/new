import "../../styles/brand.css";

const COLS: { title: string; links: [string, string][] }[] = [
  {
    title: "Products",
    links: [
      ["Compliance", "/compliance"],
      ["Verify API", "/verify"],
      ["Security Audit", "/audit"],
      ["Shield", "/shield"],
      ["Autopilot", "/agents"],
      ["Institutional", "/institutional"],
    ],
  },
  {
    title: "Developers",
    links: [
      ["Documentation", "https://docs.decaflow.xyz"],
      ["Get a free API key", "/verify"],
      ["MEV protection SDK", "https://www.npmjs.com/package/@decaflow/privacy-sdk"],
      ["GitHub", "https://github.com/affidexlab/new"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Pricing", "/#products"],
      ["Contact us", "/contact"],
      ["Partnerships", "mailto:partnership@decaflow.xyz"],
      ["X / Twitter", "https://x.com/decaflowprotocol"],
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="df df-footer">
      <div className="df-wrap">
        <div className="df-footer-grid">
          <div>
            <div style={{ fontFamily: "var(--df-display)", fontWeight: 700, fontSize: "1.35rem", color: "#fff", marginBottom: "0.75rem" }}>DecaFlow</div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.65, maxWidth: "20rem" }}>
              Wallet screening, compliance tools and contract security for crypto businesses.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4>{c.title}</h4>
              <ul>
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--df-line-dark)", padding: "1.5rem 0 2.25rem", fontSize: "0.82rem" }}>
          © 2026 DecaFlow Solutions Limited. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
