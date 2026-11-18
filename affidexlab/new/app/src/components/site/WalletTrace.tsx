import { useMemo } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export type TraceTone = "ok" | "warn" | "bad" | null;

type Props = {
  /** null = illustration mode (no real result yet) */
  tone: TraceTone;
  address?: string;
  chipText: string;
  /** change this to replay the entrance sequence */
  playKey: string | number;
};

const W = 600;
const H = 520;
const CX = 300;
const CY = 260;

type Pt = { x: number; y: number };

const polar = (deg: number, r: number): Pt => ({
  x: CX + Math.cos((deg * Math.PI) / 180) * r,
  y: CY + Math.sin((deg * Math.PI) / 180) * r,
});

// Hop 1: five counterparties. Hop 2: their counterparties. Fixed so the picture is stable.
const HOP1_ANGLES = [-158, -86, -14, 62, 138];
const HOP2_PER_PARENT = [1, 1, 2, 2, 1];
const HOP1_R = 128;
const HOP2_R = 228;

function curve(a: Pt, b: Pt, bend = 14): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

const TONE_COLOR: Record<Exclude<TraceTone, null>, string> = {
  ok: "var(--df-ok)",
  warn: "var(--df-warn)",
  bad: "var(--df-bad)",
};

const shortAddr = (a?: string) => (a && a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || "");

export default function WalletTrace({ tone, address, chipText, playKey }: Props) {
  const reduced = usePrefersReducedMotion();

  const graph = useMemo(() => {
    const hop1 = HOP1_ANGLES.map((deg) => ({ deg, p: polar(deg, HOP1_R) }));
    const hop2: { parent: number; p: Pt }[] = [];
    hop1.forEach((h, i) => {
      const n = HOP2_PER_PARENT[i];
      for (let k = 0; k < n; k += 1) {
        const off = n === 1 ? 0 : (k === 0 ? -15 : 15);
        hop2.push({ parent: i, p: polar(h.deg + off, HOP2_R) });
      }
    });
    return { hop1, hop2 };
  }, []);

  // The highlighted route goes through hop-1 node #1 to the first of its children.
  const hotParent = 1;
  const hotChildIdx = graph.hop2.findIndex((n) => n.parent === hotParent);
  const hotColor = tone ? TONE_COLOR[tone] : "var(--df-bad)";
  const showHot = tone === null || tone === "warn" || tone === "bad";
  const centerColor = tone ? TONE_COLOR[tone] : "var(--df-signal)";

  const hotA = graph.hop1[hotParent].p;
  const hotB = graph.hop2[hotChildIdx].p;
  const chipW = Math.max(chipText.length * 7.4 + 28, 120);
  // Put the label beside the highlighted node (never on top of it), on whichever side has room.
  const chipY = hotB.y;
  const chipX = hotB.x + 18 + chipW / 2 <= W - 6 ? hotB.x + 18 + chipW / 2 : hotB.x - 18 - chipW / 2;

  return (
    <svg
      key={playKey}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={
        tone === null
          ? "Illustration: a wallet connected to its counterparties across several hops, with one risky route highlighted"
          : `Wallet trace result: ${chipText}`
      }
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
    >
      {/* hop 1 edges */}
      {graph.hop1.map((h, i) => (
        <path
          key={`e1-${i}`}
          d={curve({ x: CX, y: CY }, h.p, i % 2 ? 10 : -10)}
          pathLength={1}
          className="trace-edge"
          data-ok={tone === "ok" ? 1 : undefined}
          style={{ animationDelay: `${0.15 + i * 0.12}s` }}
        />
      ))}
      {/* hop 2 edges */}
      {graph.hop2.map((n, i) => (
        <path
          key={`e2-${i}`}
          d={curve(graph.hop1[n.parent].p, n.p, i % 2 ? 8 : -8)}
          pathLength={1}
          className="trace-edge"
          data-ok={tone === "ok" ? 1 : undefined}
          style={{ animationDelay: `${0.95 + i * 0.1}s`, strokeWidth: 1.1 }}
        />
      ))}

      {/* highlighted route */}
      {showHot && (
        <>
          <path d={curve({ x: CX, y: CY }, hotA, -10)} pathLength={1} className="trace-edge" data-hot={1}
            style={{ animationDelay: "1.9s", stroke: hotColor }} />
          <path d={curve(hotA, hotB, -8)} pathLength={1} className="trace-edge" data-hot={1}
            style={{ animationDelay: "2.2s", stroke: hotColor }} />
        </>
      )}

      {/* flowing packets (skipped for reduced motion) */}
      {!reduced && (
        <g>
          {graph.hop1.map((h, i) => (
            <circle key={`p1-${i}`} r={2.6} fill="var(--df-trace)" opacity={0.9}>
              <animateMotion dur={`${3.4 + i * 0.5}s`} begin={`${2.6 + i * 0.35}s`} repeatCount="indefinite"
                path={curve({ x: CX, y: CY }, h.p, i % 2 ? 10 : -10)} />
            </circle>
          ))}
          {showHot && (
            <circle r={3.4} fill={hotColor}>
              <animateMotion dur="2.4s" begin="2.8s" repeatCount="indefinite"
                path={`${curve({ x: CX, y: CY }, hotA, -10)} ${curve(hotA, hotB, -8).replace(/^M[\d. ]+/, "")}`} />
            </circle>
          )}
        </g>
      )}

      {/* hop 2 nodes */}
      {graph.hop2.map((n, i) => {
        const hot = showHot && i === hotChildIdx;
        return (
          <g key={`n2-${i}`}>
            {hot && !reduced && (
              <circle cx={n.p.x} cy={n.p.y} r={9} fill="none" stroke={hotColor} strokeWidth={2} className="trace-pulse"
                style={{ animationDelay: "2.6s" }} />
            )}
            <circle cx={n.p.x} cy={n.p.y} r={hot ? 9 : 6} className="trace-node"
              fill={hot ? hotColor : "var(--df-ink-3)"} stroke={hot ? "#fff" : "rgba(164,174,224,0.45)"} strokeWidth={hot ? 2 : 1.2}
              style={{ animationDelay: `${1.5 + i * 0.1}s` }} />
          </g>
        );
      })}

      {/* hop 1 nodes */}
      {graph.hop1.map((h, i) => (
        <circle key={`n1-${i}`} cx={h.p.x} cy={h.p.y} r={9} className="trace-node"
          fill="var(--df-ink-3)" stroke="rgba(164,174,224,0.6)" strokeWidth={1.4}
          style={{ animationDelay: `${0.7 + i * 0.12}s` }} />
      ))}

      {/* centre wallet */}
      <circle cx={CX} cy={CY} r={34} fill="none" stroke={centerColor} strokeOpacity={0.35} strokeWidth={1.5} className="trace-node" />
      <circle cx={CX} cy={CY} r={24} className="trace-node" fill={centerColor} stroke="#fff" strokeWidth={2.5} />
      <text x={CX} y={CY + 56} textAnchor="middle" className="trace-label" fill="#eef0fb"
        style={{ fontFamily: "var(--df-mono)", fontSize: 13, animationDelay: "0.4s" }}>
        {address ? shortAddr(address) : "your wallet"}
      </text>

      {/* verdict / illustration chip */}
      <g className="trace-label" style={{ animationDelay: tone === null ? "2.9s" : "1.6s" }}>
        <rect x={chipX - chipW / 2} y={chipY - 17} width={chipW} height={30} rx={15}
          fill="var(--df-ink)" stroke={tone ? TONE_COLOR[tone] : "var(--df-bad)"} strokeWidth={1.5} />
        <text x={chipX} y={chipY + 3} textAnchor="middle" fill="#fff"
          style={{ fontFamily: "var(--df-body)", fontSize: 13, fontWeight: 600 }}>
          {chipText}
        </text>
      </g>
    </svg>
  );
}
