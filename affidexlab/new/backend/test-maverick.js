import { getMaverickPools } from './src/services/maverickService.js';

console.log('🧪 Testing Maverick Pools Integration...\n');

async function test() {
  try {
    console.log('📡 Fetching Maverick pools for Base (chainId: 8453)...');
    const startTime = Date.now();
    
    const result = await getMaverickPools(8453, { limit: 5 });
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Request completed in ${duration}ms`);
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.pools && result.pools.length > 0) {
      console.log(`\n✅ SUCCESS: Found ${result.pools.length} Maverick pools`);
    } else {
      console.log('\n⚠️  WARNING: No pools returned (may be expected if Maverick API is down)');
      console.log('   But the request completed without hanging!');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();
