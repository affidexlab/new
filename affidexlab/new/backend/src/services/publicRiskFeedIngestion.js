import { addRiskLabel } from './internalRiskEngine.js';
import { recordRiskIngestionRun } from './riskCoverageService.js';

const DEFAULT_PUBLIC_FEEDS = [
  {
    name: 'scamsniffer-address-blacklist',
    url: 'https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/address.json',
    category: 'scam',
    severity: 'high',
    confidence: 0.82,
    chain: 'ethereum',
  },
  {
    name: 'myetherwallet-address-darklist',
    url: 'https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/addresses/addresses-darklist.json',
    category: 'phishing',
    severity: 'high',
    confidence: 0.78,
    chain: 'ethereum',
  },
];

const ADDRESS_RE = /\b0x[a-fA-F0-9]{40}\b/g;

function configuredFeeds() {
  const extraUrls = String(process.env.DECAFLOW_PUBLIC_RISK_FEED_URLS || '')
    .split(',')
    .map(url => url.trim())
    .filter(Boolean)
    .map((url, idx) => ({
      name: `decaflow-configured-feed-${idx + 1}`,
      url,
      category: process.env.DECAFLOW_PUBLIC_RISK_FEED_CATEGORY || 'scam',
      severity: process.env.DECAFLOW_PUBLIC_RISK_FEED_SEVERITY || 'high',
      confidence: Number(process.env.DECAFLOW_PUBLIC_RISK_FEED_CONFIDENCE || 0.75),
      chain: process.env.DECAFLOW_PUBLIC_RISK_FEED_CHAIN || 'ethereum',
    }));
  return [...DEFAULT_PUBLIC_FEEDS, ...extraUrls];
}

function extractAddresses(value, out = new Set()) {
  if (value == null) return out;
  if (typeof value === 'string') {
    for (const match of value.match(ADDRESS_RE) || []) out.add(match.toLowerCase());
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) extractAddresses(item, out);
    return out;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) extractAddresses(item, out);
  }
  return out;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'DecaFlowRiskIngestion/1.0' } });
  if (!response.ok) throw new Error(`Feed returned ${response.status}`);
  const text = await response.text();
  try {
    return { parsed: JSON.parse(text), bytes: Buffer.byteLength(text) };
  } catch {
    return { parsed: text, bytes: Buffer.byteLength(text) };
  }
}

export async function ingestPublicRiskFeeds() {
  const maxPerFeed = Number(process.env.DECAFLOW_PUBLIC_RISK_FEED_MAX_LABELS || 50000);
  const results = [];

  for (const feed of configuredFeeds()) {
    const startedAt = new Date().toISOString();
    try {
      const { parsed, bytes } = await fetchJson(feed.url);
      const addresses = Array.from(extractAddresses(parsed)).slice(0, maxPerFeed);
      let labels = 0;
      for (const address of addresses) {
        await addRiskLabel({
          chain: feed.chain,
          address,
          category: feed.category,
          label: `${feed.name} address`,
          severity: feed.severity,
          confidence: feed.confidence,
          source: feed.name,
          evidence: feed.url,
          metadata: { feedUrl: feed.url, startedAt },
        });
        labels += 1;
      }
      await recordRiskIngestionRun({ source: feed.name, status: 'success', labelsCount: labels, fetchedBytes: bytes, metadata: { feedUrl: feed.url } });
      results.push({ source: feed.name, success: true, fetchedBytes: bytes, labels });
    } catch (err) {
      await recordRiskIngestionRun({ source: feed.name, status: 'failed', error: err.message, metadata: { feedUrl: feed.url } });
      results.push({ source: feed.name, success: false, error: err.message });
    }
  }

  const failed = results.filter(r => !r.success);
  if (failed.length && process.env.ALLOW_PARTIAL_PUBLIC_RISK_INGESTION !== 'true') {
    const error = new Error(`Public risk feed ingestion failed for ${failed.map(r => r.source).join(', ')}`);
    error.results = results;
    throw error;
  }
  return { success: failed.length === 0, results };
}
