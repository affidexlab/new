# DecaFlow Technical Team Launch & Architecture Brief

## What DecaFlow is

DecaFlow is being built as a Web3 security, compliance, and transaction-infrastructure platform. The goal is not to resell another company’s wallet-risk API or monitoring dashboard. The core product direction is DecaFlow-owned infrastructure: our own wallet-risk labels, graph edges, scoring rules, Shield alerting, incident workflows, compliance automation, and RWA compliance contracts.

The current repo contains several product lines:

1. **Verify API** — wallet screening and risk scoring.
2. **Compliance** — AML/risk workflows and customer onboarding.
3. **Shield** — continuous contract/security monitoring, alerts, and incidents.
4. **Agents** — human-approved compliance workflow automation.
5. **Institutional/RWA** — ERC-3643-style identity, compliance, risk oracle, token, and ZK gate reference contracts.
6. **Swap/Bridge/Liquidity/MEV** — transaction infrastructure, routing, analytics, partner SDK, and UI surfaces.
7. **Partner SDK and dashboard** — embeddable partner infrastructure.

## What is now built

### Internal risk intelligence engine

The backend now has a DecaFlow-owned risk engine rather than a vendor-first design.

Core tables:

- `risk_category_weights` — category scoring weights.
- `risk_address_labels` — DecaFlow-owned address intelligence labels.
- `risk_graph_edges` — wallet-to-wallet/token graph edges.
- `risk_screenings` — screening history.
- `risk_case_reviews` — analyst feedback loop.

Core services:

- `internalRiskEngine.js` screens a wallet using direct labels plus indirect graph exposure up to configurable hops.
- `riskIntelligenceService.js` defaults to `RISK_PROVIDER=internal`, so Verify and Compliance use DecaFlow’s engine by default.
- `alchemyGraphIngestionService.js` ingests graph edges from Alchemy transfers and webhook activity.

Core routes:

- `POST /v1/verify/check` — authenticated live screening using issued Verify API keys.
- `POST /v1/risk/labels` — admin-created DecaFlow risk labels.
- `GET /v1/risk/labels` — admin label inspection.
- `POST /v1/risk/edges` — admin graph edge insertion.
- `POST /v1/risk/screen` — admin internal wallet screen.
- `PATCH /v1/risk/weights/:category` — category calibration.
- `POST /v1/risk/ingest/alchemy-transfers` — batch graph ingestion via Alchemy API.
- `POST /v1/risk/webhooks/alchemy` — Alchemy webhook ingestion.
- `POST /v1/risk/case-reviews` — analyst feedback that can create confirmed-risk labels.

### Sanctions and curated label ingestion

Scripts:

- `node src/scripts/ingest-ofac-sdn-crypto.js` fetches OFAC SDN XML and extracts digital currency addresses into `risk_address_labels`.
- `node src/scripts/ingest-public-sanctions-lists.js` scans the UN consolidated list, EU consolidated financial sanctions list, and UK OFSI/HMT consolidated list for digital-asset addresses and stores confirmed matches as sanctions labels. The source URLs are configurable through environment variables because government download endpoints do change.
- `node src/scripts/ingest-curated-risk-labels.js` ingests DecaFlow’s curated seed labels from `src/data/curatedRiskLabels.json`.
- `node src/scripts/calibrate-risk-scoring.js` runs known calibration wallets against the DecaFlow internal engine; adding `--apply` raises likely category weights when the expected decision is not met.

The current curated seed list includes public Tornado Cash/mixer labels and exploit-linked seed placeholders. The public sanctions script adds UN/EU/UK/HMT coverage where those lists publish crypto addresses, while OFAC remains the strongest structured crypto-address source today. This is still the first internal dataset, so the team must keep growing it with public enforcement releases, exploit postmortems, court filings, chain explorer tags, and analyst investigations.

### Shield internal actions and incidents

Shield now has internal alert and action infrastructure.

Core tables:

- `shield_alerts`
- `shield_incidents`
- `shield_action_rules`
- `shield_action_runs`

Core routes:

- `GET/PATCH /v1/shield/alerts`
- `GET/PATCH /v1/shield/incidents`
- `GET/POST/PATCH /v1/shield/action-rules`
- `GET/POST /v1/shield/events/onchain`

Core behavior:

- `shieldMonitor.js` persists alerts and creates incidents for high/critical alerts.
- `shieldActionEngine.js` evaluates internal rules and triggers email actions.
- `/v1/shield/events/onchain` lets DecaFlow-owned indexers/watchers post on-chain activity into Shield.

Email is the only action type enabled for now. This is deliberate. Future action types can be added after the DB/action framework is stable: Slack, PagerDuty, Telegram, Discord, SMS, webhook, Defender proposal, Safe transaction proposal.

### Agents human-approved automation

Agents remain human-approved, not fund-moving autonomous enforcement.

Current behavior:

- Rules can evaluate risk scores.
- Matching items go to a review queue.
- Human reviewers approve/reject items.
- The system can suggest automation when a reviewer repeatedly makes the same decision.
- A named human can enable an auto-resolution pattern.
- Even auto-resolution remains visible in the queue and reversible.

This is the correct safe path. Do not implement autonomous freezing or fund movement until customers explicitly authorize the action type and legal/compliance policies are signed.

### RWA contracts

RWA contracts compile and test under the default contract test path. Current tests pass: `53 passing`.

Contracts:

- `IdentityRegistry.sol`
- `ComplianceRules.sol`
- `RWAToken.sol`
- `RiskOracle.sol`
- `ZKIdentityGate.sol`

Recent fixes include holder-count delta accounting, disabled live ComplianceRules replacement, address/evidence validation, and RWA test harness repair.

## What remains to be done

### Risk engine data and indexing

1. Run OFAC plus UN/EU/UK/HMT sanctions ingestion on a schedule.
2. Keep source URL overrides current because public sanctions authorities change download formats without treating DecaFlow’s backlog kindly.
3. Build curated label review tooling so analysts can approve labels before they affect production scoring.
4. Run Alchemy graph ingestion continuously per chain.
5. Backfill graph edges for high-risk wallets, customer wallets, and watched contracts.
6. Add known-clean calibration sets so the engine can distinguish clean wallets from sparse-data wallets.
7. Add scoring explainability views to show which labels/paths drove a score.

### Shield monitoring depth

The current Shield monitor covers native balance drops and event ingestion. To become a full security SaaS, build watchers for:

- Ownership transfer events.
- Proxy implementation changes.
- Admin function selectors.
- Large ERC-20/ERC-721/ERC-1155 transfers.
- Approval spikes.
- New privileged roles.
- Risky counterparty interactions using the internal risk engine.
- Failed transaction spikes.
- Contract selfdestruct/deployment/codehash changes where supported.
- Treasury outflows.

### Verify/Compliance product hardening

- Add API-key quota tracking.
- Add per-key rate limits.
- Add customer dashboard for screening history.
- Add CSV/batch screening.
- Add webhook callbacks for risk-score changes.
- Add report export.
- Add case management UI.

### RWA production readiness

Do not deploy real securities until the following exist:

- Safe addresses on Base, Arbitrum, Polygon, and Avalanche.
- KYC/accreditation process.
- Counsel-reviewed transfer restrictions.
- Approved identity registry env allowlist.
- Production deployment runbook.
- Emergency transfer runbook.
- Risk oracle update policy.
- Fresh security re-review after final configuration.

## Alchemy setup for graph ingestion

### Option A — API batch ingestion

1. Create or open an Alchemy app for each target network: Ethereum/Base/Arbitrum/Polygon/Avalanche.
2. Copy the API key.
3. Set Render env var `ALCHEMY_API_KEY` if one key works across your apps, or use per-chain vars later if we split config.
4. Call admin endpoint:

```bash
curl -X POST https://decaflow-backend.onrender.com/v1/risk/ingest/alchemy-transfers \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"chain":"base","fromBlock":"0x0","toBlock":"latest","address":"0x...","maxPages":5}'
```

### Option B — webhooks

1. Open Alchemy Dashboard.
2. Go to **Notify / Webhooks**.
3. Create an **Address Activity** webhook.
4. Select chain.
5. Add watched addresses.
6. Set webhook URL:

```text
https://decaflow-backend.onrender.com/v1/risk/webhooks/alchemy
```

7. In the Alchemy webhook security/settings panel, copy the webhook signing key.
8. In DecaFlow Render env, set:

```text
ALCHEMY_WEBHOOK_SIGNING_KEY=<Alchemy webhook signing key>
```

9. Save and test webhook. DecaFlow verifies `x-alchemy-signature` before ingesting the activity payload.

## Operational commands

```bash
cd backend
node src/scripts/ingest-ofac-sdn-crypto.js
node src/scripts/ingest-public-sanctions-lists.js
node src/scripts/ingest-curated-risk-labels.js
node src/scripts/calibrate-risk-scoring.js
npm run build
```

```bash
cd contracts
npm test
```

## Launch rule

Do not claim the risk engine is complete just because the code exists. Claim that DecaFlow owns its risk engine and is actively building its proprietary graph. The moat is the dataset, labels, analyst feedback loop, and calibration over time.
