const hre = require("hardhat");

async function main() {
  const networks = ["ethereum", "avalanche"];
  
  for (const network of networks) {
    try {
      await hre.changeNetwork(network);
      const [deployer] = await hre.ethers.getSigners();
      const balance = await hre.ethers.provider.getBalance(deployer.address);
      console.log(`${network}: ${hre.ethers.formatEther(balance)} (${deployer.address})`);
    } catch (e) {
      console.log(`${network}: Error - ${e.message}`);
    }
  }
}

main();
