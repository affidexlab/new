import crypto from 'crypto';
import pool from '../db/connection.js';
import { safeCompare } from '../utils/security.js';

function hashKey(key) {
  return crypto.createHash('sha256').update(String(key || '')).digest('hex');
}

function extractKey(req) {
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  return bearer || req.headers['x-admin-api-key'] || req.headers['x-admin-key'] || '';
}

function hasScope(scopes, requiredScope) {
  if (!requiredScope) return true;
  if (!Array.isArray(scopes)) return false;
  return scopes.includes('*') || scopes.includes(requiredScope);
}

async function auditAdminRequest(req, principal, allowed, scope, reason = null) {
  try {
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_key_id, principal, scope, method, path, ip, allowed, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [principal?.id || null, principal?.name || 'legacy-admin-key', scope || null, req.method, req.originalUrl || req.url, req.ip || req.headers['x-forwarded-for'] || null, allowed, reason]
    );
  } catch (err) {
    console.warn('⚠️ Admin audit log write failed:', err.message);
  }
}

export async function authorizeAdmin(req, res, scope = null) {
  const key = extractKey(req);
  if (!key) {
    await auditAdminRequest(req, null, false, scope, 'missing_key');
    res.status(401).json({ success: false, error: 'Admin key required.' });
    return false;
  }

  if (process.env.ADMIN_KEY && safeCompare(key, process.env.ADMIN_KEY)) {
    await auditAdminRequest(req, { name: 'legacy-admin-key' }, true, scope);
    return true;
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, name, key_hash, scopes, active, expires_at
       FROM admin_api_keys
       WHERE key_hash = $1
       LIMIT 1`,
      [hashKey(key)]
    );
    const adminKey = rows[0];
    if (!adminKey || !adminKey.active) {
      await auditAdminRequest(req, null, false, scope, 'invalid_key');
      res.status(401).json({ success: false, error: 'Invalid admin key.' });
      return false;
    }
    if (adminKey.expires_at && new Date(adminKey.expires_at) <= new Date()) {
      await auditAdminRequest(req, adminKey, false, scope, 'expired_key');
      res.status(401).json({ success: false, error: 'Admin key expired.' });
      return false;
    }
    if (!hasScope(adminKey.scopes, scope)) {
      await auditAdminRequest(req, adminKey, false, scope, 'missing_scope');
      res.status(403).json({ success: false, error: 'Admin key does not have the required scope.' });
      return false;
    }

    await pool.query(`UPDATE admin_api_keys SET last_used_at = NOW() WHERE id = $1`, [adminKey.id]);
    req.admin = { id: adminKey.id, name: adminKey.name, scopes: adminKey.scopes };
    await auditAdminRequest(req, adminKey, true, scope);
    return true;
  } catch (err) {
    console.error('❌ Admin auth error:', err);
    res.status(500).json({ success: false, error: 'Admin authentication failed.' });
    return false;
  }
}

export function createAdminKeyMaterial() {
  const key = `df_admin_${crypto.randomBytes(32).toString('hex')}`;
  return { key, keyHash: hashKey(key) };
}
