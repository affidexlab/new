import express from 'express';
import crypto from 'crypto';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';
import { screenWallet } from '../../services/riskIntelligenceService.js';
import { findOrgApiKey } from '../../services/orgApiKeyAuth.js';
import { createNowPaymentsInvoice, verifyNowPaymentsSignature } from '../../services/nowpaymentsService.js';
import { provisionCustomerAccess } from '../../services/autoProvisioningService.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const generateApiKey = () => `df_verify_${crypto.randomBytes(24).toString('hex')}`;
const planChecks = { Developer: 1000, Growth: 50000, Business: 500000, Enterprise: null };
const PLAN_PRICES_USD = { Growth: 299, Business: 799 };


router.post('/nowpayments/create-invoice', async (req, res) => {
  try {
    const { companyName, contactName, email, telegram, useCase, chains = [], monthlyChecks, plan = 'Growth', message } = req.body;
    if (!PLAN_PRICES_USD[plan]) return res.status(400).json({ success: false, error: 'Developer/Enterprise plans do not use automated NOWPayments checkout.' });
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company or project name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    const { rows } = await pool.query(
      `INSERT INTO verify_enquiries (company_name, contact_name, email, telegram, use_case, chains, monthly_checks, plan, message, source, status, payment_gateway, payment_status, api_key_issued)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'verify-nowpayments','pending_payment','nowpayments','waiting',false) RETURNING id`,
      [companyName.trim(), contactName.trim(), email.trim().toLowerCase(), telegram?.trim() || null, useCase?.trim() || null, Array.isArray(chains) ? chains : [], monthlyChecks?.trim() || null, plan, message?.trim() || null]
    );
    const orderId = `verify-${rows[0].id}`;
    const invoice = await createNowPaymentsInvoice({ priceUsd: PLAN_PRICES_USD[plan], orderId, description: `DecaFlow Verify API — ${plan}`, successPath: '/verify?checkout=success', cancelPath: '/verify?checkout=cancelled', callbackPath: '/v1/verify/nowpayments/callback' });
    await pool.query(`UPDATE verify_enquiries SET gateway_order_id = $1 WHERE id = $2`, [String(invoice.raw.id || invoice.raw.invoice_id || orderId), rows[0].id]);
    return res.json({ success: true, url: invoice.invoiceUrl });
  } catch (err) {
    console.error('❌ Verify NOWPayments invoice error:', err);
    return res.status(500).json({ success: false, error: 'Could not start NOWPayments checkout.' });
  }
});

router.post('/payment-request', async (req, res) => {
  try {
    const { companyName, contactName, email, telegram, useCase, chains = [], monthlyChecks, plan = 'Growth', message } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company or project name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    const { rows } = await pool.query(
      `INSERT INTO verify_enquiries (company_name, contact_name, email, telegram, use_case, chains, monthly_checks, plan, message, source, status, payment_gateway, payment_status, api_key_issued, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'verify-bank-transfer','pending_payment','bank_transfer','manual_details_pending',false,'Manual bank transfer details to be sent by DecaFlow') RETURNING id`,
      [companyName.trim(), contactName.trim(), email.trim().toLowerCase(), telegram?.trim() || null, useCase?.trim() || null, Array.isArray(chains) ? chains : [], monthlyChecks?.trim() || null, plan, message?.trim() || null]
    );
    await sendEnquiryEmail({ type: 'Verify Bank Transfer', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com', subject: `[DecaFlow] Verify bank transfer request — ${companyName}`, fields: { Company: companyName, Contact: contactName, Email: email, Plan: plan, 'Enquiry ID': `#${rows[0].id}` } });
    return res.json({ success: true, message: 'Bank transfer request received. DecaFlow will send payment details manually.', enquiryId: rows[0].id });
  } catch (err) {
    console.error('❌ Verify payment request error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit payment request.' });
  }
});

router.post('/nowpayments/callback', async (req, res) => {
  try {
    if (!verifyNowPaymentsSignature(req.body, req.headers['x-nowpayments-sig'])) return res.status(403).send('invalid signature');
    const { order_id, payment_status, payment_id } = req.body;
    const match = /^verify-(\d+)$/.exec(order_id || '');
    if (!match) return res.status(200).send('ok');
    const status = payment_status === 'finished' ? 'converted' : ['failed','expired','refunded'].includes(payment_status) ? payment_status : 'pending_payment';
    await pool.query(`UPDATE verify_enquiries SET status = $1, payment_status = $2, gateway_order_id = COALESCE($3, gateway_order_id), updated_at = NOW() WHERE id = $4`, [status, payment_status, payment_id ? String(payment_id) : null, match[1]]);
    res.status(200).send('ok');

    if (payment_status === 'finished') {
      const { rows } = await pool.query(`SELECT * FROM verify_enquiries WHERE id = $1`, [match[1]]);
      const enquiry = rows[0];
      if (enquiry) {
        if (!enquiry.api_key_issued) {
          const newApiKey = generateApiKey();
          await pool.query(`UPDATE verify_enquiries SET api_key_issued = TRUE, api_key = $1, updated_at = NOW() WHERE id = $2`, [newApiKey, enquiry.id]).catch(() => {});
          sendEnquiryEmail({
            type: 'Verify API Key', to: enquiry.email, subject: 'Your DecaFlow Verify API key is ready',
            fields: {
              'Dear': enquiry.contact_name || 'there',
              'Your API Key': newApiKey,
              'Endpoint': 'POST https://decaflow-backend.onrender.com/v1/verify/check',
              'Docs': 'https://docs.decaflow.xyz/verify',
            },
            isApiKey: true,
          }).catch(err => console.error('Verify auto key email failed:', err));
        }
        provisionCustomerAccess({ email: enquiry.email, name: enquiry.contact_name, companyName: enquiry.company_name, product: 'verify', planLabel: enquiry.plan })
          .catch(err => console.error('Verify auto-provisioning failed:', err));
      }
    }
    return undefined;
  } catch (err) {
    console.error('❌ Verify NOWPayments callback error:', err);
    if (!res.headersSent) return res.status(500).send('error');
  }
});

// POST /v1/verify/enquiry — public form submission
router.post('/enquiry', async (req, res) => {
  try {
    const { companyName, contactName, email, telegram, useCase, chains, monthlyChecks, plan, message, source } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company or project name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    // Check duplicate
    const existing = await pool.query(`SELECT id FROM verify_enquiries WHERE email=$1 AND plan=$2 LIMIT 1`, [email.trim().toLowerCase(), plan||'Developer']);
    if (existing.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'You already have an account with us. Check your email or contact decaflowsolutions@gmail.com for your API key.', duplicate: true });
    }

    const isFreePlan = !plan || plan === 'Developer';
    const apiKey = isFreePlan ? generateApiKey() : null;

    const result = await pool.query(
      `INSERT INTO verify_enquiries (company_name,contact_name,email,telegram,use_case,chains,monthly_checks,plan,message,source,api_key_issued,api_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id,created_at`,
      [companyName.trim(), contactName.trim(), email.trim().toLowerCase(), telegram?.trim()||null,
       useCase?.trim()||null, Array.isArray(chains)?chains:[], monthlyChecks?.trim()||null,
       plan?.trim()||'Developer', message?.trim()||null, source||'verify-page', isFreePlan, apiKey]
    );
    const enquiry = result.rows[0];

    await sendEnquiryEmail({
      type: 'Verify API',
      to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] New Verify API Signup — ${companyName} (${plan||'Developer'} Plan)`,
      fields: { 'Company': companyName, 'Contact': contactName, 'Email': email, 'Telegram': telegram||'—',
        'Use Case': useCase||'—', 'Chains': Array.isArray(chains)&&chains.length?chains.join(', '):'—',
        'Monthly Checks': monthlyChecks||'—', 'Plan': plan||'Developer',
        'API Key Issued': isFreePlan?`YES — ${apiKey}`:'NO — manual issue required',
        'Enquiry ID': `#${enquiry.id}`, 'Submitted': new Date(enquiry.created_at).toUTCString() },
    });

    if (isFreePlan && apiKey) {
      await sendEnquiryEmail({
        type: 'Verify API Key', to: email,
        subject: 'Your DecaFlow Verify API Key — Developer Plan',
        fields: { 'Dear': contactName, 'Your API Key': apiKey,
          'Plan': 'Developer (1,000 free checks/month)',
          'npm install': 'npm install @decaflow/verify',
          'Docs': 'https://docs.decaflow.xyz/verify',
          'Upgrade': 'Reply to this email to upgrade to Growth ($299/mo) or Business ($799/mo).',
          'Support': 'decaflowsolutions@gmail.com' },
        isApiKey: true,
      });
    } else {
      await sendEnquiryEmail({
        type: 'Verify API Confirmation', to: email,
        subject: `Your DecaFlow Verify API request — ${plan} Plan received`,
        fields: { 'Dear': contactName, 'Plan': plan,
          'Checks/month': planChecks[plan]?planChecks[plan].toLocaleString():'Unlimited',
          'Next steps': 'Our team will contact you within 24 hours with your API credentials, payment link, and integration guide.',
          'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com' },
        isConfirmation: true,
      });
    }

    return res.status(201).json({ success: true,
      message: isFreePlan ? 'API key issued! Check your email for your credentials.' : 'Request received. We will contact you within 24 hours with your API credentials.',
      enquiryId: enquiry.id, apiKeyIssued: isFreePlan });
  } catch (err) {
    console.error('❌ Verify enquiry error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process your request. Please try again or email us directly.' });
  }
});

// POST /v1/verify/demo — public demo
router.post('/demo', async (req, res) => {
  try {
    const { address, chain } = req.body;
    if (!address || typeof address !== 'string' || address.trim().length < 4) return res.status(400).json({ success: false, error: 'Wallet address is required.' });
    const data = await screenWallet({ address: address.trim(), chain: chain || 'ethereum', purpose: 'verify-demo', allowDemo: true });
    return res.json({
      success: true,
      demo: true,
      notice: 'Public preview only. Use /v1/verify/check with an authenticated API key for production compliance decisions.',
      data
    });
  } catch (err) {
    console.error('❌ Verify demo error:', err);
    return res.status(500).json({ success: false, error: 'Demo check failed.' });
  }
});

// POST /v1/verify/check — authenticated live wallet screening.
router.post('/check', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!apiKey) return res.status(401).json({ success: false, error: 'x-api-key header is required.' });

    const orgKey = await findOrgApiKey(apiKey, 'verify:check');
    let customerId = orgKey ? `org:${orgKey.organization_id}` : null;
    if (!orgKey) {
      const keyResult = await pool.query(
        `SELECT id, email, plan FROM verify_enquiries WHERE api_key = $1 AND api_key_issued = TRUE LIMIT 1`,
        [apiKey]
      );
      if (!keyResult.rows.length) return res.status(401).json({ success: false, error: 'Invalid API key.' });
      customerId = keyResult.rows[0].email;
    }

    const { address, chain = 'ethereum' } = req.body;
    if (!address || typeof address !== 'string' || address.trim().length < 4) return res.status(400).json({ success: false, error: 'Wallet address is required.' });

    const data = await screenWallet({ address: address.trim(), chain, customerId, purpose: 'verify-api' });

    await pool.query(
      `INSERT INTO risk_screenings (product, api_key, wallet_address, chain, provider, risk_score, risk_level, recommendation, sanctions_match, mixer_exposure, darknet_exposure, report_id, raw_response)
       VALUES ('verify', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [apiKey, data.address, data.chain, data.provider, data.riskScore, data.riskLevel, data.recommendation, data.sanctionsMatch, data.mixerExposure, data.darknetExposure, data.reportId, data.raw || data]
    );

    return res.json({ success: true, data });
  } catch (err) {
    console.error('❌ Verify check error:', err);
    return res.status(503).json({ success: false, error: err.message || 'Live screening failed.' });
  }
});

// GET /v1/verify/enquiries — admin only
router.get('/enquiries', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:read'))) return;
    const { status, plan, limit=50, offset=0 } = req.query;
    const params = []; const conditions = [];
    if (status) { params.push(status); conditions.push(`status=$${params.length}`); }
    if (plan)   { params.push(plan);   conditions.push(`plan=$${params.length}`); }
    const where = conditions.length?`WHERE ${conditions.join(' AND ')}`:'';
    params.push(Number(limit), Number(offset));
    const result = await pool.query(
      `SELECT id,company_name,contact_name,email,use_case,chains,plan,status,api_key_issued,created_at FROM verify_enquiries ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params);
    const countParams = conditions.length?(plan&&status?[status,plan]:[status||plan]):[];
    const count = await pool.query(`SELECT COUNT(*) FROM verify_enquiries ${where}`, countParams);
    return res.json({ success: true, total: Number(count.rows[0].count), data: result.rows });
  } catch (err) {
    console.error('❌ List verify enquiries error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch enquiries.' });
  }
});

// PATCH /v1/verify/enquiries/:id/issue-key — admin: manually issue API key for paid plans
router.patch('/enquiries/:id/issue-key', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:read'))) return;
    const enquiryResult = await pool.query(`SELECT * FROM verify_enquiries WHERE id=$1`, [req.params.id]);
    if (!enquiryResult.rows.length) return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    const enquiry = enquiryResult.rows[0];
    if (enquiry.api_key_issued) return res.status(400).json({ success: false, error: 'API key already issued.', apiKey: enquiry.api_key });
    const newApiKey = generateApiKey();
    await pool.query(`UPDATE verify_enquiries SET api_key_issued=TRUE,api_key=$1,status='converted',updated_at=NOW() WHERE id=$2`, [newApiKey, req.params.id]);
    await sendEnquiryEmail({
      type: 'Verify API Key', to: enquiry.email,
      subject: `Your DecaFlow Verify API Key — ${enquiry.plan} Plan`,
      fields: { 'Dear': enquiry.contact_name, 'Your API Key': newApiKey,
        'Plan': `${enquiry.plan} (${planChecks[enquiry.plan]?planChecks[enquiry.plan].toLocaleString()+' checks/month':'Unlimited'})`,
        'npm install': 'npm install @decaflow/verify', 'Docs': 'https://docs.decaflow.xyz/verify', 'Support': 'decaflowsolutions@gmail.com' },
      isApiKey: true,
    });
    return res.json({ success: true, message: `API key issued and emailed to ${enquiry.email}`, apiKey: newApiKey });
  } catch (err) {
    console.error('❌ Issue API key error:', err);
    return res.status(500).json({ success: false, error: 'Failed to issue API key.' });
  }
});

// PATCH /v1/verify/enquiries/:id — admin: update status/notes
router.patch('/enquiries/:id', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:read'))) return;
    const { status, notes } = req.body;
    const result = await pool.query(
      `UPDATE verify_enquiries SET status=COALESCE($1,status),notes=COALESCE($2,notes),updated_at=NOW() WHERE id=$3 RETURNING *`,
      [status||null, notes||null, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Update verify enquiry error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update enquiry.' });
  }
});

export default router;
