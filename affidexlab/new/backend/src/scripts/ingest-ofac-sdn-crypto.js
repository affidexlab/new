import pool from '../db/connection.js';
import { addRiskLabel } from '../services/internalRiskEngine.js';

const OFAC_SDN_XML_URL = process.env.OFAC_SDN_XML_URL || 'https://www.treasury.gov/ofac/downloads/sdn.xml';

function chainForAddress(address, currency = '') {
  const c = String(currency || '').toUpperCase();
  if (/^0x[a-fA-F0-9]{40}$/.test(address) || c.includes('ETH')) return 'ethereum';
  if (c.includes('XBT') || c.includes('BTC')) return 'bitcoin';
  if (c.includes('TRX') || c.includes('TRON')) return 'tron';
  if (c.includes('LTC')) return 'litecoin';
  if (c.includes('ZEC')) return 'zcash';
  if (c.includes('DASH')) return 'dash';
  if (c.includes('XMR')) return 'monero';
  return 'unknown';
}

function stripXml(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractNames(entryXml) {
  const first = /<firstName>([\s\S]*?)<\/firstName>/i.exec(entryXml)?.[1] || '';
  const last = /<lastName>([\s\S]*?)<\/lastName>/i.exec(entryXml)?.[1] || '';
  const title = /<title>([\s\S]*?)<\/title>/i.exec(entryXml)?.[1] || '';
  return stripXml(`${first} ${last} ${title}`) || 'OFAC SDN listed entity';
}

function buildLabel({ name, currency, address, evidence }) {
  return {
    chain: chainForAddress(address, currency),
    address,
    category: 'sanctions',
    label: `OFAC SDN: ${name}`,
    severity: 'critical',
    confidence: 1,
    source: 'ofac-sdn',
    evidence,
    metadata: { currency, name }
  };
}

function extractDigitalCurrencyAddresses(xml) {
  const entries = xml.match(/<sdnEntry>[\s\S]*?<\/sdnEntry>/gi) || [];
  const labels = [];
  const seen = new Set();
  for (const entry of entries) {
    const name = extractNames(entry);
    const remarks = stripXml(/<remarks>([\s\S]*?)<\/remarks>/i.exec(entry)?.[1] || '');

    const remarksRegex = /Digital Currency Address\s*-\s*([A-Z0-9]+)\s+([^;\]<\s]+)/gi;
    let remarksMatch;
    while ((remarksMatch = remarksRegex.exec(remarks))) {
      const currency = remarksMatch[1];
      const address = remarksMatch[2].replace(/[.,)]$/, '');
      const key = `${currency}:${address}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      labels.push(buildLabel({ name, currency, address, evidence: `${currency} digital currency address in OFAC SDN remarks` }));
    }

    const ids = entry.match(/<id>[\s\S]*?<\/id>/gi) || [];
    for (const id of ids) {
      const idType = stripXml(/<idType>([\s\S]*?)<\/idType>/i.exec(id)?.[1] || '');
      if (!/^Digital Currency Address\s*-/i.test(idType)) continue;
      const currency = idType.split('-').slice(1).join('-').trim();
      const address = stripXml(/<idNumber>([\s\S]*?)<\/idNumber>/i.exec(id)?.[1] || '').replace(/[.,)]$/, '');
      if (!address) continue;
      const key = `${currency}:${address}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      labels.push(buildLabel({ name, currency, address, evidence: `${currency} digital currency address in OFAC SDN idList` }));
    }
  }
  return labels;
}

async function main() {
  const res = await fetch(OFAC_SDN_XML_URL);
  if (!res.ok) throw new Error(`OFAC SDN fetch failed: ${res.status}`);
  const xml = await res.text();
  const labels = extractDigitalCurrencyAddresses(xml);
  let count = 0;
  for (const label of labels) {
    await addRiskLabel(label);
    count += 1;
  }
  console.log(`✅ Ingested ${count} OFAC SDN digital currency labels`);
  if (count === 0) throw new Error('OFAC SDN ingestion found zero digital currency labels; parser/source likely needs review.');
  await pool.end();
}

main().catch(async (err) => {
  console.error('❌ OFAC ingestion failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
