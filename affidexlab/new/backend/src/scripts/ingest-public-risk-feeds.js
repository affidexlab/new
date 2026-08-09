import pool from '../db/connection.js';
import { ingestPublicRiskFeeds } from '../services/publicRiskFeedIngestion.js';

async function main() {
  const result = await ingestPublicRiskFeeds();
  console.log(JSON.stringify(result, null, 2));
  await pool.end();
  if (!result.success) process.exit(1);
}

main().catch(async (err) => {
  console.error('❌ Public risk feed ingestion failed:', err.message);
  if (err.results) console.error(JSON.stringify({ results: err.results }, null, 2));
  await pool.end().catch(() => {});
  process.exit(1);
});
