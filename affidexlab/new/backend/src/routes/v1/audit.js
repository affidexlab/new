import express from 'express';
import pool from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// POST /v1/audit/enquiry — public form submission
router.post('/enquiry', async (req, res) => {
  try {
    const { projectName, contactName, email, telegram, projectUrl, githubRepo, blockchain, language, linesOfCode, auditPackage, timeline, description, source } = req.body;
    if (!projectName?.trim()) return res.status(400).json({ success: false, error: 'Project name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!githubRepo?.trim()) return res.status(400).json({ success: false, error: 'GitHub repository link is required.' });
    if (!description || description.trim().length < 20) return res.status(400).json({ success: false, error: 'Please provide a brief project description (at least 20 characters).' });

    const result = await pool.query(
      `INSERT INTO audit_enquiries (project_name,contact_name,email,telegram,project_url,github_repo,blockchain,language,lines_of_code,audit_package,timeline,description,source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id,created_at`,
      [projectName.trim(), contactName.trim(), email.trim().toLowerCase(), telegram?.trim()||null,
       projectUrl?.trim()||null, githubRepo.trim(), blockchain?.trim()||null, language?.trim()||null,
       linesOfCode?.trim()||null, auditPackage?.trim()||'Protocol Audit', timeline?.trim()||null,
       description.trim(), source||'audit-page']
    );
    const enquiry = result.rows[0];

    await sendEnquiryEmail({
      type: 'Security Audit',
      to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] New Audit Request — ${projectName} (${auditPackage||'Protocol Audit'})`,
      fields: { 'Project': projectName, 'Contact': contactName, 'Email': email, 'Telegram': telegram||'—',
        'GitHub Repo': githubRepo, 'Project URL': projectUrl||'—', 'Blockchain': blockchain||'—',
        'Language': language||'—', 'Lines of Code': linesOfCode||'—', 'Package': auditPackage||'Protocol Audit',
        'Timeline': timeline||'—', 'Description': description,
        'Enquiry ID': `#${enquiry.id}`, 'Submitted': new Date(enquiry.created_at).toUTCString() },
    });

    await sendEnquiryEmail({
      type: 'Audit Confirmation', to: email,
      subject: `Your DecaFlow Security Audit request for ${projectName} — received`,
      fields: { 'Dear': contactName, 'Project': projectName, 'Package': auditPackage||'Protocol Audit',
        'Next steps': 'Our team will review your repository within 24 hours and send you a scoping confirmation, kickoff call link, and invoice for the 50% upfront payment.',
        'NDA': 'If you need an NDA before granting repo access, reply to this email and we will send one immediately.',
        'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com' },
      isConfirmation: true,
    });

    return res.status(201).json({ success: true, message: 'Audit request received. We will review your repository and contact you within 24 hours.', enquiryId: enquiry.id });
  } catch (err) {
    console.error('❌ Audit enquiry error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit audit request. Please try again or email us directly.' });
  }
});

// GET /v1/audit/enquiries — admin only
router.get('/enquiries', async (req, res) => {
  try {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const { status, limit=50, offset=0 } = req.query;
    const params = []; let where = '';
    if (status) { params.push(status); where = `WHERE status=$${params.length}`; }
    params.push(Number(limit), Number(offset));
    const result = await pool.query(
      `SELECT id,project_name,contact_name,email,github_repo,blockchain,audit_package,status,created_at FROM audit_enquiries ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params);
    const count = await pool.query(`SELECT COUNT(*) FROM audit_enquiries ${where}`, status?[status]:[]);
    return res.json({ success: true, total: Number(count.rows[0].count), data: result.rows });
  } catch (err) {
    console.error('❌ List audit enquiries error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch enquiries.' });
  }
});

// PATCH /v1/audit/enquiries/:id — admin only
router.patch('/enquiries/:id', async (req, res) => {
  try {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const { status, notes } = req.body;
    const result = await pool.query(
      `UPDATE audit_enquiries SET status=COALESCE($1,status),notes=COALESCE($2,notes),updated_at=NOW() WHERE id=$3 RETURNING *`,
      [status||null, notes||null, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Update audit enquiry error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update enquiry.' });
  }
});

export default router;
