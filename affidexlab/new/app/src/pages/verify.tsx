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
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formStep, setFormStep] = useState<'form' | 'success'>('form');
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', contactName: '', email: '', telegram: '', expectedVolume: '', plan: '', message: '' });

  const openForm = (plan: string) => { setSelectedPlan(plan); setFormData(p => ({ ...p, plan })); setFormStep('form'); setFormOpen(true); document.body.style.overflow = 'hidden'; };
  const closeForm = () => { setFormOpen(false); document.body.style.overflow = ''; };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try { await fetch('https://decaflow-backend.onrender.com/v1/verify/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, source: 'verify-page' }) }); } catch {}
    setFormStep('success'); setFormLoading(false);
  };

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
            <button onClick={() => openForm('Business')} style={{ background: '#8b5cf6', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Get Free API Key</button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: '6rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '100px', padding: '0.4rem 1rem', fontSize: '0.78rem', color: '#c4b5fd', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Wallet Screening API
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.6rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Know Who You're{' '}
            <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Transacting With
            </span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', maxWidth: '660px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Global wallet screening API. Sanctions checking, mixer detection, darknet exposure, and jurisdiction risk scoring across 7 chains. Sub-100ms. First 1,000 checks completely free.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => openForm('Growth')} style={{ background: '#8b5cf6', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>Get Free API Key</button>
            <a href="#pricing" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)' }}>View Pricing</a>
          </div>
        </section>

        {/* ── Demo ── */}
        <section style={{ padding: '3rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '20px', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>Try a Live Wallet Check</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Enter any wallet address to see a sample risk report.</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <select value={demoChain} onChange={e => setDemoChain(e.target.value)}
                style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
                {CHAINS.map(c => <option key={c.id} value={c.id} style={{ background: '#1f2937' }}>{c.label}</option>)}
              </select>
              <input type="text" placeholder="0x... wallet address" value={demoAddress} onChange={e => setDemoAddress(e.target.value)} onKeyDown={e => e.key === 'Enter' && runDemo()}
                style={{ flex: '1', padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.9rem', outline: 'none', minWidth: '200px', fontFamily: 'monospace' }} />
              <button onClick={runDemo} disabled={demoLoading} style={{ background: '#8b5cf6', color: '#fff', padding: '0.875rem 1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, opacity: demoLoading ? 0.6 : 1 }}>{demoLoading ? 'Scanning...' : 'Check Wallet'}</button>
            </div>
            {demoResult && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${levelColor(demoResult.riskLevel)}40` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${levelColor(demoResult.riskLevel)}20`, border: `2px solid ${levelColor(demoResult.riskLevel)}`, fontSize: '1.1rem', fontWeight: 800, color: levelColor(demoResult.riskLevel), flexShrink: 0 }}>{demoResult.riskScore}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Risk Score: {demoResult.riskScore}/100</div>
                    <div style={{ color: recColor(demoResult.recommendation), fontWeight: 700, fontSize: '0.85rem' }}>{demoResult.riskLevel} RISK — {demoResult.recommendation}</div>
                  </div>
                </div>
                {demoResult.flags?.length > 0 ? demoResult.flags.map((f: string, i: number) => (
                  <div key={i} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: levelColor(demoResult.riskLevel) }}>⚠</span>{f}
                  </div>
                )) : (
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '0.5rem' }}><span style={{ color: '#22c55e' }}>✓</span>No risk factors identified</div>
                )}
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.75rem', marginBottom: 0 }}>Report ID: {demoResult.reportId} · * Demo output. Production API delivers live on-chain data.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem' }}>What the Verify API checks</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '3rem' }}>Global coverage. One API call.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
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
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Who uses the Verify API</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
              {USE_CASES.map((u, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{u.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{u.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── API Response ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>API response format</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {(['response', 'fields'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: activeTab === t ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.12)', background: activeTab === t ? 'rgba(139,92,246,0.15)' : 'transparent', color: activeTab === t ? '#c4b5fd' : 'rgba(255,255,255,0.6)' }}>
                {t === 'response' ? 'Sample Response' : 'Field Reference'}
              </button>
            ))}
          </div>
          {activeTab === 'response' ? (
            <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.4rem' }}>
                {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                <span style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>response.json</span>
              </div>
              <pre style={{ margin: 0, padding: '1.25rem', fontSize: '0.78rem', lineHeight: 1.75, color: '#e2e8f0', overflowX: 'auto' }}>
{`{
  "riskScore": 12,
  "riskLevel": "LOW",
  "sanctionsMatch": false,
  "sanctionsDetails": null,
  "mixerExposure": 0.00,
  "darknetExposure": 0.00,
  "jurisdictionRisk": "LOW",
  "hopsAnalysed": 5,
  "recommendation": "APPROVE",
  "flags": [],
  "reportId": "rpt_8f2a1c93d",
  "checkedAt": "2026-07-18T10:22:00Z"
}`}
              </pre>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {RESPONSE_FIELDS.map((r, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.9rem 1.1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <code style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '0.85rem' }}>{r.field}</code>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{r.type}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>{r.desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem' }}>Transparent pricing</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '3rem' }}>First 1,000 checks free on every plan.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{ background: plan.highlight ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)', border: plan.highlight ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', position: 'relative' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#8b5cf6', color: '#fff', padding: '0.25rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Most Popular</div>}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 800, color: plan.highlight ? '#8b5cf6' : '#fff' }}>{plan.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>{plan.period}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{plan.checks}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {plan.features.map((f, j) => <li key={j} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}><span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{f}</li>)}
                </ul>
                <button onClick={() => openForm(plan.name)} style={{display:"block",width:"100%",padding:"0.8rem",borderRadius:"10px",fontWeight:700,fontSize:"0.875rem",background:plan.highlight?"#8b5cf6":"rgba(255,255,255,0.07)",color:"#fff",border:plan.highlight?"none":"1px solid rgba(255,255,255,0.12)",cursor:"pointer"}}>
                  {plan.name==="Enterprise"?"Contact Sales":"Get Started"}
                </button>
              </div>
            ))}
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
          <button
            onClick={() => openForm('Growth')}
            style={{
              display: 'inline-block', background: '#8b5cf6', color: '#fff',
              padding: '1rem 2.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontSize: '1.05rem', fontWeight: 700,
            }}
          >
            Get API Access
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
          <div style={{ background: '#111827', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.75rem 2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>{formStep === 'success' ? 'Request Received! 🎉' : `Get Started — ${selectedPlan} Plan`}</h2>
                {formStep !== 'success' && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>A DecaFlow specialist will send your API key within 24 hours.</p>}
              </div>
              <button onClick={closeForm} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
            </div>
            {formStep === 'success' ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>We've got your request!</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2rem' }}>A member of our team will reach out to <strong>{formData.email}</strong> within 24 hours with your API credentials.</p>
                <button onClick={closeForm} style={{ background: '#8b5cf6', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {[['Company Name *', 'companyName', 'e.g. Quidax Ltd', 'text'], ['Your Name *', 'contactName', 'Full name', 'text'], ['Work Email *', 'email', 'you@company.com', 'email'], ['Telegram / WhatsApp', 'telegram', '@handle or +234...', 'text']].map(([label, field, ph, type]) => (
                    <div key={field as string}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>{label as string}</label>
                      <input required={(label as string).includes('*')} type={type as string} placeholder={ph as string} value={(formData as any)[field as string]}
                        onChange={e => setFormData(p => ({ ...p, [field as string]: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>Expected Monthly Check Volume</label>
                  <select value={formData.expectedVolume} onChange={e => setFormData(p => ({ ...p, expectedVolume: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}>
                    <option value="">Select volume range</option>
                    {['Under 1,000/month', '1,000–50,000/month', '50,000–500,000/month', '500,000+/month'].map(o => <option key={o} value={o} style={{ background: '#1f2937' }}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>Additional Information</label>
                  <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} rows={3}
                    placeholder="Tell us about your wallet screening needs..."
                    style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" disabled={formLoading} style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', opacity: formLoading ? 0.6 : 1 }}>
                  {formLoading ? 'Submitting...' : `Submit Request — ${selectedPlan} Plan`}
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
