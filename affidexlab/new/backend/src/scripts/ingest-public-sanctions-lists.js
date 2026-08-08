import pool from '../db/connection.js';
import { addRiskLabel } from '../services/internalRiskEngine.js';

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
    key: 'uk-hmt-consolidated',
    category: 'sanctions',
    severity: 'critical',
    confidence: 0.95,
    url: process.env.UK_HMT_CONSOLIDATED_SANCTIONS_URL || 'https://ofsistorage.blob.core.windows.net/publishlive/2022format/ConList.csv',
    labelPrefix: 'UK OFSI/HMT Consolidated Sanctions'
  }
];

const ADDRESS_PATTERNS = [
  { chain: 'ethereum', regex: /\b0x[a-fA-F0-9]{40}\b/g },
  { chain: 'bitcoin', regex: /\b(?:bc1[ac-hj-np-z02-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g },
  { chain: 'litecoin', regex: /\b(?:ltc1[ac-hj-np-z02-9]{11,71}|[LM3][a-km-zA-HJ-NP-Z1-9]{26,33})\b/g },
  { chain: 'zcash', regex: /\bt1[a-km-zA-HJ-NP-Z1-9]{33}\b/g },
  { chain: 'dash', regex: /\bX[1-9A-HJ-NP-Za-km-z]{33}\b/g },
  { chain: 'monero', regex: /\b4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}\b/g }
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

function extractAddresses(source, body) {
  const labels = [];
  const seen = new Set();
  for (const pattern of ADDRESS_PATTERNS) {
    let match;
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(body))) {
      const address = match[0];
      const key = `${pattern.chain}:${address.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const context = nearbyText(body, match.index);
      labels.push({
        chain: pattern.chain,
        address,
        category: source.category,
        label: `${source.labelPrefix}: ${extractName(context, 'listed entity')}`.slice(0, 255),
        severity: source.severity,
        confidence: source.confidence,
        source: source.key,
        evidence: context || `${source.labelPrefix} source contained this digital-asset address`,
        metadata: { sourceUrl: source.url, sourceKey: source.key }
      });
    }
  }
  return labels;
}

async function fetchSource(source) {
  const res = await fetch(source.url, { headers: { 'User-Agent': 'DecaFlowRiskIngestion/1.0' } });
  if (!res.ok) throw new Error(`${source.key} fetch failed: ${res.status}`);
  return res.text();
}

async function ingestSource(source) {
  const body = await fetchSource(source);
  const labels = extractAddresses(source, body);
  let inserted = 0;
  for (const label of labels) {
    await addRiskLabel(label);
    inserted += 1;
  }
  return { source: source.key, fetchedBytes: body.length, labels: inserted };
}

async function main() {
  const only = process.argv.slice(2).map(s => s.trim()).filter(Boolean);
  const sources = only.length ? DEFAULT_SOURCES.filter(source => only.includes(source.key)) : DEFAULT_SOURCES;
  const results = [];
  for (const source of sources) {
    try {
      results.push(await ingestSource(source));
    } catch (err) {
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
