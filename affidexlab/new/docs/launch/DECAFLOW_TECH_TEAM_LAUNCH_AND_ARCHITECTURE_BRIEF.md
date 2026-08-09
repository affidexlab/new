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
- `GET /v1/risk/coverage` — admin coverage summary across categories, sources, chains, and ingestion runs.

### Sanctions and curated label ingestion

Scripts:

- `node src/scripts/ingest-ofac-sdn-crypto.js` fetches OFAC SDN XML and extracts digital currency addresses into `risk_address_labels`.
- `node src/scripts/ingest-public-sanctions-lists.js` scans the UN consolidated list, EU consolidated financial sanctions list, and UK OFSI/HMT consolidated list for digital-asset addresses and stores confirmed matches as sanctions labels. The source URLs are configurable through environment variables because government download endpoints do change.
- `node src/scripts/ingest-curated-risk-labels.js` ingests DecaFlow’s curated seed labels from `src/data/curatedRiskLabels.json`.
- `node src/scripts/ingest-public-risk-feeds.js` ingests public scam/phishing feeds into DecaFlow-owned labels. The first production feeds are ScamSniffer’s address blacklist and MyEtherWallet’s address darklist; optional additional comma-separated feed URLs can be added through `DECAFLOW_PUBLIC_RISK_FEED_URLS`.
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
5. **Keep public copy aligned with authenticated production behavior.** The Agents page has been updated to describe authenticated org/API-key workflows instead of an unauthenticated public rule-builder. Any future public demo widget should stay clearly labeled as a preview, while authenticated Verify/Compliance checks remain the production compliance surface.
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

- `.github/workflows/production-risk-ingestion.yml` runs OFAC, public sanctions, public scam/phishing feeds, curated labels, and calibration every 6 hours, and can also be triggered manually from the GitHub Actions tab.
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
5. Choose `all`, `ofac`, `sanctions`, `public-feeds`, `curated`, or `calibrate`.
6. Run it and check logs.

This is the best free/low-friction replacement for Render Shell because it uses the same production DB secrets, creates logs, supports scheduling, and avoids exposing production database credentials on a personal laptop.

## Post-run review update — ingestion and scanner truthfulness

The first successful GitHub Actions run proved the runner can reach production secrets and the database, but the logs showed three operational issues that must be treated as launch blockers, not ignored:

1. OFAC ingestion returned zero labels because OFAC now publishes most crypto addresses in `idList` fields, not only in remarks. The parser has been updated to read both formats and to fail loudly if it ever finds zero digital-currency labels again.
2. EU sanctions ingestion returned 403 from the default EU endpoint. This requires a proper EU FSF crawler/token URL stored in `EU_CONSOLIDATED_SANCTIONS_URL`, or the pipeline will now fail instead of pretending partial coverage is complete.
3. The Alchemy free tier limits `eth_getLogs` requests to a 10-block range. Shield scanner defaults are now set to 10 blocks so scans work on the free tier, but production-grade monitoring should use PAYG/private RPCs or chain-specific indexed webhooks for wider catch-up windows.

Calibration now exits non-zero when a known risky/sanctioned calibration case fails, unless deliberately run with `--allow-fail`. This prevents a green workflow from hiding an ineffective risk dataset.

## Founder console, checkout, and branding update — 2026-08-08

### Founder control center

DecaFlow now has a behind-the-scenes founder console at `/founder-control`. It is protected by the founder/admin `df_admin_...` key and lets the founder operate the platform without opening the repository for normal business tasks.

Current console capabilities:

- Product control settings for Verify, Compliance, Shield, Agents, Institutional/RWA, Audit, Swap/Bridge, Analytics/MEV, and Staking.
- Public product gating: `active`, `beta`, `pre-production`, `paused`, `internal-only`, and `accepting customers` settings now affect public pages through `ProductGate`.
- Founder/customer overview counts and recent operational records.
- Customer and payment views across orgs, Shield, Agents, Institutional, Verify, Compliance, and Audit.
- Organization/customer creation with org-scoped API keys.
- Free founder test-customer access across Verify, Compliance, Shield, Agents, Institutional/RWA, and Audit without payment.
- Organization member role management.
- Organization API-key revoke/reactivate controls.
- Founder/admin key creation.
- Shield incident status/assignee editing.
- Manual risk-label creation.
- Shield security scan trigger.
- Audit-log filtering.
- Ops links to GitHub Actions ingestion/scanner/admin/org workflows.

The console stores the founder key in browser localStorage only. It should not be used on shared machines. A later hardening pass should replace direct key entry with the org magic-link/session UI and server-side session cookies.

### Product-control enforcement

The backend now exposes public product status through:

- `GET /v1/products/status`
- `GET /v1/products/status/:productKey`

The frontend wraps public product pages in `ProductGate`. If a product is paused, internal-only, or not accepting customers, the public page is blocked and replaced with a product-status message and contact CTA. If a product is `beta` or `pre-production`, the page stays visible but displays the founder-controlled status banner.

### NOWPayments checkout expansion

NOWPayments checkout now covers more than Shield:

- Compliance paid plans use `POST /v1/compliance/nowpayments/create-invoice` and `POST /v1/compliance/nowpayments/callback`.
- Verify paid Growth/Business plans use `POST /v1/verify/nowpayments/create-invoice` and `POST /v1/verify/nowpayments/callback`.
- Audit packages use `POST /v1/audit/nowpayments/create-invoice` and `POST /v1/audit/nowpayments/callback`.
- Shield, Agents, and Institutional/RWA already have NOWPayments checkout flows.

Bank transfer remains manual. The public pages collect the request, store it as pending/manual in the backend, and DecaFlow sends payment instructions manually by email.

New database/payment fields were added to Compliance, Verify, and Audit enquiry tables:

- `payment_gateway`
- `gateway_order_id`
- `payment_status`

The shared backend service `nowpaymentsService.js` now centralizes invoice creation and IPN signature verification.

### Branding update

The public-facing affected pages were harmonized toward DecaFlow’s dark-blue/blue visual system. Loud standalone purple/orange styling was removed from Compliance, Verify, Audit, Agents, Institutional, Issuer Portal, and landing-page accents where it was being used as primary brand color. Risk/severity colors can still use red/yellow/green where they communicate status; product identity should stay dark-blue/blue.

### Operational requirement

Before public promotion, confirm Render and Vercel have deployed at least commit `e1c85be98a094ea8777093191039209bc58041db`, because that includes the latest risk-feed expansion, org hardening, Agents public-copy update, Shield scanner range fix, Compliance/Audit/Verify NOWPayments checkout, and color harmonization.

## Risk coverage and org hardening update — 2026-08-09

### Risk intelligence coverage expansion

The internal engine has moved beyond OFAC/public sanctions/curated seeds and now has a production public-feed ingestion layer:

- `publicRiskFeedIngestion.js` fetches and normalizes public scam/phishing address lists.
- `npm run ingest:public-feeds` runs the public-feed loader.
- `.github/workflows/production-risk-ingestion.yml` now supports the `public-feeds` job and includes it in the scheduled `all` run.
- `risk_ingestion_runs` records feed status, label count, byte count, errors, and timestamps.
- `riskCoverageService.js` summarizes current label coverage by category, source, chain, and recent ingestion run.
- `GET /v1/risk/coverage` exposes that coverage summary to admins/founder-console integrations.

The verified production run on commit `a48176342ab5bc98445c1c6fa2df35778005ec93` loaded:

- ScamSniffer address blacklist: 2,530 labels.
- MyEtherWallet address darklist: 652 labels.

Calibration also passed after this update for known sanctioned, mixer, and exploit-linked wallets. A live backend check against a ScamSniffer-listed wallet returned `provider: decaflow-internal`, a direct scam flag, and `recommendation: REVIEW`.

This is still not a claim of Chainalysis/TRM parity. The system now has the ingestion architecture, coverage accounting, and first broader public feeds, but parity requires a continuously operated DecaFlow data program: exploit reports, court filings, takedown notices, chain explorer tags, customer cases, analyst reviews, darknet/ransomware reports, and verified internal investigations.

### Organization and Agents hardening

The org/auth layer now has self-service endpoints for customer organizations, not only founder/admin workflows:

- `GET /v1/orgs/me`
- `GET /v1/orgs/me/members`
- `POST /v1/orgs/me/members`
- `PATCH /v1/orgs/me/members/:membershipId`
- `GET /v1/orgs/me/api-keys`
- `POST /v1/orgs/me/api-keys`
- `PATCH /v1/orgs/me/api-keys/:keyId`

Humans authenticate through org sessions. Machine integrations use org API keys with explicit scopes such as `verify:check`, `agents:rules`, `agents:evaluate`, and `agents:review`.

Agents workflow endpoints were hardened so production rule creation, rule listing, evaluation, suggestions, review queue access, decisions, and automation opt-in require either:

1. an authenticated org session with an allowed role, or
2. a scoped org API key.

Unauthenticated email-only Agents access is now disabled unless `ALLOW_PUBLIC_AGENT_RULES=true` is deliberately set for a sandbox. The public Agents page was updated to describe the authenticated workflow console instead of advertising an unauthenticated live rule-builder demo.

### Current production readiness interpretation

The technical team can now treat Verify, Compliance, Shield, Audit, and Agents as materially stronger beta/public-launch surfaces, provided production deployment is confirmed at or beyond `e1c85be98a094ea8777093191039209bc58041db`. The correct engineering claim is:

> DecaFlow operates an internal risk engine with sanctions, public scam/phishing feeds, curated labels, graph ingestion, case feedback, calibration, and coverage reporting.

The incorrect claim is:

> DecaFlow has already achieved fully comprehensive Chainalysis/TRM-equivalent coverage.

That second statement becomes defensible only after the coverage dashboard shows large, diverse, continuously refreshed datasets across sanctions, mixers, scam/phishing, darknet/ransomware, exploit/stolen-fund, high-risk-service, and customer-verified case categories.

## DecaFlow Institutional compliance suite — 2026-08-09

Per the strategic roadmap (Pivot 3), DecaFlow Institutional is the compliance layer for RWA issuers, not an RWA issuer itself. DecaFlow provides three pillars as a product:

1. **On-chain identity verification (ZK-KYC).** DecaFlow issues identity attestations (`institutional_identity_attestations`): KYC status, jurisdiction eligibility, accreditation status, and an evidence hash that anchors the off-chain record. The evidence hash goes on-chain through `IdentityRegistry.setIdentity`; raw KYC evidence never does. `ZKIdentityGate.sol` provides privacy-preserving group-membership verification with proof-to-wallet binding.
2. **Automated accredited-investor compliance checks.** `POST /v1/institutional/compliance/check-investor` combines the wallet's DecaFlow attestation (KYC approved, jurisdiction-eligible, accredited, unexpired, unrevoked) with a live DecaFlow internal risk screen (sanctions/mixer/scam/graph exposure) and returns APPROVE / REVIEW / REJECT with reasons. Every check is recorded in `institutional_investor_checks` as the issuer's compliance evidence trail.
3. **Pre-audited smart contract templates.** `GET /v1/institutional/templates` serves the template catalog (`institutional_contract_templates`): IdentityRegistry, ComplianceRules, RiskOracle, RWAToken, and ZKIdentityGate — Guardian audit findings addressed, 53-test regression suite passing, with a final pre-deployment re-review required per issuer engagement.

Issuer API surface (org API key scopes `institutional:attest` / `institutional:check`, or admin scope `institutional:admin`):

- `POST /v1/institutional/identity/attestations` — record/update a wallet attestation; returns the evidence hash for the on-chain commitment.
- `GET /v1/institutional/identity/attestations/:chain/:wallet` — attestation status.
- `DELETE /v1/institutional/identity/attestations/:chain/:wallet` — revoke.
- `POST /v1/institutional/compliance/check-investor` — automated accredited-investor eligibility decision.
- `POST /v1/institutional/identity/evidence-hash` — compute an evidence hash without storing.
- `GET /v1/institutional/templates` — public template catalog.

Positioning note: DecaFlow sells this suite to issuers. Each issuer still owns its securities-law obligations for its own offering; DecaFlow provides the identity, compliance-check, and contract infrastructure they build on.

## Product manuals and operator runbooks — 2026-08-09

### Product renaming note

The Agents product is publicly branded **DecaFlow Autopilot (Agentic Compliance)**. The URL stays `/agents` and the API stays `/v1/agents/*` for compatibility; only display naming changed.

### Customer portal

Customers log in at `/login` with an email magic link (no passwords). After login, `/account` shows their organization, team members, and self-service API keys (create/revoke), plus links to every product. Sessions last 30 days. Backend: `/v1/org-auth/magic-link/request`, `/v1/org-auth/magic-link/verify`, `/v1/orgs/me*`.

### Per-product step-by-step and operator runbook

**Verify API** — wallet screening.
Customer flow: 1) buy/receive a plan (NOWPayments checkout or founder-issued), 2) get an org or Verify API key, 3) call `POST /v1/verify/check` with `x-api-key` and `{address, chain}`, 4) receive score/level/recommendation/flags/exposures, 5) every check is recorded in `risk_screenings`.
Operator runbook (Risk Intelligence Owner): daily — check Production Risk Ingestion run is green in GitHub Actions; weekly — review `GET /v1/risk/coverage` label counts, add curated labels from incident reports via `POST /v1/risk/labels`, process case reviews with `POST /v1/risk/case-reviews`; monthly — run calibration and expand `riskCalibrationCases.json`.

**Compliance** — screening workflow product.
Customer flow: 1) checkout (crypto or bank), 2) team contact and onboarding, 3) screening + review workflow through the API and analyst process.
Operator runbook (Compliance Ops): monitor `compliance_enquiries` in the founder console; respond to paid enquiries within 24h; send bank details for manual transfers; record decisions through case reviews so labels improve.

**Shield** — continuous security monitoring.
Customer flow: 1) checkout or waitlist, 2) provide chain, contract addresses, labels, alert emails, and contract ABIs, 3) DecaFlow registers contracts in `shield_contracts` and uploads ABIs via `POST /v1/shield/contracts/:chain/:address/abi`, 4) scanning runs every 15 minutes.
Operator runbook (Security Operator): daily — review open alerts (`GET /v1/shield/alerts`), incidents, and vulnerability findings (`GET /v1/shield/vulnerability-findings`); triage incidents using their playbook steps; update statuses; weekly — tune `POST /v1/shield/anomaly-thresholds` per customer and confirm the Shield Monitor workflow is green.

**Autopilot (Agents)** — agentic compliance workflows.
Customer flow: 1) checkout, 2) org account + scoped API key issued, 3) define rules (`POST /v1/agents/rules`), 4) evaluations route flagged wallets into the review queue, 5) named humans decide; after ≥5 consistent decisions at ≥90%, Autopilot suggests automation the customer must explicitly enable.
Operator runbook (Compliance Ops): monitor review queues for stuck items; verify automation enablements have named owners; never enable auto-decisions on a customer's behalf.

**Institutional/RWA** — compliance suite for issuers.
Customer flow: 1) issuer signs up (Issuer/Scale plan), 2) DecaFlow issues an org API key with `institutional:attest`/`institutional:check` scopes, 3) issuer records ZK-KYC attestations (`POST /v1/institutional/identity/attestations`), 4) issuer runs investor checks before mint/transfer (`POST /v1/institutional/compliance/check-investor`), 5) issuer deploys the pre-audited templates (catalog at `GET /v1/institutional/templates`) with their own Safe/multisig and counsel.
Operator runbook (Institutional Lead): review each issuer's engagement before granting attestation scopes; keep `APPROVED_IDENTITY_REGISTRIES` current per deployed registry; coordinate the final pre-deployment re-review per engagement.

**Audit** — manual security review engagements.
Customer flow: checkout a package → scoping call → audit delivery → optional Shield upsell.
Operator runbook: respond to `audit_enquiries` with `paid_ready_to_scope` status within 24h.
