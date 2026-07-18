import React, { useState, useEffect } from 'react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const AUDIT_SCOPE = [
  {
    icon: '🔐',
    title: 'Reentrancy Vulnerabilities',
    desc: 'Detect cross-function, cross-contract, and read-only reentrancy patterns before they cost your users everything.',
  },
  {
    icon: '🎯',
    title: 'Access Control Flaws',
    desc: 'Review all owner and admin functions, privilege escalation paths, and missing onlyOwner guards.',
  },
  {
    icon: '💱',
    title: 'Oracle Manipulation',
    desc: 'Identify price oracle attack surfaces, flash loan manipulation vectors, and TWAP implementation issues.',
  },
  {
    icon: '🌊',
    title: 'Flash Loan Attack Vectors',
    desc: 'Simulate flash loan-assisted attacks against your liquidity pools, lending markets, and governance systems.',
  },
  {
    icon: '📉',
    title: 'Integer Overflow & Underflow',
    desc: 'Verify arithmetic safety across all token amount calculations, especially in low-decimal token pairs.',
  },
  {
    icon: '🔄',
    title: 'Front-Running & MEV Exposure',
    desc: 'Identify MEV-exploitable functions in your contracts — sandwich targets, arbitrage surfaces, and sandwichable liquidations.',
  },
  {
    icon: '🗳️',
    title: 'Governance Attack Surfaces',
    desc: 'Audit proposal creation, voting logic, timelock bypass risks, and flash loan governance attacks.',
  },
  {
    icon: '🔗',
    title: 'Cross-Chain Logic Errors',
    desc: 'Review bridge implementations, cross-chain message validation, and replay attack vectors on multi-chain deployments.',
  },
  {
    icon: '💾',
    title: 'Storage Layout Collisions',
    desc: 'Check proxy upgrade patterns for storage slot conflicts, implementation variable shadowing, and initializer logic.',
  },
  {
    icon: '⛽',
    title: 'Gas Optimisation Review',
    desc: 'Identify unnecessary SLOAD operations, inefficient loops, and calldata optimisations that reduce user costs.',
  },
];

const PROCESS = [
  {
    step: '01',
    title: 'Submit Your Codebase',
    desc: 'Share your GitHub repository link or upload a zip. We accept Solidity, Vyper, and Rust (Solana/Anchor) contracts.',
    time: 'Day 1',
  },
  {
    step: '02',
    title: 'Scoping & Kickoff',
    desc: 'We review your codebase, identify critical paths, and schedule a 30-minute kickoff call to understand your protocol mechanics.',
    time: 'Day 1–2',
  },
  {
    step: '03',
    title: 'Manual Code Review',
    desc: 'Line-by-line review by our team across all 10 vulnerability categories. We study your protocol from an attacker\'s perspective.',
    time: 'Day 2–5',
  },
  {
    step: '04',
    title: 'Findings & Remediation',
    desc: 'Every vulnerability is categorised by severity (Critical/High/Medium/Low/Informational) with a specific remediation recommendation.',
    time: 'Day 5–6',
  },
  {
    step: '05',
    title: 'Report Delivery',
    desc: 'Full written audit report on DecaFlow Solutions Limited letterhead — ready to publish, share with investors, or submit to regulators.',
    time: 'Day 7',
  },
  {
    step: '06',
    title: 'Fix Verification',
    desc: 'After you implement fixes, we re-review all flagged items and issue a final clean report confirming resolution.',
    time: 'Day 8–10',
  },
];

const PACKAGES = [
  {
    name: 'Smart Contract Review',
    price: '$800',
    deliverable: '7-day turnaround',
    highlight: false,
    scope: 'Up to 500 lines of Solidity',
    ideal: 'Simple token contracts, NFT collections, single-function protocols',
    includes: [
      'Manual line-by-line code review',
      'All 10 vulnerability categories checked',
      'Severity-rated findings report',
      'Remediation recommendations',
      'PDF report on company letterhead',
      'Fix verification included',
    ],
  },
  {
    name: 'Protocol Audit',
    price: '$2,000',
    deliverable: '10-day turnaround',
    highlight: true,
    scope: 'Up to 2,000 lines across multiple contracts',
    ideal: 'DEXs, lending protocols, yield farming, staking systems',
    includes: [
      'Everything in Smart Contract Review',
      'Cross-contract interaction analysis',
      'Economic attack simulation',
      'Flash loan attack vectors',
      'Oracle manipulation review',
      'Governance logic audit',
      'Gas optimisation report',
      'Kickoff call with lead auditor',
      'Priority turnaround',
    ],
  },
  {
    name: 'Full System Audit',
    price: 'From $4,500',
    deliverable: 'Timeline agreed per scope',
    highlight: false,
    scope: 'Unlimited — full protocol, multi-chain, upgradeable proxy systems',
    ideal: 'Launch-ready protocols, pre-IDO audit, institutional-grade projects',
    includes: [
      'Everything in Protocol Audit',
      'Multi-chain deployment review',
      'Upgradeability & proxy pattern review',
      'Formal economic risk modelling',
      'Pre-launch checklist',
      'Post-deployment monitoring setup',
      'Co-marketing as "Audited by DecaFlow"',
      'Quarterly re-audit discount',
    ],
  },
];

const SEVERITY_GUIDE = [
  { level: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', desc: 'Immediate loss of funds. Protocol must be halted and fixed before any further use.' },
  { level: 'High', color: '#f97316', bg: 'rgba(249,115,22,0.1)', desc: 'Significant risk of fund loss or protocol failure under realistic conditions.' },
  { level: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', desc: 'Vulnerability requires specific conditions to exploit but poses real risk.' },
  { level: 'Low', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', desc: 'Minor issue with limited impact but should be addressed for robustness.' },
  { level: 'Informational', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', desc: 'Gas optimisations, code quality improvements, and best practice recommendations.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Audit() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState('');
  const [formStep, setFormStep] = useState<'form'|'success'>('form');
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({projectName:'',contactName:'',email:'',telegram:'',githubRepo:'',blockchain:'',language:'',linesOfCode:'',auditPackage:'',timeline:'',description:''});

  const openForm = (pkg: string) => { setSelectedPkg(pkg); setFormData(p=>({...p,auditPackage:pkg})); setFormStep('form'); setFormOpen(true); document.body.style.overflow='hidden'; };
  const closeForm = () => { setFormOpen(false); document.body.style.overflow=''; };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try { await fetch('https://decaflow-backend.onrender.com/v1/audit/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...formData,source:'audit-page'})}); } catch {}
    setFormStep('success'); setFormLoading(false);
  };

  const FAQS = [
    {
      q: 'Are you a formal audit firm like CertiK or Trail of Bits?',
      a: 'We are a registered Nigerian technology company (RC No. 9616822) providing professional smart contract security review services. We are not CertiK or Trail of Bits — but we are also not $20,000 and 3 months away. We built and deployed our own DeFi protocol with smart contracts live on Arbitrum mainnet. We know these attack vectors because we\'ve had to defend against them ourselves. Our reports are thorough, formally written, and carry the credibility of an incorporated company.',
    },
    {
      q: 'What languages do you audit?',
      a: 'Solidity (EVM — Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BNB Chain), Vyper, and Rust/Anchor (Solana). Most audits are Solidity.',
    },
    {
      q: 'How is the report formatted?',
      a: 'Every report is delivered as a professionally formatted PDF on DecaFlow Solutions Limited company letterhead. It includes an executive summary, full vulnerability catalogue (severity rated), code snippets with line references, and specific remediation recommendations. The format is designed to be shared with investors, published on your website, or submitted to regulators.',
    },
    {
      q: 'Can we publish the report publicly?',
      a: 'Yes. The report is yours. Many projects publish audit reports on their website and GitHub as part of their transparency documentation. We can also co-publish a summary announcement if useful for your marketing.',
    },
    {
      q: 'Do you offer a re-audit after we fix issues?',
      a: 'Fix verification is included in every package. After you implement the recommended fixes, we re-review all flagged items and issue a final clean report confirming resolution. No additional charge.',
    },
    {
      q: 'How do we pay?',
      a: 'We accept USDC, USDT, ETH, or bank transfer (NGN or USD). 50% upfront, 50% on report delivery. Full payment upfront receives a 10% discount.',
    },
  ];

  useEffect(() => { document.title = "Smart Contract Security Audit | DecaFlow"; }, []);
  return (
    <>
      <div style={{ background: '#0A0E27', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Nav ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky', top: 0, background: 'rgba(10,14,39,0.95)',
          backdropFilter: 'blur(12px)', zIndex: 100,
        }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Deca<span style={{ color: '#3B82F6' }}>Flow</span>
            </span>
          </a>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="/compliance" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Compliance</a>
            <a href="/audit" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Security Audit</a>
            <a href="/verify" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Verify API</a>
                    <button onClick={() => openForm(pkg.name)} style={{display:"block",width:"100%",padding:"0.875rem",borderRadius:"10px",fontWeight:700,fontSize:"0.9rem",background:pkg.highlight?"#ef4444":"rgba(255,255,255,0.07)",color:"#fff",border:pkg.highlight?"none":"1px solid rgba(255,255,255,0.12)",cursor:"pointer"}}>
                      Request This Audit
                    </button>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '2rem' }}>
              50% upfront · 50% on report delivery · 10% discount for full payment upfront · USDC, USDT, ETH, or bank transfer accepted
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
            Frequently asked questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.25rem 1.5rem', background: 'none', border: 'none',
                    color: '#fff', cursor: 'pointer', textAlign: 'left', gap: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{ fontSize: '1.2rem', color: '#3B82F6', flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.25rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'rgba(239,68,68,0.04)', borderTop: '1px solid rgba(239,68,68,0.15)' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Don't launch unaudited.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Every week a DeFi protocol gets exploited. Every time, the post-mortem says the same thing: it could have been caught in an audit.
          </p>
          <a
            onClick={() => openForm("Protocol Audit")}
            style={{
              display: 'inline-block', background: '#ef4444', color: '#fff',
              padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none',
              fontSize: '1.05rem', fontWeight: 700,
            }}
          >
            Request Your Audit
          </button>


        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem',
          textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem',
        }}>
          © 2026 DecaFlow Solutions Limited · RC No. 9616822 · decaflowsolutions@gmail.com
        </footer>
      </div>
    </>
  );
}
