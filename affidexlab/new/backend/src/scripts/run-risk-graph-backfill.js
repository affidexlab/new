import pool from '../db/connection.js';
import { ingestAlchemyTransfers } from '../services/alchemyGraphIngestionService.js';
import { recordRiskIngestionRun } from '../services/riskCoverageService.js';

function parseTargets() {
  const raw = String(process.env.RISK_GRAPH_BACKFILL_TARGETS || '').trim();
  if (!raw) return [];
  if (raw.startsWith('[')) return JSON.parse(raw);
  return raw.split(',').map(item => {
    const [chain, address] = item.split(':');
    return { chain: chain?.trim(), address: address?.trim() };
  }).filter(item => item.chain && item.address);
}

async function main() {
  const targets = parseTargets();
  if (!targets.length) {
    console.log(JSON.stringify({ success: true, skipped: true, reason: 'RISK_GRAPH_BACKFILL_TARGETS is empty', results: [] }, null, 2));
    await pool.end();
    return;
  }

  const fromBlock = process.env.RISK_GRAPH_BACKFILL_FROM_BLOCK || '0x0';
  const toBlock = process.env.RISK_GRAPH_BACKFILL_TO_BLOCK || 'latest';
  const maxPages = Number(process.env.RISK_GRAPH_BACKFILL_MAX_PAGES || 3);
  const results = [];

  for (const target of targets) {
    const startedAt = new Date().toISOString();
    try {
      const result = await ingestAlchemyTransfers({ chain: target.chain, address: target.address, fromBlock, toBlock, maxPages });
      await recordRiskIngestionRun({
        source: 'alchemy-targeted-backfill',
        status: 'success',
        edgesCount: result.inserted,
        metadata: { ...target, fromBlock, toBlock, maxPages, startedAt, result }
      });
      results.push({ ...target, success: true, ...result });
    } catch (err) {
      await recordRiskIngestionRun({
        source: 'alchemy-targeted-backfill',
        status: 'failed',
        error: err.message,
        metadata: { ...target, fromBlock, toBlock, maxPages, startedAt }
      });
      results.push({ ...target, success: false, error: err.message });
    }
  }

  const failed = results.filter(r => !r.success);
  console.log(JSON.stringify({ success: failed.length === 0, results }, null, 2));
  await pool.end();
  if (failed.length > 0) process.exit(1);
}

main().catch(async (err) => {
  console.error('❌ Risk graph backfill failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
