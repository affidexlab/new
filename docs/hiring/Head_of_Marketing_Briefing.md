# DecaFlow — Head of Marketing Briefing Document

**Prepared for:** Incoming Head of Marketing  
**Last Updated:** August 2026

---

## Executive Summary

DecaFlow is a Web3 infrastructure company that provides compliance, security, and risk intelligence solutions for the crypto industry. We help exchanges, DeFi protocols, fintechs, institutional investors, and RWA (Real-World Asset) issuers stay compliant with regulations, protect their smart contracts, and screen wallets for illicit activity.

**Our position:** We compete with companies like Chainalysis, TRM Labs, and Elliptic in risk intelligence, and with OpenZeppelin Defender and Forta in smart contract security — but we're building everything in-house as a vertically integrated platform, not relying on third-party data providers.

**Current status:** Public beta. All core products are live and functional. We're onboarding early customers and preparing for broader market launch.

---

## The Market Opportunity

### Why This Matters Now

1. **Regulatory pressure is intensifying.** MiCA in Europe, state-by-state licensing in the US, FATF Travel Rule globally — every crypto business needs compliance infrastructure or risks shutdown.

2. **Smart contract hacks are epidemic.** Billions lost annually to exploits. Protocols and institutions need continuous security monitoring, not just one-time audits.

3. **Institutional money is entering.** BlackRock, Fidelity, and traditional finance are tokenizing assets. They need compliant rails — identity verification, accredited investor checks, transfer restrictions.

4. **Current solutions are expensive and fragmented.** Chainalysis costs $100K+/year. Security monitoring is disconnected from compliance. There's no single platform that does it all.

### Total Addressable Market

- **Wallet screening / risk intelligence:** $500M+ and growing 30%+ annually
- **Smart contract security:** $200M+ (audits + monitoring)
- **RWA / tokenized securities compliance:** Emerging — potentially $1B+ as the market matures

---

## Our Products

DecaFlow offers six core products. Here's what each does, who buys it, and how it's priced.

---

### 1. Verify API — Wallet Risk Intelligence

**What it is:**  
An API that screens wallet addresses for sanctions, mixer exposure, darknet activity, scam associations, and other risk signals. Returns a risk score, risk level, and recommendation (approve/review/reject).

**How it works:**  
- Customer integrates our API into their onboarding, withdrawal, or transaction flow
- Every wallet is screened against DecaFlow's proprietary risk database
- Response includes: risk score (0–100), risk level (low/medium/high/critical), specific flags (sanctioned, mixer, scam, etc.), and recommendation

**Who buys it:**  
- Crypto exchanges (for KYC/onboarding and transaction monitoring)
- DeFi protocols (for front-end blocking)
- Fintechs with crypto features
- OTC desks and payment processors

**Pricing:**

| Plan | Price | Monthly Checks | API Keys |
|------|-------|----------------|----------|
| Developer | $99/month | 1,000 | 1 |
| Growth | $299/month | 50,000 | 2 |
| Business | $999/month | 500,000 | 5 |
| Enterprise | Custom | Unlimited | Unlimited |

**Competitive advantage:**  
- DecaFlow owns the risk data — we don't resell Chainalysis or TRM
- Lower cost than incumbents ($100K+/year vs. our $12K/year for Business)
- Same API also powers our Compliance and Autopilot products

---

### 2. Compliance — Managed Compliance Workflows

**What it is:**  
A case management system for crypto compliance teams. Policies, analyst queues, case assignment, escalation workflows, decision audit trails, and regulator-ready CSV exports.

**How it works:**  
- Compliance team defines policies (risk thresholds, jurisdiction rules, etc.)
- Alerts from Verify screening flow into review queues
- Analysts review cases, make decisions, document reasoning
- All decisions are logged for regulatory evidence
- Export case histories for regulators on demand

**Who buys it:**  
- Exchanges with compliance teams
- Crypto-friendly banks and fintechs
- OTC desks and brokerages
- Any business that needs auditable compliance evidence

**Pricing:**  
Custom — typically $2,000–$10,000/month depending on volume and features.

**Competitive advantage:**  
- Integrated with Verify API — no separate vendor for screening vs. case management
- Purpose-built for crypto compliance, not adapted from traditional finance
- Regulator-ready export formats

---

### 3. Shield — Smart Contract Security Monitoring

**What it is:**  
Continuous security monitoring for deployed smart contracts. Watches for ownership changes, proxy upgrades, suspicious approvals, large transfers, role grants/revokes, and known vulnerability patterns.

**How it works:**  
- Customer registers contract addresses to monitor
- DecaFlow monitors on-chain events every 15 minutes
- Alerts fire on suspicious activity (ownership transfer, proxy upgrade, etc.)
- Incidents are created for investigation
- Optional: upload contract ABI for privileged function detection

**Supported chains:**  
Ethereum, Base, Arbitrum, Polygon, Avalanche (more coming)

**Who buys it:**  
- DeFi protocols (treasuries, governance contracts)
- DAOs
- NFT projects
- Any project with significant on-chain value

**Pricing:**

| Plan | Price | Contracts | Features |
|------|-------|-----------|----------|
| Starter | $500/month | Up to 5 | Core monitoring, email alerts |
| Growth | $1,500/month | Up to 20 | + vulnerability scanning, ABI detection |
| Enterprise | Custom | Unlimited | + custom playbooks, SLA, dedicated support |

**Competitive advantage:**  
- Built by DecaFlow — not reselling Tenderly or Forta alerts
- Integrated with Verify for wallet risk context on flagged addresses
- Vulnerability scanning included, not a separate product

---

### 4. Autopilot — Agentic Compliance Automation

**What it is:**  
Rules-based compliance automation with human-approved decisions. Define rules (e.g., "auto-approve if risk score < 30"), and Autopilot handles routine decisions while escalating edge cases for human review.

**How it works:**  
- Define rules: conditions (risk score thresholds, flags, etc.) + actions (approve/reject/escalate)
- Autopilot evaluates incoming wallets/transactions against rules
- Low-risk items are auto-processed
- Edge cases go to human review queue
- All decisions are logged with full audit trail

**Who buys it:**  
- High-volume exchanges (reduce analyst workload)
- Fintechs with crypto features
- Payment processors
- Any business processing thousands of transactions daily

**Pricing:**  
From $1,000/month — custom based on volume and automation depth.

**Competitive advantage:**  
- Human-in-the-loop by design — we don't claim "fully autonomous" because that's a liability risk
- Integrated with Verify + Compliance — same platform, not another vendor
- Designed for compliance teams, not just engineering

**Important note for marketing:**  
Do NOT claim Autopilot "automatically freezes funds" or "autonomously blocks transactions." It's human-approved automation. This is deliberate — auto-freezing customer funds without human review is legally dangerous.

---

### 5. Security Audit — Smart Contract Audits

**What it is:**  
Manual security audits of smart contracts by experienced auditors. Fixed-scope engagements with detailed findings reports.

**How it works:**  
- Customer submits contract code for scoping
- DecaFlow provides quote based on complexity
- Audit is performed (typically 1–4 weeks)
- Customer receives findings report with severity ratings
- Follow-up review after fixes (usually included)

**Who buys it:**  
- Any project launching smart contracts
- DeFi protocols before mainnet
- NFT projects
- RWA issuers before token deployment

**Pricing:**  
$5,000–$50,000+ depending on contract complexity and scope.

**Competitive advantage:**  
- Leads into Shield monitoring post-audit
- Combined with compliance products for full-stack coverage
- Competitive pricing vs. top-tier firms ($100K+)

---

### 6. Institutional — RWA Compliance Suite

**What it is:**  
Complete compliance infrastructure for tokenized real-world assets (securities). Includes:
- **DecaFlow KYC/KYB:** Native identity verification — document upload, liveness checks, review queue
- **Accredited Investor Verification:** Income, net worth, licensed professional, qualified entity
- **On-chain Identity Attestations:** Wallet-bound KYC status without exposing personal data
- **Investor Eligibility Checks:** Automated compliance decisions (approve/review/reject)
- **Pre-audited Contract Templates:** ERC-3643 compliant security token contracts

**How it works:**  
1. Investor submits KYC application + documents
2. DecaFlow analysts review and verify
3. Approved investors receive on-chain identity attestation
4. RWA token contract checks attestation before allowing transfers
5. All decisions are logged for regulatory evidence

**Who buys it:**  
- RWA issuers (real estate, private equity, debt, etc.)
- Tokenization platforms
- Security token exchanges
- Fund administrators going on-chain

**Pricing:**

| Plan | Price | Assets | Features |
|------|-------|--------|----------|
| Issuer | $2,500/month | 1 token | Identity registry, standard compliance rules |
| Scale | $10,000/month | Multiple | Custom rules, priority support, quarterly review |
| Enterprise | Custom | Unlimited | Dedicated engineering, full integration support |

**Competitive advantage:**  
- DecaFlow IS the KYC provider — no third-party dependency (unlike competitors using Sumsub, Persona, etc.)
- Full stack: KYC + risk screening + attestations + contracts
- Pre-audited ERC-3643 templates — the standard regulators recognize

**Important note for marketing:**  
DecaFlow provides compliance **infrastructure**. We are NOT securities lawyers. Every issuer must have their own securities counsel approve their specific offering. Do not claim "legally compliant" — claim "compliance infrastructure."

---

## Customer Journey

Here's how customers typically engage with DecaFlow:

### Path 1: Exchange / Fintech
1. Discovers Verify API for wallet screening
2. Integrates API into onboarding flow
3. Adds Compliance for case management
4. Upgrades to Autopilot for automation

### Path 2: DeFi Protocol / DAO
1. Gets Security Audit before launch
2. Deploys Shield for ongoing monitoring
3. Uses Verify to screen treasury interactions

### Path 3: RWA Issuer
1. Engages Institutional for compliance suite
2. Onboards investors through DecaFlow KYC
3. Deploys pre-audited token contracts
4. Ongoing investor eligibility checks

---

## Competitive Landscape

### Risk Intelligence (Verify competitor)

| Company | Strength | Weakness vs. DecaFlow |
|---------|----------|----------------------|
| Chainalysis | Market leader, trusted brand | $100K+/year, slow sales cycle |
| TRM Labs | Strong institution relationships | Expensive, complex integration |
| Elliptic | Good EU presence | Similar pricing issues |
| **DecaFlow** | Lower cost, integrated platform | Newer brand, building track record |

### Smart Contract Security (Shield competitor)

| Company | Strength | Weakness vs. DecaFlow |
|---------|----------|----------------------|
| OpenZeppelin Defender | Strong brand, mature product | Not integrated with compliance |
| Forta | Decentralized detection network | Complex setup, separate from compliance |
| Tenderly | Good developer tools | Monitoring is add-on, not core focus |
| **DecaFlow** | Integrated with risk intelligence | Newer product |

### RWA Compliance (Institutional competitor)

| Company | Strength | Weakness vs. DecaFlow |
|---------|----------|----------------------|
| Securitize | Market leader in US | Very expensive, closed ecosystem |
| Tokeny | Strong in Europe | Limited risk intelligence integration |
| Polymath | Early mover | Less active recently |
| **DecaFlow** | Integrated KYC + risk + contracts | Newer to market |

---

## Pricing Summary

| Product | Entry Price | Target Customer |
|---------|-------------|-----------------|
| Verify API | $99/month | Developers, small exchanges |
| Verify Growth | $299/month | Growing exchanges, fintechs |
| Verify Business | $999/month | Mid-size exchanges |
| Compliance | ~$2,000+/month | Exchanges with compliance teams |
| Shield | $500/month | DeFi protocols, DAOs |
| Autopilot | $1,000+/month | High-volume processors |
| Security Audit | $5,000+ | Pre-launch projects |
| Institutional | $2,500/month | RWA issuers |

**Average deal size target:** $5,000–$15,000/month for enterprise customers.

---

## Key Marketing Messages

### Primary Value Proposition
"The compliance and security infrastructure for Web3 — wallet risk intelligence, smart contract monitoring, and RWA compliance in one platform."

### Product-Specific Messages

**Verify:**  
"Screen every wallet for sanctions, mixers, scams, and fraud — in milliseconds, at a fraction of Chainalysis pricing."

**Shield:**  
"Know the moment your smart contract is compromised. Continuous monitoring for ownership changes, proxy upgrades, and suspicious activity."

**Autopilot:**  
"Stop reviewing every transaction manually. Automate routine compliance decisions while keeping humans in the loop for edge cases."

**Institutional:**  
"The complete compliance stack for tokenized securities — KYC, accredited investor verification, and pre-audited contracts, all from DecaFlow."

### What NOT to Claim
- ❌ "Fully autonomous compliance" (we're human-approved automation)
- ❌ "Legally compliant" (we provide infrastructure, not legal advice)
- ❌ "Better than Chainalysis" (we're different, not necessarily "better" for every use case)
- ❌ "Unhackable" or "100% secure" (nothing is)

---

## Target Industries

**Tier 1 (Primary focus):**
- Crypto exchanges (CEX and DEX with front-ends)
- Fintechs with crypto features
- DeFi protocols with significant TVL
- RWA / tokenization platforms

**Tier 2 (Secondary):**
- OTC desks and brokerages
- Crypto-friendly banks
- Payment processors
- NFT marketplaces

**Tier 3 (Longer-term):**
- Traditional finance entering crypto
- Hedge funds and asset managers
- Corporate treasuries holding crypto

---

## Go-to-Market Priorities

### Immediate (Next 30 days)
1. Close first 5–10 paying customers across products
2. Get case studies / testimonials for each product
3. Launch content marketing (blog, Twitter, LinkedIn)
4. Identify 50 target accounts for outbound

### Short-term (60–90 days)
1. Hire BD executives (target-based comp)
2. Build partnership pipeline (integrations, resellers)
3. Conference presence (ETHGlobal, Token2049, etc.)
4. Paid ads testing (Twitter, crypto newsletters)

### Medium-term (6 months)
1. 50+ paying customers
2. $100K+ MRR
3. 2–3 enterprise logos ($10K+/month)
4. Recognized brand in crypto compliance space

---

## Resources

- **Website:** decaflow.xyz
- **Product pages:** /verify, /compliance, /shield, /agents (Autopilot), /audit, /institutional
- **Customer portal:** /login
- **Backend API:** decaflow-backend.onrender.com
- **GitHub:** github.com/affidexlab/new (private)

---

## Questions for the Founder

As you onboard, you'll want to clarify:

1. **Budget:** What's the marketing budget for the first 90 days?
2. **Hiring:** How many BD executives are we hiring?
3. **Priorities:** Which product should we push hardest first?
4. **Pricing flexibility:** How much room is there to negotiate enterprise deals?
5. **Case studies:** Do we have any early customers who can be referenced?
6. **Content:** Who's responsible for writing (you, founder, outsourced)?
7. **Events:** Which conferences should we target?

---

*This document is confidential and intended for internal use only.*
