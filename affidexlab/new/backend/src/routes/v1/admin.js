import express from 'express';
import pool from '../../db/connection.js';
import { authorizeAdmin, createAdminKeyMaterial } from '../../services/adminAuth.js';

const router = express.Router();


router.get('/overview', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:read'))) return;
    const safeCount = async (table, where = 'TRUE') => {
      try {
        const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table} WHERE ${where}`);
        return rows[0]?.count || 0;
      } catch {
        return 0;
      }
    };
    const [
      organizations,
      orgUsers,
      orgApiKeys,
      riskLabels,
      riskEdges,
      riskScreenings,
      shieldAlertsOpen,
      shieldIncidentsOpen,
      adminKeys,
      verifyEnquiries,
      complianceEnquiries,
      auditEnquiries
    ] = await Promise.all([
      safeCount('organizations'),
      safeCount('org_users'),
      safeCount('org_api_keys', 'active = true'),
      safeCount('risk_address_labels', 'active = true'),
      safeCount('risk_graph_edges'),
      safeCount('risk_screenings'),
      safeCount('shield_alerts', "status = 'open'"),
      safeCount('shield_incidents', "status != 'closed'"),
      safeCount('admin_api_keys', 'active = true'),
      safeCount('verify_enquiries'),
      safeCount('compliance_enquiries'),
      safeCount('audit_enquiries')
    ]);

    const recent = async (query, params = []) => {
      try {
        const { rows } = await pool.query(query, params);
        return rows;
      } catch {
        return [];
      }
    };

    const [recentAlerts, recentIncidents, recentAuditLogs, recentScreenings, recentOrgs] = await Promise.all([
      recent(`SELECT id, chain, address, label, severity, alert_type, message, status, created_at FROM shield_alerts ORDER BY created_at DESC LIMIT 10`),
      recent(`SELECT id, title, severity, status, assigned_to, created_at, updated_at FROM shield_incidents ORDER BY created_at DESC LIMIT 10`),
      recent(`SELECT id, principal, scope, method, path, allowed, reason, created_at FROM admin_audit_logs ORDER BY created_at DESC LIMIT 10`),
      recent(`SELECT id, product, wallet_address, chain, provider, risk_score, risk_level, recommendation, created_at FROM risk_screenings ORDER BY created_at DESC LIMIT 10`),
      recent(`SELECT id, name, slug, status, plan, billing_email, created_at FROM organizations ORDER BY created_at DESC LIMIT 10`)
    ]);

    return res.json({
      success: true,
      counts: {
        organizations,
        orgUsers,
        orgApiKeys,
        riskLabels,
        riskEdges,
        riskScreenings,
        shieldAlertsOpen,
        shieldIncidentsOpen,
        adminKeys,
        verifyEnquiries,
        complianceEnquiries,
        auditEnquiries
      },
      recent: { alerts: recentAlerts, incidents: recentIncidents, auditLogs: recentAuditLogs, screenings: recentScreenings, organizations: recentOrgs },
      actions: {
        productionRiskIngestion: 'https://github.com/affidexlab/new/actions/workflows/production-risk-ingestion.yml',
        shieldMonitor: 'https://github.com/affidexlab/new/actions/workflows/shield-monitor.yml',
        createAdminKey: 'https://github.com/affidexlab/new/actions/workflows/create-admin-key.yml',
        createOrganization: 'https://github.com/affidexlab/new/actions/workflows/create-organization.yml'
      }
    });
  } catch (err) {
    console.error('❌ Admin overview error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch founder overview.' });
  }
});


router.get('/products', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'products:admin'))) return;
    const { rows } = await pool.query(
      `SELECT * FROM product_control_settings ORDER BY
       CASE priority WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
       product_name ASC`
    );
    return res.json({ success: true, products: rows });
  } catch (err) {
    console.error('❌ Product settings list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch product settings.' });
  }
});

router.patch('/products/:productKey', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'products:admin'))) return;
    const { publicStatus, acceptingCustomers, priority, owner, opsNotes, publicMessage } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE product_control_settings
       SET public_status = COALESCE($1, public_status),
           accepting_customers = COALESCE($2, accepting_customers),
           priority = COALESCE($3, priority),
           owner = COALESCE($4, owner),
           ops_notes = COALESCE($5, ops_notes),
           public_message = COALESCE($6, public_message),
           updated_by = $7,
           updated_at = NOW()
       WHERE product_key = $8
       RETURNING *`,
      [publicStatus || null, typeof acceptingCustomers === 'boolean' ? acceptingCustomers : null, priority || null, owner || null, opsNotes || null, publicMessage || null, req.admin?.name || 'founder-dashboard', req.params.productKey]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Product not found.' });
    return res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('❌ Product settings update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update product settings.' });
  }
});

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
