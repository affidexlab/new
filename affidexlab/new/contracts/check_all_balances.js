const hre = require("hardhat");

async function checkBalance(networkName) {
  try {
    const config = hre.config.networks[networkName];
    if (!config || !config.accounts || config.accounts.length === 0) {
      console.log(`${networkName}: No account configured`);
      return;
    }
    
    const provider = new hre.ethers.JsonRpcProvider(config.url);
    const wallet = new hre.ethers.Wallet(config.accounts[0], provider);
    const balance = await provider.getBalance(wallet.address);
    console.log(`${networkName}: ${hre.ethers.formatEther(balance)} ETH`);
  } catch (error) {
    console.log(`${networkName}: Error - ${error.message}`);
  }
}

async function main() {
  console.log("Checking balances on all networks...\n");
  await checkBalance('base');
  await checkBalance('arbitrum');
  await checkBalance('optimism');
  await checkBalance('polygon');
  await checkBalance('avalanche');
  await checkBalance('ethereum');
}

main().catch(console.error);
