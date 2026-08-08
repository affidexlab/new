import express from 'express';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { createOrgApiKey, slugify, upsertOrgUser, ORG_ROLES } from '../../services/orgAuth.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

router.post('/', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { name, slug, ownerEmail, ownerName = null, plan = 'beta', billingEmail = null } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'name is required.' });
    if (!ownerEmail || !isValidEmail(ownerEmail)) return res.status(400).json({ success: false, error: 'valid ownerEmail is required.' });
    const orgSlug = slug?.trim() || slugify(name);
    const { rows: orgRows } = await pool.query(
      `INSERT INTO organizations (name, slug, plan, billing_email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), orgSlug, plan, billingEmail || ownerEmail]
    );
    const owner = await upsertOrgUser({ email: ownerEmail, name: ownerName });
    await pool.query(
      `INSERT INTO org_memberships (organization_id, user_id, role, invited_by)
       VALUES ($1, $2, 'owner', $3)
       ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner', status = 'active', updated_at = NOW()`,
      [orgRows[0].id, owner.id, req.admin?.name || 'admin']
    );
    return res.status(201).json({ success: true, organization: orgRows[0], owner: { id: owner.id, email: owner.email, name: owner.name } });
  } catch (err) {
    console.error('❌ Org create error:', err);
    return res.status(500).json({ success: false, error: err.code === '23505' ? 'Organization slug already exists.' : 'Could not create organization.' });
  }
});

router.get('/', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { rows } = await pool.query(`SELECT * FROM organizations ORDER BY created_at DESC LIMIT 200`);
    return res.json({ success: true, organizations: rows });
  } catch (err) {
    console.error('❌ Org list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch organizations.' });
  }
});

router.post('/:id/members', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { email, name = null, role = 'viewer' } = req.body || {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'valid email is required.' });
    if (!ORG_ROLES.includes(role)) return res.status(400).json({ success: false, error: `role must be one of ${ORG_ROLES.join(', ')}.` });
    const user = await upsertOrgUser({ email, name });
    const { rows } = await pool.query(
      `INSERT INTO org_memberships (organization_id, user_id, role, invited_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role, status = 'active', updated_at = NOW()
       RETURNING *`,
      [req.params.id, user.id, role, req.admin?.name || 'admin']
    );
    return res.status(201).json({ success: true, member: rows[0], user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('❌ Org member upsert error:', err);
    return res.status(500).json({ success: false, error: 'Could not add organization member.' });
  }
});

router.get('/:id/members', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { rows } = await pool.query(
      `SELECT m.*, u.email, u.name FROM org_memberships m JOIN org_users u ON u.id = m.user_id WHERE m.organization_id = $1 ORDER BY m.created_at DESC`,
      [req.params.id]
    );
    return res.json({ success: true, members: rows });
  } catch (err) {
    console.error('❌ Org members list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch organization members.' });
  }
});

router.post('/:id/api-keys', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { name, scopes = ['verify:check'], expiresAt = null } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'name is required.' });
    const normalizedScopes = Array.isArray(scopes) ? scopes.map(String).filter(Boolean) : String(scopes).split(',').map(s => s.trim()).filter(Boolean);
    const result = await createOrgApiKey({ organizationId: req.params.id, name: name.trim(), scopes: normalizedScopes.length ? normalizedScopes : ['verify:check'], expiresAt });
    return res.status(201).json({ success: true, ...result, warning: 'Store apiKey now. It is not stored in plaintext and cannot be shown again.' });
  } catch (err) {
    console.error('❌ Org API key create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create organization API key.' });
  }
});

router.get('/:id/api-keys', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { rows } = await pool.query(
      `SELECT id, organization_id, name, scopes, active, expires_at, last_used_at, created_at, updated_at FROM org_api_keys WHERE organization_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    return res.json({ success: true, keys: rows });
  } catch (err) {
    console.error('❌ Org API keys list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch organization API keys.' });
  }
});

export default router;
