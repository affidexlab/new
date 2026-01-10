import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';

const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';

const FALLBACK_SOLANA_RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.rpc.extrnode.com',
  'https://solana.public-rpc.com',
];

async function retryRpcCall(fn, maxRetries = 5, delayMs = 800) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();
      if (i > 0) {
        console.log(`✅ RPC call succeeded on attempt ${i + 1}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️  RPC call failed (attempt ${i + 1}/${maxRetries}):`, error?.message || error);
      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(1.5, i);
        console.log(`   Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error(`❌ RPC call failed after ${maxRetries} attempts`);
  throw lastError;
}

async function testFallbackRPCs() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING ALL RPC ENDPOINTS');
  console.log('='.repeat(80) + '\n');

  const privateKeyString = '4X6LckQt3iGAFaMqsbjkMsNRwiSUAK3SpkxTmNGdN7xhEhhUS2e8jpU9kVQBurxxoAdEHEduR3EZV894ayfpWbLk';
  const privateKeyBytes = bs58.decode(privateKeyString);
  const keypair = Keypair.fromSecretKey(privateKeyBytes);
  const wallet = keypair.publicKey;
  const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);

  console.log('Wallet:', wallet.toString());
  console.log('VDM Token:', VDM_TOKEN_ADDRESS);
  console.log('\n');

  for (const rpcUrl of FALLBACK_SOLANA_RPC_URLS) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🌐 Testing RPC: ${rpcUrl}`);
    console.log('='.repeat(80));

    try {
      const connection = new Connection(rpcUrl, 'confirmed');

      // Test 1: Connection health
      console.log('\n[1/3] Testing connection health...');
      const startHealth = Date.now();
      try {
        await retryRpcCall(() => connection.getLatestBlockhash('processed'), 2);
        const healthTime = Date.now() - startHealth;
        console.log(`   ✅ Connection healthy (${healthTime}ms)`);
      } catch (e) {
        console.log(`   ❌ Connection failed: ${e.message}`);
        continue;
      }

      // Test 2: Get VDM mint info
      console.log('\n[2/3] Checking VDM token mint...');
      const startMint = Date.now();
      try {
        const mintInfo = await retryRpcCall(() => connection.getAccountInfo(vdmMint));
        const mintTime = Date.now() - startMint;
        if (mintInfo) {
          console.log(`   ✅ VDM mint found (${mintTime}ms)`);
          console.log(`   Owner: ${mintInfo.owner.toString()}`);
        } else {
          console.log(`   ❌ VDM mint not found`);
          continue;
        }
      } catch (e) {
        console.log(`   ❌ Mint lookup failed: ${e.message}`);
        continue;
      }

      // Test 3: Get token accounts
      console.log('\n[3/3] Scanning token accounts...');
      const startAccounts = Date.now();
      try {
        const resp = await retryRpcCall(() => 
          connection.getParsedTokenAccountsByOwner(wallet, { programId: TOKEN_PROGRAM_ID })
        );
        const accountsTime = Date.now() - startAccounts;
        console.log(`   ✅ Found ${resp.value.length} token accounts (${accountsTime}ms)`);

        let vdmBalance = 0;
        for (const acc of resp.value) {
          const parsed = acc.account.data;
          const mint = parsed?.parsed?.info?.mint;
          const uiAmount = Number(parsed?.parsed?.info?.tokenAmount?.uiAmount);

          if (mint === vdmMint.toString()) {
            vdmBalance = uiAmount;
            console.log(`   ✅ VDM Token found! Balance: ${uiAmount.toLocaleString()}`);
            break;
          }
        }

        if (vdmBalance === 0) {
          console.log(`   ⚠️  No VDM tokens found in accounts`);
        }

        console.log(`\n✅ ✅ ✅ RPC FULLY FUNCTIONAL: ${rpcUrl}`);
      } catch (e) {
        console.log(`   ❌ Account scan failed: ${e.message}`);
      }

    } catch (error) {
      console.log(`\n❌ RPC FAILED: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ FALLBACK RPC TEST COMPLETE');
  console.log('='.repeat(80) + '\n');
}

testFallbackRPCs().catch(console.error);
