import { useEffect, useState } from "react";
import { API_BASE } from "../lib/apiBase";

type ProductStatus = {
  productKey: string;
  productName: string;
  publicStatus: string;
  acceptingCustomers: boolean;
  publicMessage?: string;
};

const blockedStatuses = new Set(["paused", "internal-only"]);

export default function ProductGate({ productKey, children }: { productKey: string; children: React.ReactNode }) {
  const [product, setProduct] = useState<ProductStatus | null>(null);
  const [failedOpen, setFailedOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/v1/products/status/${productKey}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`status ${res.status}`)))
      .then(data => { if (alive && data.success) setProduct(data.product); })
      .catch(() => { if (alive) setFailedOpen(true); });
    return () => { alive = false; };
  }, [productKey]);

  if (failedOpen || !product) return <>{children}</>;

  if (blockedStatuses.has(product.publicStatus) || !product.acceptingCustomers) {
    return <div style={{ minHeight: "100vh", background: "#07111f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 680, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: "2rem", textAlign: "center" }}>
        <div style={{ color: "#60A5FA", fontWeight: 900, letterSpacing: 1, fontSize: "0.75rem", marginBottom: "0.75rem" }}>DECAFLOW PRODUCT STATUS</div>
        <h1 style={{ margin: 0, fontSize: "clamp(1.7rem,4vw,2.6rem)" }}>{product.productName} is not accepting new customers right now</h1>
        <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginTop: "1rem" }}>{product.publicMessage || "This product is temporarily paused while the DecaFlow team updates availability."}</p>
        <a href="/contact" style={{ display: "inline-block", marginTop: "1rem", background: "#3B82F6", color: "#fff", textDecoration: "none", padding: "0.85rem 1.2rem", borderRadius: 12, fontWeight: 800 }}>Contact DecaFlow</a>
      </div>
    </div>;
  }

  const shouldWarn = product.publicStatus === "beta" || product.publicStatus === "pre-production";
  return <>
    {shouldWarn && <div style={{ background: product.publicStatus === "pre-production" ? "#7C2D12" : "#1E3A8A", color: "#fff", padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: 700 }}>
      {product.productName}: {product.publicMessage || `Currently ${product.publicStatus}.`}
    </div>}
    {children}
  </>;
}
