/**
 * ============================================================
 * DECAFLOW HOMEPAGE — NEW SECTIONS TO ADD
 * ============================================================
 *
 * HOW TO USE THIS FILE:
 * Open your existing pages/index.tsx (from the main repo).
 * Find the closing </main> or the footer section near the bottom.
 * Paste ALL the JSX sections below BEFORE the footer/closing tag.
 * Also paste the nav links and the hero rebrand at the top.
 *
 * This file contains:
 * 1. Updated hero copy (replace your existing hero text)
 * 2. New "What We Do" services overview section
 * 3. Compliance section with link to /compliance
 * 4. Security Audit section with link to /audit
 * 5. Verify API section with link to /verify
 * 6. Updated footer with company details
 * ============================================================
 */

// ─── 1. NAV ADDITIONS ────────────────────────────────────────────────────────
// Add these links to your existing nav component alongside your existing links:
//
// <Link href="/compliance">Compliance</Link>
// <Link href="/audit">Security Audit</Link>
// <Link href="/verify">Verify API</Link>
//
// ─────────────────────────────────────────────────────────────────────────────


// ─── 2. HERO — REPLACE your existing hero h1/subtitle with this ──────────────
export const HeroRebrand = () => (
  <div style={{ textAlign: 'center' }}>
    {/* Eyebrow */}
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
      borderRadius: '100px', padding: '0.35rem 1rem', fontSize: '0.78rem',
      color: '#93C5FD', fontWeight: 600, letterSpacing: '0.06em',
      textTransform: 'uppercase' as const, marginBottom: '1.5rem',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
      Web3 Infrastructure · Privacy · Compliance · Security
    </div>

    {/* Headline */}
    <h1 style={{
      fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: 800,
      lineHeight: 1.08, letterSpacing: '-0.035em', marginBottom: '1.5rem',
    }}>
      The Complete{' '}
      <span style={{
        background: 'linear-gradient(135deg, #3B82F6 0%, #818CF8 60%, #a78bfa 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Web3 Infrastructure
      </span>
      {' '}Layer
    </h1>

    {/* Subtitle */}
    <p style={{
      fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)',
      maxWidth: '680px', margin: '0 auto 2.5rem', lineHeight: 1.75,
    }}>
      MEV-protected swaps. On-chain AML compliance. Smart contract security audits.
      Global wallet screening. One platform — built for the next generation of Web3.
    </p>
  </div>
);


// ─── 3. SERVICES OVERVIEW SECTION ────────────────────────────────────────────
// Paste this AFTER your existing swap/bridge UI section and BEFORE the footer
export const ServicesOverview = () => (
  <section style={{
    padding: '6rem 2rem',
    background: 'rgba(255,255,255,0.02)',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)', borderRadius: '100px',
          padding: '0.35rem 1rem', fontSize: '0.75rem', color: '#93C5FD',
          fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const,
          marginBottom: '1.25rem',
        }}>
          Full-Stack Web3 Infrastructure
        </div>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800,
          letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '1rem',
        }}>
          Everything your protocol needs.<br />Nothing it doesn't.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '580px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
          DecaFlow is no longer just a DEX. We are the infrastructure layer that makes Web3 safer,
          more compliant, and more trustworthy — for builders, users, and regulators alike.
        </p>
      </div>

      {/* Service cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>

        {/* Card 1 — Swap & Bridge (existing) */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column' as const,
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', marginBottom: '1.25rem',
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
          }}>🔄</div>
          <div style={{
            display: 'inline-block', background: 'rgba(59,130,246,0.12)',
            borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.7rem',
            color: '#93C5FD', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase' as const, marginBottom: '0.75rem', width: 'fit-content',
          }}>
            Core Product
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            MEV-Protected Swaps & Bridge
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.65, flex: 1, marginBottom: '1.5rem' }}>
            Trade across 6 EVM chains with built-in protection against frontrunning, sandwich attacks,
            and MEV extraction. Private mempool routing via CoW Protocol.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const, marginBottom: '1.5rem' }}>
            {['Arbitrum', 'Base', 'Optimism', 'Polygon', 'Ethereum', 'Avalanche'].map(c => (
              <span key={c} style={{
                background: 'rgba(255,255,255,0.07)', borderRadius: '6px',
                padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)',
              }}>{c}</span>
            ))}
          </div>
          <a href="#swap" style={{
            display: 'block', textAlign: 'center', padding: '0.75rem',
            borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
            background: 'rgba(59,130,246,0.15)', color: '#93C5FD',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            Start Trading →
          </a>
        </div>

        {/* Card 2 — Compliance */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column' as const,
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', marginBottom: '1.25rem',
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
          }}>🛡️</div>
          <div style={{
            display: 'inline-block', background: 'rgba(34,197,94,0.1)',
            borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.7rem',
            color: '#86efac', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase' as const, marginBottom: '0.75rem', width: 'fit-content',
          }}>
            New
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            Compliance & Transaction Monitoring
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.65, flex: 1, marginBottom: '1.5rem' }}>
            Real-time AML compliance engine for crypto exchanges, fintechs, and DeFi protocols.
            Sanctions screening, risk scoring, and audit-ready reports. Built to global compliance standards, including MiCA.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.4rem', marginBottom: '1.5rem' }}>
            {['OFAC & UN sanctions screening', 'Risk score 0–100 per transaction', 'Regulator-ready PDF reports'].map(f => (
              <div key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ color: '#22c55e' }}>✓</span> {f}
              </div>
            ))}
          </div>
          <a href="/compliance" style={{
            display: 'block', textAlign: 'center', padding: '0.75rem',
            borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
            background: 'rgba(34,197,94,0.12)', color: '#86efac',
            border: '1px solid rgba(34,197,94,0.2)',
          }}>
            Explore Compliance →
          </a>
        </div>

        {/* Card 3 — Security Audit */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column' as const,
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', marginBottom: '1.25rem',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
          }}>🔐</div>
          <div style={{
            display: 'inline-block', background: 'rgba(239,68,68,0.1)',
            borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.7rem',
            color: '#fca5a5', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase' as const, marginBottom: '0.75rem', width: 'fit-content',
          }}>
            New
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            Smart Contract Security Audit
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.65, flex: 1, marginBottom: '1.5rem' }}>
            Professional security audits for Solidity, Rust, and Vyper smart contracts.
            10 vulnerability categories. 7-day turnaround. From $800. Formal report on company letterhead.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.4rem', marginBottom: '1.5rem' }}>
            {['Reentrancy & access control', 'Flash loan & oracle attacks', 'Fix verification included'].map(f => (
              <div key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ color: '#22c55e' }}>✓</span> {f}
              </div>
            ))}
          </div>
          <a href="/audit" style={{
            display: 'block', textAlign: 'center', padding: '0.75rem',
            borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
            background: 'rgba(239,68,68,0.1)', color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            Request an Audit →
          </a>
        </div>

        {/* Card 4 — Verify API */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column' as const,
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', marginBottom: '1.25rem',
            background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
          }}>🔍</div>
          <div style={{
            display: 'inline-block', background: 'rgba(139,92,246,0.1)',
            borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.7rem',
            color: '#c4b5fd', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase' as const, marginBottom: '0.75rem', width: 'fit-content',
          }}>
            New · API
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            DecaFlow Verify API
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.65, flex: 1, marginBottom: '1.5rem' }}>
            Global wallet screening API. Sanctions checking, mixer detection, darknet exposure, and
            jurisdiction risk scoring across 7 chains. Sub-100ms. First 1,000 checks free.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.4rem', marginBottom: '1.5rem' }}>
            {['50+ global sanctions lists', '5-hop transaction graph analysis', 'Approve / Review / Reject output'].map(f => (
              <div key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ color: '#22c55e' }}>✓</span> {f}
              </div>
            ))}
          </div>
          <a href="/verify" style={{
            display: 'block', textAlign: 'center', padding: '0.75rem',
            borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
            background: 'rgba(139,92,246,0.1)', color: '#c4b5fd',
            border: '1px solid rgba(139,92,246,0.2)',
          }}>
            Get API Key →
          </a>
        </div>
      </div>
    </div>
  </section>
);


// ─── 4. SOCIAL PROOF / TRUST BAR ─────────────────────────────────────────────
// Removed: unverified "active acquisition discussions" claim naming specific companies.


// ─── 5. STATS SECTION ────────────────────────────────────────────────────────
export const StatsSection = () => (
  <section style={{ padding: '5rem 2rem' }}>
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
        The numbers that drive us
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3.5rem', fontSize: '1rem' }}>
        The problems DecaFlow was built to solve are not theoretical.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { val: '$1.4B+', label: 'Lost to MEV annually across all DeFi', color: '#ef4444' },
          { val: '$6.24M', label: 'MEV extracted on Arbitrum in 30 days', color: '#f97316' },
          { val: '188K+', label: 'Transactions affected by MEV monthly', color: '#f59e0b' },
          { val: '$154B+', label: 'Illicit crypto volume detected globally (2025)', color: '#3B82F6' },
          { val: '6', label: 'EVM networks protected by DecaFlow', color: '#8b5cf6' },
          { val: '500+', label: 'GitHub commits of active development', color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '1.75rem 1.25rem',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>{s.val}</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);


// ─── 6. UPDATED FOOTER ───────────────────────────────────────────────────────
export const NewFooter = () => (
  <footer style={{
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '4rem 2rem 2.5rem',
    background: 'rgba(0,0,0,0.3)',
  }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>

        {/* Brand */}
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Deca<span style={{ color: '#3B82F6' }}>Flow</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            The complete Web3 infrastructure layer. Privacy, compliance, security, and speed — in one platform.
          </p>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
            <div>DecaFlow Solutions Limited</div>
          </div>
        </div>

        {/* Products */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
            Products
          </div>
          {[
            { label: 'MEV-Protected Swap', href: '/#swap' },
            { label: 'Bridge Aggregator', href: '/#bridge' },
            { label: 'Compliance Monitoring', href: '/compliance' },
            { label: 'Security Audit', href: '/audit' },
            { label: 'Verify API', href: '/verify' },
            { label: 'Privacy SDK', href: 'https://www.npmjs.com/package/@decaflow/privacy-sdk' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem',
              textDecoration: 'none', marginBottom: '0.5rem', lineHeight: 1.5,
            }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Developers */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
            Developers
          </div>
          {[
            { label: 'npm: @decaflow/privacy-sdk', href: 'https://www.npmjs.com/package/@decaflow/privacy-sdk' },
            { label: 'GitHub', href: 'https://github.com/affidexlab/new' },
            { label: 'Documentation', href: 'https://docs.decaflow.xyz' },
            { label: 'Protocol Integrations', href: 'https://github.com/affidexlab/decaflow-integrations' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem',
              textDecoration: 'none', marginBottom: '0.5rem', lineHeight: 1.5,
            }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
            Company
          </div>
          {[
            { label: 'decaflow.xyz', href: 'https://decaflow.xyz' },
            { label: 'decaflowsolutions@gmail.com', href: 'mailto:decaflowsolutions@gmail.com' },
            { label: '@decaflowprotocol', href: 'https://x.com/decaflowprotocol' },
            { label: 'Acquisition Enquiries', href: 'mailto:decaflowsolutions@gmail.com?subject=Acquisition Enquiry' },
            { label: 'Partnership', href: 'mailto:decaflowsolutions@gmail.com?subject=Partnership Enquiry' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem',
              textDecoration: 'none', marginBottom: '0.5rem', lineHeight: 1.5,
            }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap' as const, gap: '1rem',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
          © 2026 DecaFlow Solutions Limited · All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
            <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
