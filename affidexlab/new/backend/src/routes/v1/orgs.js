import express from 'express';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { authenticateOrgSession, createOrgApiKey, slugify, upsertOrgUser, ORG_ROLES } from '../../services/orgAuth.js';
import { screenWallet } from '../../services/riskIntelligenceService.js';
import { checkInvestorEligibility, upsertIdentityAttestation } from '../../services/institutionalComplianceService.js';

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

// GET /v1/orgs/me/dashboard — per-product customer dashboard data.
// Founder test orgs are comped accounts, but product access still follows the
// customer records created for the selected preview products.
router.get('/me/dashboard', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res);
    if (!principal) return;
    const email = principal.email;
    const { rows: orgRows } = await pool.query(`SELECT plan, billing_email FROM organizations WHERE id = $1`, [principal.organization_id]);
    const isFounderTest = orgRows[0]?.plan === 'founder-test';
    const emails = Array.from(new Set([email, orgRows[0]?.billing_email].filter(Boolean)));

    const one = async (query, params) => { try { const { rows } = await pool.query(query, params); return rows; } catch { return []; } };

    const [verifyRows, shieldCustomers, agentsRows, instRows, complianceRows, auditRows] = await Promise.all([
      one(`SELECT id, plan, status, api_key_issued, api_key, created_at FROM verify_enquiries WHERE email = ANY($1) ORDER BY created_at DESC LIMIT 3`, [emails]),
      one(`SELECT id, plan, status, created_at FROM shield_customers WHERE email = ANY($1) ORDER BY created_at DESC LIMIT 3`, [emails]),
      one(`SELECT id, plan, status, created_at FROM agents_customers WHERE email = ANY($1) ORDER BY created_at DESC LIMIT 3`, [emails]),
      one(`SELECT id, plan, status, created_at FROM institutional_customers WHERE email = ANY($1) ORDER BY created_at DESC LIMIT 3`, [emails]),
      one(`SELECT id, plan, status, created_at FROM compliance_enquiries WHERE email = ANY($1) ORDER BY created_at DESC LIMIT 3`, [emails]),
      one(`SELECT id, audit_package AS plan, status, created_at FROM audit_enquiries WHERE email = ANY($1) ORDER BY created_at DESC LIMIT 3`, [emails]),
    ]);

    const activeStates = ['active', 'converted', 'paid_queued', 'paid_ready_to_scope', 'paid_pending_key'];
    const hasAccess = (rows) => rows.some(r => activeStates.includes(r.status));

    const shieldCustomerIds = shieldCustomers.map(c => c.id);
    const contracts = shieldCustomerIds.length
      ? await one(`SELECT chain, address, label, status FROM shield_contracts WHERE customer_id = ANY($1) LIMIT 20`, [shieldCustomerIds])
      : [];
    const contractAddresses = contracts.map(c => String(c.address || '').toLowerCase());
    let alerts = [];
    let incidents = [];
    if (contractAddresses.length) {
      alerts = await one(`SELECT chain, address, severity, alert_type, message, created_at FROM shield_alerts WHERE lower(address) = ANY($1) ORDER BY created_at DESC LIMIT 8`, [contractAddresses]);
      incidents = await one(
        `SELECT i.title, i.severity, i.status, i.created_at FROM shield_incidents i
         JOIN shield_alerts a ON a.id = i.alert_id
         WHERE lower(a.address) = ANY($1) ORDER BY i.created_at DESC LIMIT 6`,
        [contractAddresses]
      );
    }

    const [rules, queue] = await Promise.all([
      one(`SELECT id, name, operator, threshold, enabled, auto_decision FROM compliance_workflow_rules WHERE account_email = ANY($1) ORDER BY created_at DESC LIMIT 10`, [emails]),
      one(`SELECT id, wallet_address, risk_score, risk_level, status, created_at FROM compliance_review_queue WHERE account_email = ANY($1) ORDER BY created_at DESC LIMIT 10`, [emails]),
    ]);

    const [attestations, checks] = await Promise.all([
      one(`SELECT chain, wallet_address, kyc_status, jurisdiction_eligible, accredited_investor, created_at FROM institutional_identity_attestations WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 10`, [principal.organization_id]),
      one(`SELECT chain, wallet_address, decision, risk_score, created_at FROM institutional_investor_checks WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 10`, [principal.organization_id]),
    ]);

    const verifyKeys = verifyRows.filter(r => r.api_key_issued && r.api_key).map(r => r.api_key);
    const screeningKeys = [...verifyKeys, `org-session:${principal.organization_id}`];
    const screenings = await one(`SELECT wallet_address, chain, risk_score, risk_level, recommendation, created_at FROM risk_screenings WHERE api_key = ANY($1) ORDER BY created_at DESC LIMIT 10`, [screeningKeys]);

    return res.json({
      success: true,
      isFounderTest,
      products: {
        verify: { access: hasAccess(verifyRows), records: verifyRows.map(({ api_key, ...r }) => ({ ...r, apiKeyIssued: r.api_key_issued })), recentScreenings: screenings },
        shield: { access: hasAccess(shieldCustomers), records: shieldCustomers, contracts, recentAlerts: alerts, recentIncidents: incidents },
        agents: { access: hasAccess(agentsRows), records: agentsRows, rules, reviewQueue: queue },
        institutional: { access: hasAccess(instRows), records: instRows, attestations, investorChecks: checks },
        compliance: { access: hasAccess(complianceRows), records: complianceRows },
        audit: { access: hasAccess(auditRows), records: auditRows },
      },
    });
  } catch (err) {
    console.error('❌ Org dashboard error:', err);
    return res.status(500).json({ success: false, error: 'Could not load product dashboards.' });
  }
});

// POST /v1/orgs/me/verify/screen — run a live wallet screening from the dashboard.
router.post('/me/verify/screen', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst']);
    if (!principal) return;
    const { address, chain = 'ethereum' } = req.body || {};
    if (!address || String(address).trim().length < 4) return res.status(400).json({ success: false, error: 'Wallet address is required.' });
    const data = await screenWallet({ address: String(address).trim(), chain, customerId: `org:${principal.organization_id}`, purpose: 'dashboard-screen' });
    await pool.query(
      `INSERT INTO risk_screenings (product, api_key, wallet_address, chain, provider, risk_score, risk_level, recommendation, sanctions_match, mixer_exposure, darknet_exposure, report_id, raw_response)
       VALUES ('verify', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [`org-session:${principal.organization_id}`, data.address, data.chain, data.provider, data.riskScore, data.riskLevel, data.recommendation, data.sanctionsMatch, data.mixerExposure, data.darknetExposure, data.reportId, data.raw || data]
    ).catch(() => {});
    return res.json({ success: true, data });
  } catch (err) {
    console.error('❌ Dashboard screening error:', err);
    return res.status(503).json({ success: false, error: err.message || 'Screening failed.' });
  }
});

// POST /v1/orgs/me/shield/contracts — add a contract to Shield monitoring.
router.post('/me/shield/contracts', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin']);
    if (!principal) return;
    const { chain, address, label = null } = req.body || {};
    if (!chain?.trim() || !address?.trim()) return res.status(400).json({ success: false, error: 'chain and address are required.' });

    const existing = await pool.query(
      `SELECT id FROM shield_customers WHERE email = $1 AND status = 'active' ORDER BY created_at ASC LIMIT 1`,
      [principal.email]
    );
    let customerId = existing.rows[0]?.id;
    if (!customerId) {
      const { rows: orgRows } = await pool.query(`SELECT plan, name FROM organizations WHERE id = $1`, [principal.organization_id]);
      if (orgRows[0]?.plan !== 'founder-test') return res.status(403).json({ success: false, error: 'No active Shield subscription on this account.' });
      const created = await pool.query(
        `INSERT INTO shield_customers (company_name, contact_name, email, plan, status, payment_gateway)
         VALUES ($1, $2, $3, 'Founder Test', 'active', 'comped') RETURNING id`,
        [orgRows[0].name, principal.name || principal.email, principal.email]
      );
      customerId = created.rows[0].id;
    }
    const { rows } = await pool.query(
      `INSERT INTO shield_contracts (customer_id, chain, address, label, status)
       VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
      [customerId, String(chain).toLowerCase().trim(), String(address).toLowerCase().trim(), label]
    );
    return res.status(201).json({ success: true, contract: rows[0] });
  } catch (err) {
    console.error('❌ Dashboard shield contract error:', err);
    return res.status(500).json({ success: false, error: 'Could not add contract.' });
  }
});

// POST /v1/orgs/me/institutional/attestations — record a ZK-KYC attestation from the dashboard.
router.post('/me/institutional/attestations', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst']);
    if (!principal) return;
    const { chain = 'ethereum', walletAddress, jurisdictionEligible = true, accreditedInvestor = false, jurisdiction = null } = req.body || {};
    if (!walletAddress || String(walletAddress).trim().length < 4) return res.status(400).json({ success: false, error: 'walletAddress is required.' });
    const attestation = await upsertIdentityAttestation({
      chain,
      walletAddress: String(walletAddress).trim(),
      organizationId: principal.organization_id,
      kycStatus: 'approved',
      jurisdictionEligible,
      accreditedInvestor,
      jurisdiction,
      evidence: { recordedVia: 'customer-dashboard', by: principal.email, at: new Date().toISOString() },
      attestedBy: principal.email,
    });
    return res.status(201).json({ success: true, attestation });
  } catch (err) {
    console.error('❌ Dashboard attestation error:', err);
    return res.status(500).json({ success: false, error: 'Could not record attestation.' });
  }
});

// POST /v1/orgs/me/institutional/check-investor — run an investor eligibility check from the dashboard.
router.post('/me/institutional/check-investor', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst']);
    if (!principal) return;
    const { chain = 'ethereum', walletAddress, requireAccreditation = true } = req.body || {};
    if (!walletAddress || String(walletAddress).trim().length < 4) return res.status(400).json({ success: false, error: 'walletAddress is required.' });
    const result = await checkInvestorEligibility({
      chain,
      walletAddress: String(walletAddress).trim(),
      organizationId: principal.organization_id,
      requireAccreditation: requireAccreditation !== false,
      requestedBy: principal.email,
    });
    return res.json({ success: true, decision: result.decision, reasons: result.reasons, risk: result.risk });
  } catch (err) {
    console.error('❌ Dashboard investor check error:', err);
    return res.status(500).json({ success: false, error: 'Could not run investor check.' });
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
