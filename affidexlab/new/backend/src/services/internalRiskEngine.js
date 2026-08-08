import crypto from 'crypto';
import pool from '../db/connection.js';

const SEVERITY_BASE = { low: 25, medium: 50, high: 75, critical: 100 };
const DEFAULT_MAX_HOPS = Number(process.env.RISK_GRAPH_MAX_HOPS || 5);

function cleanAddress(address) {
  return String(address || '').trim().toLowerCase();
}

function cleanChain(chain) {
  return String(chain || 'ethereum').trim().toLowerCase();
}

function recommendationFromScore(score) {
  if (score < 25) return 'APPROVE';
  if (score < 70) return 'REVIEW';
  return 'REJECT';
}

function levelFromScore(score) {
  if (score < 25) return 'LOW';
  if (score < 60) return 'MEDIUM';
  if (score < 85) return 'HIGH';
  return 'CRITICAL';
}

function severityScore(severity, categoryWeight, confidence, depth) {
  const base = SEVERITY_BASE[String(severity || 'high').toLowerCase()] || 75;
  const decay = depth <= 0 ? 1 : Math.pow(0.55, depth);
  const boundedConfidence = Math.max(0, Math.min(1, Number(confidence ?? 1)));
  return base * (Number(categoryWeight || 50) / 100) * boundedConfidence * decay;
}

export async function addRiskLabel({ chain, address, category, label, severity = 'high', confidence = 1, source = 'decaflow', evidence = null, metadata = {} }) {
  const { rows } = await pool.query(
    `INSERT INTO risk_address_labels (chain, address, category, label, severity, confidence, source, evidence, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (chain, lower(address), category, source)
     DO UPDATE SET label = EXCLUDED.label, severity = EXCLUDED.severity, confidence = EXCLUDED.confidence,
                   evidence = EXCLUDED.evidence, metadata = EXCLUDED.metadata, active = true, updated_at = NOW()
     RETURNING *`,
    [cleanChain(chain), cleanAddress(address), category, label || null, severity, confidence, source, evidence, metadata]
  );
  return rows[0];
}

export async function addRiskEdge({ chain, fromAddress, toAddress, txHash = null, blockNumber = null, valueWei = null, valueUsd = null, tokenAddress = null, source = 'decaflow-indexer', metadata = {} }) {
  const { rows } = await pool.query(
    `INSERT INTO risk_graph_edges (chain, from_address, to_address, tx_hash, block_number, value_wei, value_usd, token_address, source, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [cleanChain(chain), cleanAddress(fromAddress), cleanAddress(toAddress), txHash, blockNumber, valueWei, valueUsd, tokenAddress ? cleanAddress(tokenAddress) : null, source, metadata]
  );
  return rows[0];
}

export async function screenWalletInternal({ address, chain = 'ethereum', maxHops = DEFAULT_MAX_HOPS }) {
  const wallet = cleanAddress(address);
  const network = cleanChain(chain);

  const { rows: directRows } = await pool.query(
    `SELECT l.*, COALESCE(w.weight, 50) AS category_weight
     FROM risk_address_labels l
     LEFT JOIN risk_category_weights w ON w.category = l.category AND w.enabled = true
     WHERE l.chain = $1 AND lower(l.address) = $2 AND l.active = true`,
    [network, wallet]
  );

  const { rows: exposureRows } = await pool.query(
    `WITH RECURSIVE exposure(depth, address, path) AS (
       SELECT 0, $2::text, ARRAY[$2::text]
       UNION ALL
       SELECT exposure.depth + 1,
              CASE WHEN lower(e.from_address) = exposure.address THEN lower(e.to_address) ELSE lower(e.from_address) END,
              path || CASE WHEN lower(e.from_address) = exposure.address THEN lower(e.to_address) ELSE lower(e.from_address) END
       FROM exposure
       JOIN risk_graph_edges e
         ON e.chain = $1
        AND (lower(e.from_address) = exposure.address OR lower(e.to_address) = exposure.address)
       WHERE exposure.depth < $3
         AND NOT (CASE WHEN lower(e.from_address) = exposure.address THEN lower(e.to_address) ELSE lower(e.from_address) END = ANY(path))
     )
     SELECT exposure.depth, exposure.address, exposure.path, l.category, l.label, l.severity, l.confidence, l.source,
            COALESCE(w.weight, 50) AS category_weight
     FROM exposure
     JOIN risk_address_labels l ON l.chain = $1 AND lower(l.address) = exposure.address AND l.active = true
     LEFT JOIN risk_category_weights w ON w.category = l.category AND w.enabled = true
     WHERE exposure.depth > 0
     ORDER BY exposure.depth ASC, l.confidence DESC
     LIMIT 100`,
    [network, wallet, Number(maxHops)]
  );

  const flags = [];
  const exposures = [];
  let score = 0;
  let sanctionsMatch = false;
  let mixerExposure = 0;
  let darknetExposure = 0;

  for (const row of directRows) {
    const s = severityScore(row.severity, row.category_weight, row.confidence, 0);
    score = Math.max(score, s);
    flags.push(`Direct ${row.category}: ${row.label || row.address}`);
    if (row.category === 'sanctions') sanctionsMatch = true;
    if (row.category === 'mixer') mixerExposure = Math.max(mixerExposure, Number(row.confidence || 1));
    if (row.category === 'darknet') darknetExposure = Math.max(darknetExposure, Number(row.confidence || 1));
    exposures.push({ type: 'direct', depth: 0, address: row.address, category: row.category, label: row.label, severity: row.severity, confidence: Number(row.confidence || 0), source: row.source });
  }

  for (const row of exposureRows) {
    const s = severityScore(row.severity, row.category_weight, row.confidence, row.depth);
    score = Math.max(score, s);
    flags.push(`${row.depth}-hop ${row.category}: ${row.label || row.address}`);
    if (row.category === 'sanctions' && row.depth <= 2) sanctionsMatch = true;
    if (row.category === 'mixer') mixerExposure = Math.max(mixerExposure, Number(row.confidence || 1) / Math.max(1, Number(row.depth)));
    if (row.category === 'darknet') darknetExposure = Math.max(darknetExposure, Number(row.confidence || 1) / Math.max(1, Number(row.depth)));
    exposures.push({ type: 'indirect', depth: Number(row.depth), address: row.address, path: row.path, category: row.category, label: row.label, severity: row.severity, confidence: Number(row.confidence || 0), source: row.source });
  }

  const riskScore = Math.max(0, Math.min(100, Math.round(score)));
  const riskLevel = levelFromScore(riskScore);

  return {
    address: wallet,
    chain: network,
    provider: 'decaflow-internal',
    riskScore,
    riskLevel,
    sanctionsMatch,
    sanctionsDetails: exposures.filter(e => e.category === 'sanctions'),
    mixerExposure: Number(mixerExposure.toFixed(4)),
    darknetExposure: Number(darknetExposure.toFixed(4)),
    jurisdictionRisk: riskLevel,
    hopsAnalysed: Number(maxHops),
    recommendation: recommendationFromScore(riskScore),
    flags: Array.from(new Set(flags)).slice(0, 25),
    exposures,
    reportId: `df_${crypto.randomBytes(8).toString('hex')}`,
    checkedAt: new Date().toISOString(),
    dataCoverage: {
      directLabels: directRows.length,
      indirectExposures: exposureRows.length,
      engine: 'DecaFlow internal graph + label engine',
    },
  };
}
