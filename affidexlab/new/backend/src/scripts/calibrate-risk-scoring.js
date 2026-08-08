import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../db/connection.js';
import { screenWalletInternal } from '../services/internalRiskEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const file = process.argv[2] || join(__dirname, '../data/riskCalibrationCases.json');
const shouldApply = process.argv.includes('--apply');
const allowFail = process.argv.includes('--allow-fail');

function recommendationRank(value) {
  return { APPROVE: 0, REVIEW: 1, REJECT: 2 }[value] ?? 0;
}

async function bumpLikelyCategory(exposures) {
  const category = exposures.find(e => e.category === 'sanctions')?.category || exposures[0]?.category;
  if (!category) return null;
  const { rows } = await pool.query(
    `UPDATE risk_category_weights
     SET weight = LEAST(100, weight + 5), updated_at = NOW()
     WHERE category = $1
     RETURNING *`,
    [category]
  );
  return rows[0] || null;
}

async function main() {
  const cases = JSON.parse(readFileSync(file, 'utf8'));
  const results = [];
  for (const testCase of cases) {
    const screen = await screenWalletInternal({ address: testCase.address, chain: testCase.chain, maxHops: testCase.maxHops || 3 });
    const scorePass = Number(screen.riskScore) >= Number(testCase.expectedMinScore ?? 0);
    const recommendationPass = !testCase.expectedRecommendation || recommendationRank(screen.recommendation) >= recommendationRank(testCase.expectedRecommendation);
    let adjustment = null;
    if (shouldApply && (!scorePass || !recommendationPass)) adjustment = await bumpLikelyCategory(screen.exposures);
    results.push({
      name: testCase.name,
      address: testCase.address,
      chain: testCase.chain,
      riskScore: screen.riskScore,
      recommendation: screen.recommendation,
      expectedMinScore: testCase.expectedMinScore,
      expectedRecommendation: testCase.expectedRecommendation,
      pass: scorePass && recommendationPass,
      adjustment
    });
  }
  const failed = results.filter(result => !result.pass);
  console.log(JSON.stringify({ success: failed.length === 0, applied: shouldApply, results }, null, 2));
  await pool.end();
  if (failed.length && !allowFail) {
    throw new Error(`${failed.length} risk calibration case(s) failed`);
  }
}

main().catch(async (err) => {
  console.error('❌ Risk scoring calibration failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
