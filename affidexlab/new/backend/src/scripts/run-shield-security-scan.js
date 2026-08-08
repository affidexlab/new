import pool from '../db/connection.js';
import { runShieldSecurityScan } from '../services/shieldSecurityScanner.js';

async function main() {
  const result = await runShieldSecurityScan();
  console.log(JSON.stringify({ success: true, result }, null, 2));
  await pool.end();
}

main().catch(async (err) => {
  console.error('❌ Shield security scan failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
