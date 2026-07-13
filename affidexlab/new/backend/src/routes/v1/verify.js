import express from 'express';
import crypto from 'crypto';
import pool from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const generateApiKey = () => `df_verify_${crypto.randomBytes(24).toString('hex')}`;
const planChecks = { Developer: 1000, Growth: 50000, Business: 500000, Enterprise: null };

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
    const clean = address.replace('0x','').toLowerCase();
    const seed = (clean.charCodeAt(0)||65) + (clean.charCodeAt(1)||66);
    const score = seed%3===0?8:seed%3===1?54:89;
    const level = score<25?'LOW':score<60?'MEDIUM':score<85?'HIGH':'CRITICAL';
    const recommendation = score<25?'APPROVE':score<60?'REVIEW':'REJECT';
    const flags = score<25?[]:score<60?['Interaction with flagged exchange','Moderate transaction velocity']:
      score<85?['Mixer exposure (Tornado Cash)','High-risk jurisdiction activity']:
      ['OFAC SDN list proximity','Mixer exposure detected','Darknet market interaction'];
    return res.json({ success: true, data: {
      address: address.trim(), chain: chain||'ethereum', riskScore: score, riskLevel: level,
      sanctionsMatch: score>85, sanctionsDetails: score>85?{ programme:'OFAC SDN', entity:'Demo Entity', list:'US-OFAC' }:null,
      mixerExposure: score>60?0.34:score>30?0.08:0, darknetExposure: score>75?0.12:0,
      jurisdictionRisk: score>60?'HIGH':score>30?'MEDIUM':'LOW',
      hopsAnalysed: 5, recommendation, flags,
      reportId: `rpt_${Math.random().toString(36).substr(2,9)}`,
      checkedAt: new Date().toISOString(),
      note: 'Demo output only. Production API delivers live on-chain data.' } });
  } catch (err) {
    console.error('❌ Verify demo error:', err);
    return res.status(500).json({ success: false, error: 'Demo check failed.' });
  }
});

// GET /v1/verify/enquiries — admin only
router.get('/enquiries', async (req, res) => {
  try {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ success: false, error: 'Unauthorized.' });
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
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ success: false, error: 'Unauthorized.' });
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
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ success: false, error: 'Unauthorized.' });
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
