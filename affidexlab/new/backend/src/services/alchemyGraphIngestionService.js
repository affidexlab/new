import { addRiskEdge } from './internalRiskEngine.js';

const ALCHEMY_NETWORKS = {
  ethereum: 'eth-mainnet',
  base: 'base-mainnet',
  arbitrum: 'arb-mainnet',
  polygon: 'polygon-mainnet',
  avalanche: 'avax-mainnet',
  optimism: 'opt-mainnet'
};

function normalizeChain(chain = 'ethereum') {
  return String(chain || 'ethereum').toLowerCase();
}

function alchemyUrl(chain) {
  const network = ALCHEMY_NETWORKS[normalizeChain(chain)];
  if (!network) throw new Error(`Unsupported Alchemy chain: ${chain}`);
  const key = process.env.ALCHEMY_API_KEY || process.env[`ALCHEMY_API_KEY_${normalizeChain(chain).toUpperCase()}`];
  if (!key) throw new Error(`Alchemy API key not configured for ${chain}`);
  return `https://${network}.g.alchemy.com/v2/${key}`;
}

function hexToNumber(hex) {
  if (!hex) return null;
  try { return Number.parseInt(hex, 16); } catch { return null; }
}

export async function ingestAlchemyTransfers({ chain = 'ethereum', fromBlock = '0x0', toBlock = 'latest', address = null, maxPages = 5 }) {
  const url = alchemyUrl(chain);
  const network = normalizeChain(chain);
  let pageKey = null;
  let inserted = 0;
  let pages = 0;

  do {
    const params = [{
      fromBlock,
      toBlock,
      category: ['external', 'erc20', 'erc721', 'erc1155'],
      withMetadata: true,
      excludeZeroValue: false,
      maxCount: '0x3e8',
      ...(address ? { toAddress: address } : {}),
      ...(pageKey ? { pageKey } : {})
    }];

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'alchemy_getAssetTransfers', params })
    });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error(body.error?.message || `Alchemy transfer fetch failed: ${res.status}`);

    for (const tx of body.result?.transfers || []) {
      if (!tx.from || !tx.to) continue;
      await addRiskEdge({
        chain: network,
        fromAddress: tx.from,
        toAddress: tx.to,
        txHash: tx.hash,
        blockNumber: hexToNumber(tx.blockNum),
        valueWei: tx.rawContract?.value ? BigInt(tx.rawContract.value).toString() : null,
        valueUsd: tx.value || null,
        tokenAddress: tx.rawContract?.address || null,
        source: 'alchemy-transfers',
        metadata: { category: tx.category, asset: tx.asset, uniqueId: tx.uniqueId, metadata: tx.metadata }
      });
      inserted += 1;
    }

    pageKey = body.result?.pageKey || null;
    pages += 1;
  } while (pageKey && pages < Number(maxPages));

  return { chain: network, inserted, pages, hasMore: Boolean(pageKey) };
}

export async function ingestAlchemyWebhookActivity({ chain = 'ethereum', activity = [], source = 'alchemy-webhook' }) {
  const network = normalizeChain(chain);
  let inserted = 0;
  for (const item of activity) {
    const from = item.fromAddress || item.from || item.from_address;
    const to = item.toAddress || item.to || item.to_address;
    if (!from || !to) continue;
    await addRiskEdge({
      chain: item.network || network,
      fromAddress: from,
      toAddress: to,
      txHash: item.hash || item.txHash || item.transactionHash,
      blockNumber: item.blockNum ? hexToNumber(item.blockNum) : item.blockNumber || null,
      valueWei: item.rawContract?.rawValue || item.rawContract?.value || null,
      valueUsd: item.value || null,
      tokenAddress: item.rawContract?.address || item.assetContractAddress || null,
      source,
      metadata: item
    });
    inserted += 1;
  }
  return { chain: network, inserted };
}
