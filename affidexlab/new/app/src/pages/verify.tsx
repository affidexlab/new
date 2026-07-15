import React, { useState, useEffect } from 'react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🌍',
    title: 'Global Sanctions Coverage',
    desc: 'Real-time checks against OFAC, UN Security Council, EU, HMT (UK), and FATF blacklists. Updated within minutes of every new designation.',
  },
  {
    icon: '🔀',
    title: 'Mixer & Tumbler Detection',
    desc: 'Identifies funds that have passed through Tornado Cash, ChipMixer, Sinbad, and 40+ other known mixing services across all supported chains.',
  },
  {
    icon: '🌑',
    title: 'Darknet Market Exposure',
    desc: 'Flags wallet addresses with known links to darknet marketplaces, ransomware operators, and cybercriminal infrastructure.',
  },
  {
    icon: '📍',
    title: 'Jurisdiction Risk Scoring',
    desc: 'Identifies wallet activity concentrated in high-risk jurisdictions — North Korea, Iran, Russia, and other FATF grey-listed territories.',
  },
  {
    icon: '🔗',
    title: 'Transaction Graph Analysis',
    desc: 'Traces fund flows up to 5 hops from a wallet address, identifying indirect exposure to flagged entities.',
  },
  {
    icon: '⚡',
    title: 'Sub-100ms Response',
    desc: 'Enterprise-grade speed. Verify millions of addresses without introducing latency into your user flows.',
  },
  {
    icon: '🌐',
    title: '7 Chains Supported',
    desc: 'Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BNB Chain. One API call, cross-chain visibility.',
  },
  {
    icon: '📄',
    title: 'Audit Trail',
    desc: 'Every check is logged with a unique report ID, timestamp, and full response — ready for regulatory inspection at any time.',
  },
];

const RESPONSE_FIELDS = [
  { field: 'riskScore', type: 'number (0–100)', desc: 'Composite risk score. 0 = clean. 100 = critical risk.' },
  { field: 'riskLevel', type: '"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"', desc: 'Human-readable risk band.' },
  { field: 'sanctionsMatch', type: 'boolean', desc: 'True if address or direct counterparty is on a sanctions list.' },
  { field: 'sanctionsDetails', type: 'object | null', desc: 'Programme name, entity name, and list source if sanctioned.' },
  { field: 'mixerExposure', type: 'number (0–1)', desc: 'Fraction of funds with traceable mixer origin.' },
  { field: 'darknetExposure', type: 'number (0–1)', desc: 'Fraction of funds linked to darknet services.' },
  { field: 'jurisdictionRisk', type: '"LOW" | "MEDIUM" | "HIGH"', desc: 'Risk level of dominant transaction jurisdictions.' },
  { field: 'hopsAnalysed', type: 'number', desc: 'Number of transaction hops traced in graph analysis.' },
  { field: 'recommendation', type: '"APPROVE" | "REVIEW" | "REJECT"', desc: 'Suggested action for this wallet.' },
  { field: 'flags', type: 'string[]', desc: 'List of specific risk factors identified.' },
  { field: 'reportId', type: 'string', desc: 'Unique ID for this check — reference in your audit trail.' },
  { field: 'checkedAt', type: 'ISO 8601 timestamp', desc: 'Exact time the check was performed.' },
];

const USE_CASES = [
  { icon: '🏦', title: 'Crypto Exchanges & VASPs', desc: 'Screen every deposit and withdrawal address before processing. Generate monthly AML reports for CBN and SEC-Nigeria submissions.' },
  { icon: '💳', title: 'Fintech & Neobanks', desc: 'Pre-screen crypto-adjacent transactions to satisfy CBN AML obligations and avoid account freezes from processing sanctioned funds.' },
  { icon: '🏛️', title: 'DeFi Protocols', desc: 'Implement wallet screening at the frontend level — warn users with high-risk wallets before they interact with your protocol.' },
  { icon: '⚖️', title: 'Law Firms & Compliance Teams', desc: 'Run wallet investigations for client due diligence, litigation support, and regulatory submissions with full documented output.' },
  { icon: '🔍', title: 'Blockchain Investigators', desc: 'Trace fund flows, identify mixer exposure, and generate evidence-grade reports for law enforcement or civil proceedings.' },
  { icon: '🤝', title: 'OTC Desks & Brokers', desc: 'Screen counterparty wallets before large OTC transactions. Protect your business from unknowingly handling proceeds of crime.' },
];

const PLANS = [  {
    name: 'Growth',
    price: '$299',
    period: '/month',
    highlight: false,
    checks: '50,000 checks/month',
    features: [
      '50,000 wallet checks per month',
      'Full global sanctions coverage',
      'All 7 supported chains',
      'Mixer & darknet detection',
      'Transaction graph analysis (3 hops)',
      'Audit trail & report IDs',
      'Email support',
      'Webhook alerts',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Business',
    price: '$799',
    period: '/month',
    highlight: true,
    checks: '500,000 checks/month',
    features: [
      '500,000 wallet checks per month',
      'Everything in Growth',
      '5-hop graph analysis',
      'Jurisdiction risk scoring',
      'Bulk screening (batch API)',
      'Priority support (24hr SLA)',
      'Monthly compliance reports',
      'Custom risk thresholds',
      'Dedicated account manager',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    highlight: false,
    checks: 'Unlimited checks',
    features: [
      'Unlimited wallet checks',
      'Custom sanctions list integration',
      'Custom chain support',
      'Dedicated infrastructure',
      'SLA guarantees',
      'White-label API available',
      'On-premise deployment option',
      'Quarterly compliance review',
    ],
    cta: 'Contact Sales',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Verify() {
  const [demoAddress, setDemoAddress] = useState('');
  const [demoChain, setDemoChain] = useState('ethereum');
  const [demoResult, setDemoResult] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'response' | 'fields'>('response');

  const CHAINS = [
    { id: 'ethereum', label: 'Ethereum' },
    { id: 'arbitrum', label: 'Arbitrum' },
    { id: 'base', label: 'Base' },
    { id: 'polygon', label: 'Polygon' },
    { id: 'optimism', label: 'Optimism' },
    { id: 'avalanche', label: 'Avalanche' },
    { id: 'bnb', label: 'BNB Chain' },
  ];

  const runDemo = () => {
    if (!demoAddress.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);
    setTimeout(() => {
      const seed = demoAddress.replace('0x', '').charCodeAt(0) || 65;
      const score = seed % 3 === 0 ? 8 : seed % 3 === 1 ? 54 : 89;
      const level = score < 25 ? 'LOW' : score < 60 ? 'MEDIUM' : score < 85 ? 'HIGH' : 'CRITICAL';
      const recommendation = score < 25 ? 'APPROVE' : score < 60 ? 'REVIEW' : 'REJECT';
      const mixer = score > 60 ? 0.34 : score > 30 ? 0.08 : 0.00;
      const darknet = score > 75 ? 0.12 : 0.00;
      const sanctioned = score > 85;
      const flags = score < 25
        ? []
        : score < 60
        ? ['Interaction with flagged exchange', 'Moderate transaction velocity']
        : score < 85
        ? ['Mixer exposure (Tornado Cash)', 'High-risk jurisdiction activity', 'Multiple pseudonymous wallet clusters']
        : ['OFAC SDN list proximity', 'Mixer exposure', 'Darknet market interaction', 'North Korea-linked wallet cluster'];

      setDemoResult({
        riskScore: score,
        riskLevel: level,
        sanctionsMatch: sanctioned,
        sanctionsDetails: sanctioned ? { programme: 'OFAC SDN', entity: 'Demo Entity', list: 'US-OFAC' } : null,
        mixerExposure: mixer,
        darknetExposure: darknet,
        jurisdictionRisk: score > 60 ? 'HIGH' : score > 30 ? 'MEDIUM' : 'LOW',
        hopsAnalysed: 5,
        recommendation,
        flags,
        reportId: 'rpt_' + Math.random().toString(36).substr(2, 9),
        checkedAt: new Date().toISOString(),
        chain: demoChain,
        address: demoAddress,
      });
      setDemoLoading(false);
    }, 1600);
  };

  const levelColor = (l: string) =>
    l === 'LOW' ? '#22c55e' : l === 'MEDIUM' ? '#f59e0b' : l === 'HIGH' ? '#f97316' : '#ef4444';

  const recColor = (r: string) =>
    r === 'APPROVE' ? '#22c55e' : r === 'REVIEW' ? '#f59e0b' : '#ef4444';

  useEffect(() => { document.title = "DecaFlow Verify API — Wallet Screening & Sanctions Checking"; }, []);
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
            <a href="/audit" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Security Audit</a>
            <a href="/verify" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Verify API</a>
            <a href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Swap</a>
            <a
              href="mailto:decaflowsolutions@gmail.com?subject=Verify API Key Request"
              style={{
                background: '#3B82F6', color: '#fff', padding: '0.5rem 1.25rem',
                borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              Get API Key
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: '6rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '100px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#C4B5FD',
            fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            DecaFlow Verify API
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.03em', marginBottom: '1.5rem',
          }}>
            Know Who You're Dealing With.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Before It's Too Late.
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'rgba(255,255,255,0.65)', maxWidth: '680px',
            margin: '0 auto 2.5rem', lineHeight: 1.7,
          }}>
            Instant wallet screening against global sanctions lists, mixer databases, darknet exposure records,
            and jurisdiction risk profiles — across 7 blockchain networks. One API. Sub-100ms.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:decaflowsolutions@gmail.com?subject=Verify API Key Request"
              style={{
                background: '#8b5cf6', color: '#fff', padding: '0.875rem 2rem',
                borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 700,
              }}
            >
              Get API Access
            </a>
            <a
              href="#demo"
              style={{
                background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '0.875rem 2rem',
                borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Try Live Demo
            </a>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', marginTop: '4rem', flexWrap: 'wrap',
            background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
          }}>
            {[
              { val: '7', label: 'Blockchain networks' },
              { val: '50+', label: 'Sanctions lists monitored' },
              { val: '<100ms', label: 'API response time' },
              { val: '5 hops', label: 'Graph analysis depth' },
              { val: '99.9%', label: 'Uptime SLA' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: '1 1 160px', padding: '1.75rem 1rem', textAlign: 'center',
                borderRight: i < 4 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6', letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Live Demo ── */}
        <section id="demo" style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Try it now
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Enter any wallet address and see a live demo response.
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: '20px', padding: '2rem',
          }}>
            {/* Inputs */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Enter wallet address (0x...)"
                value={demoAddress}
                onChange={(e) => setDemoAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runDemo()}
                style={{
                  flex: '1', padding: '0.875rem 1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: '0.9rem', outline: 'none', minWidth: '220px',
                  fontFamily: 'monospace',
                }}
              />
              <select
                value={demoChain}
                onChange={(e) => setDemoChain(e.target.value)}
                style={{
                  padding: '0.875rem 1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer',
                }}
              >
                {CHAINS.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1f3e' }}>{c.label}</option>)}
              </select>
              <button
                onClick={runDemo}
                disabled={demoLoading || !demoAddress.trim()}
                style={{
                  background: '#8b5cf6', color: '#fff', padding: '0.875rem 1.5rem',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem',
                  opacity: (demoLoading || !demoAddress.trim()) ? 0.5 : 1,
                }}
              >
                {demoLoading ? 'Scanning...' : 'Verify Wallet'}
              </button>
            </div>

            {/* Result */}
            {demoResult && (
              <div style={{ marginTop: '1.5rem' }}>
                {/* Summary bar */}
                <div style={{
                  display: 'flex', gap: '1rem', flexWrap: 'wrap',
                  padding: '1.25rem', borderRadius: '12px',
                  background: `${levelColor(demoResult.riskLevel)}10`,
                  border: `1px solid ${levelColor(demoResult.riskLevel)}30`,
                  marginBottom: '1rem', alignItems: 'center',
                }}>
                  {/* Score circle */}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${levelColor(demoResult.riskLevel)}20`,
                    border: `2px solid ${levelColor(demoResult.riskLevel)}`,
                    fontSize: '1.25rem', fontWeight: 800,
                    color: levelColor(demoResult.riskLevel),
                  }}>
                    {demoResult.riskScore}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      Risk Score: {demoResult.riskScore}/100 —{' '}
                      <span style={{ color: levelColor(demoResult.riskLevel) }}>{demoResult.riskLevel} RISK</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                        Chain: <strong style={{ color: '#fff' }}>{demoResult.chain}</strong>
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                        Sanctioned: <strong style={{ color: demoResult.sanctionsMatch ? '#ef4444' : '#22c55e' }}>
                          {demoResult.sanctionsMatch ? 'YES' : 'NO'}
                        </strong>
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                        Recommendation:{' '}
                        <strong style={{ color: recColor(demoResult.recommendation) }}>{demoResult.recommendation}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {(['response', 'fields'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '0.4rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '0.8rem', fontWeight: 600,
                        background: activeTab === tab ? '#8b5cf6' : 'rgba(255,255,255,0.07)',
                        color: '#fff',
                      }}
                    >
                      {tab === 'response' ? 'API Response' : 'Field Reference'}
                    </button>
                  ))}
                </div>

                {activeTab === 'response' && (
                  <div style={{
                    background: '#0D1117', borderRadius: '12px', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.4rem' }}>
                      {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
                        <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                      ))}
                      <span style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
                        decaflow-verify-api · response.json
                      </span>
                    </div>
                    <pre style={{ margin: 0, padding: '1.25rem', fontSize: '0.8rem', lineHeight: 1.7, color: '#e2e8f0', overflowX: 'auto' }}>
                      {JSON.stringify(demoResult, null, 2)}
                    </pre>
                  </div>
                )}

                {activeTab === 'fields' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {RESPONSE_FIELDS.slice(0, 8).map((f, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '160px 1fr',
                        gap: '1rem', padding: '0.75rem', borderRadius: '8px',
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                        fontSize: '0.8rem',
                      }}>
                        <div>
                          <div style={{ fontFamily: 'monospace', color: '#8b5cf6', fontWeight: 700 }}>{f.field}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '0.15rem' }}>{f.type}</div>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem', marginBottom: 0 }}>
                  * Demo output only. Production API delivers live on-chain data from real-time blockchain indexing.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Code ── */}
        <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Integrate in minutes
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Three lines of code. Full AML compliance.
          </p>
          <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>verify-wallet.ts</span>
            </div>
            <pre style={{ margin: 0, padding: '1.75rem 1.5rem', fontSize: '0.85rem', lineHeight: 1.75, color: '#e2e8f0', overflowX: 'auto' }}>
{`import { DecaFlowVerify } from '@decaflow/verify';

const verify = new DecaFlowVerify({
  apiKey: process.env.DECAFLOW_VERIFY_KEY,
});

// Screen a wallet before processing any transaction
const result = await verify.screenWallet({
  address: userWalletAddress,
  chainId: 42161, // Arbitrum
  context: 'deposit',
  hops: 5, // trace 5 levels deep
});

// Act on the recommendation
switch (result.recommendation) {
  case 'APPROVE':
    await processTransaction(userWalletAddress);
    break;

  case 'REVIEW':
    await flagForManualReview(result.reportId);
    await notifyComplianceTeam(result);
    break;

  case 'REJECT':
    await blockTransaction(userWalletAddress);
    await logToAuditTrail(result.reportId, 'BLOCKED');
    break;
}

// Generate monthly compliance report
const report = await verify.generateReport({
  from: '2026-06-01',
  to: '2026-06-30',
  format: 'pdf', // 'pdf' | 'json' | 'csv'
});`}
            </pre>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              What the Verify API screens for
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
              Seven threat categories. Every check. Every time.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '1.5rem',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>{f.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.825rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Use Cases ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Who uses DecaFlow Verify
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
            From crypto exchanges to law firms — anyone who needs to know where funds come from.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {USE_CASES.map((u, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '1.5rem',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{u.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>{u.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.825rem', lineHeight: 1.6, margin: 0 }}>{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Pricing
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: '3.5rem', fontSize: '1rem' }}>
              Enterprise-grade wallet screening. Production-ready.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {PLANS.map((plan, i) => (
                <div key={i} style={{
                  background: plan.highlight ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
                  border: plan.highlight ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px', padding: '1.75rem', position: 'relative',
                }}>
                  {plan.highlight && (
                    <div style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      background: '#8b5cf6', color: '#fff', padding: '0.25rem 1rem',
                      borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                      Most Popular
                    </div>
                  )}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{plan.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: plan.highlight ? '#8b5cf6' : '#fff' }}>{plan.price}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{plan.period}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 600, marginBottom: '1.25rem' }}>{plan.checks}</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.83rem', color: 'rgba(255,255,255,0.7)' }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`mailto:decaflowsolutions@gmail.com?subject=Verify API - ${plan.name} Plan`}
                    style={{
                      display: 'block', textAlign: 'center', padding: '0.8rem',
                      borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem',
                      background: plan.highlight ? '#8b5cf6' : 'rgba(255,255,255,0.07)',
                      color: '#fff', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Start verifying wallets today.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Enterprise-grade wallet screening. Production-ready in minutes.
          </p>
          <a
            
            style={{
              display: 'inline-block', background: '#8b5cf6', color: '#fff',
              padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none',
              fontSize: '1.05rem', fontWeight: 700,
            }}
          >
            Get API Access
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
