import express from 'express';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';
import { screenWallet } from '../../services/riskIntelligenceService.js';
import { createNowPaymentsInvoice, verifyNowPaymentsSignature } from '../../services/nowpaymentsService.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const PLAN_PRICES_USD = { Starter: 299, Business: 799 };



router.post('/nowpayments/create-invoice', async (req, res) => {
  try {
    const { companyName, contactName, email, telegram, businessType, chains = [], monthlyTxVolume, plan = 'Business', message } = req.body;
    if (!PLAN_PRICES_USD[plan]) return res.status(400).json({ success: false, error: 'Enterprise is custom pricing — use bank/manual sales flow.' });
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    const { rows } = await pool.query(
      `INSERT INTO compliance_enquiries (company_name, contact_name, email, telegram, business_type, chains, monthly_tx_volume, plan, message, source, status, payment_gateway, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'compliance-nowpayments','pending_payment','nowpayments','waiting') RETURNING id`,
      [companyName.trim(), contactName.trim(), email.trim().toLowerCase(), telegram?.trim() || null, businessType?.trim() || null, Array.isArray(chains) ? chains : [], monthlyTxVolume?.trim() || null, plan, message?.trim() || null]
    );
    const orderId = `compliance-${rows[0].id}`;
    const invoice = await createNowPaymentsInvoice({ priceUsd: PLAN_PRICES_USD[plan], orderId, description: `DecaFlow Compliance — ${plan}`, successPath: '/compliance?checkout=success', cancelPath: '/compliance?checkout=cancelled', callbackPath: '/v1/compliance/nowpayments/callback' });
    await pool.query(`UPDATE compliance_enquiries SET gateway_order_id = $1 WHERE id = $2`, [String(invoice.raw.id || invoice.raw.invoice_id || orderId), rows[0].id]);
    return res.json({ success: true, url: invoice.invoiceUrl });
  } catch (err) {
    console.error('❌ Compliance NOWPayments invoice error:', err);
    return res.status(500).json({ success: false, error: 'Could not start NOWPayments checkout.' });
  }
});

router.post('/payment-request', async (req, res) => {
  try {
    const { companyName, contactName, email, telegram, businessType, chains = [], monthlyTxVolume, plan = 'Business', message } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    const { rows } = await pool.query(
      `INSERT INTO compliance_enquiries (company_name, contact_name, email, telegram, business_type, chains, monthly_tx_volume, plan, message, source, status, payment_gateway, payment_status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'compliance-bank-transfer','pending_payment','bank_transfer','manual_details_pending','Manual bank transfer details to be sent by DecaFlow') RETURNING id`,
      [companyName.trim(), contactName.trim(), email.trim().toLowerCase(), telegram?.trim() || null, businessType?.trim() || null, Array.isArray(chains) ? chains : [], monthlyTxVolume?.trim() || null, plan, message?.trim() || null]
    );
    await sendEnquiryEmail({ type: 'Compliance Bank Transfer', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com', subject: `[DecaFlow] Compliance bank transfer request — ${companyName}`, fields: { Company: companyName, Contact: contactName, Email: email, Plan: plan, 'Enquiry ID': `#${rows[0].id}` } });
    return res.json({ success: true, message: 'Bank transfer request received. DecaFlow will send payment details manually.', enquiryId: rows[0].id });
  } catch (err) {
    console.error('❌ Compliance payment request error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit payment request.' });
  }
});

router.post('/nowpayments/callback', async (req, res) => {
  try {
    if (!verifyNowPaymentsSignature(req.body, req.headers['x-nowpayments-sig'])) return res.status(403).send('invalid signature');
    const { order_id, payment_status, payment_id } = req.body;
    const match = /^compliance-(\d+)$/.exec(order_id || '');
    if (!match) return res.status(200).send('ok');
    const status = payment_status === 'finished' ? 'converted' : ['failed','expired','refunded'].includes(payment_status) ? payment_status : 'pending_payment';
    await pool.query(`UPDATE compliance_enquiries SET status = $1, payment_status = $2, gateway_order_id = COALESCE($3, gateway_order_id), updated_at = NOW() WHERE id = $4`, [status, payment_status, payment_id ? String(payment_id) : null, match[1]]);
    return res.status(200).send('ok');
  } catch (err) {
    console.error('❌ Compliance NOWPayments callback error:', err);
    return res.status(500).send('error');
  }
});

// POST /v1/compliance/enquiry — public form submission
router.post('/enquiry', async (req, res) => {
  try {
    const { companyName, contactName, email, telegram, businessType, chains, monthlyTxVolume, plan, message, source } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    const result = await pool.query(
      `INSERT INTO compliance_enquiries (company_name,contact_name,email,telegram,business_type,chains,monthly_tx_volume,plan,message,source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,created_at`,
      [companyName.trim(), contactName.trim(), email.trim().toLowerCase(), telegram?.trim()||null,
       businessType?.trim()||null, Array.isArray(chains)?chains:[], monthlyTxVolume?.trim()||null,
       plan?.trim()||'Business', message?.trim()||null, source||'compliance-page']
    );
    const enquiry = result.rows[0];

    await sendEnquiryEmail({
      type: 'Compliance',
      to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] New Compliance Enquiry — ${companyName} (${plan||'Business'} Plan)`,
      fields: { 'Company': companyName, 'Contact': contactName, 'Email': email, 'Telegram': telegram||'—',
        'Business Type': businessType||'—', 'Chains': Array.isArray(chains)&&chains.length?chains.join(', '):'—',
        'Monthly Volume': monthlyTxVolume||'—', 'Plan': plan||'Business', 'Message': message||'—',
        'Enquiry ID': `#${enquiry.id}`, 'Submitted': new Date(enquiry.created_at).toUTCString() },
    });

    await sendEnquiryEmail({
      type: 'Compliance Confirmation', to: email,
      subject: 'We received your DecaFlow Compliance request',
      fields: { 'Dear': contactName, 'Plan requested': plan||'Business',
        'Next step': 'A member of our compliance team will contact you within 24 hours with your API credentials and integration guide.',
        'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com' },
      isConfirmation: true,
    });

    return res.status(201).json({ success: true, message: 'Compliance enquiry received. We will contact you within 24 hours.', enquiryId: enquiry.id });
  } catch (err) {
    console.error('❌ Compliance enquiry error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit enquiry. Please try again or email us directly.' });
  }
});

// POST /v1/compliance/demo-score — public demo
router.post('/demo-score', async (req, res) => {
  try {
    const { address, chain } = req.body;
    if (!address || typeof address !== 'string') return res.status(400).json({ success: false, error: 'Wallet address is required.' });
    const data = await screenWallet({ address: address.trim(), chain: chain || 'ethereum', purpose: 'compliance-demo', allowDemo: true });
    return res.json({
      success: true,
      demo: true,
      notice: 'Public preview only. Authenticated Verify/Compliance API checks are the production compliance record.',
      data
    });
  } catch (err) {
    console.error('❌ Demo score error:', err);
    return res.status(500).json({ success: false, error: 'Demo score failed.' });
  }
});

// GET /v1/compliance/enquiries — admin only
router.get('/enquiries', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:read'))) return;
    const { status, limit=50, offset=0 } = req.query;
    const params = []; let where = '';
    if (status) { params.push(status); where = `WHERE status=$${params.length}`; }
    params.push(Number(limit), Number(offset));
    const result = await pool.query(
      `SELECT id,company_name,contact_name,email,business_type,chains,plan,status,created_at FROM compliance_enquiries ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params);
    const count = await pool.query(`SELECT COUNT(*) FROM compliance_enquiries ${where}`, status?[status]:[]);
    return res.json({ success: true, total: Number(count.rows[0].count), data: result.rows });
  } catch (err) {
    console.error('❌ List compliance enquiries error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch enquiries.' });
  }
});

// PATCH /v1/compliance/enquiries/:id — admin only
router.patch('/enquiries/:id', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:read'))) return;
    const { status, notes } = req.body;
    const result = await pool.query(
      `UPDATE compliance_enquiries SET status=COALESCE($1,status),notes=COALESCE($2,notes),updated_at=NOW() WHERE id=$3 RETURNING *`,
      [status||null, notes||null, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Update compliance enquiry error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update enquiry.' });
  }
});

export default router;
