import pool from '../db/connection.js';

export async function getRiskCoverageSummary() {
  const [byCategory, bySource, byChain, recentRuns] = await Promise.all([
    pool.query(
      `SELECT category, COUNT(*)::int AS labels
       FROM risk_address_labels
       WHERE active = true
       GROUP BY category
       ORDER BY labels DESC`
    ),
    pool.query(
      `SELECT source, COUNT(*)::int AS labels
       FROM risk_address_labels
       WHERE active = true
       GROUP BY source
       ORDER BY labels DESC
       LIMIT 25`
    ),
    pool.query(
      `SELECT chain, COUNT(*)::int AS labels
       FROM risk_address_labels
       WHERE active = true
       GROUP BY chain
       ORDER BY labels DESC`
    ),
    pool.query(
      `SELECT source, status, labels_count, edges_count, fetched_bytes, error, started_at, finished_at
       FROM risk_ingestion_runs
       ORDER BY started_at DESC
       LIMIT 20`
    ).catch(() => ({ rows: [] })),
  ]);

  const categoryCounts = Object.fromEntries(byCategory.rows.map(row => [row.category, Number(row.labels)]));
  const requiredCategories = ['sanctions', 'mixer', 'scam', 'phishing', 'stolen_funds', 'darknet', 'darknet_market', 'ransomware'];
  const missingCategories = requiredCategories.filter(category => !categoryCounts[category]);
  const totalLabels = byCategory.rows.reduce((sum, row) => sum + Number(row.labels), 0);

  return {
    totalLabels,
    categories: byCategory.rows,
    sources: bySource.rows,
    chains: byChain.rows,
    recentRuns: recentRuns.rows,
    coverageReadiness: {
      productionEngine: true,
      marketCoverageClaim: missingCategories.length === 0 && totalLabels >= Number(process.env.RISK_MARKET_COVERAGE_MIN_LABELS || 10000),
      missingCategories,
      minimumLabelsForBroadClaim: Number(process.env.RISK_MARKET_COVERAGE_MIN_LABELS || 10000),
    },
  };
}

export async function recordRiskIngestionRun({ source, status, labelsCount = 0, edgesCount = 0, fetchedBytes = 0, error = null, metadata = {} }) {
  await pool.query(
    `INSERT INTO risk_ingestion_runs (source, status, labels_count, edges_count, fetched_bytes, error, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [source, status, labelsCount, edgesCount, fetchedBytes, error, metadata]
  ).catch(() => {});
}
