import pool from '../db/connection.js';
import { addRiskLabel } from '../services/internalRiskEngine.js';

const OFAC_SDN_XML_URL = process.env.OFAC_SDN_XML_URL || 'https://www.treasury.gov/ofac/downloads/sdn.xml';

function chainForAddress(address, currency = '') {
  const c = String(currency || '').toUpperCase();
  if (/^0x[a-fA-F0-9]{40}$/.test(address) || c.includes('ETH')) return 'ethereum';
  if (c.includes('XBT') || c.includes('BTC')) return 'bitcoin';
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

function extractDigitalCurrencyAddresses(xml) {
  const entries = xml.match(/<sdnEntry>[\s\S]*?<\/sdnEntry>/gi) || [];
  const labels = [];
  for (const entry of entries) {
    const name = extractNames(entry);
    const remarks = stripXml(/<remarks>([\s\S]*?)<\/remarks>/i.exec(entry)?.[1] || '');
    const regex = /Digital Currency Address\s*-\s*([A-Z0-9]+)\s+([^;\]<\s]+)/gi;
    let match;
    while ((match = regex.exec(remarks))) {
      const currency = match[1];
      const address = match[2].replace(/[.,)]$/, '');
      labels.push({
        chain: chainForAddress(address, currency),
        address,
        category: 'sanctions',
        label: `OFAC SDN: ${name}`,
        severity: 'critical',
        confidence: 1,
        source: 'ofac-sdn',
        evidence: `${currency} digital currency address in OFAC SDN remarks`,
        metadata: { currency, name }
      });
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
  await pool.end();
}

main().catch(async (err) => {
  console.error('❌ OFAC ingestion failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
