import express from 'express';
import { pool } from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

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
    const { address } = req.body;
    if (!address || typeof address !== 'string') return res.status(400).json({ success: false, error: 'Wallet address is required.' });
    const clean = address.replace('0x','').toLowerCase();
    const seed = (clean.charCodeAt(0)||65) + (clean.charCodeAt(1)||66);
    const score = seed%3===0?12:seed%3===1?67:91;
    const level = score<30?'LOW':score<70?'MEDIUM':'HIGH';
    const recommendation = score<30?'APPROVE':score<70?'REVIEW':'REJECT';
    const flags = score<30?['No sanctions matches found','No mixer activity detected','Clean transaction history']:
      score<70?['Interaction with flagged DEX router','Moderate anonymity pattern detected']:
      ['OFAC watchlist proximity detected','Mixer usage detected (Tornado Cash)','High-risk jurisdiction activity'];
    return res.json({ success: true, data: { address, riskScore: score, riskLevel: level, recommendation, flags,
      sanctionsMatch: score>85, mixerExposure: score>60?0.34:score>30?0.08:0,
      checkedAt: new Date().toISOString(), note: 'Demo output. Production API delivers live on-chain data.' } });
  } catch (err) {
    console.error('❌ Demo score error:', err);
    return res.status(500).json({ success: false, error: 'Demo score failed.' });
  }
});

// GET /v1/compliance/enquiries — admin only
router.get('/enquiries', async (req, res) => {
  try {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ success: false, error: 'Unauthorized.' });
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
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ success: false, error: 'Unauthorized.' });
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
