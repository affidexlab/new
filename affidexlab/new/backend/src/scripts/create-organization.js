import pool from '../db/connection.js';
import { createOrgApiKey, slugify, upsertOrgUser } from '../services/orgAuth.js';

async function main() {
  const [name, ownerEmail, ownerName = '', scopes = 'verify:check,risk:screen'] = process.argv.slice(2);
  if (!name || !ownerEmail) throw new Error('Usage: node src/scripts/create-organization.js "Org Name" owner@example.com "Owner Name" "verify:check,risk:screen"');
  const { rows: orgRows } = await pool.query(
    `INSERT INTO organizations (name, slug, plan, billing_email)
     VALUES ($1, $2, 'beta', $3)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
     RETURNING *`,
    [name, slugify(name), ownerEmail]
  );
  const owner = await upsertOrgUser({ email: ownerEmail, name: ownerName || null });
  await pool.query(
    `INSERT INTO org_memberships (organization_id, user_id, role, invited_by)
     VALUES ($1, $2, 'owner', 'github-actions')
     ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner', status = 'active', updated_at = NOW()`,
    [orgRows[0].id, owner.id]
  );
  const keyScopes = scopes.split(',').map(s => s.trim()).filter(Boolean);
  const key = await createOrgApiKey({ organizationId: orgRows[0].id, name: 'Default Production API Key', scopes: keyScopes.length ? keyScopes : ['verify:check'] });
  console.log(JSON.stringify({ success: true, organization: orgRows[0], owner: { id: owner.id, email: owner.email }, apiKey: key.apiKey, apiKeyRecord: key.record }, null, 2));
  await pool.end();
}

main().catch(async (err) => {
  console.error('❌ Organization creation failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
