import pool from '../db/connection.js';
import { hashSecret } from './orgAuth.js';

function hasScope(scopes, requiredScope) {
  if (!requiredScope) return true;
  if (!Array.isArray(scopes)) return false;
  return scopes.includes('*') || scopes.includes(requiredScope);
}

export async function findOrgApiKey(apiKey, requiredScope = null) {
  if (!apiKey) return null;
  const { rows } = await pool.query(
    `SELECT k.id, k.organization_id, k.name, k.scopes, k.active, k.expires_at, o.name AS organization_name, o.status AS organization_status
     FROM org_api_keys k
     JOIN organizations o ON o.id = k.organization_id
     WHERE k.key_hash = $1
     LIMIT 1`,
    [hashSecret(apiKey)]
  );
  const key = rows[0];
  if (!key || !key.active || key.organization_status !== 'active') return null;
  if (key.expires_at && new Date(key.expires_at) <= new Date()) return null;
  if (!hasScope(key.scopes, requiredScope)) return null;
  await pool.query(`UPDATE org_api_keys SET last_used_at = NOW() WHERE id = $1`, [key.id]);
  return key;
}
