import express from 'express';
import pool from '../../db/connection.js';
import { authorizeAdmin, createAdminKeyMaterial } from '../../services/adminAuth.js';

const router = express.Router();

router.post('/keys', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:keys'))) return;
    const { name, scopes = ['*'], expiresAt = null } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'name is required.' });
    const normalizedScopes = Array.isArray(scopes) ? scopes.map(String).filter(Boolean) : String(scopes).split(',').map(s => s.trim()).filter(Boolean);
    const { key, keyHash } = createAdminKeyMaterial();
    const { rows } = await pool.query(
      `INSERT INTO admin_api_keys (name, key_hash, scopes, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, scopes, active, expires_at, created_at`,
      [name.trim(), keyHash, JSON.stringify(normalizedScopes.length ? normalizedScopes : ['*']), expiresAt]
    );
    return res.status(201).json({ success: true, adminKey: key, record: rows[0], warning: 'Store adminKey now. It is not stored in plaintext and cannot be shown again.' });
  } catch (err) {
    console.error('❌ Admin key create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create admin key.' });
  }
});

router.get('/keys', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:keys'))) return;
    const { rows } = await pool.query(
      `SELECT id, name, scopes, active, expires_at, last_used_at, created_at, updated_at
       FROM admin_api_keys ORDER BY created_at DESC LIMIT 100`
    );
    return res.json({ success: true, keys: rows });
  } catch (err) {
    console.error('❌ Admin keys list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch admin keys.' });
  }
});

router.patch('/keys/:id', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:keys'))) return;
    const { active, name, scopes, expiresAt } = req.body || {};
    const normalizedScopes = Array.isArray(scopes) ? scopes.map(String).filter(Boolean) : scopes ? String(scopes).split(',').map(s => s.trim()).filter(Boolean) : null;
    const { rows } = await pool.query(
      `UPDATE admin_api_keys
       SET active = COALESCE($1, active),
           name = COALESCE($2, name),
           scopes = COALESCE($3, scopes),
           expires_at = COALESCE($4, expires_at),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, scopes, active, expires_at, last_used_at, created_at, updated_at`,
      [typeof active === 'boolean' ? active : null, name?.trim() || null, normalizedScopes ? JSON.stringify(normalizedScopes) : null, expiresAt || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Admin key not found.' });
    return res.json({ success: true, key: rows[0] });
  } catch (err) {
    console.error('❌ Admin key update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update admin key.' });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:audit'))) return;
    const { limit = 100, offset = 0 } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), Number(offset)]
    );
    return res.json({ success: true, logs: rows });
  } catch (err) {
    console.error('❌ Admin audit logs error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch admin audit logs.' });
  }
});

export default router;
