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
                  <button onClick={() => openForm(plan.name)} style={{display:"block",width:"100%",padding:"0.8rem",borderRadius:"10px",fontWeight:700,fontSize:"0.875rem",background:plan.highlight?"#8b5cf6":"rgba(255,255,255,0.07)",color:"#fff",border:plan.highlight?"none":"1px solid rgba(255,255,255,0.12)",cursor:"pointer"}}>
                    {plan.name==="Enterprise"?"Contact Sales":"Get Started"}
                  </button>
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
          © 2026 DecaFlow Solutions Limited 
        </footer>
      </div>
    </>
  );
}
