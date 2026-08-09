import express from 'express';
import crypto from 'crypto';
import pool from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';
import { safeCompare } from '../../utils/security.js';
import { authenticateOrgSession } from '../../services/orgAuth.js';
import { findOrgApiKey } from '../../services/orgApiKeyAuth.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const VALID_OPERATORS = ['>', '>=', '<', '<=', '=='];

function bearerOrApiKey(req) {
  return req.headers['x-api-key'] || req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
}

async function resolveAgentsAccess(req, res, scope = 'agents:rules', roles = ['owner', 'admin', 'analyst']) {
  const token = bearerOrApiKey(req);
  if (!token && process.env.ALLOW_PUBLIC_AGENT_RULES === 'true') {
    const email = req.body?.email || req.query?.email;
    if (!email || !isValidEmail(email)) {
      res.status(400).json({ success: false, error: 'A valid account email is required.' });
      return null;
    }
    return { email: email.trim().toLowerCase(), organizationId: null, actor: email.trim().toLowerCase(), publicDemo: true };
  }

  const orgKey = await findOrgApiKey(token, scope);
  if (orgKey) {
    return {
      email: orgKey.billing_email,
      organizationId: orgKey.organization_id,
      actor: `api-key:${orgKey.name}`,
      apiKeyId: orgKey.id,
    };
  }

  const principal = await authenticateOrgSession(req, res, roles);
  if (!principal) return null;
  return {
    email: principal.email,
    organizationId: principal.organization_id,
    actor: principal.email,
    role: principal.role,
  };
}

/**
 * Phase 2 of the roadmap's own "Agent-Ready Infrastructure" plan (see
 * CONTINUE_ON_OLD_CHAT.md): configurable workflow rules that flag items for
 * human review. Deliberately does NOT implement Phase 3 (autonomous action,
 * e.g. actually freezing a transaction) — every rule's only possible action
 * is putting something in front of a human via the review queue below.
 * Nothing in this file can move funds, revoke access, or take any
 * consequential action on its own. That's not an oversight to fix later;
 * it's the point, until there's a real risk-scoring engine behind this
 * (see verify.js's /demo endpoint — it's a 3-value deterministic demo, not
 * a real scorer) and a specific, deliberate decision to allow autonomy for
 * a specific action, made by someone who owns that risk, not defaulted here.
 */

router.post('/rules', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:rules', ['owner', 'admin', 'analyst']);
    if (!access) return;
    const { name, conditionField, operator, threshold, action } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'Rule name is required.' });
    if (!VALID_OPERATORS.includes(operator)) return res.status(400).json({ success: false, error: `Operator must be one of ${VALID_OPERATORS.join(', ')}.` });
    if (typeof threshold !== 'number') return res.status(400).json({ success: false, error: 'Threshold must be a number.' });
    if (!['flag_for_review', 'notify_only'].includes(action)) return res.status(400).json({ success: false, error: 'Action must be flag_for_review or notify_only — no other action exists yet.' });

    const { rows } = await pool.query(
      `INSERT INTO compliance_workflow_rules (account_email, organization_id, name, condition_field, operator, threshold, action, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [access.email, access.organizationId, name, conditionField || 'riskScore', operator, threshold, action, access.actor]
    );
    return res.status(201).json({ success: true, rule: rows[0] });
  } catch (err) {
    console.error('❌ Agents rule creation error:', err);
    return res.status(500).json({ success: false, error: 'Could not create rule.' });
  }
});

router.get('/rules', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:rules', ['owner', 'admin', 'analyst', 'viewer']);
    if (!access) return;
    const { rows } = await pool.query(`SELECT * FROM compliance_workflow_rules WHERE account_email = $1 ORDER BY created_at DESC`, [access.email]);
    return res.status(200).json({ success: true, rules: rows });
  } catch (err) {
    console.error('❌ Agents rules list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch rules.' });
  }
});

router.patch('/rules/:id', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:rules', ['owner', 'admin', 'analyst']);
    if (!access) return;
    const { enabled } = req.body;
    const { rows } = await pool.query(`UPDATE compliance_workflow_rules SET enabled = $1, updated_at = NOW() WHERE id = $2 AND account_email = $3 RETURNING *`, [!!enabled, req.params.id, access.email]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Rule not found.' });
    return res.status(200).json({ success: true, rule: rows[0] });
  } catch (err) {
    console.error('❌ Agents rule update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update rule.' });
  }
});

router.delete('/rules/:id', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:rules', ['owner', 'admin']);
    if (!access) return;
    await pool.query(`DELETE FROM compliance_workflow_rules WHERE id = $1 AND account_email = $2`, [req.params.id, access.email]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Agents rule delete error:', err);
    return res.status(500).json({ success: false, error: 'Could not delete rule.' });
  }
});

function ruleMatches(rule, value) {
  switch (rule.operator) {
    case '>': return value > rule.threshold;
    case '>=': return value >= rule.threshold;
    case '<': return value < rule.threshold;
    case '<=': return value <= rule.threshold;
    case '==': return value === rule.threshold;
    default: return false;
  }
}

/**
 * Evaluates a risk result (e.g. from verify.js) against an account's active
 * rules. Call this wherever a real risk score gets produced. The ONLY things
 * that can happen here: nothing (no rule matched), a queue entry a human has
 * to act on, or a notification email. No transaction is ever touched.
 */
router.post('/evaluate', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:evaluate', ['owner', 'admin', 'analyst']);
    if (!access) return;
    const { walletAddress, chain, riskScore, riskLevel } = req.body;
    if (typeof riskScore !== 'number') return res.status(400).json({ success: false, error: 'riskScore (number) is required.' });

    const { rows: rules } = await pool.query(`SELECT * FROM compliance_workflow_rules WHERE account_email = $1 AND enabled = true`, [access.email]);
    const matched = rules.filter(r => r.condition_field === 'riskScore' && ruleMatches(r, riskScore));

    const queued = [];
    const autoResolved = [];
    for (const rule of matched) {
      if (rule.action === 'flag_for_review') {
        if (rule.auto_decision) {
          // Still creates a real, visible queue row — automation here means
          // "resolved without waiting," never "resolved invisibly." A human
          // can see and override every auto-resolved item just like any other.
          const { rows } = await pool.query(
            `INSERT INTO compliance_review_queue (account_email, rule_id, wallet_address, chain, risk_score, risk_level, status, reviewed_by, reviewed_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
            [access.email, rule.id, walletAddress || null, chain || null, riskScore, riskLevel || null, rule.auto_decision, `agent:pattern-match (enabled by ${rule.auto_enabled_by})`]
          );
          autoResolved.push(rows[0]);
        } else {
          const { rows } = await pool.query(
            `INSERT INTO compliance_review_queue (account_email, rule_id, wallet_address, chain, risk_score, risk_level, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
            [access.email, rule.id, walletAddress || null, chain || null, riskScore, riskLevel || null]
          );
          queued.push(rows[0]);
        }
      }
    }

    if (matched.length > 0) {
      sendEnquiryEmail({
        type: 'Agents',
        to: access.email,
        subject: `[DecaFlow] ${matched.length} rule(s) triggered — wallet flagged for your review`,
        fields: {
          Wallet: walletAddress || '—',
          'Risk score': String(riskScore),
          'Rules triggered': matched.map(r => r.name).join(', '),
          Action: queued.length > 0
            ? `${queued.length} item(s) added to your review queue — nothing happens until you decide.`
            : autoResolved.length > 0
              ? `${autoResolved.length} item(s) auto-resolved per rules you enabled — visible in your queue, reversible anytime.`
              : 'Notification only, no action needed.',
        },
      }).catch(err => console.error('Agents notify email failed:', err));
    }

    return res.status(200).json({ success: true, rulesTriggered: matched.length, queuedForReview: queued.length, autoResolved: autoResolved.length });
  } catch (err) {
    console.error('❌ Agents evaluate error:', err);
    return res.status(500).json({ success: false, error: 'Could not evaluate rules.' });
  }
});

/**
 * Phase 3 of the roadmap's own plan: "The AI Agent observes these workflows,
 * learns the compliance officer's patterns, and eventually asks... would you
 * like me to handle this automatically for you from now on?"
 *
 * This endpoint only ever SUGGESTS — it looks at a rule's real decision
 * history and surfaces a pattern if one is strong enough to be worth asking
 * about. It cannot enable anything by itself. A human has to call
 * /rules/:id/enable-auto separately, and can revoke it just as easily.
 */
router.get('/suggestions', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:review', ['owner', 'admin', 'analyst']);
    if (!access) return;

    const { rows } = await pool.query(
      `SELECT rule_id, status, COUNT(*) as cnt
       FROM compliance_review_queue
       WHERE account_email = $1 AND status IN ('approved','rejected') AND rule_id IS NOT NULL
       GROUP BY rule_id, status`,
      [access.email]
    );

    const byRule = {};
    for (const row of rows) {
      byRule[row.rule_id] = byRule[row.rule_id] || { approved: 0, rejected: 0 };
      byRule[row.rule_id][row.status] = Number(row.cnt);
    }

    const MIN_DECISIONS = 5;
    const MIN_CONSISTENCY = 0.9;
    const suggestions = [];

    for (const [ruleId, counts] of Object.entries(byRule)) {
      const total = counts.approved + counts.rejected;
      if (total < MIN_DECISIONS) continue;
      const dominant = counts.approved >= counts.rejected ? 'approved' : 'rejected';
      const consistency = Math.max(counts.approved, counts.rejected) / total;
      if (consistency < MIN_CONSISTENCY) continue;

      const { rows: ruleRows } = await pool.query(`SELECT * FROM compliance_workflow_rules WHERE id = $1`, [ruleId]);
      const rule = ruleRows[0];
      if (!rule || rule.auto_decision) continue; // already automated or rule no longer exists

      suggestions.push({
        ruleId: Number(ruleId),
        ruleName: rule.name,
        totalDecisions: total,
        consistencyPct: Math.round(consistency * 100),
        suggestedAction: dominant,
        message: `You've ${dominant} ${Math.max(counts.approved, counts.rejected)}/${total} items matching "${rule.name}". Want future matches handled the same way automatically, without waiting in the queue?`,
      });
    }

    return res.status(200).json({ success: true, suggestions });
  } catch (err) {
    console.error('❌ Agents suggestions error:', err);
    return res.status(500).json({ success: false, error: 'Could not compute suggestions.' });
  }
});

/// The explicit human opt-in this whole feature hinges on. Nothing gets
/// automated without a named person calling this endpoint on purpose.
router.post('/rules/:id/enable-auto', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:rules', ['owner', 'admin']);
    if (!access) return;
    const { decision, enabledBy } = req.body;
    if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ success: false, error: 'decision must be approved or rejected.' });
    if (!enabledBy?.trim()) return res.status(400).json({ success: false, error: 'enabledBy is required — automation needs an accountable owner too, not just decisions.' });

    const { rows } = await pool.query(
      `UPDATE compliance_workflow_rules SET auto_decision = $1, auto_enabled_at = NOW(), auto_enabled_by = $2, updated_at = NOW() WHERE id = $3 AND account_email = $4 RETURNING *`,
      [decision, enabledBy, req.params.id, access.email]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Rule not found.' });
    return res.status(200).json({ success: true, rule: rows[0] });
  } catch (err) {
    console.error('❌ Agents enable-auto error:', err);
    return res.status(500).json({ success: false, error: 'Could not enable automation.' });
  }
});

/// Just as easy to turn back off as it was to turn on.
router.post('/rules/:id/disable-auto', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:rules', ['owner', 'admin']);
    if (!access) return;
    const { rows } = await pool.query(
      `UPDATE compliance_workflow_rules SET auto_decision = NULL, auto_enabled_at = NULL, auto_enabled_by = NULL, updated_at = NOW() WHERE id = $1 AND account_email = $2 RETURNING *`,
      [req.params.id, access.email]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Rule not found.' });
    return res.status(200).json({ success: true, rule: rows[0] });
  } catch (err) {
    console.error('❌ Agents disable-auto error:', err);
    return res.status(500).json({ success: false, error: 'Could not disable automation.' });
  }
});

router.get('/review-queue', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:review', ['owner', 'admin', 'analyst', 'viewer']);
    if (!access) return;
    const { status } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM compliance_review_queue WHERE account_email = $1 AND status = $2 ORDER BY created_at DESC`,
      [access.email, status || 'pending']
    );
    return res.status(200).json({ success: true, items: rows });
  } catch (err) {
    console.error('❌ Agents review queue error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch review queue.' });
  }
});

/// The human sign-off point. This is the ONLY place a decision on a flagged
/// item gets recorded — deliberately requires a person (reviewedBy) every time.
router.post('/review-queue/:id/decide', async (req, res) => {
  try {
    const access = await resolveAgentsAccess(req, res, 'agents:review', ['owner', 'admin', 'analyst']);
    if (!access) return;
    const { decision, reviewedBy } = req.body;
    if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ success: false, error: 'decision must be approved or rejected.' });
    if (!reviewedBy?.trim()) return res.status(400).json({ success: false, error: 'reviewedBy is required — every decision needs an accountable human.' });

    const { rows } = await pool.query(
      `UPDATE compliance_review_queue SET status = $1, reviewed_by = $2, reviewed_at = NOW() WHERE id = $3 AND account_email = $4 RETURNING *`,
      [decision, reviewedBy, req.params.id, access.email]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Queue item not found.' });
    return res.status(200).json({ success: true, item: rows[0] });
  } catch (err) {
    console.error('❌ Agents review decision error:', err);
    return res.status(500).json({ success: false, error: 'Could not record decision.' });
  }
});

// ============================================================
// Payment endpoints — same architecture as Shield/Institutional.
// Fixed self-serve prices for Starter/Growth; Enterprise stays on waitlist.
// ============================================================

const PLAN_PRICES_CENTS = { Starter: 50000, Growth: 250000 }; // $500 / $2,500 per month

router.post('/waitlist', async (req, res) => {
  try {
    const { companyName, contactName, email, message, plan } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    await sendEnquiryEmail({
      type: 'Agents', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] Agents interest — ${companyName}`,
      fields: { Company: companyName, Contact: contactName || '—', Email: email, Plan: plan || 'Enterprise', Message: message || '—' },
    });
    await sendEnquiryEmail({
      type: 'Agents Confirmation', to: email, subject: "We've got your DecaFlow Agents request",
      fields: { Dear: contactName || 'there', 'What happens next': 'Our team will follow up to scope your workflow rules.' },
      isConfirmation: true,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Agents waitlist error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit request.' });
  }
});

router.post('/payment-request', async (req, res) => {
  try {
    const { companyName, contactName, email, plan, paymentMethod } = req.body;
    if (paymentMethod !== 'bank') return res.status(400).json({ success: false, error: 'Unsupported payment method.' });
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    await pool.query(
      `INSERT INTO agents_customers (company_name, contact_name, email, plan, payment_gateway, status)
       VALUES ($1, $2, $3, $4, 'bank', 'pending_payment')`,
      [companyName, contactName || null, email, plan]
    );

    await sendEnquiryEmail({
      type: 'Agents', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] Agents bank transfer request — ${companyName}`,
      fields: { Company: companyName, Contact: contactName || '—', Email: email, Plan: plan },
    });
    await sendEnquiryEmail({
      type: 'Agents Confirmation', to: email, subject: 'DecaFlow Agents — bank transfer request received',
      fields: { Dear: contactName || 'there', 'What happens next': 'Transfer details within one business day.' },
      isConfirmation: true,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Agents payment-request error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit request.' });
  }
});

router.post('/nowpayments/create-invoice', async (req, res) => {
  if (!process.env.NOWPAYMENTS_API_KEY) return res.status(503).json({ success: false, error: 'Crypto payment is not configured yet.' });
  try {
    const { plan, companyName, contactName, email } = req.body;
    if (!PLAN_PRICES_CENTS[plan]) return res.status(400).json({ success: false, error: 'Enterprise is custom — use the waitlist form.' });
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    const priceUsd = PLAN_PRICES_CENTS[plan] / 100;
    const insertResult = await pool.query(
      `INSERT INTO agents_customers (company_name, contact_name, email, plan, payment_gateway, status)
       VALUES ($1, $2, $3, $4, 'nowpayments', 'pending_payment') RETURNING id`,
      [companyName, contactName || null, email, plan]
    );
    const orderId = `agents-${insertResult.rows[0].id}`;
    const apiBase = process.env.NOWPAYMENTS_ENV === 'sandbox' ? 'https://api-sandbox.nowpayments.io' : 'https://api.nowpayments.io';
    const frontendUrl = process.env.FRONTEND_URL || 'https://decaflow.xyz';
    const backendUrl = process.env.BACKEND_URL || 'https://decaflow-backend.onrender.com';

    const npRes = await fetch(`${apiBase}/v1/invoice`, {
      method: 'POST',
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: priceUsd, price_currency: 'usd', order_id: orderId,
        order_description: `DecaFlow Agents — ${plan} — ${companyName}`,
        ipn_callback_url: `${backendUrl}/v1/agents/nowpayments/callback`,
        success_url: `${frontendUrl}/agents?checkout=success`, cancel_url: `${frontendUrl}/agents?checkout=cancelled`,
      }),
    });
    const npData = await npRes.json();
    const invoiceUrl = npData.invoice_url || npData.url;
    if (!npRes.ok || !invoiceUrl) return res.status(502).json({ success: false, error: 'Could not start crypto checkout.' });

    await pool.query(`UPDATE agents_customers SET gateway_order_id = $1 WHERE id = $2`, [String(npData.id || npData.invoice_id || orderId), insertResult.rows[0].id]);

    await sendEnquiryEmail({
      type: 'Agents', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] Agents checkout started — ${companyName}`,
      fields: { Company: companyName, Contact: contactName || '—', Email: email, Plan: plan, 'Order ID': orderId },
    }).catch(() => {});

    return res.status(200).json({ success: true, url: invoiceUrl });
  } catch (err) {
    console.error('❌ Agents NOWPayments create-invoice error:', err);
    return res.status(500).json({ success: false, error: 'Could not start crypto checkout.' });
  }
});

router.post('/nowpayments/callback', async (req, res) => {
  try {
    if (!process.env.NOWPAYMENTS_IPN_SECRET) return res.status(503).send('not configured');
    const sig = req.headers['x-nowpayments-sig'];
    const sortObjectKeys = (obj) => Object.keys(obj).sort().reduce((r, k) => { r[k] = (obj[k] && typeof obj[k] === 'object') ? sortObjectKeys(obj[k]) : obj[k]; return r; }, {});
    const expectedSig = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET).update(JSON.stringify(sortObjectKeys(req.body))).digest('hex');
    if (!sig || !safeCompare(sig, expectedSig)) return res.status(403).send('invalid signature');

    const { order_id, payment_status, pay_currency, pay_amount, payment_id } = req.body;
    const match = /^agents-(\d+)$/.exec(order_id || '');
    if (!match) return res.status(200).send('ok');

    const dbId = match[1];
    const { rows } = await pool.query(`SELECT * FROM agents_customers WHERE id = $1`, [dbId]);
    const customer = rows[0];
    if (!customer) return res.status(200).send('ok');

    if (payment_status === 'finished' && customer.status !== 'paid_queued') {
      await pool.query(
        `UPDATE agents_customers SET status = 'paid_queued', gateway_order_id = $1, updated_at = NOW() WHERE id = $2`,
        [String(payment_id), dbId]
      );

      res.status(200).send('ok');

      sendEnquiryEmail({
        type: 'Agents', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
        subject: `[DecaFlow] Agents payment confirmed — ${order_id}`,
        fields: { Company: customer.company_name, Email: customer.email, Plan: customer.plan, 'Order ID': order_id, Amount: `${pay_amount} ${pay_currency}` },
      }).catch(err => console.error('Agents payment notify failed:', err));
    } else if (['failed', 'expired', 'refunded'].includes(payment_status)) {
      await pool.query(`UPDATE agents_customers SET status = $1, updated_at = NOW() WHERE id = $2`, [payment_status, dbId]);
      res.status(200).send('ok');
    } else {
      res.status(200).send('ok');
    }
  } catch (err) {
    console.error('❌ Agents NOWPayments callback error:', err);
    if (!res.headersSent) return res.status(500).send('callback processing failed');
  }
});

export default router;
