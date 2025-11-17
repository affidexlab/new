# RWA Yield Router (Non-Custodial) — 8‑Week MVP Plan

Audience: Wallets / Exchanges (B2B first)
Scope: Global, avoid US users initially
Chain: Ethereum L2 first (Arbitrum mainnet beta)
Funding target: $1,000,000 pre‑seed

## 1) Product summary
A non‑custodial, issuer‑agnostic yield router that makes tokenized cash equivalents (e.g., short‑term U.S. Treasuries, money‑market fund tokens) accessible via a single SDK and policy engine. Wallets and exchanges integrate one interface; our contracts + off‑chain connectors route to eligible instruments per jurisdiction/KYC status, maximizing after‑fee yield and preserving liquidity constraints.

We do not issue assets or take custody. Users mint/redeem eligible RWA tokens directly to their own wallets; we orchestrate eligibility checks, policy enforcement, and settlement flows.

## 2) Architecture (high level)
- On‑chain (Arbitrum first):
  - AllowlistRegistry: Minimal registry of issuer‑provided attestations for addresses (non‑US, KYC tier, instrument eligibility, expiry). Append‑only, role‑gated updaters.
  - PolicyEngine: Configurable rules per instrument SKU (jurisdiction constraints, holding limits, lockups, re‑sale restrictions). Pure/view logic where possible.
  - VaultRouter: Orchestration contract that validates PolicyEngine + AllowlistRegistry, then facilitates mint/redeem calls to whitelisted issuer bridges/wrappers. Holds no pooled assets; tokens settle to user wallet. Emits standardized events for analytics.
  - IntentInterface: Minimal contract to accept signed intents (EIP‑712) that encode constraints (min APY, liquidity horizon, max fee) and authorization for a solver to execute on behalf of the user.

- Off‑chain services:
  - Issuer Connectors: API clients + webhook handlers for whitelisting, document signing, and order placement where required by transfer agents (e.g., Securitize, Backed, Matrixdock, OpenEden, Ondo). They produce attestations anchored on‑chain.
  - KYC/KYB & Sanctions Screening: Integrate a provider (e.g., Sumsub, Persona, Fractal) with a policy to avoid US persons and restricted jurisdictions. Portable allowlist across issuers.
  - Jurisdiction Engine: Evaluates user residency and instrument constraints; writes signed attestations (Merkle proofs) consumable by AllowlistRegistry.
  - Intent Solver: Listens to on‑chain intent events, computes best eligible route, executes with proofs, and records receipts. Pluggable solver market later.
  - Observability: Indexer + dashboards (eligibility funnels, intent fill rates, time‑to‑whitelist, APY after fees).

- Frontend/SDK:
  - Typescript SDK for wallets/exchanges with 3 primitives: getEligibility(address), submitIntent(params), getPositions(address).
  - Reference UI (embedded widget) for KYC + consent + preview yield.

Security and posture:
- No custody, no pooling; router only orchestrates.
- Strict allowlist of issuer endpoints and token contracts.
- Pausable/guarded functions, role separation, timelock on config.
- External audits before public mainnet; formal invariants for critical paths.

## 3) Issuer shortlist for non‑US eligibility (subject to BD and legal)
- Backed Finance (Switzerland) — BTokens (e.g., short‑term UST exposure), transferable under Swiss DLT law to non‑US, qualified investors depending on SKU.
- Matrixdock STBT (Singapore) — tokenized short‑term T‑bills targeted at non‑US professional investors.
- OpenEden TBILL (Singapore) — tokenized T‑bills with non‑US focus.
- Ondo USDY / OUSG — evaluate non‑US eligible share classes and transfer mechanics on Ethereum L2; start with the SKU that allows non‑US distribution.
- (Stretch) Franklin FOBXX and BlackRock BUIDL are largely US/institutional; we integrate later when distribution permits non‑US retail/Pro investors via partners.

We will confirm each issuer’s distribution rules and SKUs with counsel; MVP integrates 1–2 that permit non‑US onboarding via API.

## 4) Week‑by‑week plan (8 weeks)

Week 1 — Scoping, legal, issuer BD, chain selection
- Confirm “avoid US” compliance posture with counsel; document KYC policy and blocked regions.
- Select Arbitrum for L2 (fees, infra maturity, institutional interest); set up testnets and infra.
- Finalize MVP feature cut: eligibility check, one issuer integration, intents, SDK, reference UI.
- Begin BD with 2 issuers (e.g., Backed, Matrixdock) for sandbox/simulation access and API docs.
- Draft threat model and security requirements.

Week 2 — Contract skeletons + off‑chain scaffolding
- Implement interfaces and storage schemas for AllowlistRegistry, PolicyEngine, VaultRouter, IntentInterface.
- Off‑chain: bootstrap KYC provider sandbox; scaffold Issuer Connector abstraction; start Jurisdiction Engine (country detection, residency proofs).
- CI, linting, hardhat/foundry test harness, gas snapshots.

Week 3 — Policy & allowlists + minimal routing
- Implement PolicyEngine evaluation and AllowlistRegistry attestations (issuer and KYC keys); event schemas.
- Implement VaultRouter minimal path (single SKU stub) with guarded config and whitelisted target contracts.
- Unit tests for policy/allowlist paths; fuzz tests on selector logic.

Week 4 — First issuer integration (sandbox)
- Build Connector A (e.g., Backed/Matrixdock) for onboarding + mint/redeem; implement off‑chain document flow and on‑chain attestation updates.
- Integrate IntentInterface → off‑chain Solver to produce transactions; EIP‑712 signatures, nonces, expiries.
- End‑to‑end on Arbitrum testnet with mock KYC and simulated mint/redeem.

Week 5 — SDK + reference UI + analytics
- TS SDK v0: eligibility check, submit intent, read positions/events.
- Reference widget for wallets/exchanges (React) with KYC handoff, consent capture, and preview yields.
- Stand up indexer + dashboards (eligibility funnel, time‑to‑whitelist, APY after fees).

Week 6 — Hardening and reviews
- Add formal invariants for routing safety; add pausable + role separation + timelock.
- Internal security review, dependency audit, static analysis; expand test coverage (>90% for protocol logic).
- Legal/compliance review of flows and disclaimers; finalize ToS for B2B integrators.

Week 7 — Pilot integrations
- Integrate with 1 wallet/exchange partner in staging; run a cohort of non‑US users through KYC and mint/redeem.
- Add Connector B feasibility (second issuer API mapping) to prove multi‑issuer abstraction.
- Collect feedback; iterate SDK ergonomics.

Week 8 — Mainnet beta (gated)
- Deploy contracts to Arbitrum mainnet behind allowlist gates.
- Run playbooks: incident response, config changes, key rotations, monitoring alerts.
- Publish docs and integration guides; announce private beta with partner(s).

## 5) Deliverables
- Protocol: 4 contracts with tests and deploy scripts.
- Off‑chain: 1 issuer connector in sandbox, KYC integration, Jurisdiction Engine MVP, intent solver v0, indexer + dashboards.
- SDK & widget: TS SDK, React widget, integration docs.
- Security: internal review report, checklist; shortlist 2 audit firms and booked slots (post‑MVP).
- BD: 1 signed sandbox agreement with issuer; 1 wallet/exchange pilot MOU.

## 6) KPIs and success criteria (MVP)
- 1 wallet/exchange integration in staging; 1 issuer connector live (testnet → mainnet beta).
- < 24 hours time‑to‑whitelist for compliant non‑US users.
- 95%+ successful intent fills; < 30s solver turnaround for in‑hours KYC’d users.
- $250k–$1M routed volume in controlled beta (subject to issuer minimums and caps).
- Zero custody of user assets; no critical security findings in internal review.

## 7) Compliance posture (non‑US MVP)
- No marketing to US persons; block US IPs and attest residency; KYC with sanctions screening.
- We do not issue tokens or custody assets; users mint to self‑custody wallets.
- Each integrated issuer’s transfer restrictions and resale rules enforced via PolicyEngine.
- Clear disclaimers: no investment advice; eligibility and availability vary by jurisdiction.

## 8) Use of proceeds (Seed $1,000,000; 12–15 months runway)
- Team (≈$640k): 2 protocol engineers, 1 backend, 1 full‑stack, 1 BD/compliance ops contractor.
- Security/Audits (≈$120k): static/dynamic analysis, audit deposit, bug bounty kickoff.
- Legal/Compliance (≈$120k): outside counsel, KYC provider fees, policy reviews.
- Infra/Ops (≈$70k): nodes, monitoring, logging, CI/CD, testnets.
- BD/Partnerships (≈$50k): travel, pilots, integrations, collateral.

## 9) Risks & mitigations
- Issuer fragmentation / changing terms: abstract via Connector layer; maintain 2+ issuers.
- Regulatory shifts: non‑US focus MVP; keep modular policy engine; counsel reviews.
- Security: small surface on‑chain; strict whitelists; staged rollouts; external audits.
- Distribution dependency: prioritize SDK ergonomics and revenue share for wallet partners.
- Liquidity/settlement delays at issuers: set user expectations; show SLAs; choose SKUs with faster liquidity.

## 10) Roadmap beyond MVP (quarter following)
- Add second and third issuer; expand chain support (Optimism/Base), explore Solana bridge after EVM maturity.
- Portable KYC across issuers; add more granular eligibility tiers.
- Automated rebalancing across instruments for net yield after fees, respecting liquidity and policy.
- White‑label dashboards for partners; add custody integrations for institutional clients.

## 11) Notes
- All issuer integrations and eligibility flows are subject to confirmation with each transfer agent and legal review.
- We explicitly avoid US users at MVP; future US access will require separate product tracks aligned with applicable law.
