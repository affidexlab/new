import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';

const FALLBACK_RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
];

async function debugVdmBalance(walletAddress) {
  console.log('\n🔍 === VDM Balance Debug Tool ===\n');
  console.log('Wallet:', walletAddress);
  console.log('VDM Token:', VDM_TOKEN_ADDRESS);
  console.log('\n');

  const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
  const wallet = new PublicKey(walletAddress);

  for (const rpcUrl of FALLBACK_RPC_URLS) {
    console.log(`\n📡 Testing RPC: ${rpcUrl}`);
    console.log('─'.repeat(80));

    try {
      const connection = new Connection(rpcUrl, 'confirmed');

      console.log('\n1️⃣ Checking VDM token account info...');
      const mintInfo = await connection.getAccountInfo(vdmMint);
      if (!mintInfo) {
        console.log('❌ VDM mint account not found!');
        continue;
      }
      console.log('✅ VDM mint found');
      console.log('   Owner:', mintInfo.owner.toString());
      console.log('   Is TOKEN_PROGRAM_ID?', mintInfo.owner.equals(TOKEN_PROGRAM_ID));
      console.log('   Is TOKEN_2022_PROGRAM_ID?', mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID));

      const detectedProgramId = mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID) 
        ? TOKEN_2022_PROGRAM_ID 
        : TOKEN_PROGRAM_ID;
      
      console.log('   Detected Program:', detectedProgramId.toString());

      console.log('\n2️⃣ Scanning TOKEN_PROGRAM_ID accounts...');
      try {
        const resp1 = await connection.getParsedTokenAccountsByOwner(
          wallet,
          { programId: TOKEN_PROGRAM_ID }
        );
        console.log(`   Found ${resp1.value.length} token accounts`);
        
        let vdmFound = false;
        for (const acc of resp1.value) {
          const parsed = acc.account.data;
          const mint = parsed?.parsed?.info?.mint;
          const uiAmount = Number(parsed?.parsed?.info?.tokenAmount?.uiAmount || 0);
          
          if (mint === vdmMint.toString()) {
            console.log(`   ✅ VDM Token found! Balance: ${uiAmount}`);
            vdmFound = true;
          }
        }
        
        if (!vdmFound && resp1.value.length > 0) {
          console.log('   📋 Sample accounts:');
          resp1.value.slice(0, 3).forEach(acc => {
            const mint = acc.account.data?.parsed?.info?.mint;
            const amount = acc.account.data?.parsed?.info?.tokenAmount?.uiAmount;
            console.log(`      - Mint: ${mint?.substring(0, 12)}... Balance: ${amount}`);
          });
        }
      } catch (e) {
        console.log('   ❌ Error:', e.message);
      }

      console.log('\n3️⃣ Scanning TOKEN_2022_PROGRAM_ID accounts...');
      try {
        const resp2 = await connection.getParsedTokenAccountsByOwner(
          wallet,
          { programId: TOKEN_2022_PROGRAM_ID }
        );
        console.log(`   Found ${resp2.value.length} token accounts`);
        
        let vdmFound = false;
        for (const acc of resp2.value) {
          const parsed = acc.account.data;
          const mint = parsed?.parsed?.info?.mint;
          const uiAmount = Number(parsed?.parsed?.info?.tokenAmount?.uiAmount || 0);
          
          if (mint === vdmMint.toString()) {
            console.log(`   ✅ VDM Token found! Balance: ${uiAmount}`);
            vdmFound = true;
          }
        }
        
        if (!vdmFound && resp2.value.length > 0) {
          console.log('   📋 Sample accounts:');
          resp2.value.slice(0, 3).forEach(acc => {
            const mint = acc.account.data?.parsed?.info?.mint;
            const amount = acc.account.data?.parsed?.info?.tokenAmount?.uiAmount;
            console.log(`      - Mint: ${mint?.substring(0, 12)}... Balance: ${amount}`);
          });
        }
      } catch (e) {
        console.log('   ❌ Error:', e.message);
      }

      console.log('\n4️⃣ Trying direct mint filter scan...');
      try {
        const resp3 = await connection.getParsedTokenAccountsByOwner(
          wallet,
          { mint: vdmMint }
        );
        console.log(`   Found ${resp3.value.length} accounts for VDM mint`);
        
        for (const acc of resp3.value) {
          const parsed = acc.account.data;
          const uiAmount = Number(parsed?.parsed?.info?.tokenAmount?.uiAmount || 0);
          console.log(`   ✅ VDM Balance: ${uiAmount}`);
          console.log(`   Account: ${acc.pubkey.toString()}`);
        }
      } catch (e) {
        console.log('   ❌ Error:', e.message);
      }

    } catch (error) {
      console.log('❌ RPC Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

const walletArg = process.argv[2];
if (!walletArg) {
  console.log('Usage: node debug-vdm-balance.js <WALLET_ADDRESS>');
  console.log('Example: node debug-vdm-balance.js EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR');
  process.exit(1);
}

debugVdmBalance(walletArg).catch(console.error);
