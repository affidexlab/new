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

function shouldFallbackRpc(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed') ||
    msg.includes('fetch') ||
    msg.includes('blocked') ||
    msg.includes('csp') ||
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('content security policy')
  );
}

async function getWorkingConnection(primary) {
  console.log('🔌 Testing primary Solana RPC connection...');
  try {
    await retryRpcCall(() => primary.getLatestBlockhash('processed'), 2);
    console.log('✅ Primary RPC connection working');
    return primary;
  } catch (e) {
    console.warn('⚠️  Primary RPC failed:', e?.message);
    if (!shouldFallbackRpc(e)) {
      console.log('   Error not RPC-related, continuing with primary');
      return primary;
    }
  }

  console.log('🔄 Trying fallback RPC endpoints...');
  for (const url of FALLBACK_SOLANA_RPC_URLS) {
    try {
      console.log(`   Testing ${url}...`);
      const c = new Connection(url, 'confirmed');
      await retryRpcCall(() => c.getLatestBlockhash('processed'), 2);
      console.log(`✅ Using fallback Solana RPC: ${url}`);
      return c;
    } catch (e) {
      console.warn(`   ❌ Failed: ${e?.message}`);
    }
  }

  console.warn('⚠️  All fallback RPCs failed, using primary');
  return primary;
}

let vdmTokenProgramIdCache = null;

async function getVdmTokenProgramId(connection) {
  if (!vdmTokenProgramIdCache) {
    vdmTokenProgramIdCache = (async () => {
      const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
      const info = await retryRpcCall(() => connection.getAccountInfo(vdmMint));
      const owner = info?.owner;
      if (owner?.equals(TOKEN_2022_PROGRAM_ID)) {
        return TOKEN_2022_PROGRAM_ID;
      }
      return TOKEN_PROGRAM_ID;
    })().catch((e) => {
      vdmTokenProgramIdCache = null;
      throw e;
    });
  }
  return vdmTokenProgramIdCache;
}

async function sumTokenBalanceByProgram(connection, walletAddress, tokenProgramId) {
  const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
  
  const resp = await retryRpcCall(() => 
    connection.getParsedTokenAccountsByOwner(walletAddress, { programId: tokenProgramId })
  );
  
  console.log(`📊 Found ${resp.value.length} token accounts for program ${tokenProgramId.toString().substring(0, 8)}...`);
  
  let total = 0;
  for (const acc of resp.value) {
    const parsed = acc.account.data;
    const mint = parsed?.parsed?.info?.mint;
    const uiAmount = Number(parsed?.parsed?.info?.tokenAmount?.uiAmount);
    
    console.log(`   Token: ${mint?.substring(0, 8)}... Balance: ${uiAmount}`);
    
    if (mint === vdmMint.toString()) {
      console.log(`   ✅ VDM Token found! Balance: ${uiAmount}`);
      if (Number.isFinite(uiAmount)) {
        total += uiAmount;
      }
    }
  }
  return total;
}

async function getVDMTokenBalance(connection, walletAddress) {
  console.log('\n🔍 === VDM BALANCE FETCH START ===');
  console.log('   Wallet:', walletAddress.toString());
  console.log('   VDM Token:', VDM_TOKEN_ADDRESS);
  console.log('   Timestamp:', new Date().toISOString());

  const run = async (conn, rpcLabel) => {
    console.log(`\n📊 Fetching balance via ${rpcLabel}...`);
    
    const programId = await getVdmTokenProgramId(conn);
    console.log('   Token Program ID:', programId.toString());

    let total = 0;

    try {
      console.log('   [1/2] Scanning primary token program...');
      const primaryBalance = await sumTokenBalanceByProgram(conn, walletAddress, programId);
      total += primaryBalance;
      console.log(`   Primary program balance: ${primaryBalance}`);
    } catch (e) {
      console.error('   ❌ Primary scan failed:', e?.message || e);
      throw e;
    }

    const altProgramId = programId.equals(TOKEN_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
    try {
      console.log('   [2/2] Scanning alternative token program...');
      const altBalance = await sumTokenBalanceByProgram(conn, walletAddress, altProgramId);
      total += altBalance;
      console.log(`   Alternative program balance: ${altBalance}`);
    } catch (e) {
      console.log('   No accounts in alternative program (this is normal)');
    }

    console.log(`\n💰 ✅ TOTAL VDM BALANCE: ${total.toLocaleString()} VDM`);
    return total;
  };

  try {
    const primaryConn = await getWorkingConnection(connection);
    
    try {
      const balance = await run(primaryConn, 'primary RPC');
      console.log('\n✅ === VDM BALANCE FETCH SUCCESS ===\n');
      return balance;
    } catch (e) {
      console.error('❌ Primary RPC balance fetch failed:', e?.message);
      
      if (!shouldFallbackRpc(e)) {
        console.error('   Error is not RPC-related, re-throwing');
        throw e;
      }
      
      console.log('   Attempting fallback RPCs...');
    }

    for (const url of FALLBACK_SOLANA_RPC_URLS) {
      try {
        console.log(`\n🔄 Trying fallback RPC: ${url}`);
        vdmTokenProgramIdCache = null;
        const fallbackConn = new Connection(url, 'confirmed');
        const balance = await run(fallbackConn, url);
        console.log('\n✅ === VDM BALANCE FETCH SUCCESS (fallback) ===\n');
        return balance;
      } catch (e) {
        console.error(`   ❌ Fallback ${url} failed:`, e?.message);
      }
    }

    console.error('\n❌ All RPC endpoints failed, returning 0');
    return 0;
  } catch (error) {
    console.error('\n❌ === VDM BALANCE FETCH FAILED ===');
    console.error('   Wallet:', walletAddress.toString());
    console.error('   VDM Token:', VDM_TOKEN_ADDRESS);
    console.error('   Error:', error?.message || error);
    console.error('   Stack:', error?.stack);
    console.error('===================================\n');
    return 0;
  }
}

async function testVDMBalance() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 VDM BALANCE DETECTION TEST - LIVE WALLET');
  console.log('='.repeat(80) + '\n');

  const privateKeyString = '4X6LckQt3iGAFaMqsbjkMsNRwiSUAK3SpkxTmNGdN7xhEhhUS2e8jpU9kVQBurxxoAdEHEduR3EZV894ayfpWbLk';
  
  let keypair;
  try {
    const privateKeyBytes = bs58.decode(privateKeyString);
    keypair = Keypair.fromSecretKey(privateKeyBytes);
    console.log('✅ Keypair loaded successfully');
    console.log('   Public Key:', keypair.publicKey.toString());
  } catch (error) {
    console.error('❌ Failed to load keypair:', error.message);
    process.exit(1);
  }

  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  
  console.log('\n📍 Expected: ~20,000 VDM tokens');
  console.log('━'.repeat(80) + '\n');

  const balance = await getVDMTokenBalance(connection, keypair.publicKey);

  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`Wallet: ${keypair.publicKey.toString()}`);
  console.log(`Balance: ${balance.toLocaleString()} VDM`);
  console.log(`Expected: ~20,000 VDM`);
  
  if (balance >= 19000 && balance <= 21000) {
    console.log('\n✅ ✅ ✅ TEST PASSED! Balance is correct! ✅ ✅ ✅');
  } else if (balance === 0) {
    console.log('\n❌ ❌ ❌ TEST FAILED! Balance showing as 0 ❌ ❌ ❌');
  } else {
    console.log(`\n⚠️  Balance detected but outside expected range: ${balance}`);
  }
  
  console.log('='.repeat(80) + '\n');
}

testVDMBalance().catch(console.error);
