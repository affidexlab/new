/**
 * Shield Phase 0 — manual-assisted contract monitoring.
 *
 * WHAT THIS DOES:
 * For each contract in WATCHED_CONTRACTS, checks its native-token balance against
 * the last-seen value and emails an alert (via the existing mailer) if it drops
 * sharply. This is deliberately simple — it is the "Phase 0" tier from the Shield
 * spec, not the full continuous-monitoring product.
 *
 * WHAT THIS DOES NOT DO YET:
 * - No ownership/admin-key change detection (needs each contract's ABI — add per
 *   contract once you're onboarding real clients).
 * - No persistence: lastSeenBalance is in-memory and resets every run. Fine for a
 *   cron job that runs continuously; not fine if you need historical alert data —
 *   add a Postgres table (see suggested schema at the bottom) before relying on this.
 * - No real-time / mempool watching — this is a polling check, meant to run on a
 *   schedule (e.g. every 15 minutes), not a live listener.
 *
 * HOW TO ACTUALLY RUN THIS:
 * This is NOT wired into server.js and does not run automatically. It needs:
 *   1. RPC URLs in env vars (RPC_ETHEREUM, RPC_ARBITRUM, ...) — e.g. a free-tier
 *      Alchemy or Infura endpoint.
 *   2. Real contract addresses added to WATCHED_CONTRACTS below.
 *   3. Something to actually invoke it on a schedule. On Render, add a "Cron Job"
 *      service (separate from the web service) pointing at:
 *          node src/services/shieldMonitor.js
 *      running every 15 minutes. Locally: `node src/services/shieldMonitor.js`.
 *   4. SMTP_PASS already set (it's required by mailer.js for any email to send —
 *      should already be configured if your enquiry emails are working).
 */

import { ethers } from 'ethers';
import { sendEnquiryEmail } from '../utils/mailer.js';

const RPC_URLS = {
  ethereum: process.env.RPC_ETHEREUM,
  arbitrum: process.env.RPC_ARBITRUM,
};

// Phase 0: hardcoded list. Phase 1: pull this from a `shield_contracts` table
// populated when a client is onboarded via the /v1/shield/waitlist flow.
const WATCHED_CONTRACTS = [
  // { chain: 'arbitrum', address: '0xYourClientContract', label: 'Client X — main contract' },
];

// Alert if balance drops this much or more in one check. Tune per contract in Phase 1 —
// a treasury contract and an AMM pool have very different "normal" volatility.
const ALERT_DROP_THRESHOLD_PCT = 20;

const lastSeenBalance = new Map();

async function checkContract(provider, contract) {
  const { chain, address, label } = contract;
  const key = `${chain}:${address}`;

  const balance = await provider.getBalance(address);
  const prevBalance = lastSeenBalance.get(key);

  if (prevBalance !== undefined && prevBalance > 0n) {
    const delta = balance - prevBalance;
    const pctChange = Number((delta * 10000n) / prevBalance) / 100;

    if (delta < 0n && pctChange <= -ALERT_DROP_THRESHOLD_PCT) {
      await alertShield({
        severity: 'HIGH',
        label,
        chain,
        address,
        message: `Balance dropped ${Math.abs(pctChange).toFixed(1)}% (${ethers.formatEther(-delta)} native token) since the last check.`,
      });
    }
  }

  lastSeenBalance.set(key, balance);
}

async function alertShield({ severity, label, chain, address, message }) {
  console.log(`[SHIELD ${severity}] ${label} (${chain}:${address}) — ${message}`);
  await sendEnquiryEmail({
    type: 'Shield',
    to: process.env.SHIELD_ALERT_EMAIL || process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
    subject: `[Shield ${severity}] ${label}`,
    fields: {
      Severity: severity,
      Contract: label,
      Chain: chain,
      Address: address,
      Detail: message,
      Time: new Date().toUTCString(),
    },
  });
}

export async function runShieldCheck() {
  if (WATCHED_CONTRACTS.length === 0) {
    console.log('[shieldMonitor] WATCHED_CONTRACTS is empty — nothing to check yet. Add contracts before scheduling this.');
    return;
  }
  for (const contract of WATCHED_CONTRACTS) {
    try {
      const rpcUrl = RPC_URLS[contract.chain];
      if (!rpcUrl) {
        console.warn(`[shieldMonitor] No RPC URL configured for chain "${contract.chain}" — skipping ${contract.address}. Set RPC_${contract.chain.toUpperCase()} in env.`);
        continue;
      }
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await checkContract(provider, contract);
    } catch (err) {
      console.error(`[shieldMonitor] Check failed for ${contract.address}:`, err.message);
    }
  }
}

// Lets this file be run directly: `node src/services/shieldMonitor.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  runShieldCheck().then(() => process.exit(0));
}

/* Suggested Phase 1 schema, once you're ready to persist contracts + alert history:
CREATE TABLE shield_contracts (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  chain TEXT NOT NULL,
  address TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE shield_alerts (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER REFERENCES shield_contracts(id),
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
*/
