import pool from '../db/connection.js';
import { addRiskLabel } from '../services/internalRiskEngine.js';
import { recordRiskIngestionRun } from '../services/riskCoverageService.js';
import { findAddressesInText } from '../services/cryptoAddressValidation.js';

const UK_SANCTIONS_LIST_URL = 'https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.xml';

// The old OFSI Consolidated List host stopped serving data when the list closed (28 Jan 2026).
// If a stale env var/secret still points there, ignore it and use the official UK Sanctions List instead.
function resolveUkSanctionsUrl() {
  const configured = (process.env.UK_HMT_CONSOLIDATED_SANCTIONS_URL || '').trim();
  if (!configured) return UK_SANCTIONS_LIST_URL;
  if (/ofsistorage\.blob\.core\.windows\.net|ConList\.(csv|xml|txt)/i.test(configured)) {
    console.warn(`⚠️ UK_HMT_CONSOLIDATED_SANCTIONS_URL points at the closed OFSI list; using ${UK_SANCTIONS_LIST_URL} instead. Update or delete that secret.`);
    return UK_SANCTIONS_LIST_URL;
  }
  return configured;
}

const DEFAULT_SOURCES = [
  {
    key: 'un-consolidated',
    category: 'sanctions',
    severity: 'critical',
    confidence: 0.95,
    url: process.env.UN_CONSOLIDATED_SANCTIONS_URL || 'https://scsanctions.un.org/resources/xml/en/consolidated.xml',
    labelPrefix: 'UN Consolidated Sanctions'
  },
  {
    key: 'eu-consolidated',
    category: 'sanctions',
    severity: 'critical',
    confidence: 0.95,
    url: process.env.EU_CONSOLIDATED_SANCTIONS_URL || 'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content',
    labelPrefix: 'EU Consolidated Financial Sanctions'
  },
  {
    // Source key kept as 'uk-hmt-consolidated' so existing labels and risk.js lookups keep working.
    // The OFSI Consolidated List closed on 28 Jan 2026; the FCDO UK Sanctions List is now the only UK source.
    key: 'uk-hmt-consolidated',
    category: 'sanctions',
    severity: 'critical',
    confidence: 0.95,
    url: resolveUkSanctionsUrl(),
    labelPrefix: 'UK Sanctions List (FCDO)'
  }
];

function stripTags(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function nearbyText(text, index, radius = 320) {
  return stripTags(text.slice(Math.max(0, index - radius), Math.min(text.length, index + radius)));
}

function extractName(context, fallback) {
  const candidates = [
    /<FIRST_NAME>([\s\S]*?)<\/FIRST_NAME>[\s\S]*?<SECOND_NAME>([\s\S]*?)<\/SECOND_NAME>/i,
    /<NAME_ALIAS[^>]*>\s*<ALIAS_NAME>([\s\S]*?)<\/ALIAS_NAME>/i,
    /<wholeName>([\s\S]*?)<\/wholeName>/i,
    /"Name 6"\s*,?\s*"?([^",\n]+)"?/i,
    /Individual, Entity, Ship\s*,?\s*([^,\n]+)/i
  ];
  for (const pattern of candidates) {
    const match = pattern.exec(context);
    if (match) return stripTags(match.slice(1).filter(Boolean).join(' '));
  }
  return fallback;
}

// Only checksum-valid addresses are accepted (see services/cryptoAddressValidation.js).
function extractAddresses(source, body) {
  const stats = {};
  const found = findAddressesInText(body, stats);
  const labels = found.map(({ chain, address, index }) => {
    const context = nearbyText(body, index);
    return {
      chain,
      address,
      category: source.category,
      label: `${source.labelPrefix}: ${extractName(context, 'listed entity')}`.slice(0, 255),
      severity: source.severity,
      confidence: source.confidence,
      source: source.key,
      evidence: context || `${source.labelPrefix} source contained this digital-asset address`,
      metadata: { sourceUrl: source.url, sourceKey: source.key, validated: 'checksum' }
    };
  });
  return { labels, rejectedInvalid: stats.rejected || 0 };
}

async function fetchSource(source) {
  const res = await fetch(source.url, { headers: { 'User-Agent': 'DecaFlowRiskIngestion/1.0' } });
  if (!res.ok) throw new Error(`${source.key} fetch failed: ${res.status}`);
  return res.text();
}

async function ingestSource(source) {
  const startedAt = (await pool.query('SELECT NOW() AS now')).rows[0].now;
  const body = await fetchSource(source);
  const { labels, rejectedInvalid } = extractAddresses(source, body);
  let inserted = 0;
  for (const label of labels) {
    await addRiskLabel(label);
    inserted += 1;
  }

  // Deactivate labels from this source that the latest snapshot no longer contains
  // (de-listed addresses, and look-alike strings stored by older, unvalidated runs).
  // Skipped when nothing valid was found, so a bad download can never wipe a source.
  let deactivatedStale = 0;
  if (inserted > 0) {
    const stale = await pool.query(
      `UPDATE risk_address_labels
       SET active = false, updated_at = NOW(),
           metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('deactivatedReason', 'not_in_latest_source_snapshot')
       WHERE source = $1 AND active = true AND updated_at < $2`,
      [source.key, startedAt]
    );
    deactivatedStale = stale.rowCount;
  }

  const result = { source: source.key, fetchedBytes: body.length, labels: inserted, rejectedInvalid, deactivatedStale };
  await recordRiskIngestionRun({ source: source.key, status: 'success', labelsCount: inserted, fetchedBytes: body.length, metadata: { rejectedInvalid, deactivatedStale, sourceUrl: source.url } });
  return result;
}

async function main() {
  const only = process.argv.slice(2).map(s => s.trim()).filter(Boolean);
  const sources = only.length ? DEFAULT_SOURCES.filter(source => only.includes(source.key)) : DEFAULT_SOURCES;
  const results = [];
  for (const source of sources) {
    try {
      results.push(await ingestSource(source));
    } catch (err) {
      await recordRiskIngestionRun({ source: source.key, status: 'failed', error: err.message, metadata: { sourceUrl: source.url } });
      results.push({ source: source.key, error: err.message });
    }
  }
  const errors = results.filter(result => result.error);
  console.log(JSON.stringify({ success: errors.length === 0, results }, null, 2));
  await pool.end();
  if (errors.length && process.env.ALLOW_PARTIAL_SANCTIONS_INGESTION !== 'true') {
    throw new Error(`${errors.length} public sanctions source(s) failed: ${errors.map(e => e.source).join(', ')}`);
  }
}

main().catch(async (err) => {
  console.error('❌ Public sanctions ingestion failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
