import crypto from 'crypto';
import { getAddress, keccak256 } from 'ethers';

/**
 * Checksum-validating address detection for risk-label ingestion.
 *
 * Why this exists: scanning big sanctions files (XML/CSV) with a loose regex produces strings that
 * merely *look* like wallet addresses (IDs, hashes, codes). Storing those as "sanctioned wallets"
 * would wrongly reject legitimate customers. Every candidate here must pass the chain's own
 * checksum / structure rules before it is accepted.
 *
 * Two entry points:
 *  - findAddressesInText(text): free-text scanning, high-specificity chains only
 *  - isValidAddress(chain, token): exact-token validation for dedicated per-chain lists
 *    (also supports Solana and XRP, which are too loose to scan in free text)
 */

const BTC_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const RIPPLE_ALPHABET = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
const B58 = '1-9A-HJ-NP-Za-km-z';

const alphabetMaps = new Map();
function alphabetMap(alphabet) {
  if (!alphabetMaps.has(alphabet)) {
    alphabetMaps.set(alphabet, new Map([...alphabet].map((ch, i) => [ch, BigInt(i)])));
  }
  return alphabetMaps.get(alphabet);
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest();
}

export function base58Decode(str, alphabet = BTC_ALPHABET) {
  if (!str) return null;
  const map = alphabetMap(alphabet);
  let num = 0n;
  for (const ch of str) {
    const v = map.get(ch);
    if (v === undefined) return null;
    num = num * 58n + v;
  }
  let hex = num.toString(16);
  if (hex.length % 2) hex = `0${hex}`;
  const body = num === 0n ? Buffer.alloc(0) : Buffer.from(hex, 'hex');
  let zeros = 0;
  while (zeros < str.length && str[zeros] === alphabet[0]) zeros += 1;
  return Buffer.concat([Buffer.alloc(zeros), body]);
}

/** Returns the payload (without the 4-byte double-SHA256 checksum) or null if the checksum fails. */
function base58Check(str, alphabet = BTC_ALPHABET) {
  const decoded = base58Decode(str, alphabet);
  if (!decoded || decoded.length < 5) return null;
  const payload = decoded.subarray(0, decoded.length - 4);
  const checksum = decoded.subarray(decoded.length - 4);
  const expected = sha256(sha256(payload)).subarray(0, 4);
  return checksum.equals(expected) ? payload : null;
}

// ---------- Bech32 / Bech32m (BIP-173 / BIP-350) ----------
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'; // 32 chars
const BECH32_GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
const BECH32_CONST = 1;
const BECH32M_CONST = 0x2bc830a3;

function bech32Polymod(values) {
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25;
    chk = (((chk & 0x1ffffff) << 5) ^ v) >>> 0;
    for (let i = 0; i < 5; i += 1) {
      if ((top >>> i) & 1) chk = (chk ^ BECH32_GEN[i]) >>> 0;
    }
  }
  return chk >>> 0;
}

function bech32HrpExpand(hrp) {
  const out = [];
  for (const c of hrp) out.push(c.charCodeAt(0) >> 5);
  out.push(0);
  for (const c of hrp) out.push(c.charCodeAt(0) & 31);
  return out;
}

function convertBits(data, from, to, pad) {
  let acc = 0;
  let bits = 0;
  const out = [];
  const maxv = (1 << to) - 1;
  const maxAcc = (1 << (from + to - 1)) - 1; // mask so long programs (e.g. 160-bit) do not overflow 32-bit ints
  for (const value of data) {
    if (value < 0 || (value >> from) !== 0) return null;
    acc = ((acc << from) | value) & maxAcc;
    bits += from;
    while (bits >= to) {
      bits -= to;
      out.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) out.push((acc << (to - bits)) & maxv);
  } else if (bits >= from || ((acc << (to - bits)) & maxv)) {
    return null;
  }
  return out;
}

function isValidSegwit(address, expectedHrp) {
  if (address.length < 14 || address.length > 90) return false;
  const lower = address.toLowerCase();
  if (address !== lower && address !== address.toUpperCase()) return false; // mixed case is invalid
  const sep = lower.lastIndexOf('1');
  if (sep < 1 || sep + 7 > lower.length) return false;
  const hrp = lower.slice(0, sep);
  if (hrp !== expectedHrp) return false;
  const data = [];
  for (const ch of lower.slice(sep + 1)) {
    const idx = BECH32_CHARSET.indexOf(ch);
    if (idx === -1) return false;
    data.push(idx);
  }
  const constant = bech32Polymod([...bech32HrpExpand(hrp), ...data]);
  if (constant !== BECH32_CONST && constant !== BECH32M_CONST) return false;
  const version = data[0];
  if (version > 16) return false;
  if (version === 0 && constant !== BECH32_CONST) return false;
  if (version !== 0 && constant !== BECH32M_CONST) return false;
  const program = convertBits(data.slice(1, -6), 5, 8, false);
  if (!program || program.length < 2 || program.length > 40) return false;
  if (version === 0 && program.length !== 20 && program.length !== 32) return false;
  return true;
}

// ---------- Chain validators ----------
const ZERO_EVM = /^0x0{40}$/;

export function isValidEvm(address) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address) || ZERO_EVM.test(address)) return false;
  const body = address.slice(2);
  if (body === body.toLowerCase() || body === body.toUpperCase()) return true; // no checksum casing to verify
  try {
    getAddress(address); // mixed case => EIP-55 checksum must match
    return true;
  } catch {
    return false;
  }
}

export function isValidBitcoin(address) {
  if (/^[13]/.test(address)) {
    const p = base58Check(address);
    // 0x00 = P2PKH ('1…'), 0x05 = P2SH ('3…'). Legacy Litecoin '3…' P2SH is intentionally treated as Bitcoin.
    return !!p && p.length === 21 && (p[0] === 0x00 || p[0] === 0x05);
  }
  return isValidSegwit(address, 'bc');
}

export function isValidLitecoin(address) {
  if (/^[LM]/.test(address)) {
    const p = base58Check(address);
    return !!p && p.length === 21 && (p[0] === 0x30 || p[0] === 0x32);
  }
  return isValidSegwit(address, 'ltc');
}

export function isValidDash(address) {
  const p = base58Check(address);
  return !!p && p.length === 21 && (p[0] === 0x4c || p[0] === 0x10);
}

export function isValidZcashTransparent(address) {
  const p = base58Check(address);
  return !!p && p.length === 22 && p[0] === 0x1c && (p[1] === 0xb8 || p[1] === 0xbd);
}

export function isValidTron(address) {
  if (!/^T/.test(address)) return false;
  const p = base58Check(address);
  return !!p && p.length === 21 && p[0] === 0x41;
}

export function isValidRipple(address) {
  if (!/^r/.test(address)) return false;
  const p = base58Check(address, RIPPLE_ALPHABET);
  return !!p && p.length === 21 && p[0] === 0x00;
}

export function isValidSolana(address) {
  if (address.length < 32 || address.length > 44) return false;
  const bytes = base58Decode(address);
  return !!bytes && bytes.length === 32; // no checksum exists; length check only. Use for dedicated lists, never free text.
}

const MONERO_BLOCK_BYTES = { 0: 0, 2: 1, 3: 2, 5: 3, 6: 4, 7: 5, 9: 6, 10: 7, 11: 8 };

function moneroDecode(address) {
  const out = [];
  const fullBlocks = Math.floor(address.length / 11);
  const lastLen = address.length % 11;
  if (!(lastLen in MONERO_BLOCK_BYTES)) return null;
  const decodeBlock = (chars, bytes) => {
    const map = alphabetMap(BTC_ALPHABET);
    let num = 0n;
    for (const ch of chars) {
      const v = map.get(ch);
      if (v === undefined) return null;
      num = num * 58n + v;
    }
    if (num >= 1n << BigInt(8 * bytes)) return null; // does not fit in the block
    const block = Buffer.alloc(bytes);
    for (let i = bytes - 1; i >= 0; i -= 1) {
      block[i] = Number(num & 0xffn);
      num >>= 8n;
    }
    return block;
  };
  for (let i = 0; i < fullBlocks; i += 1) {
    const block = decodeBlock(address.slice(i * 11, i * 11 + 11), 8);
    if (!block) return null;
    out.push(block);
  }
  if (lastLen) {
    const block = decodeBlock(address.slice(fullBlocks * 11), MONERO_BLOCK_BYTES[lastLen]);
    if (!block) return null;
    out.push(block);
  }
  return Buffer.concat(out);
}

export function isValidMonero(address) {
  if (address.length !== 95 && address.length !== 106) return false;
  const data = moneroDecode(address);
  if (!data || data.length < 69) return false;
  const body = data.subarray(0, data.length - 4);
  const checksum = data.subarray(data.length - 4);
  const expected = Buffer.from(keccak256(body).slice(2), 'hex').subarray(0, 4);
  if (!checksum.equals(expected)) return false;
  // 18 = standard, 19 = integrated, 42 = subaddress (mainnet)
  return [0x12, 0x13, 0x2a].includes(body[0]);
}

const VALIDATORS = {
  ethereum: isValidEvm,
  bitcoin: isValidBitcoin,
  litecoin: isValidLitecoin,
  dash: isValidDash,
  zcash: isValidZcashTransparent,
  tron: isValidTron,
  monero: isValidMonero,
  ripple: isValidRipple,
  solana: isValidSolana,
};

// Every EVM network shares the 0x address format and validation.
export const EVM_CHAINS = new Set([
  'ethereum', 'arbitrum', 'base', 'optimism', 'polygon', 'avalanche', 'bsc', 'bnb', 'gnosis', 'linea', 'scroll', 'zksync', 'fantom', 'celo', 'mantle', 'blast',
]);

export function isEvmChain(chain) {
  return EVM_CHAINS.has(String(chain || '').toLowerCase());
}

/** Exact-token validation for a known chain. Unknown chains return false (never guess). */
export function isValidAddress(chain, token) {
  const c = String(chain || '').toLowerCase();
  const value = String(token || '').trim();
  if (!value) return false;
  const validator = isEvmChain(c) ? isValidEvm : VALIDATORS[c];
  return validator ? validator(value) : false;
}

/**
 * Finds which chain a single token is valid on (high-specificity chains only).
 * Used to re-file an address that a third-party list put under the wrong chain bucket.
 */
export function detectChain(token) {
  const value = String(token || '').trim();
  for (const chain of ['tron', 'bitcoin', 'litecoin', 'dash', 'zcash', 'monero', 'ethereum']) {
    if (VALIDATORS[chain](value)) return chain;
  }
  return null;
}

// ---------- Free-text scanning (high-specificity chains only) ----------
const SCAN_PATTERNS = [
  { chain: 'ethereum', regex: /\b0x[a-fA-F0-9]{40}\b/g, validate: isValidEvm },
  { chain: 'bitcoin', regex: new RegExp(`\\b[13][${B58}]{25,34}\\b`, 'g'), validate: isValidBitcoin },
  { chain: 'bitcoin', regex: /\bbc1[ac-hj-np-z02-9]{6,87}\b/gi, validate: isValidBitcoin },
  { chain: 'litecoin', regex: new RegExp(`\\b[LM][${B58}]{25,34}\\b`, 'g'), validate: isValidLitecoin },
  { chain: 'litecoin', regex: /\bltc1[ac-hj-np-z02-9]{6,87}\b/gi, validate: isValidLitecoin },
  { chain: 'dash', regex: new RegExp(`\\b[X7][${B58}]{33}\\b`, 'g'), validate: isValidDash },
  { chain: 'zcash', regex: new RegExp(`\\bt[13][${B58}]{33}\\b`, 'g'), validate: isValidZcashTransparent },
  { chain: 'tron', regex: new RegExp(`\\bT[${B58}]{33}\\b`, 'g'), validate: isValidTron },
  { chain: 'monero', regex: new RegExp(`\\b[48][${B58}]{94}\\b`, 'g'), validate: isValidMonero },
  { chain: 'monero', regex: new RegExp(`\\b4[${B58}]{105}\\b`, 'g'), validate: isValidMonero },
];

/**
 * Finds checksum-valid addresses in free text.
 * Returns [{ chain, address, index }]; if `stats` is passed, it is filled with { candidates, rejected }.
 */
export function findAddressesInText(text, stats = null) {
  const body = String(text || '');
  const found = [];
  const seen = new Set();
  let candidates = 0;
  let rejected = 0;
  for (const { chain, regex, validate } of SCAN_PATTERNS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(body))) {
      candidates += 1;
      const address = match[0];
      if (!validate(address)) {
        rejected += 1;
        continue;
      }
      const key = `${chain}:${chain === 'ethereum' ? address.toLowerCase() : address}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({ chain, address, index: match.index });
    }
  }
  if (stats) {
    stats.candidates = candidates;
    stats.rejected = rejected;
  }
  return found;
}
