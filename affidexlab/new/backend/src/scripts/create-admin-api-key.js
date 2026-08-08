import pool from '../db/connection.js';
import { createAdminKeyMaterial } from '../services/adminAuth.js';

async function main() {
  const name = process.argv[2] || 'DecaFlow Admin';
  const scopes = (process.argv[3] || '*').split(',').map(s => s.trim()).filter(Boolean);
  const { key, keyHash } = createAdminKeyMaterial();
  const { rows } = await pool.query(
    `INSERT INTO admin_api_keys (name, key_hash, scopes) VALUES ($1, $2, $3) RETURNING id, name, scopes, created_at`,
    [name, keyHash, JSON.stringify(scopes)]
  );
  console.log(JSON.stringify({ success: true, adminKey: key, record: rows[0] }, null, 2));
  await pool.end();
}

main().catch(async (err) => {
  console.error('❌ Admin API key creation failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
