import pool from '../db/connection.js';
import { createOrgApiKey, createToken, hashSecret, slugify, upsertOrgUser } from './orgAuth.js';
import { sendEnquiryEmail } from '../utils/mailer.js';

const PRODUCT_SCOPES = {
  verify: ['verify:check'],
  compliance: ['verify:check', 'agents:review'],
  shield: ['verify:check'],
  agents: ['agents:rules', 'agents:evaluate', 'agents:review', 'verify:check'],
  institutional: ['institutional:attest', 'institutional:check', 'verify:check'],
  audit: [],
};

const PRODUCT_LABELS = {
  verify: 'Verify API',
  compliance: 'Compliance',
  shield: 'Shield',
  agents: 'Autopilot (Agentic Compliance)',
  institutional: 'Institutional / RWA',
  audit: 'Security Audit',
};
const DEFAULT_AUTO_ISSUED_API_KEY_TTL_DAYS = 90;
const defaultAutoIssuedApiKeyExpiry = () => new Date(Date.now() + DEFAULT_AUTO_ISSUED_API_KEY_TTL_DAYS * 24 * 60 * 60 * 1000);

async function findExistingOrg(email) {
  const { rows } = await pool.query(
    `SELECT m.organization_id, o.name
     FROM org_users u
     JOIN org_memberships m ON m.user_id = u.id AND m.status = 'active'
     JOIN organizations o ON o.id = m.organization_id AND o.status = 'active'
     WHERE u.email = $1
     ORDER BY m.created_at ASC
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

// Auto-provisions access on a confirmed payment: reuses or creates the org +
// owner, issues a product-scoped org API key, and emails a one-time login link.
// Never throws — a provisioning hiccup must not break payment-callback handling.
export async function provisionCustomerAccess({ email, name = null, companyName = null, product, planLabel = null }) {
  try {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail.includes('@')) return { provisioned: false, reason: 'no email' };

    let organizationId;
    let organizationName;
    const existing = await findExistingOrg(normalizedEmail);
    if (existing) {
      organizationId = existing.organization_id;
      organizationName = existing.name;
    } else {
      const orgName = companyName?.trim() || `${normalizedEmail.split('@')[0]} — DecaFlow Customer`;
      const { rows } = await pool.query(
        `INSERT INTO organizations (name, slug, status, plan, billing_email)
         VALUES ($1, $2, 'active', $3, $4) RETURNING id, name`,
        [orgName, `${slugify(orgName)}-${createToken('x').slice(2, 8)}`, planLabel || product, normalizedEmail]
      );
      organizationId = rows[0].id;
      organizationName = rows[0].name;
      const user = await upsertOrgUser({ email: normalizedEmail, name });
      await pool.query(
        `INSERT INTO org_memberships (organization_id, user_id, role, invited_by)
         VALUES ($1, $2, 'owner', 'auto-provisioning')
         ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner', status = 'active', updated_at = NOW()`,
        [organizationId, user.id]
      );
    }

    const scopes = PRODUCT_SCOPES[product] || [];
    let apiKey = null;
    if (scopes.length) {
      const keyResult = await createOrgApiKey({
        organizationId,
        name: `${PRODUCT_LABELS[product] || product} — auto-issued`,
        scopes,
        expiresAt: defaultAutoIssuedApiKeyExpiry(),
      });
      apiKey = keyResult.apiKey;
    }

    const loginToken = createToken('df_login');
    await pool.query(
      `INSERT INTO org_login_tokens (email, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [normalizedEmail, hashSecret(loginToken)]
    );
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.decaflow.xyz';
    const loginUrl = `${frontendUrl}/login?token=${loginToken}`;

    const fields = {
      'Dear': name || 'there',
      'Your account': organizationName,
      'Product activated': `${PRODUCT_LABELS[product] || product}${planLabel ? ` — ${planLabel}` : ''}`,
      'Log in': loginUrl,
      'Link expires': '7 days — after that, request a new link at decaflow.xyz/login',
    };
    if (apiKey) {
      fields['Your API Key'] = apiKey;
      fields['API key expires'] = `${DEFAULT_AUTO_ISSUED_API_KEY_TTL_DAYS} days from issue. Create a replacement in your account before expiry.`;
      fields['Keep it safe'] = 'This key is shown once. You can create or revoke keys anytime from your account page.';
    }
    const emailed = await sendEnquiryEmail({
      type: 'Account Access',
      to: normalizedEmail,
      subject: `Your DecaFlow account is ready — ${PRODUCT_LABELS[product] || product}`,
      fields,
      isApiKey: Boolean(apiKey),
    });

    console.log(`✅ Auto-provisioned ${product} access for ${normalizedEmail} (org ${organizationId}, emailed: ${emailed})`);
    return { provisioned: true, organizationId, emailed, apiKeyIssued: Boolean(apiKey) };
  } catch (err) {
    console.error(`❌ Auto-provisioning failed for ${email} (${product}):`, err.message);
    return { provisioned: false, reason: err.message };
  }
}
