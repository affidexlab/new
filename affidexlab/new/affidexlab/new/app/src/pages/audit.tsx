import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

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
export default function AuditPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  return (
    <>
      <Head>
        <title>Smart Contract Security Audit | DecaFlow</title>
        <meta
          name="description"
          content="Professional Web3 smart contract security audits. Solidity, Rust, Vyper. 7-day turnaround. From $800. Formal report on company letterhead."
        />
      </Head>

      <div style={{ background: '#0A0E27', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Nav ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky', top: 0, background: 'rgba(10,14,39,0.95)',
          backdropFilter: 'blur(12px)', zIndex: 100,
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Deca<span style={{ color: '#3B82F6' }}>Flow</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/compliance" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Compliance</Link>
            <Link href="/audit" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Security Audit</Link>
            <Link href="/verify" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Verify API</Link>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Swap</Link>
            <a
              href="mailto:decaflowsolutions@gmail.com?subject=Security Audit Request"
              style={{
                background: '#3B82F6', color: '#fff', padding: '0.5rem 1.25rem',
                borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              Request Audit
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: '6rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '100px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#FCA5A5',
            fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            Security Audit Services
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.03em', marginBottom: '1.5rem',
          }}>
            Smart Contract Audits{' '}
            <span style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              That Don't Cost a Fortune
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', maxWidth: '680px',
            margin: '0 auto 2.5rem', lineHeight: 1.7,
          }}>
            Professional, thorough, and formally documented security audits for DeFi protocols, token contracts, and blockchain applications.
            Built by people who actually ship smart contracts.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:decaflowsolutions@gmail.com?subject=Security Audit Request"
              style={{
                background: '#ef4444', color: '#fff', padding: '0.875rem 2rem',
                borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 700,
              }}
            >
              Request an Audit
            </a>
            <a
              href="#packages"
              style={{
                background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '0.875rem 2rem',
                borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              View Packages
            </a>
          </div>

          {/* Comparison bar */}
          <div style={{
            marginTop: '4rem', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
          }}>
            {[
              { label: 'CertiK / Trail of Bits', val: '$20K–$100K', sub: '3–6 month wait', color: '#ef4444' },
              { label: 'DecaFlow Protocol Audit', val: 'From $800', sub: '7-day turnaround', color: '#22c55e' },
              { label: 'Random Freelancer', val: '$200–$500', sub: 'No formal report', color: '#f59e0b' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '1.75rem 1.5rem', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.val}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── What we check ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            What we check — every time
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
            Ten vulnerability categories. Zero shortcuts.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {AUDIT_SCOPE.map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '1.5rem',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.825rem', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Severity Guide ── */}
        <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              How we rate severity
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              Every finding is rated by impact and likelihood — not guesswork.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {SEVERITY_GUIDE.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                    background: s.bg, border: `1px solid ${s.color}30`,
                    borderRadius: '12px', padding: '1rem 1.25rem',
                  }}
                >
                  <div style={{
                    background: s.color, color: '#fff', padding: '0.25rem 0.75rem',
                    borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {s.level}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Process ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            How it works
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
            From code submission to clean report in 7–10 days.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PROCESS.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '1.5rem',
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 800, color: '#3B82F6', flexShrink: 0,
                }}>
                  {p.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{p.title}</h3>
                    <span style={{
                      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                      padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      {p.time}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Packages ── */}
        <section id="packages" style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Audit packages
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
              Choose based on your codebase size and launch timeline.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {PACKAGES.map((pkg, i) => (
                <div
                  key={i}
                  style={{
                    background: pkg.highlight ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                    border: pkg.highlight ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', padding: '2rem', position: 'relative',
                  }}
                >
                  {pkg.highlight && (
                    <div style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      background: '#ef4444', color: '#fff', padding: '0.25rem 1rem',
                      borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{pkg.name}</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: pkg.highlight ? '#ef4444' : '#fff', marginBottom: '0.25rem' }}>{pkg.price}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem' }}>{pkg.deliverable}</div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.6rem 0.8rem',
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem',
                  }}>
                    <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Scope:</strong> {pkg.scope}
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.6rem 0.8rem',
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem',
                  }}>
                    <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Ideal for:</strong> {pkg.ideal}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {pkg.includes.map((item, j) => (
                      <li key={j} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`mailto:decaflowsolutions@gmail.com?subject=Audit Request - ${pkg.name}&body=Hi, I would like to request a ${pkg.name} for my smart contract project. Contract details: `}
                    style={{
                      display: 'block', textAlign: 'center', padding: '0.875rem',
                      borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                      background: pkg.highlight ? '#ef4444' : 'rgba(255,255,255,0.07)',
                      color: '#fff', border: pkg.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    Request This Audit
                  </a>
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
            href="mailto:decaflowsolutions@gmail.com?subject=Security Audit Request"
            style={{
              display: 'inline-block', background: '#ef4444', color: '#fff',
              padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none',
              fontSize: '1.05rem', fontWeight: 700,
            }}
          >
            Request Your Audit
          </a>
        </section>

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
