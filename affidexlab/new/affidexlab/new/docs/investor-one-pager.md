# Investor One‑Pager — RWA Yield Router (Non‑Custodial)

Audience: Wallets / Exchanges (B2B integration first)
Scope: Global, avoid US users initially
Chain: Ethereum L2 first (Arbitrum)
Raise: $1,000,000 pre‑seed

## Problem
Wallets and exchanges want to offer safe, yield‑bearing “cash” on‑chain but face fragmented issuers, jurisdictional rules, bespoke KYC flows, and clunky UX. Integrations are costly, compliance is inconsistent, and switching between instruments is manual.

## Solution
A non‑custodial yield router and policy engine that aggregates tokenized cash equivalents (e.g., T‑bill/money‑market tokens) behind one SDK. We standardize eligibility (KYC/allowlists), enforce issuer constraints on‑chain, and route user intents to the best eligible instrument with verifiable execution — no custody, no advice.

## Product
- Contracts (Arbitrum): AllowlistRegistry, PolicyEngine, VaultRouter, IntentInterface.
- Off‑chain: Issuer Connectors (KYC/whitelisting + mint/redeem), Jurisdiction Engine, Intent Solver, analytics.
- SDK + Widget: 3 calls to integrate (eligibility, submit intent, positions). Reference UI for KYC and consent.
- Compliance: Non‑US users only at MVP; enforce issuer transfer restrictions; sanctions screening; clear disclaimers.

## Why now
- RWAs and on‑chain treasuries are the leading institutional theme. Tokenized T‑bill products have grown into multi‑billion AUM, with major managers (BlackRock, Franklin, Ondo) entering.
- Wallets/exchanges need compliant yield to retain users and deposits; regulators push for clarity outside the US; L2s offer low‑fee rails.
- Intent‑based execution and solver networks are maturing, enabling clean UX with auditable routes.

## Market
- On‑chain cash/yield TAM: fast‑growing multi‑billion AUM today; broader tokenization market projected to reach trillions by 2030. Target customers: wallets, exchanges, treasurers, and payment apps outside the US.

## Business model
- B2B integration fees + per‑transaction routing fees (bps) paid by partners.
- Optional SaaS for eligibility/KYC tooling and dashboards.
- Volume incentives and co‑marketing with issuers and custody partners.

## Go‑to‑market
- Integrate with 1–2 wallets/exchanges in private beta; offer revenue share on routed yield.
- Start with 1–2 non‑US‑eligible issuers (e.g., Backed/Matrixdock/OpenEden) and expand coverage.
- Ship an embeddable widget and simple SDK to minimize engineering lift for partners.

## Traction plan (next 8–12 weeks)
- Week 4: First issuer sandbox end‑to‑end on testnet.
- Week 6: SDK v0 + internal security review.
- Week 7: Pilot wallet integration in staging, non‑US users through KYC and mint/redeem.
- Week 8: Arbitrum mainnet gated beta with first partner.
- KPI targets: <24h whitelist time; 95%+ intent fill rate; $250k–$1M routed in controlled beta.

## Tech & compliance moat
- Portable allowlist + policy engine standardizing eligibility across issuers; partners integrate once.
- Verifiable execution (intents + receipts) and auditable event stream for partners and regulators.
- Distribution moat via wallet/exchange SDK + rev‑share; data network effects as coverage grows.
- Non‑custodial architecture reduces licensing exposure and shortens sales cycles.

## Team
- Protocol, exchange, and compliance experience (details available upon request). Hiring to expand protocol/backend, BD/compliance ops, and security.

## Raise & use of proceeds ($1,000,000)
- 12–15 months runway. Team (≈64%), security/audits (≈12%), legal/compliance (≈12%), infra/ops (≈7%), BD/partnerships (≈5%).
- Milestones to next round: 3+ issuers integrated, 3+ wallet/exchange partners live, $25–50M routed cumulative, external audit completed, revenue‑generating pilots.

## Risks & mitigations
- Issuer fragmentation / policy churn → Connector abstraction + multi‑issuer coverage.
- Regulatory changes → Non‑US MVP; modular policy; regular counsel reviews.
- Security → Small on‑chain surface area; staged rollouts; external audits and bounties.
- Distribution reliance → SDK ergonomics; commercial incentives; co‑marketing and support.

## Ask
Seeking $1,000,000 pre‑seed to complete MVP, secure first wallet/exchange integrations, and undergo security reviews. Intros to non‑US RWA issuers and wallets/exchanges welcome.
