import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import fetch from 'node-fetch';

const VDM_TOKEN_ADDRESS = 'B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5';
const TEST_WALLET = process.argv[2];

if (!TEST_WALLET) {
  console.error('Usage: node debug-vdm-staking.js <WALLET_ADDRESS>');
  process.exit(1);
}

async function debugVDMStaking() {
  console.log('🔍 VDM Staking Debug Tool\n');
  console.log('Testing wallet:', TEST_WALLET);
  console.log('VDM Token:', VDM_TOKEN_ADDRESS);
  console.log('─'.repeat(60));

  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

  console.log('\n1️⃣ Testing VDM Balance...');
  try {
    const walletPubkey = new PublicKey(TEST_WALLET);
    const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
    
    console.log('   Wallet PublicKey:', walletPubkey.toString());
    console.log('   VDM Mint:', vdmMint.toString());
    
    const tokenAccount = await getAssociatedTokenAddress(vdmMint, walletPubkey);
    console.log('   Associated Token Account:', tokenAccount.toString());
    
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    if (!accountInfo) {
      console.log('   ❌ Token account does NOT exist!');
      console.log('   💡 This wallet has never received VDM tokens or the ATA needs to be created.');
    } else {
      console.log('   ✅ Token account exists!');
      
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      console.log('   Balance (raw):', balance.value.amount);
      console.log('   Balance (UI):', balance.value.uiAmount);
      console.log('   Decimals:', balance.value.decimals);
      
      if (balance.value.uiAmount === 0) {
        console.log('   ⚠️  Balance is zero. Wallet has VDM account but no tokens.');
      } else {
        console.log('   ✅ VDM Balance:', balance.value.uiAmount, 'VDM');
      }
    }
  } catch (error) {
    console.log('   ❌ Error fetching balance:', error.message);
  }

  console.log('\n2️⃣ Testing VDM Price (Backend)...');
  try {
    const API_BASE = process.env.VITE_API_BASE_URL || 'https://decaflow-backend.onrender.com';
    console.log('   API URL:', `${API_BASE}/v1/solana-staking/vdm-price`);
    
    const response = await fetch(`${API_BASE}/v1/solana-staking/vdm-price`);
    console.log('   Response status:', response.status);
    
    const data = await response.json();
    console.log('   Response:', JSON.stringify(data, null, 2));
    
    if (data?.success && data?.data?.priceUsd) {
      console.log('   ✅ Backend price available:', data.data.priceUsd, 'USD');
    } else {
      console.log('   ❌ Backend price not available');
    }
  } catch (error) {
    console.log('   ❌ Error fetching backend price:', error.message);
  }

  console.log('\n3️⃣ Testing VDM Price (DexScreener Direct)...');
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${VDM_TOKEN_ADDRESS}`;
    console.log('   API URL:', url);
    
    const response = await fetch(url);
    console.log('   Response status:', response.status);
    
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      console.log('   ✅ Found', data.pairs.length, 'trading pairs');
      
      const sortedPairs = data.pairs
        .map(p => ({
          dex: p.dexId,
          pair: p.pairAddress,
          baseToken: p.baseToken?.symbol,
          quoteToken: p.quoteToken?.symbol,
          priceUsd: Number(p.priceUsd),
          liquidity: Number(p.liquidity?.usd) || 0,
          volume24h: Number(p.volume?.h24) || 0,
        }))
        .sort((a, b) => b.liquidity - a.liquidity);
      
      console.log('\n   Top 3 pairs by liquidity:');
      sortedPairs.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.dex.toUpperCase()} - ${p.baseToken}/${p.quoteToken}`);
        console.log(`      Price: $${p.priceUsd}`);
        console.log(`      Liquidity: $${p.liquidity.toLocaleString()}`);
        console.log(`      24h Volume: $${p.volume24h.toLocaleString()}`);
        console.log(`      Pair Address: ${p.pair}`);
      });
      
      const bestPair = sortedPairs[0];
      console.log('\n   ✅ Best price (highest liquidity):', bestPair.priceUsd, 'USD');
    } else {
      console.log('   ❌ No trading pairs found on DexScreener');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error fetching DexScreener price:', error.message);
  }

  console.log('\n4️⃣ Testing Token Mint Info...');
  try {
    const vdmMint = new PublicKey(VDM_TOKEN_ADDRESS);
    const mintInfo = await connection.getParsedAccountInfo(vdmMint);
    
    if (mintInfo.value) {
      console.log('   ✅ Token mint exists!');
      const parsed = mintInfo.value.data;
      if ('parsed' in parsed) {
        console.log('   Decimals:', parsed.parsed.info.decimals);
        console.log('   Supply:', parsed.parsed.info.supply);
        console.log('   Mint Authority:', parsed.parsed.info.mintAuthority);
        console.log('   Freeze Authority:', parsed.parsed.info.freezeAuthority);
      }
    } else {
      console.log('   ❌ Token mint not found!');
    }
  } catch (error) {
    console.log('   ❌ Error fetching mint info:', error.message);
  }

  console.log('\n5️⃣ Testing Solana RPC Connection...');
  try {
    const slot = await connection.getSlot();
    console.log('   ✅ RPC connection working');
    console.log('   Current slot:', slot);
    
    const blockTime = await connection.getBlockTime(slot);
    console.log('   Current time:', new Date(blockTime * 1000).toISOString());
  } catch (error) {
    console.log('   ❌ RPC connection error:', error.message);
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Debug complete!\n');
}

debugVDMStaking().catch(console.error);
