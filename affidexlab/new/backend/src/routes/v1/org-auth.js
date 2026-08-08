import express from 'express';
import pool from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';
import { createToken, hashSecret, upsertOrgUser } from '../../services/orgAuth.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

router.post('/magic-link/request', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'Valid email is required.' });
    const normalizedEmail = email.trim().toLowerCase();
    const userCheck = await pool.query(
      `SELECT u.id FROM org_users u JOIN org_memberships m ON m.user_id = u.id WHERE u.email = $1 AND u.status = 'active' AND m.status = 'active' LIMIT 1`,
      [normalizedEmail]
    );
    if (!userCheck.rows.length) return res.status(404).json({ success: false, error: 'No active organization account found for this email.' });

    const token = createToken('df_login');
    await pool.query(
      `INSERT INTO org_login_tokens (email, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [normalizedEmail, hashSecret(token)]
    );
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.decaflow.xyz';
    await sendEnquiryEmail({
      type: 'Org Login',
      to: normalizedEmail,
      subject: 'Your DecaFlow login link',
      fields: {
        Login: `${frontendUrl}/login?token=${token}`,
        Expires: '15 minutes',
        Security: 'If you did not request this, ignore this email.'
      },
      isConfirmation: true
    });
    return res.json({ success: true, message: 'Login link sent if the account is active.' });
  } catch (err) {
    console.error('❌ Org magic link request error:', err);
    return res.status(500).json({ success: false, error: 'Could not send login link.' });
  }
});

router.post('/magic-link/verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ success: false, error: 'token is required.' });
    const { rows } = await pool.query(
      `UPDATE org_login_tokens SET consumed_at = NOW()
       WHERE token_hash = $1 AND consumed_at IS NULL AND expires_at > NOW()
       RETURNING email`,
      [hashSecret(token)]
    );
    if (!rows[0]) return res.status(401).json({ success: false, error: 'Invalid or expired login token.' });
    const user = await upsertOrgUser({ email: rows[0].email });
    await pool.query(`UPDATE org_users SET last_login_at = NOW() WHERE id = $1`, [user.id]);
    const sessionToken = createToken('df_session');
    await pool.query(
      `INSERT INTO org_sessions (user_id, token_hash, expires_at, ip, user_agent)
       VALUES ($1, $2, NOW() + INTERVAL '30 days', $3, $4)`,
      [user.id, hashSecret(sessionToken), req.ip || null, req.headers['user-agent'] || null]
    );
    return res.json({ success: true, sessionToken, expiresInDays: 30 });
  } catch (err) {
    console.error('❌ Org magic link verify error:', err);
    return res.status(500).json({ success: false, error: 'Could not verify login token.' });
  }
});

export default router;
