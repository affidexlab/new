const hre = require("hardhat");

async function checkBalance(networkName) {
  try {
    const provider = new hre.ethers.JsonRpcProvider(
      hre.config.networks[networkName].url
    );
    const wallet = new hre.ethers.Wallet(
      process.env.DEPLOYER_PRIVATE_KEY,
      provider
    );
    const balance = await provider.getBalance(wallet.address);
    const formatted = hre.ethers.formatEther(balance);
    console.log(`${networkName}: ${formatted} (${wallet.address})`);
  } catch (e) {
    console.log(`${networkName}: Error - ${e.message}`);
  }
}

async function main() {
  await checkBalance("avalanche");
  await checkBalance("ethereum");
}

main().catch(console.error);
