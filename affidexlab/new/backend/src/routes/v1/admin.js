import express from 'express';
import pool from '../../db/connection.js';
import crypto from 'crypto';
import { authorizeAdmin, createAdminKeyMaterial } from '../../services/adminAuth.js';
import { createOrgApiKey, createToken, hashSecret, slugify, upsertOrgUser } from '../../services/orgAuth.js';

const router = express.Router();

// POST /v1/admin/org-login-link — founder/admin fallback that mints a one-time
// customer login link directly, so login works even if SMTP delivery fails.
router.post('/org-login-link', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'valid email is required.' });
    const normalizedEmail = email.trim().toLowerCase();
    const userCheck = await pool.query(
      `SELECT u.id FROM org_users u JOIN org_memberships m ON m.user_id = u.id
       WHERE u.email = $1 AND u.status = 'active' AND m.status = 'active' LIMIT 1`,
      [normalizedEmail]
    );
    if (!userCheck.rows.length) return res.status(404).json({ success: false, error: 'No active organization account found for this email.' });
    const token = createToken('df_login');
    await pool.query(
      `INSERT INTO org_login_tokens (email, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [normalizedEmail, hashSecret(token)]
    );
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.decaflow.xyz';
    return res.status(201).json({
      success: true,
      loginUrl: `${frontendUrl}/login?token=${token}`,
      expiresInMinutes: 15,
      warning: 'One-time link. Anyone with this URL can log into the account — share it only with the account owner.'
    });
  } catch (err) {
    console.error('❌ Org login link error:', err);
    return res.status(500).json({ success: false, error: 'Could not create login link.' });
  }
});


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



router.post('/test-access', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { email, name = 'Founder Test User', companyName = 'DecaFlow Founder Test Account', products = null } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'valid email is required.' });
    const normalizedEmail = email.trim().toLowerCase();
    const orgSlug = `${slugify(companyName)}-${crypto.randomBytes(3).toString('hex')}`;
    const allowedProducts = ['verify', 'compliance', 'shield', 'agents', 'institutional', 'audit'];
    const requestedProducts = Array.isArray(products)
      ? products.map(p => String(p).trim().toLowerCase()).filter(p => allowedProducts.includes(p))
      : [];
    const selectedProducts = requestedProducts.length ? Array.from(new Set(requestedProducts)) : allowedProducts;
    const hasProduct = (product) => selectedProducts.includes(product);
    const orgScopes = selectedProducts.includes('verify') || selectedProducts.includes('compliance')
      ? ['verify:check', 'risk:screen']
      : [];
    if (selectedProducts.includes('shield')) orgScopes.push('shield:admin');
    if (selectedProducts.includes('agents')) orgScopes.push('agents:rules', 'agents:evaluate', 'agents:review');
    if (selectedProducts.includes('institutional')) orgScopes.push('institutional:attest', 'institutional:check');

    const { rows: orgRows } = await pool.query(
      `INSERT INTO organizations (name, slug, status, plan, billing_email)
       VALUES ($1, $2, 'active', 'founder-test', $3)
       RETURNING *`,
      [companyName, orgSlug, normalizedEmail]
    );
    const user = await upsertOrgUser({ email: normalizedEmail, name });
    await pool.query(
      `INSERT INTO org_memberships (organization_id, user_id, role, invited_by)
       VALUES ($1, $2, 'owner', $3)
       ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner', status = 'active', updated_at = NOW()`,
      [orgRows[0].id, user.id, req.admin?.name || 'founder-dashboard']
    );
    const orgKey = await createOrgApiKey({ organizationId: orgRows[0].id, name: 'Founder Test API Key', scopes: orgScopes.length ? orgScopes : ['org:read'] });
    const verifyKey = hasProduct('verify') ? `df_verify_test_${crypto.randomBytes(24).toString('hex')}` : null;

    if (hasProduct('verify')) {
      await pool.query(
        `INSERT INTO verify_enquiries (company_name, contact_name, email, use_case, chains, monthly_checks, plan, source, status, api_key_issued, api_key, notes)
         VALUES ($1, $2, $3, 'founder-test', ARRAY['base','arbitrum','polygon','avalanche'], 'unlimited', 'Founder Test', 'founder-dashboard', 'converted', true, $4, 'Comped founder test account')`,
        [companyName, name, normalizedEmail, verifyKey]
      ).catch(() => {});
    }
    if (hasProduct('compliance')) {
      await pool.query(
        `INSERT INTO compliance_enquiries (company_name, contact_name, email, business_type, chains, monthly_tx_volume, plan, message, source, status, notes)
         VALUES ($1, $2, $3, 'founder-test', ARRAY['base','arbitrum','polygon','avalanche'], 'test', 'Founder Test', 'Comped founder test account', 'founder-dashboard', 'converted', 'No payment required')`,
        [companyName, name, normalizedEmail]
      ).catch(() => {});
    }
    const shieldCustomer = hasProduct('shield') ? await pool.query(
      `INSERT INTO shield_customers (company_name, contact_name, email, plan, status, payment_gateway)
       VALUES ($1, $2, $3, 'Founder Test', 'active', 'comped') RETURNING id`,
      [companyName, name, normalizedEmail]
    ).catch(() => ({ rows: [] })) : { rows: [] };
    if (hasProduct('agents')) {
      await pool.query(
        `INSERT INTO agents_customers (company_name, contact_name, email, plan, payment_gateway, gateway_order_id, status)
         VALUES ($1, $2, $3, 'Founder Test', 'comped', $4, 'active')`,
        [companyName, name, normalizedEmail, `comped_${crypto.randomBytes(8).toString('hex')}`]
      ).catch(() => {});
    }
    if (hasProduct('institutional')) {
      await pool.query(
        `INSERT INTO institutional_customers (company_name, contact_name, email, plan, asset_type, jurisdictions, message, payment_gateway, gateway_order_id, status)
         VALUES ($1, $2, $3, 'Founder Test', 'internal test', 'Base, Arbitrum, Polygon, Avalanche', 'Comped founder test account', 'comped', $4, 'active')`,
        [companyName, name, normalizedEmail, `comped_${crypto.randomBytes(8).toString('hex')}`]
      ).catch(() => {});
    }
    if (hasProduct('audit')) {
      await pool.query(
        `INSERT INTO audit_enquiries (project_name, contact_name, email, github_repo, audit_package, description, source, status, notes)
         VALUES ($1, $2, $3, 'internal-founder-test', 'Founder Test', 'Comped founder test audit access account', 'founder-dashboard', 'converted', 'No payment required')`,
        [companyName, name, normalizedEmail]
      ).catch(() => {});
    }

    // Seed realistic sample data so the customer dashboard shows a working
    // product experience instead of empty tables for the selected products.
    if (shieldCustomer.rows[0]) {
      await pool.query(
        `INSERT INTO shield_contracts (customer_id, chain, address, label, status)
         VALUES ($1, 'arbitrum', '0xdbbdbdcf4b9fc8f85ae549078199ee3fb27cadb3', 'Sample watched contract', 'active')`,
        [shieldCustomer.rows[0].id]
      ).catch(() => {});
    }
    if (hasProduct('agents')) {
      const sampleRule = await pool.query(
        `INSERT INTO compliance_workflow_rules (account_email, organization_id, name, condition_field, operator, threshold, action, created_by)
         VALUES ($1, $2, 'High-risk wallets need review', 'riskScore', '>', 70, 'flag_for_review', 'founder-test-seed')
         RETURNING id`,
        [normalizedEmail, orgRows[0].id]
      ).catch(() => ({ rows: [] }));
      await pool.query(
        `INSERT INTO compliance_workflow_rules (account_email, organization_id, name, condition_field, operator, threshold, action, created_by)
         VALUES ($1, $2, 'Critical wallets always flagged', 'riskScore', '>=', 90, 'flag_for_review', 'founder-test-seed')`,
        [normalizedEmail, orgRows[0].id]
      ).catch(() => {});
      if (sampleRule.rows[0]) {
        await pool.query(
          `INSERT INTO compliance_review_queue (account_email, organization_id, rule_id, wallet_address, chain, risk_score, risk_level, status)
           VALUES ($1, $2, $3, '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c', 'ethereum', 100, 'CRITICAL', 'pending'),
                  ($1, $2, $3, '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', 'ethereum', 85, 'HIGH', 'pending')`,
          [normalizedEmail, orgRows[0].id, sampleRule.rows[0].id]
        ).catch(() => {});
      }
    }
    if (hasProduct('verify')) {
      await pool.query(
        `INSERT INTO risk_screenings (product, api_key, wallet_address, chain, provider, risk_score, risk_level, recommendation, sanctions_match, mixer_exposure, darknet_exposure, report_id, raw_response)
         VALUES ('verify', $1, '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c', 'ethereum', 'decaflow-internal', 100, 'CRITICAL', 'REJECT', true, 0, 0, $2, '{"seed":true}'::jsonb),
                ('verify', $1, '0x1e7b01f8d28e757b07887ff6bf23e46bde4e4cbd', 'ethereum', 'decaflow-internal', 8, 'LOW', 'APPROVE', false, 0, 0, $3, '{"seed":true}'::jsonb)`,
        [verifyKey, `df_seed_${crypto.randomBytes(6).toString('hex')}`, `df_seed_${crypto.randomBytes(6).toString('hex')}`]
      ).catch(() => {});
    }
    if (hasProduct('institutional')) {
      await pool.query(
        `INSERT INTO institutional_identity_attestations (chain, wallet_address, organization_id, kyc_status, jurisdiction_eligible, accredited_investor, jurisdiction, accreditation_basis, attested_by)
         VALUES ('ethereum', '0x1e7b01f8d28e757b07887ff6bf23e46bde4e4cbd', $1, 'approved', true, true, 'US', 'Sample accredited investor attestation', 'founder-test-seed')
         ON CONFLICT (chain, lower(wallet_address)) DO NOTHING`,
        [orgRows[0].id]
      ).catch(() => {});
      await pool.query(
        `INSERT INTO institutional_investor_checks (chain, wallet_address, organization_id, decision, reasons, risk_score, risk_level, sanctions_match, requested_by)
         VALUES ('ethereum', '0x1e7b01f8d28e757b07887ff6bf23e46bde4e4cbd', $1, 'APPROVE', '[]'::jsonb, 8, 'LOW', false, 'founder-test-seed'),
                ('ethereum', '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c', $1, 'REJECT', '["Wallet has direct or near-hop sanctions exposure."]'::jsonb, 100, 'CRITICAL', true, 'founder-test-seed')`,
        [orgRows[0].id]
      ).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      organization: orgRows[0],
      user: { id: user.id, email: user.email, name: user.name },
      orgApiKey: orgKey.apiKey,
      verifyApiKey: verifyKey,
      products: selectedProducts,
      message: `Founder test access created for ${selectedProducts.join(', ')} without payment.`
    });
  } catch (err) {
    console.error('❌ Founder test access error:', err);
    return res.status(500).json({ success: false, error: 'Could not create founder test access.' });
  }
});

router.get('/customers', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:read'))) return;
    const safeRows = async (query, params = []) => {
      try { const { rows } = await pool.query(query, params); return rows; } catch { return []; }
    };
    const [orgs, shield, agents, institutional, verify, compliance, audit] = await Promise.all([
      safeRows(`SELECT 'organization' AS source, id, name AS company_name, billing_email AS email, plan, status, created_at FROM organizations ORDER BY created_at DESC LIMIT 100`),
      safeRows(`SELECT 'shield' AS source, id, company_name, email, plan, status, payment_gateway, gateway_order_id, created_at FROM shield_customers ORDER BY created_at DESC LIMIT 100`),
      safeRows(`SELECT 'agents' AS source, id, company_name, email, plan, status, payment_gateway, gateway_order_id, created_at FROM agents_customers ORDER BY created_at DESC LIMIT 100`),
      safeRows(`SELECT 'institutional' AS source, id, company_name, email, plan, status, payment_gateway, gateway_order_id, created_at FROM institutional_customers ORDER BY created_at DESC LIMIT 100`),
      safeRows(`SELECT 'verify_enquiry' AS source, id, company_name, email, plan, status, created_at FROM verify_enquiries ORDER BY created_at DESC LIMIT 100`),
      safeRows(`SELECT 'compliance_enquiry' AS source, id, company_name, email, plan, status, created_at FROM compliance_enquiries ORDER BY created_at DESC LIMIT 100`),
      safeRows(`SELECT 'audit_enquiry' AS source, id, project_name AS company_name, email, audit_package AS plan, status, created_at FROM audit_enquiries ORDER BY created_at DESC LIMIT 100`)
    ]);
    return res.json({ success: true, customers: [...orgs, ...shield, ...agents, ...institutional, ...verify, ...compliance, ...audit].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 200) });
  } catch (err) {
    console.error('❌ Admin customers error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch customers.' });
  }
});

router.get('/payments', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:read'))) return;
    const safeRows = async (query) => { try { const { rows } = await pool.query(query); return rows; } catch { return []; } };
    const [shield, agents, institutional] = await Promise.all([
      safeRows(`SELECT 'shield' AS product, id, company_name, email, plan, status, payment_gateway, gateway_order_id, created_at, updated_at FROM shield_customers ORDER BY created_at DESC LIMIT 100`),
      safeRows(`SELECT 'agents' AS product, id, company_name, email, plan, status, payment_gateway, gateway_order_id, created_at, updated_at FROM agents_customers ORDER BY created_at DESC LIMIT 100`),
      safeRows(`SELECT 'institutional' AS product, id, company_name, email, plan, status, payment_gateway, gateway_order_id, created_at, updated_at FROM institutional_customers ORDER BY created_at DESC LIMIT 100`)
    ]);
    return res.json({ success: true, payments: [...shield, ...agents, ...institutional].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 200) });
  } catch (err) {
    console.error('❌ Admin payments error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch payments.' });
  }
});

router.get('/members', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { rows } = await pool.query(
      `SELECT m.id, m.organization_id, o.name AS organization_name, u.email, u.name, m.role, m.status, m.created_at, m.updated_at
       FROM org_memberships m JOIN organizations o ON o.id = m.organization_id JOIN org_users u ON u.id = m.user_id
       ORDER BY m.created_at DESC LIMIT 200`
    );
    return res.json({ success: true, members: rows });
  } catch (err) {
    console.error('❌ Admin members error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch members.' });
  }
});

router.patch('/members/:id', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { role, status } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE org_memberships SET role = COALESCE($1, role), status = COALESCE($2, status), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [role || null, status || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Member not found.' });
    return res.json({ success: true, member: rows[0] });
  } catch (err) {
    console.error('❌ Admin member update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update member.' });
  }
});

router.get('/org-api-keys', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { rows } = await pool.query(
      `SELECT k.id, k.organization_id, o.name AS organization_name, k.name, k.scopes, k.active, k.expires_at, k.last_used_at, k.created_at, k.updated_at
       FROM org_api_keys k JOIN organizations o ON o.id = k.organization_id ORDER BY k.created_at DESC LIMIT 200`
    );
    return res.json({ success: true, keys: rows });
  } catch (err) {
    console.error('❌ Org API keys list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch organization API keys.' });
  }
});

router.patch('/org-api-keys/:id', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'orgs:admin'))) return;
    const { active, name, scopes, expiresAt } = req.body || {};
    const normalizedScopes = Array.isArray(scopes) ? scopes.map(String).filter(Boolean) : scopes ? String(scopes).split(',').map(s => s.trim()).filter(Boolean) : null;
    const { rows } = await pool.query(
      `UPDATE org_api_keys SET active = COALESCE($1, active), name = COALESCE($2, name), scopes = COALESCE($3, scopes), expires_at = COALESCE($4, expires_at), updated_at = NOW() WHERE id = $5 RETURNING *`,
      [typeof active === 'boolean' ? active : null, name?.trim() || null, normalizedScopes ? JSON.stringify(normalizedScopes) : null, expiresAt || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'API key not found.' });
    return res.json({ success: true, key: rows[0] });
  } catch (err) {
    console.error('❌ Org API key update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update organization API key.' });
  }
});

router.patch('/shield-incidents/:id', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'shield:admin'))) return;
    const { status, assignedTo, summary, nextSteps } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE shield_incidents SET status = COALESCE($1, status), assigned_to = COALESCE($2, assigned_to), summary = COALESCE($3, summary), next_steps = COALESCE($4, next_steps), updated_at = NOW(), closed_at = CASE WHEN $1 = 'closed' THEN NOW() ELSE closed_at END WHERE id = $5 RETURNING *`,
      [status || null, assignedTo || null, summary || null, nextSteps || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Incident not found.' });
    return res.json({ success: true, incident: rows[0] });
  } catch (err) {
    console.error('❌ Admin incident update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update incident.' });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    if (!(await authorizeAdmin(req, res, 'admin:audit'))) return;
    const { limit = 100, offset = 0, principal, scope, allowed } = req.query;
    const params = [];
    const where = [];
    if (principal) { params.push(`%${principal}%`); where.push(`principal ILIKE $${params.length}`); }
    if (scope) { params.push(scope); where.push(`scope = $${params.length}`); }
    if (allowed === 'true' || allowed === 'false') { params.push(allowed === 'true'); where.push(`allowed = $${params.length}`); }
    params.push(Number(limit), Number(offset));
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM admin_audit_logs ${whereSql} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return res.json({ success: true, logs: rows });
  } catch (err) {
    console.error('❌ Admin audit logs error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch admin audit logs.' });
  }
});

export default router;
