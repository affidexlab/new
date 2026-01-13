/**
 * MEV Risk Analysis Example
 * 
 * This example shows how to check MEV risk before executing a trade.
 * Useful for displaying warnings to users or implementing risk-based routing.
 */

import { createPrivacyClient } from '@decaflow/privacy-sdk';

async function checkMEVRisk() {
  const client = createPrivacyClient({
    network: 'arbitrum',
    apiKey: process.env.DECAFLOW_API_KEY
  });

  const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
  const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

  console.log('Analyzing MEV risk...\n');

  const riskAnalysis = await client.getMEVRiskScore({
    from: '0xYourAddress',
    tokenIn: WETH,
    tokenOut: USDC,
    amount: (1 * 1e18).toString()
  });

  console.log('Risk Analysis:');
  console.log(`  Risk Score: ${riskAnalysis.riskScore}/100`);
  console.log(`  Risk Level: ${riskAnalysis.riskLevel.toUpperCase()}`);
  console.log(`  Estimated MEV: $${riskAnalysis.estimatedMEV}`);
  console.log(`  Recommendation: ${riskAnalysis.recommendation}`);

  if (riskAnalysis.riskLevel === 'high') {
    console.log('\n🚨 HIGH RISK! Privacy protection strongly recommended.');
    console.log('   Proceeding with privacy-protected swap...\n');

    const quote = await client.getSwapQuote({
      from: '0xYourAddress',
      tokenIn: WETH,
      tokenOut: USDC,
      amount: (1 * 1e18).toString(),
      enableMEVProtection: true
    });

    console.log('Privacy Quote:');
    console.log(`  Route: ${quote.route}`);
    console.log(`  MEV Savings: $${quote.mevSavingsUSD}`);
  } else if (riskAnalysis.riskLevel === 'low') {
    console.log('\n✅ LOW RISK. Standard swap should be safe.');
  } else {
    console.log('\n⚠️  MEDIUM RISK. Privacy protection recommended.');
  }
}

checkMEVRisk()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
