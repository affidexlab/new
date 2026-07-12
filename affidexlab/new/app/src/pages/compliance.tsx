import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface Tier {
  name: string;
  price: string;
  period: string;
  highlight: boolean;
  features: string[];
  cta: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES: Feature[] = [
  {
    icon: '🔍',
    title: 'Real-Time Transaction Monitoring',
    desc: 'Every on-chain transaction is scored the moment it hits the mempool. Suspicious patterns are flagged before settlement — not after.',
  },
  {
    icon: '🛡️',
    title: 'AML & CFT Compliance Engine',
    desc: 'Continuously checks transactions against OFAC, UN, EU, and FATF sanctions lists. Stay compliant with CBN, SEC-Nigeria, and MiCA requirements without lifting a finger.',
  },
  {
    icon: '📊',
    title: 'Risk Scoring Dashboard',
    desc: 'Every wallet and transaction receives a 0–100 composite risk score covering sanctions exposure, mixer usage, darknet activity, and behavioural anomalies.',
  },
  {
    icon: '⚡',
    title: 'Sub-100ms API Response',
    desc: 'Instant risk decisions at transaction speed. No bottlenecks in your user flow — compliance checks run silently in the background.',
  },
  {
    icon: '🌍',
    title: 'Multi-Chain Coverage',
    desc: 'Monitors Arbitrum, Ethereum, Base, Optimism, Polygon, Avalanche, and BNB Chain simultaneously. One API, every major chain.',
  },
  {
    icon: '📁',
    title: 'Audit-Ready Reports',
    desc: 'Generate regulator-ready compliance reports on demand. Full transaction history, risk scores, and decisions exported as PDF or JSON — formatted for CBN, SEC, and FIRS submissions.',
  },
];

const TIERS: Tier[] = [
  {
    name: 'Starter',
    price: '$299',
    period: '/month',
    highlight: false,
    features: [
      'Up to 10,000 transaction checks/month',
      'OFAC & UN sanctions screening',
      '3 blockchain networks',
      'Email alerts for high-risk events',
      'Standard support',
      'Monthly compliance reports',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Business',
    price: '$799',
    period: '/month',
    highlight: true,
    features: [
      'Up to 100,000 transaction checks/month',
      'Full global sanctions coverage',
      'All 7 supported networks',
      'Real-time webhook alerts',
      'Priority support (24hr SLA)',
      'Weekly compliance reports',
      'API access included',
      'Custom risk thresholds',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    highlight: false,
    features: [
      'Unlimited transaction checks',
      'Custom sanctions list integration',
      'Dedicated infrastructure',
      'Custom chain support',
      'Dedicated compliance manager',
      'Real-time regulator export',
      'White-label available',
      'SLA guarantees',
    ],
    cta: 'Contact Sales',
  },
];

const USE_CASES = [
  {
    sector: 'Crypto Exchanges',
    problem: 'CBN and SEC-Nigeria now require VASPs to screen all transactions for AML/CFT compliance. Non-compliance risks licence revocation.',
    solution: 'DecaFlow Compliance screens every deposit and withdrawal in real time, auto-generates monthly reports, and flags suspicious wallets before funds are processed.',
  },
  {
    sector: 'Fintech & Neobanks',
    problem: 'Fintechs processing crypto-adjacent transactions face CBN scrutiny and risk account freezes if AML obligations are missed.',
    solution: 'Integrate our API in one afternoon. Every transaction touching a blockchain address is automatically screened and logged with a full audit trail.',
  },
  {
    sector: 'Payment Processors',
    problem: 'Processing payments from wallets linked to sanctioned entities or mixers creates legal liability and reputational risk.',
    solution: 'Pre-screening via the DecaFlow Compliance API stops high-risk payments before they process — not after complaints arrive.',
  },
  {
    sector: 'DeFi Protocols',
    problem: 'Global regulators are increasingly applying AML obligations to DeFi protocols. MiCA in Europe and emerging SEC guidance in the US are changing the landscape.',
    solution: 'Embed compliance screening into your protocol\'s frontend. Show users their wallet risk score before they interact — demonstrating regulatory good faith.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CompliancePage() {
  const [demoWallet, setDemoWallet] = useState('');
  const [demoResult, setDemoResult] = useState<null | {
    score: number;
    level: string;
    flags: string[];
  }>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const runDemo = () => {
    if (!demoWallet.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);
    setTimeout(() => {
      // Deterministic demo output based on wallet length
      const seed = demoWallet.length;
      const score = seed % 3 === 0 ? 12 : seed % 3 === 1 ? 67 : 91;
      const level = score < 30 ? 'LOW' : score < 70 ? 'MEDIUM' : 'HIGH';
      const flags =
        score < 30
          ? ['No sanctions matches', 'No mixer activity', 'Clean transaction history']
          : score < 70
          ? ['Interaction with flagged DEX', 'Moderate anonymity pattern']
          : ['OFAC watchlist proximity', 'Mixer usage detected', 'High-risk jurisdiction'];
      setDemoResult({ score, level, flags });
      setDemoLoading(false);
    }, 1400);
  };

  const levelColor = (level: string) =>
    level === 'LOW' ? '#22c55e' : level === 'MEDIUM' ? '#f59e0b' : '#ef4444';

  return (
    <>
      <Head>
        <title>Compliance & Transaction Monitoring | DecaFlow</title>
        <meta
          name="description"
          content="Real-time on-chain AML compliance, sanctions screening, and transaction monitoring for crypto businesses. CBN, SEC, and MiCA ready."
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
            <Link href="/compliance" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Compliance</Link>
            <Link href="/audit" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Security Audit</Link>
            <Link href="/verify" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Verify API</Link>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Swap</Link>
            <a
              href="mailto:decaflowsolutions@gmail.com"
              style={{
                background: '#3B82F6', color: '#fff', padding: '0.5rem 1.25rem',
                borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              Get Started
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: '6rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '100px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#93C5FD',
            fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            Compliance Infrastructure
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.03em', marginBottom: '1.5rem',
          }}>
            On-Chain AML Compliance{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #818CF8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Built for Africa's Crypto Economy
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', maxWidth: '680px',
            margin: '0 auto 2.5rem', lineHeight: 1.7,
          }}>
            Real-time transaction monitoring, sanctions screening, and AML risk scoring for crypto exchanges,
            fintechs, and DeFi protocols. CBN-compliant, SEC-Nigeria ready, MiCA compatible.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:decaflowsolutions@gmail.com?subject=Compliance API Demo Request"
              style={{
                background: '#3B82F6', color: '#fff', padding: '0.875rem 2rem',
                borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 700,
              }}
            >
              Request a Demo
            </a>
            <a
              href="#pricing"
              style={{
                background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '0.875rem 2rem',
                borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              View Pricing
            </a>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: '0', marginTop: '4rem',
            background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
            flexWrap: 'wrap',
          }}>
            {[
              { val: '$59B+', label: 'Crypto transactions in Nigeria (2023–24)' },
              { val: '6+', label: 'Chains monitored in real time' },
              { val: '<100ms', label: 'API response time' },
              { val: '99.9%', label: 'Uptime SLA' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  flex: '1 1 200px', padding: '1.75rem 1.5rem', textAlign: 'center',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#3B82F6', letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem', lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Live Demo ── */}
        <section style={{ padding: '3rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '20px', padding: '2.5rem',
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Try the Risk Scorer</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Enter any wallet address to see a demo compliance score.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="0x... or any wallet address"
                value={demoWallet}
                onChange={(e) => setDemoWallet(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runDemo()}
                style={{
                  flex: '1', padding: '0.875rem 1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: '0.9rem', outline: 'none', minWidth: '200px',
                }}
              />
              <button
                onClick={runDemo}
                disabled={demoLoading}
                style={{
                  background: '#3B82F6', color: '#fff', padding: '0.875rem 1.5rem',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem', opacity: demoLoading ? 0.6 : 1,
                }}
              >
                {demoLoading ? 'Scanning...' : 'Check Risk'}
              </button>
            </div>

            {demoResult && (
              <div style={{
                marginTop: '1.5rem', padding: '1.25rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${levelColor(demoResult.level)}40`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: `${levelColor(demoResult.level)}20`,
                    border: `2px solid ${levelColor(demoResult.level)}`,
                    fontSize: '1.1rem', fontWeight: 800, color: levelColor(demoResult.level),
                  }}>
                    {demoResult.score}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Risk Score: {demoResult.score}/100</div>
                    <div style={{ color: levelColor(demoResult.level), fontWeight: 700, fontSize: '0.85rem' }}>
                      {demoResult.level} RISK
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {demoResult.flags.map((f, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: levelColor(demoResult.level) }}>
                        {demoResult.level === 'LOW' ? '✓' : demoResult.level === 'MEDIUM' ? '⚠' : '✗'}
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '1rem', marginBottom: 0 }}>
                  * This is a demonstration. Production API delivers live on-chain data.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Everything you need to stay compliant
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
            One platform. Full regulatory coverage. No compliance team required.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '1.75rem',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Use Cases ── */}
        <section style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Who uses DecaFlow Compliance
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
              Built for every business where crypto and compliance meet.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
              {USE_CASES.map((u, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px', padding: '2rem',
                  }}
                >
                  <div style={{
                    display: 'inline-block', background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.25)', borderRadius: '6px',
                    padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: '#93C5FD',
                    fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {u.sector}
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>The Problem</span>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.65, marginTop: '0.35rem', marginBottom: 0 }}>{u.problem}</p>
                  </div>
                  <div>
                    <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>The Solution</span>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.65, marginTop: '0.35rem', marginBottom: 0 }}>{u.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── API Snippet ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Integrate in minutes
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '1rem' }}>
            A single API call returns a full compliance decision. No complex setup. No compliance team needed.
          </p>
          <div style={{
            background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', overflow: 'hidden',
          }}>
            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>compliance-check.ts</span>
            </div>
            <pre style={{
              margin: 0, padding: '1.75rem 1.5rem', overflowX: 'auto',
              fontSize: '0.85rem', lineHeight: 1.75,
              color: '#e2e8f0',
            }}>
{`import { DecaFlowCompliance } from '@decaflow/compliance';

const compliance = new DecaFlowCompliance({
  apiKey: process.env.DECAFLOW_API_KEY,
});

// Screen a wallet before processing a transaction
const result = await compliance.screenWallet({
  address: '0xUserWalletAddress',
  chainId: 42161, // Arbitrum
  context: 'deposit', // 'deposit' | 'withdrawal' | 'swap'
});

console.log(result);
// {
//   riskScore: 23,
//   riskLevel: 'LOW',
//   sanctionsMatch: false,
//   mixerExposure: 0.02,
//   recommendation: 'APPROVE',
//   flags: [],
//   reportId: 'rpt_abc123'
// }

if (result.recommendation === 'APPROVE') {
  await processTransaction();
} else {
  await flagForReview(result.reportId);
}`}
            </pre>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Transparent pricing
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
              Compliance that doesn't cost like Chainalysis.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {TIERS.map((t, i) => (
                <div
                  key={i}
                  style={{
                    background: t.highlight ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
                    border: t.highlight ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', padding: '2rem', position: 'relative',
                  }}
                >
                  {t.highlight && (
                    <div style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      background: '#3B82F6', color: '#fff', padding: '0.25rem 1rem',
                      borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: 800, color: t.highlight ? '#3B82F6' : '#fff' }}>{t.price}</span>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>{t.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {t.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={"mailto:decaflowsolutions@gmail.com?subject=Compliance - " + t.name + " Plan"}
                    style={{
                      display: 'block', textAlign: 'center', padding: '0.875rem',
                      borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                      background: t.highlight ? '#3B82F6' : 'rgba(255,255,255,0.07)',
                      color: '#fff', border: t.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    {t.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Compliance isn't optional anymore.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Nigerian SEC, CBN, and global FATF standards are converging. Get ahead of the requirement — not behind it.
          </p>
          <a
            href="mailto:decaflowsolutions@gmail.com?subject=Compliance API - I want to get started"
            style={{
              display: 'inline-block', background: '#3B82F6', color: '#fff',
              padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none',
              fontSize: '1.05rem', fontWeight: 700,
            }}
          >
            Talk to Us Today
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
