import crypto from 'crypto';
import pool from '../db/connection.js';

export const ORG_ROLES = ['owner', 'admin', 'analyst', 'viewer', 'billing'];

export function hashSecret(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

export function createToken(prefix) {
  return `${prefix}_${crypto.randomBytes(32).toString('hex')}`;
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || `org-${crypto.randomBytes(4).toString('hex')}`;
}

export async function upsertOrgUser({ email, name = null }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const { rows } = await pool.query(
    `INSERT INTO org_users (email, name)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, org_users.name), updated_at = NOW()
     RETURNING *`,
    [normalizedEmail, name]
  );
  return rows[0];
}

export async function createOrgApiKey({ organizationId, name, scopes = ['verify:check'], expiresAt = null }) {
  const apiKey = createToken('df_org');
  const { rows } = await pool.query(
    `INSERT INTO org_api_keys (organization_id, name, key_hash, scopes, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, organization_id, name, scopes, active, expires_at, created_at`,
    [organizationId, name, hashSecret(apiKey), JSON.stringify(scopes), expiresAt]
  );
  return { apiKey, record: rows[0] };
}

export async function authenticateOrgSession(req, res, allowedRoles = []) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
  if (!token) {
    res.status(401).json({ success: false, error: 'Session token required.' });
    return null;
  }

  const { rows } = await pool.query(
    `SELECT s.id AS session_id, u.id AS user_id, u.email, u.name, m.organization_id, m.role, o.name AS organization_name
     FROM org_sessions s
     JOIN org_users u ON u.id = s.user_id
     JOIN org_memberships m ON m.user_id = u.id AND m.status = 'active'
     JOIN organizations o ON o.id = m.organization_id AND o.status = 'active'
     WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW()`,
    [hashSecret(token)]
  );

  const principal = rows[0];
  if (!principal) {
    res.status(401).json({ success: false, error: 'Invalid or expired session.' });
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(principal.role)) {
    res.status(403).json({ success: false, error: 'Insufficient role.' });
    return null;
  }
  req.orgPrincipal = principal;
  return principal;
}
