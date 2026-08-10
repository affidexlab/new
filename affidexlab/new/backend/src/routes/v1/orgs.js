import express from 'express';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { authenticateOrgSession, createOrgApiKey, slugify, upsertOrgUser, ORG_ROLES } from '../../services/orgAuth.js';
import { screenWallet } from '../../services/riskIntelligenceService.js';
import { checkInvestorEligibility, upsertIdentityAttestation } from '../../services/institutionalComplianceService.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const DEFAULT_CUSTOMER_API_KEY_TTL_DAYS = 90;
const defaultCustomerApiKeyExpiry = () => new Date(Date.now() + DEFAULT_CUSTOMER_API_KEY_TTL_DAYS * 24 * 60 * 60 * 1000);
const API_KEY_LIMITS_BY_PLAN = { growth: 2, starter: 2, business: 5, enterprise: null, 'founder test': 5, 'founder-test': 5 };
const VERIFY_MONTHLY_LIMITS_BY_PLAN = { developer: 1000, growth: 50000, business: 500000, enterprise: null, 'founder test': null, 'founder-test': null };

function apiKeyLimitForPlan(plan) {
  const normalized = String(plan || '').trim().toLowerCase();
  if (normalized.includes('enterprise')) return null;
  if (normalized.includes('business')) return 5;
  if (normalized.includes('growth') || normalized.includes('starter')) return 2;
  if (normalized.includes('founder')) return 5;
  return API_KEY_LIMITS_BY_PLAN[normalized] ?? 1;
}

function verifyMonthlyLimitForPlan(plan) {
  const normalized = String(plan || 'developer').trim().toLowerCase();
  if (normalized.includes('enterprise') || normalized.includes('founder')) return null;
  if (normalized.includes('business')) return VERIFY_MONTHLY_LIMITS_BY_PLAN.business;
  if (normalized.includes('growth')) return VERIFY_MONTHLY_LIMITS_BY_PLAN.growth;
  return VERIFY_MONTHLY_LIMITS_BY_PLAN.developer;
}

async function resolveVerifyUsage({ organizationId, emails, verifyRows = null }) {
  const rows = verifyRows || (await pool.query(
    `SELECT id, plan, status, api_key_issued, api_key, created_at FROM verify_enquiries WHERE email = ANY($1) ORDER BY created_at DESC LIMIT 3`,
    [emails]
  )).rows;
  const activeRows = rows.filter(r => ['active', 'converted', 'paid_queued', 'paid_ready_to_scope', 'paid_pending_key'].includes(r.status));
  const plan = activeRows[0]?.plan || rows[0]?.plan || 'Developer';
  const limit = verifyMonthlyLimitForPlan(plan);
  const verifyKeys = rows.filter(r => r.api_key_issued && r.api_key).map(r => r.api_key);
  const screeningKeys = [...verifyKeys, `org-session:${organizationId}`];
  const { rows: usageRows } = await pool.query(
    `SELECT COUNT(*)::int AS used
     FROM risk_screenings
     WHERE product = 'verify'
       AND created_at >= date_trunc('month', NOW())
       AND (organization_id = $1 OR api_key = ANY($2))`,
    [organizationId, screeningKeys]
  );
  const used = Number(usageRows[0]?.used || 0);
  return { plan, limit, used, remaining: limit === null ? null : Math.max(limit - used, 0), verifyKeys, screeningKeys };
}

async function resolveOrgApiKeyPolicy(principal) {
  const { rows: orgRows } = await pool.query(`SELECT plan, billing_email FROM organizations WHERE id = $1`, [principal.organization_id]);
  const emails = Array.from(new Set([principal.email, orgRows[0]?.billing_email].filter(Boolean)));
  const { rows: verifyRows } = await pool.query(
    `SELECT plan FROM verify_enquiries
     WHERE email = ANY($1) AND status IN ('active','converted','paid_queued','paid_ready_to_scope','paid_pending_key')
     ORDER BY created_at DESC LIMIT 1`,
    [emails]
  ).catch(() => ({ rows: [] }));
  const plan = verifyRows[0]?.plan || orgRows[0]?.plan || 'default';
  const limit = apiKeyLimitForPlan(plan);
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM org_api_keys
     WHERE organization_id = $1 AND active = true AND (expires_at IS NULL OR expires_at > NOW())`,
    [principal.organization_id]
  );
  return { plan, limit, activeKeyCount: Number(countRows[0]?.count || 0) };
}

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

    const [compliancePolicies, complianceCases, complianceEscalations] = await Promise.all([
      one(`SELECT id, name, auto_review_score, auto_reject_score, escalation_email, active, updated_at FROM compliance_policies WHERE organization_id = $1 ORDER BY active DESC, updated_at DESC LIMIT 10`, [principal.organization_id]),
      one(`SELECT id, wallet_address, chain, risk_score, risk_level, status, priority, assigned_to, escalation_state, decision, created_at FROM compliance_cases WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 20`, [principal.organization_id]),
      one(`SELECT id, case_id, escalated_to, reason, status, created_at FROM compliance_escalations WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 10`, [principal.organization_id]),
    ]);

    const verifyUsage = await resolveVerifyUsage({ organizationId: principal.organization_id, emails, verifyRows });
    const screeningKeys = verifyUsage.screeningKeys;
    const screenings = await one(
      `SELECT wallet_address, chain, risk_score, risk_level, recommendation, created_at
       FROM risk_screenings
       WHERE organization_id = $1 OR api_key = ANY($2)
       ORDER BY created_at DESC LIMIT 10`,
      [principal.organization_id, screeningKeys]
    );

    return res.json({
      success: true,
      isFounderTest,
      products: {
        verify: {
          access: hasAccess(verifyRows),
          records: verifyRows.map(({ api_key, ...r }) => ({ ...r, apiKeyIssued: r.api_key_issued })),
          recentScreenings: screenings,
          quota: { plan: verifyUsage.plan, used: verifyUsage.used, limit: verifyUsage.limit, remaining: verifyUsage.remaining },
        },
        shield: { access: hasAccess(shieldCustomers), records: shieldCustomers, contracts, recentAlerts: alerts, recentIncidents: incidents },
        agents: { access: hasAccess(agentsRows), records: agentsRows, rules, reviewQueue: queue },
        institutional: { access: hasAccess(instRows), records: instRows, attestations, investorChecks: checks },
        compliance: { access: hasAccess(complianceRows), records: complianceRows, policies: compliancePolicies, cases: complianceCases, escalations: complianceEscalations, quota: verifyUsage },
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
    const { rows: orgRows } = await pool.query(`SELECT billing_email FROM organizations WHERE id = $1`, [principal.organization_id]);
    const emails = Array.from(new Set([principal.email, orgRows[0]?.billing_email].filter(Boolean)));
    const quota = await resolveVerifyUsage({ organizationId: principal.organization_id, emails });
    if (quota.limit !== null && quota.used >= quota.limit) {
      return res.status(402).json({
        success: false,
        error: `Monthly Verify quota exceeded for ${quota.plan}. Limit: ${quota.limit.toLocaleString()} checks/month.`,
        quota: { plan: quota.plan, used: quota.used, limit: quota.limit, remaining: 0 },
      });
    }
    const data = await screenWallet({ address: String(address).trim(), chain, customerId: `org:${principal.organization_id}`, purpose: 'dashboard-screen' });
    await pool.query(
      `INSERT INTO risk_screenings (product, api_key, organization_id, wallet_address, chain, provider, risk_score, risk_level, recommendation, sanctions_match, mixer_exposure, darknet_exposure, report_id, raw_response)
       VALUES ('verify', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [`org-session:${principal.organization_id}`, principal.organization_id, data.address, data.chain, data.provider, data.riskScore, data.riskLevel, data.recommendation, data.sanctionsMatch, data.mixerExposure, data.darknetExposure, data.reportId, data.raw || data]
    ).catch(() => {});
    return res.json({ success: true, data, quota: { plan: quota.plan, used: quota.used + 1, limit: quota.limit, remaining: quota.limit === null ? null : Math.max(quota.limit - quota.used - 1, 0) } });
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

router.get('/me/compliance/policies', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst', 'viewer']);
    if (!principal) return;
    const { rows } = await pool.query(
      `SELECT id, name, auto_review_score, auto_reject_score, escalation_email, regulator_export_format, active, created_by, created_at, updated_at
       FROM compliance_policies WHERE organization_id = $1 ORDER BY active DESC, updated_at DESC`,
      [principal.organization_id]
    );
    return res.json({ success: true, policies: rows });
  } catch (err) {
    console.error('❌ Compliance policies list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch compliance policies.' });
  }
});

router.post('/me/compliance/policies', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst']);
    if (!principal) return;
    const { name, autoReviewScore = 70, autoRejectScore = 90, escalationEmail = null, regulatorExportFormat = 'csv' } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'Policy name is required.' });
    const { rows } = await pool.query(
      `INSERT INTO compliance_policies (organization_id, name, auto_review_score, auto_reject_score, escalation_email, regulator_export_format, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [principal.organization_id, name.trim(), Number(autoReviewScore), Number(autoRejectScore), escalationEmail || null, regulatorExportFormat || 'csv', principal.email]
    );
    return res.status(201).json({ success: true, policy: rows[0] });
  } catch (err) {
    console.error('❌ Compliance policy create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create compliance policy.' });
  }
});

router.get('/me/compliance/cases', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst', 'viewer']);
    if (!principal) return;
    const { status = null, assignedTo = null } = req.query;
    const params = [principal.organization_id];
    const where = ['organization_id = $1'];
    if (status) { params.push(status); where.push(`status = $${params.length}`); }
    if (assignedTo) { params.push(assignedTo); where.push(`assigned_to = $${params.length}`); }
    const { rows } = await pool.query(
      `SELECT id, wallet_address, chain, risk_score, risk_level, status, priority, assigned_to, escalation_state, decision, notes, source, created_by, decided_by, decided_at, created_at, updated_at
       FROM compliance_cases WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT 100`,
      params
    );
    return res.json({ success: true, cases: rows });
  } catch (err) {
    console.error('❌ Compliance cases list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch compliance cases.' });
  }
});

router.post('/me/compliance/cases', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst']);
    if (!principal) return;
    const { walletAddress, chain = 'ethereum', assignedTo = null, priority = 'normal', notes = null } = req.body || {};
    if (!walletAddress || String(walletAddress).trim().length < 4) return res.status(400).json({ success: false, error: 'walletAddress is required.' });
    const risk = await screenWallet({ address: String(walletAddress).trim(), chain, customerId: `org:${principal.organization_id}`, purpose: 'compliance-case' });
    const { rows } = await pool.query(
      `INSERT INTO compliance_cases (organization_id, wallet_address, chain, risk_score, risk_level, status, priority, assigned_to, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, 'open', $6, $7, $8, $9) RETURNING *`,
      [principal.organization_id, risk.address, risk.chain, risk.riskScore, risk.riskLevel, priority, assignedTo, notes, principal.email]
    );
    return res.status(201).json({ success: true, case: rows[0], risk });
  } catch (err) {
    console.error('❌ Compliance case create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create compliance case.' });
  }
});

router.patch('/me/compliance/cases/:caseId', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst']);
    if (!principal) return;
    const { status, priority, assignedTo, decision, notes } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE compliance_cases
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           assigned_to = COALESCE($3, assigned_to),
           decision = COALESCE($4, decision),
           notes = COALESCE($5, notes),
           decided_by = CASE WHEN $4 IS NULL THEN decided_by ELSE $6 END,
           decided_at = CASE WHEN $4 IS NULL THEN decided_at ELSE NOW() END,
           updated_at = NOW()
       WHERE id = $7 AND organization_id = $8
       RETURNING *`,
      [status || null, priority || null, assignedTo || null, decision || null, notes || null, principal.email, req.params.caseId, principal.organization_id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Compliance case not found.' });
    return res.json({ success: true, case: rows[0] });
  } catch (err) {
    console.error('❌ Compliance case update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update compliance case.' });
  }
});

router.post('/me/compliance/cases/:caseId/escalate', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst']);
    if (!principal) return;
    const { escalatedTo = null, reason = 'Manual escalation from customer dashboard' } = req.body || {};
    const updated = await pool.query(
      `UPDATE compliance_cases SET escalation_state = 'escalated', status = 'escalated', updated_at = NOW()
       WHERE id = $1 AND organization_id = $2 RETURNING id`,
      [req.params.caseId, principal.organization_id]
    );
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Compliance case not found.' });
    const { rows } = await pool.query(
      `INSERT INTO compliance_escalations (case_id, organization_id, escalated_to, reason, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.caseId, principal.organization_id, escalatedTo, reason, principal.email]
    );
    return res.status(201).json({ success: true, escalation: rows[0] });
  } catch (err) {
    console.error('❌ Compliance escalation error:', err);
    return res.status(500).json({ success: false, error: 'Could not escalate compliance case.' });
  }
});

router.get('/me/compliance/export', async (req, res) => {
  try {
    const principal = await authenticateOrgSession(req, res, ['owner', 'admin', 'analyst', 'viewer']);
    if (!principal) return;
    const { rows } = await pool.query(
      `SELECT id, wallet_address, chain, risk_score, risk_level, status, priority, assigned_to, escalation_state, decision, created_by, decided_by, created_at, updated_at
       FROM compliance_cases WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1000`,
      [principal.organization_id]
    );
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['id','wallet_address','chain','risk_score','risk_level','status','priority','assigned_to','escalation_state','decision','created_by','decided_by','created_at','updated_at'];
    const csv = [header.join(','), ...rows.map(row => header.map(key => escape(row[key])).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="decaflow-compliance-cases.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('❌ Compliance export error:', err);
    return res.status(500).json({ success: false, error: 'Could not export compliance cases.' });
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
    const keyPolicy = await resolveOrgApiKeyPolicy(principal);
    const { rows } = await pool.query(
      `SELECT id, organization_id, name, scopes, active, expires_at, last_used_at, created_at, updated_at
       FROM org_api_keys WHERE organization_id = $1 ORDER BY created_at DESC`,
      [principal.organization_id]
    );
    return res.json({ success: true, keys: rows, keyPolicy });
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
    const keyPolicy = await resolveOrgApiKeyPolicy(principal);
    if (keyPolicy.limit !== null && keyPolicy.activeKeyCount >= keyPolicy.limit) {
      return res.status(403).json({
        success: false,
        error: `Your ${keyPolicy.plan} plan allows ${keyPolicy.limit} active API key${keyPolicy.limit === 1 ? '' : 's'}. Revoke an old key before creating another one.`,
        keyPolicy,
      });
    }
    const normalizedScopes = Array.isArray(scopes) ? scopes.map(String).filter(Boolean) : String(scopes).split(',').map(s => s.trim()).filter(Boolean);
    const effectiveExpiresAt = expiresAt || defaultCustomerApiKeyExpiry();
    const result = await createOrgApiKey({ organizationId: principal.organization_id, name: name.trim(), scopes: normalizedScopes, expiresAt: effectiveExpiresAt });
    return res.status(201).json({ success: true, ...result, expiresAt: result.record.expires_at, warning: 'Store apiKey now. It is not stored in plaintext and cannot be shown again.' });
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
