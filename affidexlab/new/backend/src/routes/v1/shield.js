import express from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';
import { safeCompare } from '../../utils/security.js';
import { createShieldAlert } from '../../services/shieldActionEngine.js';
import { runShieldSecurityScan } from '../../services/shieldSecurityScanner.js';
import { runShieldVulnerabilityScan } from '../../services/shieldVulnerabilityScanner.js';
import { provisionCustomerAccess } from '../../services/autoProvisioningService.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const requireAdmin = (req, res) => authorizeAdmin(req, res, 'shield:admin');

// Fixed monthly prices in cents, standing in for the ranges shown on the pricing
// page ($500-1,500 and $3,000-8,000). Stripe checkout needs one exact number —
// change these two lines to adjust the self-serve price. Enterprise has no fixed
// price and isn't sold through this endpoint; it stays on the waitlist form below.
const PLAN_PRICES_CENTS = {
  Starter: 75000,   // $750/mo
  Growth: 500000,   // $5,000/mo
};

// Lazy + guarded: only constructs a Stripe client if a key is present, and only
// when a checkout request actually comes in. This means the rest of the backend
// (compliance/audit/verify forms, everything already live) keeps working exactly
// as before even before Stripe is configured — this route just returns a clean
// "not configured yet" error instead of the whole server failing to boot.
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// POST /v1/shield/waitlist — public early-access signup.
router.post('/waitlist', async (req, res) => {
  try {
    const { companyName, contactName, email, chains, contractCount, message, source } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    const { rows } = await pool.query(
      `INSERT INTO shield_waitlist (company_name, contact_name, email, chains, contract_count, message, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        companyName.trim(),
        contactName.trim(),
        email.trim().toLowerCase(),
        JSON.stringify(Array.isArray(chains) ? chains : []),
        contractCount ? String(contractCount) : null,
        message?.trim() || null,
        source || 'shield-page'
      ]
    );

    await sendEnquiryEmail({
      type: 'Shield',
      to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] New Shield Early Access Request — ${companyName}`,
      fields: {
        'Company': companyName,
        'Contact': contactName,
        'Email': email,
        'Chains': Array.isArray(chains) && chains.length ? chains.join(', ') : '—',
        'Contracts to monitor': contractCount || '—',
        'Message': message || '—',
        'Source': source || 'shield-page',
        'Submitted': new Date().toUTCString(),
      },
    });

    await sendEnquiryEmail({
      type: 'Shield Confirmation',
      to: email,
      subject: "You're on the list for DecaFlow Shield",
      fields: {
        'Dear': contactName,
        'What happens next': "We're onboarding Shield early-access clients in small batches. A member of the team will reach out to scope your contracts and set up monitoring.",
        'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com',
      },
      isConfirmation: true,
    });

    return res.status(201).json({ success: true, waitlistId: rows[0].id, message: "You're on the Shield early-access list. We'll be in touch." });
  } catch (err) {
    console.error('❌ Shield waitlist error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit. Please try again or email us directly.' });
  }
});

router.get('/waitlist', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { status, limit = 100, offset = 0 } = req.query;
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = `WHERE status = $${params.length}`;
    }
    params.push(Number(limit), Number(offset));
    const { rows } = await pool.query(
      `SELECT * FROM shield_waitlist ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return res.json({ success: true, waitlist: rows });
  } catch (err) {
    console.error('❌ Shield waitlist list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch Shield waitlist.' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { status = 'open', limit = 50, offset = 0 } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM shield_alerts WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [status, Number(limit), Number(offset)]
    );
    return res.json({ success: true, alerts: rows });
  } catch (err) {
    console.error('❌ Shield alerts list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch alerts.' });
  }
});

router.patch('/alerts/:id', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { status } = req.body;
    if (!['open', 'acknowledged', 'resolved'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid status.' });
    const { rows } = await pool.query(
      `UPDATE shield_alerts SET status = $1, resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Alert not found.' });
    return res.json({ success: true, alert: rows[0] });
  } catch (err) {
    console.error('❌ Shield alert update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update alert.' });
  }
});

router.get('/incidents', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { status = 'triage', limit = 50, offset = 0 } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM shield_incidents WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [status, Number(limit), Number(offset)]
    );
    return res.json({ success: true, incidents: rows });
  } catch (err) {
    console.error('❌ Shield incidents list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch incidents.' });
  }
});

router.patch('/incidents/:id', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { status, assignedTo, summary, nextSteps } = req.body;
    const { rows } = await pool.query(
      `UPDATE shield_incidents
       SET status = COALESCE($1, status),
           assigned_to = COALESCE($2, assigned_to),
           summary = COALESCE($3, summary),
           next_steps = COALESCE($4, next_steps),
           updated_at = NOW(),
           closed_at = CASE WHEN $1 = 'closed' THEN NOW() ELSE closed_at END
       WHERE id = $5 RETURNING *`,
      [status || null, assignedTo || null, summary || null, nextSteps || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Incident not found.' });
    return res.json({ success: true, incident: rows[0] });
  } catch (err) {
    console.error('❌ Shield incident update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update incident.' });
  }
});

router.get('/vulnerability-findings', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { status = 'open', limit = 100, offset = 0 } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM shield_vulnerability_findings WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [status, Number(limit), Number(offset)]
    );
    return res.json({ success: true, findings: rows });
  } catch (err) {
    console.error('❌ Shield findings list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch Shield findings.' });
  }
});

router.patch('/vulnerability-findings/:id', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { status } = req.body || {};
    if (!['open', 'acknowledged', 'resolved', 'false_positive'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid status.' });
    const { rows } = await pool.query(
      `UPDATE shield_vulnerability_findings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Finding not found.' });
    return res.json({ success: true, finding: rows[0] });
  } catch (err) {
    console.error('❌ Shield finding update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update Shield finding.' });
  }
});

router.post('/contracts/:chain/:address/abi', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { abi, source = 'customer-provided' } = req.body || {};
    if (!Array.isArray(abi)) return res.status(400).json({ success: false, error: 'abi must be an array.' });
    const { rows } = await pool.query(
      `INSERT INTO shield_contract_abis (chain, address, abi, source)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (chain, lower(address))
       DO UPDATE SET abi = EXCLUDED.abi, source = EXCLUDED.source, updated_at = NOW()
       RETURNING id, chain, address, source, created_at, updated_at`,
      [String(req.params.chain).toLowerCase(), String(req.params.address).toLowerCase(), JSON.stringify(abi), source]
    );
    return res.status(201).json({ success: true, abi: rows[0] });
  } catch (err) {
    console.error('❌ Shield ABI upsert error:', err);
    return res.status(500).json({ success: false, error: 'Could not save contract ABI.' });
  }
});

router.get('/playbooks', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { rows } = await pool.query(`SELECT * FROM shield_incident_playbooks ORDER BY alert_type, id`);
    return res.json({ success: true, playbooks: rows });
  } catch (err) {
    console.error('❌ Shield playbooks list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch playbooks.' });
  }
});

router.post('/playbooks', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { name, alertType, severity = 'high', steps = [], customerId = null } = req.body || {};
    if (!name?.trim() || !alertType?.trim()) return res.status(400).json({ success: false, error: 'name and alertType are required.' });
    if (!Array.isArray(steps) || !steps.length) return res.status(400).json({ success: false, error: 'steps must be a non-empty array.' });
    const { rows } = await pool.query(
      `INSERT INTO shield_incident_playbooks (name, alert_type, severity, steps, customer_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), alertType.trim(), severity, JSON.stringify(steps.map(String)), customerId]
    );
    return res.status(201).json({ success: true, playbook: rows[0] });
  } catch (err) {
    console.error('❌ Shield playbook create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create playbook.' });
  }
});

router.get('/anomaly-thresholds', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { rows } = await pool.query(`SELECT * FROM shield_anomaly_thresholds ORDER BY alert_type, chain NULLS FIRST, address NULLS FIRST`);
    return res.json({ success: true, thresholds: rows });
  } catch (err) {
    console.error('❌ Shield thresholds list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch anomaly thresholds.' });
  }
});

router.post('/anomaly-thresholds', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { alertType, chain = null, address = null, threshold, windowBlocks = 10, severity = 'high' } = req.body || {};
    if (!alertType?.trim() || !Number(threshold)) return res.status(400).json({ success: false, error: 'alertType and numeric threshold are required.' });
    const { rows } = await pool.query(
      `INSERT INTO shield_anomaly_thresholds (alert_type, chain, address, threshold, window_blocks, severity)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [alertType.trim(), chain, address ? String(address).toLowerCase() : null, Number(threshold), Number(windowBlocks), severity]
    );
    return res.status(201).json({ success: true, threshold: rows[0] });
  } catch (err) {
    console.error('❌ Shield threshold create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create anomaly threshold.' });
  }
});

router.get('/action-rules', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { rows } = await pool.query(`SELECT * FROM shield_action_rules ORDER BY created_at DESC`);
    return res.json({ success: true, rules: rows });
  } catch (err) {
    console.error('❌ Shield action rules list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch action rules.' });
  }
});

router.post('/action-rules', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { name, eventType, minSeverity = 'medium', chain = null, address = null, actionType = 'email' } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'name is required.' });
    if (!eventType?.trim()) return res.status(400).json({ success: false, error: 'eventType is required.' });
    if (!['email'].includes(actionType)) return res.status(400).json({ success: false, error: 'Only email actions are enabled for now.' });

    const { rows } = await pool.query(
      `INSERT INTO shield_action_rules (name, event_type, min_severity, chain, address, action_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, eventType, minSeverity, chain, address, actionType]
    );
    return res.status(201).json({ success: true, rule: rows[0] });
  } catch (err) {
    console.error('❌ Shield action rule create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create action rule.' });
  }
});

router.patch('/action-rules/:id', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { enabled, minSeverity, actionType } = req.body;
    const { rows } = await pool.query(
      `UPDATE shield_action_rules
       SET enabled = COALESCE($1, enabled),
           min_severity = COALESCE($2, min_severity),
           action_type = COALESCE($3, action_type),
           updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [enabled ?? null, minSeverity || null, actionType || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Action rule not found.' });
    return res.json({ success: true, rule: rows[0] });
  } catch (err) {
    console.error('❌ Shield action rule update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update action rule.' });
  }
});

router.get('/events/onchain', (_req, res) => res.status(200).send('ok'));

router.post('/events/onchain', async (req, res) => {
  try {
    const secret = process.env.SHIELD_EVENT_WEBHOOK_SECRET;
    if (secret && req.headers['x-shield-secret'] !== secret) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const { chain, address, label, eventType, severity = 'medium', message, txHash, metadata } = req.body;
    if (!chain || !address || !eventType || !message) return res.status(400).json({ success: false, error: 'chain, address, eventType, and message are required.' });

    const result = await createShieldAlert({ chain, address, label, severity, alertType: eventType, message, txHash, metadata });
    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('❌ Shield onchain event error:', err);
    return res.status(500).json({ success: false, error: 'Could not process on-chain event.' });
  }
});

router.post('/scan/security', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const result = await runShieldSecurityScan(req.body || {});
    return res.status(202).json({ success: true, result });
  } catch (err) {
    console.error('❌ Shield security scan trigger error:', err);
    return res.status(500).json({ success: false, error: 'Could not run Shield security scan.' });
  }
});

router.post('/scan/vulnerabilities', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const result = await runShieldVulnerabilityScan();
    return res.status(202).json({ success: true, result });
  } catch (err) {
    console.error('❌ Shield vulnerability scan trigger error:', err);
    return res.status(500).json({ success: false, error: 'Could not run Shield vulnerability scan.' });
  }
});

// POST /v1/shield/checkout — Starter/Growth self-serve subscription checkout.
// Enterprise is "Custom" pricing and is NOT sold here — it stays on /waitlist above.
router.post('/checkout', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Payments are not live yet. Use the waitlist form for now, or contact us directly.' });
  }

  try {
    const { plan, companyName, contactName, email, chain, contractAddress, chains } = req.body;

    if (!PLAN_PRICES_CENTS[plan]) {
      return res.status(400).json({ success: false, error: 'Enterprise is custom pricing — please use the waitlist form instead of checkout.' });
    }
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!contractAddress?.trim()) return res.status(400).json({ success: false, error: 'A contract address is required so we know what to start monitoring.' });

    const frontendUrl = process.env.FRONTEND_URL || 'https://decaflow.xyz';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `DecaFlow Shield — ${plan}` },
          unit_amount: PLAN_PRICES_CENTS[plan],
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      // Everything the webhook needs to actually set up monitoring after payment —
      // Stripe hands this back verbatim in the checkout.session.completed event.
      metadata: {
        plan,
        companyName,
        contactName: contactName || '',
        chain: chain || (Array.isArray(chains) && chains[0]) || '',
        contractAddress,
      },
      success_url: `${frontendUrl}/shield?checkout=success`,
      cancel_url: `${frontendUrl}/shield?checkout=cancelled`,
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (err) {
    console.error('❌ Shield checkout error:', err);
    return res.status(500).json({ success: false, error: 'Could not start checkout. Please try again or email us directly.' });
  }
});

// POST /v1/shield/payment-request — crypto or bank transfer request (manual/semi-manual
// confirmation, not instant). Card is handled by /checkout above once Stripe is live.
router.post('/payment-request', async (req, res) => {
  try {
    const { plan, companyName, contactName, email, chain, contractAddress, paymentMethod } = req.body;

    if (!['crypto', 'bank'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, error: 'Unknown payment method.' });
    }
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!contractAddress?.trim()) return res.status(400).json({ success: false, error: 'A contract address is required so we know what to start monitoring.' });

    const basePrice = PLAN_PRICES_CENTS[plan] ? PLAN_PRICES_CENTS[plan] / 100 : null;
    let walletAddress = null;
    let exactAmount = null;

    if (paymentMethod === 'crypto') {
      // Deliberately NOT a hardcoded/placeholder address — a real address you control has
      // to be set per chain via env var (SHIELD_WALLET_ARBITRUM etc). Showing a fake or
      // example address on a payment page is how people lose real funds, so this fails
      // closed: no env var set = no address shown, ever.
      const envKey = `SHIELD_WALLET_${(chain || '').toUpperCase()}`;
      walletAddress = process.env[envKey] || null;
      if (!walletAddress) {
        return res.status(503).json({ success: false, error: `Crypto payment on ${chain || 'this chain'} isn't set up yet. Please use bank transfer, or contact us directly.` });
      }
      // Unique cents amount (e.g. $750.37) makes each customer's expected payment
      // distinguishable on-chain without needing a memo field, which EVM transfers don't have.
      // Guardian audit LOW "Non-Cryptographic Randomness in Payment Amounts": was
      // Math.random(), not cryptographically secure. crypto.randomInt's upper bound is
      // EXCLUSIVE (unlike the old formula's inclusive +1), so this is randomInt(1, 100)
      // to keep the exact same 1-99 inclusive range as before.
      const cents = crypto.randomInt(1, 100);
      exactAmount = basePrice ? `${basePrice}.${String(cents).padStart(2, '0')}` : null;
    }

    const status = 'pending_payment';
    await sendEnquiryEmail({
      type: 'Shield',
      to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] Shield ${paymentMethod} payment request — ${companyName}`,
      fields: {
        'Company': companyName, 'Contact': contactName || '—', 'Email': email, 'Plan': plan || '—',
        'Payment method': paymentMethod,
        'Expected amount': exactAmount ? `$${exactAmount} on ${chain}` : (basePrice ? `$${basePrice}/mo` : '—'),
        'Wallet to watch': walletAddress || '—',
        'Contract': `${chain || '—'}: ${contractAddress}`,
        'Status': status,
      },
    });

    await sendEnquiryEmail({
      type: 'Shield Confirmation',
      to: email,
      subject: paymentMethod === 'crypto' ? 'DecaFlow Shield — payment instructions' : 'DecaFlow Shield — bank transfer request received',
      fields: paymentMethod === 'crypto'
        ? { 'Dear': contactName || 'there', 'Send exactly': `$${exactAmount} equivalent in stablecoin on ${chain}`, 'To': walletAddress, 'Then': 'Reply to this email once sent — we verify on-chain and activate your account manually. This is not instant yet.' }
        : { 'Dear': contactName || 'there', 'What happens next': "Our team will email you bank transfer details within one business day. Your account activates once payment clears — bank transfers are not instant." },
      isConfirmation: true,
    });

    return res.status(200).json({ success: true, walletAddress, exactAmount, chain: chain || null });
  } catch (err) {
    console.error('❌ Shield payment-request error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit request. Please try again or email us directly.' });
  }
});

// ============================================================
// NOWPayments — real crypto payment gateway integration.
// Flow: create-invoice (unique invoice_url + QR) -> customer pays -> NOWPayments detects
// it on-chain and POSTs our callback (signed) -> we verify + activate. Payout to your
// real wallet is configured once in your NOWPayments dashboard (Payment Settings ->
// wallet), not in this code — no wallet address needs to live here.
// Docs: https://documenter.getpostman.com/view/7907941/2s93JusNJt
// ============================================================

router.post('/nowpayments/create-invoice', async (req, res) => {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    return res.status(503).json({ success: false, error: 'Crypto payment is not configured yet. Use another payment method for now.' });
  }
  try {
    const { plan, companyName, contactName, email, chain, contractAddress } = req.body;

    if (!PLAN_PRICES_CENTS[plan]) return res.status(400).json({ success: false, error: 'Enterprise is custom pricing — please use the waitlist form.' });
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!contractAddress?.trim()) return res.status(400).json({ success: false, error: 'A contract address is required so we know what to start monitoring.' });

    const priceUsd = PLAN_PRICES_CENTS[plan] / 100;

    const insertResult = await pool.query(
      `INSERT INTO shield_customers (company_name, contact_name, email, plan, payment_gateway, status)
       VALUES ($1, $2, $3, $4, 'nowpayments', 'pending_payment') RETURNING id`,
      [companyName, contactName || null, email, plan]
    );
    const dbId = insertResult.rows[0].id;
    const orderId = `shield-${dbId}`;

    await pool.query(
      `INSERT INTO shield_contracts (customer_id, chain, address, label, status) VALUES ($1, $2, $3, $4, 'pending')`,
      [dbId, chain || 'unknown', contractAddress, `${companyName} — primary contract`]
    );

    // NOWPAYMENTS_ENV=sandbox -> sandbox API + sandbox key; unset/"live" -> production.
    const apiBase = process.env.NOWPAYMENTS_ENV === 'sandbox' ? 'https://api-sandbox.nowpayments.io' : 'https://api.nowpayments.io';
    const frontendUrl = process.env.FRONTEND_URL || 'https://decaflow.xyz';
    const backendUrl = process.env.BACKEND_URL || 'https://decaflow-backend.onrender.com';

    const npRes = await fetch(`${apiBase}/v1/invoice`, {
      method: 'POST',
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: priceUsd,
        price_currency: 'usd',
        order_id: orderId,
        order_description: `DecaFlow Shield — ${plan} — ${contractAddress} on ${chain || 'unspecified chain'}`,
        ipn_callback_url: `${backendUrl}/v1/shield/nowpayments/callback`,
        success_url: `${frontendUrl}/shield?checkout=success`,
        cancel_url: `${frontendUrl}/shield?checkout=cancelled`,
      }),
    });
    const npData = await npRes.json();
    const invoiceUrl = npData.invoice_url || npData.url; // defensive: field naming has varied across NOWPayments doc versions

    if (!npRes.ok || !invoiceUrl) {
      console.error('❌ NOWPayments invoice creation failed:', npRes.status, npData);
      return res.status(502).json({ success: false, error: 'Could not start crypto checkout. Please try again or use another payment method.' });
    }

    await pool.query(`UPDATE shield_customers SET coingate_order_id = $1 WHERE id = $2`, [String(npData.id || npData.invoice_id || ''), dbId]);

    return res.status(200).json({ success: true, url: invoiceUrl });
  } catch (err) {
    console.error('❌ Shield NOWPayments create-invoice error:', err);
    return res.status(500).json({ success: false, error: 'Could not start crypto checkout. Please try again.' });
  }
});

// Sorts an object's keys alphabetically (recursively) — required by NOWPayments' exact
// signature scheme: sort keys, JSON.stringify, HMAC-SHA512 with the IPN secret, compare
// hex digest to the x-nowpayments-sig header. This is their own documented algorithm.
function sortObjectKeys(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = (obj[key] && typeof obj[key] === 'object') ? sortObjectKeys(obj[key]) : obj[key];
    return result;
  }, {});
}

// NOWPayments IPN needs the parsed body (to re-sort + re-stringify), not raw bytes, so —
// unlike the Stripe webhook — this route does NOT need special raw-body middleware and can
// stay mounted normally, after the app-wide express.json() in server.js.
router.post('/nowpayments/callback', async (req, res) => {
  try {
    if (!process.env.NOWPAYMENTS_IPN_SECRET) {
      console.warn('⚠️  Shield NOWPayments callback hit but NOWPAYMENTS_IPN_SECRET is not set — ignoring.');
      return res.status(503).send('not configured');
    }

    const sig = req.headers['x-nowpayments-sig'];
    const expectedSig = crypto
      .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
      .update(JSON.stringify(sortObjectKeys(req.body)))
      .digest('hex');

    if (!sig || !safeCompare(sig, expectedSig)) {
      console.error('❌ Shield NOWPayments callback signature mismatch');
      return res.status(403).send('invalid signature');
    }

    const { order_id, payment_status, pay_currency, pay_amount, payment_id } = req.body;
    const match = /^shield-(\d+)$/.exec(order_id || '');
    if (!match) { console.warn('⚠️  Shield NOWPayments callback: unrecognized order_id', order_id); return res.status(200).send('ok'); }
    const dbId = match[1];

    const { rows } = await pool.query(`SELECT * FROM shield_customers WHERE id = $1`, [dbId]);
    const customer = rows[0];
    if (!customer) { console.warn('⚠️  Shield NOWPayments callback: no matching customer for', order_id); return res.status(200).send('ok'); }

    if (payment_status === 'finished' && customer.status !== 'active') {
      await pool.query(`UPDATE shield_customers SET status = 'active', coingate_order_id = $1, updated_at = NOW() WHERE id = $2`, [String(payment_id), dbId]);
      await pool.query(`UPDATE shield_contracts SET status = 'active' WHERE customer_id = $1`, [dbId]);

      // Acknowledge only after durable provisioning state is written. Email can
      // happen after the response; payment state cannot.
      res.status(200).send('ok');

      sendEnquiryEmail({
        type: 'Shield',
        to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
        subject: `[DecaFlow] Shield paid via crypto — ${customer.company_name}`,
        fields: { Company: customer.company_name, Email: customer.email, Plan: customer.plan, Paid: `${pay_amount} ${pay_currency}`, 'NOWPayments ID': String(payment_id) },
      }).catch(err => console.error('Shield notify email failed:', err));

      sendEnquiryEmail({
        type: 'Shield Confirmation',
        to: customer.email,
        subject: "You're live on DecaFlow Shield",
        fields: {
          'Dear': customer.contact_name || 'there',
          'What just happened': `Payment confirmed (${pay_amount} ${pay_currency}). Your ${customer.plan} subscription is active and your contract is now in our monitoring system.`,
          'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com',
        },
        isConfirmation: true,
      }).catch(err => console.error('Shield confirmation email failed:', err));

      provisionCustomerAccess({ email: customer.email, name: customer.contact_name, companyName: customer.company_name, product: 'shield', planLabel: customer.plan })
        .catch(err => console.error('Shield auto-provisioning failed:', err));
    } else if (['failed', 'expired', 'refunded'].includes(payment_status)) {
      await pool.query(`UPDATE shield_customers SET status = $1, updated_at = NOW() WHERE id = $2`, [payment_status, dbId]);
      res.status(200).send('ok');
    } else {
      res.status(200).send('ok');
    }
    // waiting / confirming / partially_paid / sending: no action yet, more callbacks follow.
  } catch (err) {
    console.error('❌ Shield NOWPayments callback error:', err);
    if (!res.headersSent) return res.status(500).send('callback processing failed');
  }
});

export default router;
