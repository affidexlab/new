import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getAddress } from 'ethers';
import { isValidAddress, findAddressesInText, detectChain } from '../src/services/cryptoAddressValidation.js';

const { addresses: VALID } = JSON.parse(
  fs.readFileSync(new URL('./fixtures/real-addresses.json', import.meta.url), 'utf8')
);

// BIP-173 / BIP-350 reference vectors
const BIP_VECTORS = [
  'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4',
  'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
  'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0',
];

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const RIPPLE = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function corrupt(address, alphabet) {
  const i = Math.floor(address.length / 2);
  const next = alphabet[(alphabet.indexOf(address[i]) + 1) % alphabet.length];
  return address.slice(0, i) + next + address.slice(i + 1);
}

test('accepts real addresses for every supported chain', () => {
  for (const [chain, list] of Object.entries(VALID)) {
    for (const address of list) assert.equal(isValidAddress(chain, address), true, `${chain} ${address}`);
  }
  for (const address of BIP_VECTORS) assert.equal(isValidAddress('bitcoin', address), true, address);
});

test('rejects a single-character corruption of every checksummed address', () => {
  for (const chain of ['bitcoin', 'litecoin', 'dash', 'zcash', 'tron', 'monero', 'ripple']) {
    for (const address of VALID[chain]) {
      const alphabet = chain === 'ripple' ? RIPPLE : /^(bc1|ltc1)/i.test(address) ? BECH32 : B58;
      const bad = corrupt(address, alphabet);
      assert.equal(isValidAddress(chain, bad), false, `${chain} ${bad}`);
    }
  }
  assert.equal(isValidAddress('bitcoin', corrupt(BIP_VECTORS[1], BECH32)), false);
});

test('EVM: lowercase accepted, wrong EIP-55 casing rejected, zero address rejected', () => {
  const lower = VALID.ethereum[0].toLowerCase();
  assert.equal(isValidAddress('ethereum', lower), true);
  assert.equal(isValidAddress('base', lower), true);
  const checksummed = getAddress(lower);
  assert.equal(isValidAddress('ethereum', checksummed), true);
  const pos = 2 + [...checksummed.slice(2)].findIndex(c => /[a-f]/i.test(c));
  const ch = checksummed[pos];
  const flipped = checksummed.slice(0, pos) + (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()) + checksummed.slice(pos + 1);
  assert.equal(isValidAddress('ethereum', flipped), false);
  assert.equal(isValidAddress('ethereum', `0x${'0'.repeat(40)}`), false);
});

test('rejects things that merely look like addresses', () => {
  assert.equal(isValidAddress('bitcoin', '1234567890123456789012345678'), false);
  assert.equal(isValidAddress('tron', `T${'1'.repeat(33)}`), false);
  assert.equal(isValidAddress('monero', '5be5543ff73456ab9f2d207887e2af87322c651ea1a873c5b25b7ffae456c320'), false);
  assert.equal(isValidAddress('unknown-chain', VALID.ethereum[0]), false);
  assert.equal(isValidAddress('bitcoin', ''), false);
});

test('free-text scan finds real addresses in XML-like text and ignores look-alikes', () => {
  const text = `<entry id="1234567890123456789012345678"><wallet>${VALID.bitcoin[0]}</wallet>`
    + `<note>ref T${'1'.repeat(33)} hash 5be5543ff73456ab9f2d207887e2af87322c651ea1a873c5b25b7ffae456c320</note>`
    + `<wallet>${VALID.tron[0]}</wallet><wallet>${VALID.ethereum[0]}</wallet><wallet>${VALID.ethereum[0]}</wallet></entry>`;
  const stats = {};
  const found = findAddressesInText(text, stats);
  assert.deepEqual(found.map(f => f.chain).sort(), ['bitcoin', 'ethereum', 'tron']);
  assert.ok(stats.rejected >= 1);
});

test('detectChain re-files an address listed under the wrong chain bucket', () => {
  assert.equal(detectChain(VALID.tron[0]), 'tron');
  assert.equal(detectChain(VALID.bitcoin[0]), 'bitcoin');
  assert.equal(detectChain('not-an-address'), null);
});
