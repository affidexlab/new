import express from 'express';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { authenticateOrgSession, createOrgApiKey, slugify, upsertOrgUser, ORG_ROLES } from '../../services/orgAuth.js';

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

router.get('/me', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res);
    if (!principal) return;
    return res.json({ success: true, account: principal });
  } catch (err) {
    console.error('❌ Org self account error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch organization account.' });
  }
});

router.get('/me/members', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst', 'viewer', 'billing']);
    if (!principal) return;
    const { rows } = await pool.query(
      `SELECT m.id, m.organization_id, m.role, m.status, m.created_at, m.updated_at, u.email, u.name, u.last_login_at
       FROM org_memberships m
       JOIN org_users u ON u.id = m.user_id
       WHERE m.organization_id = $1
       ORDER BY m.created_at DESC`,
      [principal.organization_id]
    );
    return res.json({ success: true, members: rows });
  } catch (err) {
    console.error('❌ Org self members error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch members.' });
  }
});

router.post('/me/members', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin']);
    if (!principal) return;
    const { email, name = null, role = 'viewer' } = req.body || {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'valid email is required.' });
    if (!ORG_ROLES.includes(role) || role === 'owner') return res.status(400).json({ success: false, error: 'role must be admin, analyst, viewer, or billing.' });
    const user = await upsertOrgUser({ email, name });
    const { rows } = await pool.query(
      `INSERT INTO org_memberships (organization_id, user_id, role, invited_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role, status = 'active', updated_at = NOW()
       RETURNING *`,
      [principal.organization_id, user.id, role, principal.email]
    );
    return res.status(201).json({ success: true, member: rows[0], user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('❌ Org self member upsert error:', err);
    return res.status(500).json({ success: false, error: 'Could not add member.' });
  }
});

router.patch('/me/members/:membershipId', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin']);
    if (!principal) return;
    const { role, status } = req.body || {};
    if (role && (!ORG_ROLES.includes(role) || role === 'owner')) return res.status(400).json({ success: false, error: 'role must be admin, analyst, viewer, or billing.' });
    if (status && !['active', 'disabled'].includes(status)) return res.status(400).json({ success: false, error: 'status must be active or disabled.' });
    const { rows } = await pool.query(
      `UPDATE org_memberships
       SET role = COALESCE($1, role), status = COALESCE($2, status), updated_at = NOW()
       WHERE id = $3 AND organization_id = $4 AND role != 'owner'
       RETURNING *`,
      [role || null, status || null, req.params.membershipId, principal.organization_id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Member not found or protected.' });
    return res.json({ success: true, member: rows[0] });
  } catch (err) {
    console.error('❌ Org self member update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update member.' });
  }
});

router.get('/me/api-keys', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst']);
    if (!principal) return;
    const { rows } = await pool.query(
      `SELECT id, organization_id, name, scopes, active, expires_at, last_used_at, created_at, updated_at
       FROM org_api_keys WHERE organization_id = $1 ORDER BY created_at DESC`,
      [principal.organization_id]
    );
    return res.json({ success: true, keys: rows });
  } catch (err) {
    console.error('❌ Org self API keys error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch API keys.' });
  }
});

router.post('/me/api-keys', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin']);
    if (!principal) return;
    const { name, scopes = ['verify:check', 'agents:evaluate'], expiresAt = null } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'name is required.' });
    const normalizedScopes = Array.isArray(scopes) ? scopes.map(String).filter(Boolean) : String(scopes).split(',').map(s => s.trim()).filter(Boolean);
    const result = await createOrgApiKey({ organizationId: principal.organization_id, name: name.trim(), scopes: normalizedScopes, expiresAt });
    return res.status(201).json({ success: true, ...result, warning: 'Store apiKey now. It is not stored in plaintext and cannot be shown again.' });
  } catch (err) {
    console.error('❌ Org self API key create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create API key.' });
  }
});

router.patch('/me/api-keys/:keyId', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin']);
    if (!principal) return;
    const { active } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE org_api_keys SET active = $1, updated_at = NOW()
       WHERE id = $2 AND organization_id = $3
       RETURNING id, organization_id, name, scopes, active, expires_at, last_used_at, created_at, updated_at`,
      [!!active, req.params.keyId, principal.organization_id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'API key not found.' });
    return res.json({ success: true, key: rows[0] });
  } catch (err) {
    console.error('❌ Org self API key update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update API key.' });
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
