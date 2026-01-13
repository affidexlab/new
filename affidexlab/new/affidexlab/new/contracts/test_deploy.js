const hre = require("hardhat");

async function main() {
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  
  const signers = await hre.ethers.getSigners();
  console.log("Number of signers:", signers.length);
  
  if (signers.length > 0) {
    const deployer = signers[0];
    console.log("Deployer address:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  } else {
    console.log("No signers available!");
  }
}

main().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
