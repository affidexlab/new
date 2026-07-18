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
            <button onClick={() => openForm('Protocol Audit')} style={{ background: '#ef4444', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Request an Audit</button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: '6rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '100px', padding: '0.4rem 1rem', fontSize: '0.78rem', color: '#fca5a5', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Smart Contract Security
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.6rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Don't Launch{' '}
            <span style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              With Unaudited Contracts
            </span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', maxWidth: '660px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Professional smart contract security audits for Solidity, Vyper, and Rust (Solana/Anchor). 10 vulnerability categories, formal PDF report on company letterhead, 7-day turnaround.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => openForm('Protocol Audit')} style={{ background: '#ef4444', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>Request an Audit</button>
            <a href="#pricing" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)' }}>View Packages</a>
          </div>
        </section>

        {/* ── Scope ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem' }}>What we check</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '3rem' }}>10 vulnerability categories. Every contract, every time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
            {AUDIT_SCOPE.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Process ── */}
        <section style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>How it works</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {PROCESS.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#fca5a5' }}>{p.step}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{p.title}</h3>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 600 }}>{p.time}</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Severity Guide ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>How we rate findings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {SEVERITY_GUIDE.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: s.bg, border: `1px solid ${s.color}40`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
                <span style={{ flexShrink: 0, minWidth: 110, fontWeight: 800, fontSize: '0.85rem', color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.level}</span>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Packages ── */}
        <section id="pricing" style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem' }}>Audit packages</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '3rem' }}>Fixed pricing. No hidden fees.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
            {PACKAGES.map((pkg, i) => (
              <div key={i} style={{ background: pkg.highlight ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)', border: pkg.highlight ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', position: 'relative' }}>
                {pkg.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', padding: '0.25rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Most Popular</div>}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{pkg.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 800, color: pkg.highlight ? '#ef4444' : '#fff' }}>{pkg.price}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{pkg.deliverable}</p>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.3rem' }}>Scope</div>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{pkg.scope}</p>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.3rem' }}>Ideal for</div>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{pkg.ideal}</p>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {pkg.includes.map((f, j) => (
                    <li key={j} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}><span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{f}</li>
                  ))}
                </ul>
                <button onClick={() => openForm(pkg.name)} style={{ display: 'block', width: '100%', padding: '0.875rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', background: pkg.highlight ? '#ef4444' : 'rgba(255,255,255,0.07)', color: '#fff', border: pkg.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
                  Request This Audit
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '2rem' }}>
            50% upfront · 50% on report delivery · 10% discount for full payment upfront · USDC, USDT, ETH, or bank transfer accepted
          </p>
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
          <button
            onClick={() => openForm("Protocol Audit")}
            style={{
              display: 'inline-block', background: '#ef4444', color: '#fff',
              padding: '1rem 2.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontSize: '1.05rem', fontWeight: 700,
            }}
          >
            Request Your Audit
          </button>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem',
          textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem',
        }}>
          © 2026 DecaFlow Solutions Limited 
        </footer>
      </div>

      {/* ── Form Modal ── */}
      {formOpen && (
        <div onClick={e => e.target === e.currentTarget && closeForm()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.75rem 2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>{formStep === 'success' ? 'Request Received! 🎉' : `Request an Audit — ${selectedPkg}`}</h2>
                {formStep !== 'success' && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>Our audit team will follow up within 24 hours to scope your engagement.</p>}
              </div>
              <button onClick={closeForm} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
            </div>
            {formStep === 'success' ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>We've got your request!</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2rem' }}>A member of our audit team will reach out to <strong>{formData.email}</strong> within 24 hours to confirm scope and timeline.</p>
                <button onClick={closeForm} style={{ background: '#ef4444', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {[['Project Name *', 'projectName', 'e.g. Quidax Protocol', 'text'], ['Your Name *', 'contactName', 'Full name', 'text'], ['Work Email *', 'email', 'you@company.com', 'email'], ['Telegram / WhatsApp', 'telegram', '@handle or +234...', 'text']].map(([label, field, ph, type]) => (
                    <div key={field as string}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>{label as string}</label>
                      <input required={(label as string).includes('*')} type={type as string} placeholder={ph as string} value={(formData as any)[field as string]}
                        onChange={e => setFormData(p => ({ ...p, [field as string]: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>GitHub Repository Link</label>
                  <input type="text" placeholder="https://github.com/your-org/your-repo" value={formData.githubRepo} onChange={e => setFormData(p => ({ ...p, githubRepo: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>Blockchain</label>
                    <select value={formData.blockchain} onChange={e => setFormData(p => ({ ...p, blockchain: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}>
                      <option value="">Select chain</option>
                      {['Ethereum', 'Arbitrum', 'Base', 'Optimism', 'Polygon', 'Avalanche', 'BNB Chain', 'Solana', 'Multi-chain'].map(o => <option key={o} value={o} style={{ background: '#1f2937' }}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>Language</label>
                    <select value={formData.language} onChange={e => setFormData(p => ({ ...p, language: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}>
                      <option value="">Select language</option>
                      {['Solidity', 'Vyper', 'Rust (Anchor)'].map(o => <option key={o} value={o} style={{ background: '#1f2937' }}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>Approx. Lines of Code</label>
                    <input type="text" placeholder="e.g. 1,200" value={formData.linesOfCode} onChange={e => setFormData(p => ({ ...p, linesOfCode: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>Desired Timeline</label>
                    <input type="text" placeholder="e.g. Before launch, 2 weeks" value={formData.timeline} onChange={e => setFormData(p => ({ ...p, timeline: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>Additional Information</label>
                  <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3}
                    placeholder="Tell us about your protocol and what you'd like audited..."
                    style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" disabled={formLoading} style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? 'Submitting...' : `Submit Request — ${selectedPkg}`}
                </button>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '0.75rem' }}>🔒 Your information is confidential and will only be used to process your request.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
