import pool from '../db/connection.js';
import { addRiskLabel } from './internalRiskEngine.js';
import { recordRiskIngestionRun } from './riskCoverageService.js';
import { isEvmChain, isValidAddress, isValidEvm, detectChain } from './cryptoAddressValidation.js';

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

// Public mirror of the US Treasury OFAC SDN list's digital-currency addresses, split per currency (MIT licence,
// https://github.com/0xB10C/ofac-sanctioned-digital-currency-addresses). Same underlying data as our direct OFAC
// ingestion, so this adds chain coverage and a second path to the data, not an independent authority.
// Marked optional: a third-party repo outage must warn, not fail the whole ingestion pipeline.
const OFAC_MIRROR_BASE = 'https://raw.githubusercontent.com/0xB10C/ofac-sanctioned-digital-currency-addresses/lists/sanctioned_addresses_';
const OFAC_MIRROR_CHAINS = {
  XBT: 'bitcoin', ETH: 'ethereum', ARB: 'arbitrum', BSC: 'bsc', LTC: 'litecoin', DASH: 'dash',
  ZEC: 'zcash', TRX: 'tron', XMR: 'monero', SOL: 'solana', XRP: 'ripple',
};

const OFAC_MIRROR_FEEDS = Object.entries(OFAC_MIRROR_CHAINS).map(([code, chain]) => ({
  name: `ofac-mirror-${code.toLowerCase()}`,
  url: `${OFAC_MIRROR_BASE}${code}.txt`,
  category: 'sanctions',
  severity: 'critical',
  confidence: 0.97,
  chain,
  strict: true, // one address per token, validated per chain; strays are re-filed by detected chain
  optional: true,
  labelText: `OFAC SDN (public mirror) ${code} address`,
}));

const EVM_ADDRESS_RE = /\b0x[a-fA-F0-9]{40}\b/g;
const TOKEN_SPLIT_RE = /[\s,;"'[\]{}()<>]+/;

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
  const mirror = process.env.DECAFLOW_DISABLE_OFAC_MIRROR === 'true' ? [] : OFAC_MIRROR_FEEDS;
  return [...DEFAULT_PUBLIC_FEEDS, ...mirror, ...extraUrls];
}

function walkStrings(value, visit) {
  if (value == null) return;
  if (typeof value === 'string') return visit(value);
  if (Array.isArray(value)) {
    for (const item of value) walkStrings(item, visit);
    return;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) walkStrings(item, visit);
  }
}

/** Returns { entries: [{ chain, address }], rejected } — only checksum/structure-valid addresses. */
export function extractFeedAddresses(value, feed) {
  const entries = new Map();
  let rejected = 0;
  const add = (chain, address) => {
    const key = `${chain}:${isEvmChain(chain) ? address.toLowerCase() : address}`;
    if (!entries.has(key)) entries.set(key, { chain, address: isEvmChain(chain) ? address.toLowerCase() : address });
  };

  walkStrings(value, (text) => {
    if (feed.strict) {
      for (const token of text.split(TOKEN_SPLIT_RE)) {
        if (!token) continue;
        if (isValidAddress(feed.chain, token)) {
          add(feed.chain, token);
          continue;
        }
        const detected = detectChain(token); // e.g. a Tron address filed under the Bitcoin list
        if (detected) add(detected, token);
        else if (token.length >= 20) rejected += 1;
      }
      return;
    }
    // Free-form feed (JSON blobs, lists): EVM addresses only, EIP-55 validated.
    for (const match of text.match(EVM_ADDRESS_RE) || []) {
      if (isValidEvm(match)) add(feed.chain, match);
      else rejected += 1;
    }
  });
  return { entries: Array.from(entries.values()), rejected };
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
      const dbNow = (await pool.query('SELECT NOW() AS now')).rows[0].now;
      const { parsed, bytes } = await fetchJson(feed.url);
      const { entries, rejected } = extractFeedAddresses(parsed, feed);
      let labels = 0;
      for (const { chain, address } of entries.slice(0, maxPerFeed)) {
        await addRiskLabel({
          chain,
          address,
          category: feed.category,
          label: feed.labelText || `${feed.name} address`,
          severity: feed.severity,
          confidence: feed.confidence,
          source: feed.name,
          evidence: feed.url,
          metadata: { feedUrl: feed.url, startedAt, validated: 'checksum' },
        });
        labels += 1;
      }

      // Remove labels this source no longer lists (de-listed / previously stored look-alikes).
      // Skipped when nothing valid was found so a bad download can never wipe a source.
      let deactivatedStale = 0;
      if (labels > 0) {
        const stale = await pool.query(
          `UPDATE risk_address_labels
           SET active = false, updated_at = NOW(),
               metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('deactivatedReason', 'not_in_latest_source_snapshot')
           WHERE source = $1 AND active = true AND updated_at < $2`,
          [feed.name, dbNow]
        );
        deactivatedStale = stale.rowCount;
      }

      await recordRiskIngestionRun({
        source: feed.name, status: 'success', labelsCount: labels, fetchedBytes: bytes,
        metadata: { feedUrl: feed.url, rejectedInvalid: rejected, deactivatedStale },
      });
      results.push({ source: feed.name, success: true, fetchedBytes: bytes, labels, rejectedInvalid: rejected, deactivatedStale });
    } catch (err) {
      await recordRiskIngestionRun({ source: feed.name, status: 'failed', error: err.message, metadata: { feedUrl: feed.url, optional: !!feed.optional } });
      if (feed.optional) {
        console.log(`::warning title=Optional risk feed failed::${feed.name}: ${err.message}`);
      }
      results.push({ source: feed.name, success: false, optional: !!feed.optional, error: err.message });
    }
  }

  const failed = results.filter(r => !r.success && !r.optional);
  const optionalFailed = results.filter(r => !r.success && r.optional);
  if (failed.length && process.env.ALLOW_PARTIAL_PUBLIC_RISK_INGESTION !== 'true') {
    const error = new Error(`Public risk feed ingestion failed for ${failed.map(r => r.source).join(', ')}`);
    error.results = results;
    throw error;
  }
  return { success: failed.length === 0, optionalFailures: optionalFailed.map(r => r.source), results };
}
