import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { addRiskLabel } from '../services/internalRiskEngine.js';
import pool from '../db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const file = process.argv[2] || join(__dirname, '../data/curatedRiskLabels.json');

async function main() {
  const labels = JSON.parse(readFileSync(file, 'utf8'));
  let count = 0;
  for (const label of labels) {
    await addRiskLabel(label);
    count += 1;
  }
  console.log(`✅ Ingested ${count} curated DecaFlow risk labels from ${file}`);
  await pool.end();
}

main().catch(async (err) => {
  console.error('❌ Curated label ingestion failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
