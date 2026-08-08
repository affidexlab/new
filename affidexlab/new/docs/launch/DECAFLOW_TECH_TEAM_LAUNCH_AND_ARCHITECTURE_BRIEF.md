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

## Launch readiness re-review — 2026-08-08

### Current launch position

DecaFlow is ready to present publicly as a controlled public beta / design-partner launch. It is not yet ready to present as a fully mature, fully automated, enterprise risk-intelligence network because the proprietary data graph still needs live ingestion runs, scheduled refreshes, production monitoring jobs, and customer/pilot data expansion.

The core backend foundation is now real: Verify can call the internal DecaFlow risk engine through authenticated `/v1/verify/check`, risk labels and graph edges have admin ingestion paths, Alchemy webhook ingestion is implemented with signing-key verification, case review feeds back into labels, Shield has alert/incident/action-rule APIs, Agents has human-approved workflow automation, and the smart-contract regression suite passes.

### Evidence from this re-review

- Backend syntax check passed with `npm run build`.
- Frontend production build passed with `npm run build`; Vite emitted large-chunk and browser-polyfill warnings, but no build failure.
- Smart-contract tests passed with `53 passing`.
- Live repo is on `main` after the Alchemy multi-signing-key update.
- `ALCHEMY_WEBHOOK_SIGNING_KEYS` is now supported as comma-separated keys for multiple Alchemy webhooks.

### Must be done before claiming “100% public launch”

1. **Run the production data ingestion jobs.** The scripts exist, but production data is not in the database until the deployed backend runs `ingest-ofac-sdn-crypto.js`, `ingest-public-sanctions-lists.js`, `ingest-curated-risk-labels.js`, and targeted Alchemy backfills. Code without populated data still produces sparse scores.
2. **Schedule recurring ingestion.** Add Render Cron jobs or another scheduler for sanctions refresh, curated-label refresh, graph backfills, and Shield monitoring. Manual one-off ingestion is not enough for a public security product.
3. **Confirm production env vars after deploy.** Required backend values include `DATABASE_URL`, `DATABASE_CA_CERT` or trusted CA behavior, `ADMIN_KEY`, `RISK_PROVIDER=internal`, `ALLOW_DEMO_RISK=false`, `ALCHEMY_API_KEY`, `ALCHEMY_WEBHOOK_SIGNING_KEYS`, `SHIELD_EVENT_WEBHOOK_SECRET`, SMTP mailer values, and payment provider values if payments are public.
4. **Run a real webhook test from Alchemy.** The webhook should return 200, write rows into `risk_graph_edges`, and reject a tampered request with a bad signature.
5. **Fix public frontend copy that still says risk scoring is demo-only.** The Agents page still contains an FAQ saying public scoring is deterministic demo output. That is now misleading for the authenticated internal-risk path and should be updated before marketing traffic is sent there.
6. **Decide what to do with public demo endpoints.** `/v1/verify/demo`, `/v1/compliance/demo-score`, and the landing-page mini wallet demo are still acceptable as demos if clearly labeled, but they must not be marketed as live compliance decisions.
7. **Persist Shield waitlist submissions.** The Shield waitlist currently emails requests but does not persist them to a dedicated waitlist table. That is acceptable for private beta, but fragile for a public campaign.
8. **Deepen Shield watchers.** Current Shield coverage includes alerts/incidents/action rules and monitored on-chain events, but a full security SaaS still needs ownership/admin-change detection, proxy implementation monitoring, ABI-aware privileged function detection, ERC approval/transfer anomaly detection, and vulnerability scanning workflow.
9. **Protect admin surfaces.** Several admin APIs rely on `X-Admin-Key`. For beta this can work if the key is strong and private, but public launch should move to authenticated org/admin accounts with role-based access and audit logs.
10. **RWA remains pre-production.** Contracts pass tests, but real securities use still requires counsel-approved rules, Safe/multisig addresses on Base/Arbitrum/Polygon/Avalanche, KYC/accreditation provider integration, final deployment scripts, production identity/risk oracle operators, and a fresh post-configuration security re-review.

### Recommended production cron jobs

Run these from `backend` after the latest deploy:

```bash
node src/scripts/ingest-ofac-sdn-crypto.js
node src/scripts/ingest-public-sanctions-lists.js
node src/scripts/ingest-curated-risk-labels.js
node src/scripts/calibrate-risk-scoring.js
```

Recommended schedule:

- OFAC + public sanctions: every 6–12 hours.
- Curated labels: every deploy or every hour if the JSON is managed through internal review tooling.
- Calibration: after every label/weight change and before major sales demos.
- Alchemy backfills: per onboarded address/contract, then periodically for gaps.
- Shield monitor: every 5–15 minutes until event-driven watchers replace polling.

### Alchemy production checklist

- Create one Address Activity webhook per chain.
- Add the chain-specific DecaFlow router address and any customer/pilot addresses for that chain.
- Point every webhook to `/v1/risk/webhooks/alchemy`.
- Store all webhook signing keys in `ALCHEMY_WEBHOOK_SIGNING_KEYS`, comma-separated, no spaces.
- Store the app key in `ALCHEMY_API_KEY`.
- Send test webhooks and verify rows appear in `risk_graph_edges`.
- Confirm bad signatures return 401.

## Immediate hardening update — production DB, Shield scanner, and admin keys

### Production DB ingestion runbook

Run the ingestion jobs from the deployed backend environment so they use Render’s production `DATABASE_URL`, `DATABASE_CA_CERT`, Alchemy key, and the same network settings as the API.

Preferred Render path:

1. Open Render dashboard.
2. Open the DecaFlow backend service.
3. Make sure the latest `main` deploy is live.
4. Open **Shell** if enabled, or create a **Render Job/Cron Job** using the same repo and environment group.
5. Set the command working directory to `affidexlab/new/backend` if Render checks out the repo root.
6. Run:

```bash
npm run ingest:ofac
npm run ingest:sanctions
npm run ingest:curated
npm run risk:calibrate
```

If Render Shell is unavailable, create one-off Render Jobs with these commands:

```bash
cd affidexlab/new/backend && npm ci && npm run ingest:ofac
cd affidexlab/new/backend && npm ci && npm run ingest:sanctions
cd affidexlab/new/backend && npm ci && npm run ingest:curated
cd affidexlab/new/backend && npm ci && npm run risk:calibrate
```

Local execution against production is possible but less safe. Only do it from a trusted machine, then export production `DATABASE_URL` and `DATABASE_CA_CERT` exactly as Render has them before running the same commands.

### Shield security scanner now added

Shield now includes `shieldSecurityScanner.js` plus `npm run shield:scan-security`. It watches active Shield contracts and DecaFlow dogfood contracts for:

- Ownership transfer events.
- Role grants and revocations.
- Proxy implementation upgrades.
- Proxy admin changes.
- ERC-20 approval events.
- ERC-721/ERC-1155 approval-for-all events.
- Transfer events emitted by watched contracts.
- Runtime bytecode hash changes.

Run it manually through the admin endpoint:

```bash
curl -X POST https://decaflow-backend.onrender.com/v1/shield/scan/security \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DECAFLOW_ADMIN_API_KEY" \
  -d '{}'
```

Or schedule it as a Render Cron Job:

```bash
cd affidexlab/new/backend && npm ci && npm run shield:scan-security
```

Required RPC env vars:

- `RPC_ARBITRUM`
- `RPC_BASE`
- `RPC_POLYGON`
- `RPC_AVALANCHE`
- Optional: `RPC_ETHEREUM`, `RPC_OPTIMISM`

### Admin key upgrade

Admin APIs now support hashed scoped admin keys, while the old `ADMIN_KEY` remains as a temporary fallback. Create a production admin key from Render Shell or a one-off job:

```bash
cd affidexlab/new/backend
node src/scripts/create-admin-api-key.js "Launch Admin" "*"
```

The script prints the raw `df_admin_...` key once. Store it in a password manager. Use it as:

```text
Authorization: Bearer df_admin_...
```

After confirming the new key works, remove or rotate the legacy `ADMIN_KEY`. The database stores only the SHA-256 hash and logs admin attempts to `admin_audit_logs`.

## Render Shell alternative — GitHub Actions ops runner

Render Shell is not required. The repo now includes GitHub Actions workflows that run production operations against the production database using GitHub encrypted secrets:

- `.github/workflows/production-risk-ingestion.yml` runs OFAC, public sanctions, curated labels, and calibration every 6 hours, and can also be triggered manually from the GitHub Actions tab.
- `.github/workflows/shield-monitor.yml` runs the Shield balance monitor plus the Shield security scanner every 15 minutes.

Required GitHub repository secrets:

- `DATABASE_URL`
- `DATABASE_CA_CERT`
- `ALCHEMY_API_KEY`
- `RPC_ARBITRUM`
- `RPC_BASE`
- `RPC_POLYGON`
- `RPC_AVALANCHE`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `NOTIFY_EMAIL`
- `SHIELD_ALERT_EMAIL`

Optional override secrets:

- `RPC_ETHEREUM`
- `RPC_OPTIMISM`
- `UN_CONSOLIDATED_SANCTIONS_URL`
- `EU_CONSOLIDATED_SANCTIONS_URL`
- `UK_HMT_CONSOLIDATED_SANCTIONS_URL`

How to run manually:

1. Open GitHub repo.
2. Go to **Actions**.
3. Open **Production Risk Ingestion**.
4. Click **Run workflow**.
5. Choose `all`, `ofac`, `sanctions`, `curated`, or `calibrate`.
6. Run it and check logs.

This is the best free/low-friction replacement for Render Shell because it uses the same production DB secrets, creates logs, supports scheduling, and avoids exposing production database credentials on a personal laptop.
