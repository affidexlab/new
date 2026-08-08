import pool from '../db/connection.js';
import { runShieldSecurityScan } from '../services/shieldSecurityScanner.js';

async function main() {
  const result = await runShieldSecurityScan();
  const failed = result.results.filter(item => item.error);
  console.log(JSON.stringify({ success: failed.length === 0, result }, null, 2));
  await pool.end();
  if (failed.length > 0) process.exit(1);
}

main().catch(async (err) => {
  console.error('❌ Shield security scan failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
