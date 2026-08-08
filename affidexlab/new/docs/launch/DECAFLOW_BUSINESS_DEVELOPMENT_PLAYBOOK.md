# DecaFlow Business Development Playbook

## What BD is selling

DecaFlow sells security and compliance infrastructure for Web3 companies. The immediate offer should be framed as a public beta / design-partner program, not a finished enterprise monopoly product. That framing is stronger because it is honest and creates urgency: early customers get influence over the product while DecaFlow builds its proprietary risk graph and Shield monitoring engine.

## Product positioning

### DecaFlow Verify

**One-liner:** Wallet screening API for crypto companies that need fast approve/review/reject risk decisions.

**Who to target:**

- Wallets.
- Exchanges.
- OTC desks.
- Stablecoin apps.
- Payment processors.
- DeFi frontends.
- Launchpads.

**Current pitch:**

> DecaFlow Verify gives teams a wallet-risk decision layer and is moving toward a proprietary DecaFlow risk graph built from sanctions labels, mixer/darknet/scam intelligence, transaction graph exposure, and analyst feedback.

**Be careful:** Do not claim the proprietary graph is already as complete as TRM/Chainalysis. Say it is DecaFlow-owned and actively expanding.

### DecaFlow Compliance

**One-liner:** Compliance workflows for teams that need wallet risk review, audit trails, and human decisions.

**Who to target:**

- Crypto fintechs.
- Exchanges.
- Payment apps.
- Token projects with compliance needs.
- Emerging-market crypto operators.

**Pitch:**

> Compliance teams do not just need a score. They need a workflow: what triggered the alert, who reviewed it, what decision was made, and what evidence supports that decision. DecaFlow turns wallet-risk screening into an operational process.

### DecaFlow Shield

**One-liner:** Continuous smart-contract monitoring that creates alerts and incidents when contract activity looks dangerous.

**Who to target:**

- DeFi protocols.
- Treasuries.
- Token issuers.
- Launchpads.
- DAOs.
- Protocols that already had an audit but still need monitoring.

**Pitch:**

> An audit is a snapshot. Shield is the ongoing watchtower after deployment. It tracks contract activity, creates alerts, opens incidents, and gives teams a response workflow.

**Current honest scope:** Native balance monitoring and internal event/alert/incident infrastructure are built. Deeper watchers are being added: ownership changes, proxy upgrades, role changes, risky counterparties, approval spikes, and suspicious flows.

### DecaFlow Agents

**One-liner:** Human-approved automation for compliance decisions.

**Who to target:**

- Teams overwhelmed by manual review.
- Compliance teams with repeated decision patterns.
- Exchanges and fintechs that cannot fully automate due to regulation.

**Pitch:**

> DecaFlow Agents do not blindly freeze accounts. They learn from repeated human decisions and ask for approval before automating a pattern. That gives speed without losing accountability.

### DecaFlow Institutional / RWA

**One-liner:** Compliance-first infrastructure for tokenized real-world assets.

**Who to target:**

- Real estate tokenization platforms.
- Private credit funds.
- Asset managers exploring tokenization.
- Issuers that need whitelisted transfer rules.

**Pitch:**

> DecaFlow Institutional provides the technical layer for compliant tokenized assets: identity registry, transfer rules, risk oracle, forced-transfer controls, and issuer tooling.

**Important:** This is not ready for real securities without legal review, KYC/accreditation provider, multisig deployment, and final audit. Sell discovery/design-partner work, not instant issuance.

## Best prospects right now

1. Small-to-mid crypto exchanges.
2. Wallet apps.
3. DeFi protocols with treasury risk.
4. Launchpads and token issuers.
5. RWA founders still in planning stage.
6. Audit clients who need post-audit monitoring.
7. African/global fintechs that need affordable compliance workflows.

## Outreach message templates

### Shield outreach

Subject: Continuous monitoring after your audit

> Hi [Name], I saw [Project] is live on [chain]. A one-time audit is useful, but most incidents happen after deployment through admin changes, integrations, compromised keys, or suspicious fund flows. DecaFlow Shield is our continuous monitoring layer: it watches contracts, creates alerts, opens incidents, and gives your team a response workflow. We are onboarding design partners now. Would you be open to a 20-minute call this week?

### Verify/Compliance outreach

Subject: Wallet risk screening + review workflow

> Hi [Name], DecaFlow is building a wallet-risk and compliance workflow platform for crypto teams. The goal is not just a score; it is an approve/review/reject decision, evidence, audit trail, and human review process. We are expanding our proprietary DecaFlow risk graph and onboarding beta partners. Would it be useful to test this against your onboarding or transaction review flow?

### RWA outreach

Subject: Compliance infrastructure for tokenized assets

> Hi [Name], DecaFlow is building institutional infrastructure for RWA issuers: identity registry, compliant transfer rules, wallet eligibility checks, and issuer tooling. We are not offering one-click securities issuance; we work with teams during the legal and technical design phase so the contract rules match counsel-approved requirements. Are you exploring tokenized assets this quarter?

## Discovery questions

### For Verify/Compliance

- What wallets or transactions do you screen today?
- Do you use a vendor now?
- What happens after a wallet is flagged?
- Who approves/rejects cases?
- Do you need API, dashboard, or both?
- What chains matter first?
- What monthly screening volume do you expect?

### For Shield

- Which contracts hold funds?
- Which contracts have admin roles or upgradeability?
- Who should receive alerts?
- What events would be critical for you: ownership changes, balance drops, approvals, upgrades, role changes?
- Do you already have an incident response runbook?
- What chains do you deploy on?

### For RWA

- What asset are you tokenizing?
- Which jurisdictions are involved?
- Are investors retail, accredited, QIBs, or non-US?
- Have you selected securities counsel?
- Do you need KYC, KYB, accreditation, or all three?
- Do you need secondary transfers or only primary issuance?
- What chain do you prefer?

## Pricing guidance for beta

Do not underprice enterprise infrastructure. Use beta pricing with clear scope.

- Verify API beta: free developer tier, paid pilot for higher volume.
- Compliance beta: monthly workflow fee plus implementation.
- Shield beta: charge per monitored contract and chain.
- Agents beta: charge for workflow automation and review queue volume.
- RWA discovery: paid technical/legal design workshop before any deployment.

## What BD must not promise

Do not promise:

- Guaranteed legal compliance.
- Instant RWA issuance.
- Fully autonomous fund freezing.
- Complete Chainalysis/TRM-level graph coverage today.
- Exploit prevention.
- Real-time protection on every chain without chain-specific setup.

Promise instead:

- DecaFlow-owned risk graph under active expansion.
- Human-approved compliance automation.
- Continuous monitoring and incident workflows.
- Early design-partner influence.
- Practical integration support.

## Alchemy webhook setup for BD/customer calls

If a customer asks what is needed for Shield monitoring:

1. They give DecaFlow the contracts to watch.
2. DecaFlow adds those addresses to Alchemy Address Activity webhooks or DecaFlow indexers.
3. Alchemy sends on-chain activity to DecaFlow, and DecaFlow verifies the webhook signature before accepting it.
4. DecaFlow stores graph edges, creates Shield alerts/incidents, and emails the right people.

This is infrastructure, not outsourced intelligence. Alchemy provides node/webhook plumbing. DecaFlow owns interpretation, risk labels, scoring, alert rules, incidents, and customer workflow.

## Sales stages

1. **Discovery call** — understand chain, product, risk, and urgency.
2. **Pilot scope** — pick 1–5 wallets/contracts and one chain.
3. **Data onboarding** — add watched addresses, customer contacts, alert rules.
4. **First report** — show findings, alerts, risk scores, and workflow outcomes.
5. **Paid expansion** — more contracts, chains, API usage, and workflow automation.

## Best immediate launch motion

Launch as:

> DecaFlow Public Beta: proprietary wallet-risk intelligence, continuous contract monitoring, and compliance workflow automation for Web3 teams.

Call-to-action:

> Join as a design partner.

This is strong because it sells the direction honestly while letting DecaFlow build data depth with real customers.

## Launch readiness re-review — 2026-08-08

### What BD can sell now

BD can sell DecaFlow as a public beta / design-partner program for proprietary wallet-risk intelligence, compliance workflows, and contract monitoring. That is a strong position because customers get direct influence over coverage and workflow design while DecaFlow grows its internal graph.

The best first customers are teams that already feel the pain but do not require a mature ten-year intelligence dataset on day one: early-stage exchanges, wallets, RWA pilots, DeFi protocols, treasury teams, audit/security teams, and Web3 companies that need screening plus a human review process.

### What BD must not oversell

Do not claim DecaFlow already has complete global coverage. The correct claim is that DecaFlow owns the engine and is building coverage through sanctions ingestion, curated labels, graph ingestion, Alchemy activity feeds, analyst review, and pilot/customer data.

Do not sell RWA as “ready to issue securities tomorrow.” Sell RWA as a technical/legal design engagement that prepares issuer workflows, compliance rules, identity gating, and chain deployment plans for counsel-reviewed production use.

### Best first sales motion

Lead with one of these offers:

1. **Shield pilot:** “Give us 1–5 contracts and one chain. We’ll monitor activity, create alerts/incidents, and tune the alert workflow with your team.”
2. **Verify pilot:** “Give us wallet-screening cases and expected outcomes. We’ll run them through DecaFlow’s internal risk engine, show evidence, and tune rules.”
3. **Compliance workflow pilot:** “Give us your review process. We’ll configure rules, queue decisions, and build the audit trail around your analysts.”

### Required onboarding information from a customer

For Shield:

- Chain.
- Contract address.
- Contract label.
- What the contract does.
- Admin/owner address if known.
- Treasury/vault address if separate.
- Alert email recipients.
- What events should be treated as critical.

For Verify/Compliance:

- Chains to screen.
- Monthly volume.
- API or dashboard preference.
- Example clean wallets.
- Example risky wallets.
- Required decision categories: approve, review, reject, block, escalate.
- Who reviews false positives.

For RWA:

- Asset type.
- Jurisdictions.
- Investor type.
- Counsel status.
- KYC/accreditation provider status.
- Target chains: Base, Arbitrum, Polygon, Avalanche.
- Safe/multisig addresses, once created.

### Public announcement wording

Use:

> DecaFlow is opening its public beta for Web3 teams that need wallet-risk intelligence, compliance workflows, and continuous contract monitoring. We are onboarding design partners across Verify, Compliance, and Shield while expanding DecaFlow’s proprietary risk graph.

Avoid:

> DecaFlow is fully complete and detects everything.

The first version earns trust by being precise. Overclaiming security products is how a company turns one bug into a brand problem.

### BD checklist before outreach blast

- Confirm the production backend deploy includes the latest risk and Alchemy webhook changes.
- Confirm Alchemy signed test events are arriving.
- Confirm demo pages do not contradict the new internal-risk-engine status.
- Confirm one inbox is responsible for pilot responses.
- Confirm pricing ranges and pilot scope are approved.
- Keep all outreach framed as beta/design-partner unless the prospect is only buying a limited pilot.

## Immediate hardening update — 2026-08-08

BD can now say Shield monitoring includes event-based security scanning for watched contracts, including owner changes, role changes, proxy upgrades, proxy admin changes, approvals, transfers, and code-hash changes. Phrase this carefully: DecaFlow monitors for these signals and creates alerts/incidents; it does not guarantee exploit prevention.

Updated Shield pilot pitch:

> Give DecaFlow 1–5 important contracts on one chain. We will monitor activity, admin/proxy changes, approval/transfer signals, code-hash changes, and incident workflow outcomes, then tune alerts with your team before expanding coverage.

Updated compliance/risk pitch:

> DecaFlow’s authenticated production checks use DecaFlow-owned risk labels, public sanctions ingestion, curated labels, Alchemy graph ingestion, scoring calibration, and analyst feedback. Public website demos are previews; production API checks are the compliance workflow surface.

When a customer asks what they need to provide, ask for chain, contract address, label, admin/owner address if known, alert recipients, and the events they consider critical.
