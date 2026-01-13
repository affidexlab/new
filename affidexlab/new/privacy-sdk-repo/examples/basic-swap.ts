/**
 * Basic Privacy Swap Example
 * 
 * This example shows how to execute a simple privacy-protected swap
 * using the DecaFlow SDK.
 */

import { createPrivacyClient } from '@decaflow/privacy-sdk';
import { ethers } from 'ethers';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const client = createPrivacyClient({
    network: 'arbitrum',
    apiKey: process.env.DECAFLOW_API_KEY
  });

  const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
  const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

  console.log('Getting privacy swap quote...');
  
  const quote = await client.getSwapQuote({
    from: wallet.address,
    tokenIn: WETH,
    tokenOut: USDC,
    amount: ethers.parseEther('1').toString(),
    slippage: 0.5,
    enableMEVProtection: true
  });

  console.log('\nQuote Details:');
  console.log(`  Input Amount: ${ethers.formatEther(quote.inputAmount)} WETH`);
  console.log(`  Output Amount: ${ethers.formatUnits(quote.outputAmount, 6)} USDC`);
  console.log(`  MEV Risk Score: ${quote.mevRiskScore}/100`);
  console.log(`  Estimated MEV Savings: $${quote.mevSavingsUSD}`);
  console.log(`  Route: ${quote.route}`);

  if (quote.mevRiskScore > 70) {
    console.log('\n⚠️  High MEV risk detected! Privacy protection recommended.');
  }

  console.log('\nExecuting privacy swap...');
  
  const tx = await client.executeSwap(quote, wallet);

  console.log(`\n✅ Transaction submitted: ${tx.transactionHash}`);
  console.log(`   View on Arbiscan: https://arbiscan.io/tx/${tx.transactionHash}`);
  console.log(`   MEV Saved: $${tx.mevSaved}`);

  console.log('\n🎉 Swap completed successfully with MEV protection!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
