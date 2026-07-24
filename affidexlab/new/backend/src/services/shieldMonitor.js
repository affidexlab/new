/**
 * Shield monitoring — contract balance checks + email alerts.
 *
 * WHAT THIS DOES:
 * Checks each watched contract's native-token balance against the last-seen value
 * and emails an alert (via the existing mailer) if it drops sharply. Watched
 * contracts = DecaFlow's own 4 router contracts (dogfooding) + every contract
 * belonging to an active, paid Shield customer (pulled live from Postgres each run).
 *
 * WHAT THIS DOES NOT DO YET:
 * - No ownership/admin-key change detection (needs each contract's ABI).
 * - No real-time / mempool watching — this is a polling check, meant to run on a
 *   schedule (e.g. every 15 minutes), not a live listener.
 *
 * HOW TO ACTUALLY RUN THIS:
 * This is NOT wired into server.js and does not run automatically. It needs:
 *   1. RPC URLs in env vars — RPC_ARBITRUM, RPC_BASE, RPC_POLYGON, RPC_AVALANCHE.
 *   2. A scheduler — Render Cron Job pointed at `node src/services/shieldMonitor.js`,
 *      running every 15 minutes.
 *   3. SMTP_PASS already set (required by mailer.js).
 * The database connection reuses your existing pool — no separate credentials needed.
 */

import { ethers } from 'ethers';
import { sendEnquiryEmail } from '../utils/mailer.js';
import pool from '../db/connection.js';

const RPC_URLS = {
  arbitrum: process.env.RPC_ARBITRUM,
  base: process.env.RPC_BASE,
  polygon: process.env.RPC_POLYGON,
  avalanche: process.env.RPC_AVALANCHE,
};

// DecaFlow's own contracts — always monitored, regardless of paying customers.
// Base and Polygon share the same address (0x1E7b...4Cbd), consistent with a
// deterministic/CREATE2 deployment across chains — flagged earlier, not treated as an error.
const DOGFOOD_CONTRACTS = [
  { chain: 'arbitrum', address: '0xdBBDBDcF4B9fc8F85ae549078199ee3fb27cadB3', label: 'DecaFlow Router — Arbitrum' },
  { chain: 'base', address: '0x1E7b01f8D28e757B07887Ff6BF23e46BdE4e4Cbd', label: 'DecaFlow Router — Base' },
  { chain: 'polygon', address: '0x1E7b01f8D28e757B07887Ff6BF23e46BdE4e4Cbd', label: 'DecaFlow Router — Polygon' },
  { chain: 'avalanche', address: '0x41475aDeB1172905Dd1085FBe525e1A79487e49C', label: 'DecaFlow Router — Avalanche' },
];

// Pulls every contract belonging to a customer whose payment has actually cleared —
// this is the piece that connects a NOWPayments/Stripe activation to real monitoring.
// Without this, a paid customer's contract sits in the database but nothing watches it.
async function loadCustomerContracts() {
  try {
    const { rows } = await pool.query(
      `SELECT sc.chain, sc.address, sc.label, cust.company_name
       FROM shield_contracts sc
       JOIN shield_customers cust ON cust.id = sc.customer_id
       WHERE sc.status = 'active' AND cust.status = 'active'`
    );
    return rows.map(r => ({ chain: r.chain, address: r.address, label: r.label || `${r.company_name} — contract` }));
  } catch (err) {
    console.error('[shieldMonitor] Could not load customer contracts from DB — monitoring dogfood contracts only this run:', err.code || '', err.message || String(err));
    return [];
  }
}

// Alert if balance drops this much or more in one check. Tune per contract in Phase 1 —
// a treasury contract and an AMM pool have very different "normal" volatility.
const ALERT_DROP_THRESHOLD_PCT = 20;

// IMPORTANT: this MUST be persisted in Postgres, not an in-memory Map. This script is
// invoked fresh on every scheduled run (Render Cron Job or GitHub Actions each start a
// brand-new process) — an in-memory Map would reset to empty every single time, meaning
// prevBalance would always be undefined and the alert below would never fire. Caught this
// before the first real scheduled run; worth knowing it existed at all.
async function getLastBalance(chain, address) {
  const { rows } = await pool.query(
    `SELECT balance_wei FROM shield_last_balance WHERE chain = $1 AND address = $2`,
    [chain, address]
  );
  return rows[0] ? BigInt(rows[0].balance_wei) : undefined;
}

async function saveLastBalance(chain, address, balance) {
  await pool.query(
    `INSERT INTO shield_last_balance (chain, address, balance_wei, checked_at) VALUES ($1, $2, $3, NOW())
     ON CONFLICT (chain, address) DO UPDATE SET balance_wei = $3, checked_at = NOW()`,
    [chain, address, balance.toString()]
  );
}

async function checkContract(provider, contract) {
  const { chain, address, label } = contract;

  const balance = await provider.getBalance(address);
  const prevBalance = await getLastBalance(chain, address);

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

  await saveLastBalance(chain, address, balance);
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
  const customerContracts = await loadCustomerContracts();
  const watchedContracts = [...DOGFOOD_CONTRACTS, ...customerContracts];

  console.log(`[shieldMonitor] Checking ${watchedContracts.length} contracts (${DOGFOOD_CONTRACTS.length} dogfood + ${customerContracts.length} paying customers)`);

  for (const contract of watchedContracts) {
    try {
      const rpcUrl = RPC_URLS[contract.chain];
      if (!rpcUrl) {
        console.warn(`[shieldMonitor] No RPC URL configured for chain "${contract.chain}" — skipping ${contract.address}. Set RPC_${contract.chain.toUpperCase()} in env.`);
        continue;
      }
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await checkContract(provider, contract);
    } catch (err) {
      console.error(`[shieldMonitor] Check failed for ${contract.address}:`, err.code || '', err.message || String(err));
    }
  }
}

// Lets this file be run directly: `node src/services/shieldMonitor.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  runShieldCheck().then(() => process.exit(0));
}
