import SiteNav from "./site/SiteNav";

type ProductNavProps = {
  active: "Compliance" | "Verify API" | "Shield" | "Autopilot" | "Institutional" | "Security Audit";
  ctaLabel: string;
  onCta: () => void;
};

/**
 * Product pages share the same navigation as the home page, so a visitor always
 * sees the same menu, the same sign-in link and one clear call to action.
 */
export default function ProductNav({ active, ctaLabel, onCta }: ProductNavProps) {
  return (
    <>
      {/* Mobile layout fixes the product pages have relied on since before the nav redesign. */}
      <style>{`
        @media (max-width: 640px) {
          section { padding-left: 1rem !important; padding-right: 1rem !important; }
          h1 { overflow-wrap: anywhere; }
          input, select, textarea { font-size: 16px !important; }
          .modal-inner { width: calc(100vw - 1rem) !important; max-height: 92vh !important; overflow: auto !important; }
        }
      `}</style>
      <SiteNav active={active} cta={{ label: ctaLabel, onClick: onCta }} />
    </>
  );
}
