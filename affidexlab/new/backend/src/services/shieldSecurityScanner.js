import { ethers } from 'ethers';
import pool from '../db/connection.js';
import { createShieldAlert } from './shieldActionEngine.js';

const RPC_URLS = {
  arbitrum: process.env.RPC_ARBITRUM,
  base: process.env.RPC_BASE,
  polygon: process.env.RPC_POLYGON,
  avalanche: process.env.RPC_AVALANCHE,
  optimism: process.env.RPC_OPTIMISM,
  ethereum: process.env.RPC_ETHEREUM,
};

const DOGFOOD_CONTRACTS = [
  { chain: 'arbitrum', address: '0xdBBDBDcF4B9fc8F85ae549078199ee3fb27cadB3', label: 'DecaFlow Router — Arbitrum' },
  { chain: 'base', address: '0x1E7b01f8D28e757B07887Ff6BF23e46BdE4e4Cbd', label: 'DecaFlow Router — Base' },
  { chain: 'polygon', address: '0x1E7b01f8D28e757B07887Ff6BF23e46BdE4e4Cbd', label: 'DecaFlow Router — Polygon' },
  { chain: 'avalanche', address: '0x41475aDeB1172905Dd1085FBe525e1A79487e49C', label: 'DecaFlow Router — Avalanche' },
];

const EVENT_RULES = [
  { type: 'ownership_change', severity: 'critical', signature: 'OwnershipTransferred(address,address)', message: 'Ownership transfer event detected on watched contract.' },
  { type: 'role_granted', severity: 'high', signature: 'RoleGranted(bytes32,address,address)', message: 'Privileged role granted on watched contract.' },
  { type: 'role_revoked', severity: 'medium', signature: 'RoleRevoked(bytes32,address,address)', message: 'Privileged role revoked on watched contract.' },
  { type: 'proxy_upgraded', severity: 'critical', signature: 'Upgraded(address)', message: 'Proxy implementation upgrade detected on watched contract.' },
  { type: 'proxy_admin_changed', severity: 'critical', signature: 'AdminChanged(address,address)', message: 'Proxy admin change detected on watched contract.' },
  { type: 'approval_spike', severity: 'medium', signature: 'Approval(address,address,uint256)', message: 'ERC-20 approval emitted by watched contract.' },
  { type: 'approval_for_all', severity: 'high', signature: 'ApprovalForAll(address,address,bool)', message: 'ERC-721/ERC-1155 operator approval emitted by watched contract.' },
  { type: 'asset_transfer', severity: 'medium', signature: 'Transfer(address,address,uint256)', message: 'Asset transfer emitted by watched contract.' },
];

function cleanAddress(address) {
  return String(address || '').trim().toLowerCase();
}

function cleanChain(chain) {
  return String(chain || '').trim().toLowerCase();
}

function topic(signature) {
  return ethers.id(signature);
}

function providerFor(chain) {
  const url = RPC_URLS[cleanChain(chain)];
  if (!url) return null;
  return new ethers.JsonRpcProvider(url);
}

async function loadContracts() {
  const { rows } = await pool.query(
    `SELECT sc.chain, sc.address, sc.label, cust.company_name
     FROM shield_contracts sc
     JOIN shield_customers cust ON cust.id = sc.customer_id
     WHERE sc.status = 'active' AND cust.status = 'active'`
  ).catch(() => ({ rows: [] }));

  const customerContracts = rows.map(r => ({ chain: r.chain, address: r.address, label: r.label || `${r.company_name} — contract` }));
  const byKey = new Map();
  for (const contract of [...DOGFOOD_CONTRACTS, ...customerContracts]) {
    if (!contract.chain || !contract.address) continue;
    byKey.set(`${cleanChain(contract.chain)}:${cleanAddress(contract.address)}`, {
      chain: cleanChain(contract.chain),
      address: cleanAddress(contract.address),
      label: contract.label || contract.address,
    });
  }
  return Array.from(byKey.values());
}

async function getCursor(chain, address, currentBlock, lookbackBlocks) {
  const { rows } = await pool.query(
    `SELECT last_block FROM shield_scan_cursors WHERE chain = $1 AND lower(address) = $2 AND scanner = 'security-events'`,
    [chain, address]
  );
  if (rows[0]) return Number(rows[0].last_block) + 1;
  return Math.max(0, currentBlock - Number(lookbackBlocks || process.env.SHIELD_SECURITY_SCAN_LOOKBACK_BLOCKS || 10));
}

async function setCursor(chain, address, blockNumber) {
  const update = await pool.query(
    `UPDATE shield_scan_cursors SET last_block = $3, updated_at = NOW()
     WHERE chain = $1 AND lower(address) = $2 AND scanner = 'security-events'`,
    [chain, address, blockNumber]
  );
  if (update.rowCount === 0) {
    await pool.query(
      `INSERT INTO shield_scan_cursors (chain, address, scanner, last_block)
       VALUES ($1, $2, 'security-events', $3)`,
      [chain, address, blockNumber]
    );
  }
}

async function loadAnomalyThreshold({ alertType, chain, address }) {
  const { rows } = await pool.query(
    `SELECT *
     FROM shield_anomaly_thresholds
     WHERE enabled = true
       AND alert_type = $1
       AND (chain IS NULL OR lower(chain) = lower($2))
       AND (address IS NULL OR lower(address) = lower($3))
     ORDER BY CASE WHEN address IS NOT NULL THEN 0 ELSE 1 END,
              CASE WHEN chain IS NOT NULL THEN 0 ELSE 1 END,
              threshold ASC
     LIMIT 1`,
    [alertType, chain, address]
  ).catch(() => ({ rows: [] }));
  return rows[0] || null;
}

async function checkCodeHash({ provider, chain, address, label, blockNumber }) {
  const code = await provider.getCode(address);
  const codeHash = ethers.keccak256(code === '0x' ? '0x' : code);
  const { rows } = await pool.query(
    `SELECT code_hash FROM shield_contract_state WHERE chain = $1 AND lower(address) = $2`,
    [chain, address]
  );
  const previous = rows[0]?.code_hash;
  const update = await pool.query(
    `UPDATE shield_contract_state SET code_hash = $3, block_number = $4, updated_at = NOW()
     WHERE chain = $1 AND lower(address) = $2`,
    [chain, address, codeHash, blockNumber]
  );
  if (update.rowCount === 0) {
    await pool.query(
      `INSERT INTO shield_contract_state (chain, address, code_hash, block_number)
       VALUES ($1, $2, $3, $4)`,
      [chain, address, codeHash, blockNumber]
    );
  }

  if (previous && previous !== codeHash) {
    await createShieldAlert({
      chain,
      address,
      label,
      severity: 'critical',
      alertType: 'codehash_changed',
      message: 'Runtime bytecode hash changed for watched contract. Confirm this is an authorized upgrade or redeployment.',
      metadata: { previousCodeHash: previous, currentCodeHash: codeHash, blockNumber }
    });
    return 1;
  }
  return 0;
}

async function scanContract(contract, options = {}) {
  const provider = providerFor(contract.chain);
  if (!provider) return { ...contract, skipped: true, reason: `RPC URL missing for ${contract.chain}` };

  const currentBlock = await provider.getBlockNumber();
  const maxRange = Math.max(1, Number(options.maxRange || process.env.SHIELD_SECURITY_SCAN_MAX_RANGE || 10));
  const fromBlock = await getCursor(contract.chain, contract.address, currentBlock, options.lookbackBlocks);
  const toBlock = Math.min(currentBlock, fromBlock + maxRange - 1);
  const alerts = [];
  let codeAlerts = await checkCodeHash({ provider, ...contract, blockNumber: currentBlock });

  for (const rule of EVENT_RULES) {
    const logs = await provider.getLogs({ address: contract.address, fromBlock, toBlock, topics: [topic(rule.signature)] });
    const threshold = await loadAnomalyThreshold({ alertType: rule.type, chain: contract.chain, address: contract.address });
    if (threshold && logs.length >= Number(threshold.threshold)) {
      const result = await createShieldAlert({
        chain: contract.chain,
        address: contract.address,
        label: contract.label,
        severity: threshold.severity || 'high',
        alertType: `${rule.type}_anomaly`,
        message: `${logs.length} ${rule.type.replace(/_/g, ' ')} events detected across blocks ${fromBlock}-${toBlock}, exceeding threshold ${threshold.threshold}.`,
        metadata: { fromBlock, toBlock, count: logs.length, threshold: threshold.threshold, windowBlocks: threshold.window_blocks, signature: rule.signature }
      });
      alerts.push(result.alert);
    }
    for (const log of logs) {
      const result = await createShieldAlert({
        chain: contract.chain,
        address: contract.address,
        label: contract.label,
        severity: rule.severity,
        alertType: rule.type,
        message: rule.message,
        txHash: log.transactionHash,
        metadata: { blockNumber: log.blockNumber, logIndex: log.index, signature: rule.signature, topics: log.topics, data: log.data }
      });
      alerts.push(result.alert);
    }
  }

  await setCursor(contract.chain, contract.address, toBlock);
  return { ...contract, fromBlock, toBlock, currentBlock, alertsCreated: alerts.length + codeAlerts };
}

export async function runShieldSecurityScan(options = {}) {
  const contracts = await loadContracts();
  const results = [];
  for (const contract of contracts) {
    try {
      results.push(await scanContract(contract, options));
    } catch (err) {
      results.push({ ...contract, error: err.message });
    }
  }
  return { scannedContracts: contracts.length, results };
}
