const hre = require("hardhat");

const POSITION_MANAGERS = {
  mainnet: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  ethereum: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  base: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
  arbitrum: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  optimism: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  polygon: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  avalanche: "0x655C406EBFa14EE2006250925e54ec43AD184f8B"
};

const TREASURY_WALLET = process.env.TREASURY_WALLET || "0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901";
const LP_FEE_RATE = 300; // 3% fee (300 basis points)

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying LPFeeManager to ${network}...\n`);

  const positionManager = POSITION_MANAGERS[network];
  if (!positionManager) {
    throw new Error(`Position manager not configured for ${network}`);
  }

  console.log("Configuration:");
  console.log(`  Position Manager: ${positionManager}`);
  console.log(`  Treasury: ${TREASURY_WALLET}`);
  console.log(`  LP Fee Rate: ${LP_FEE_RATE / 100}%\n`);

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log(`  Deployer: ${deployer.address}\n`);

  const LPFeeManager = await hre.ethers.getContractFactory("LPFeeManager", deployer);
  const lpFeeManager = await LPFeeManager.deploy(
    positionManager,
    TREASURY_WALLET,
    LP_FEE_RATE
  );

  await lpFeeManager.waitForDeployment();
  const address = await lpFeeManager.getAddress();

  console.log(`\n✅ LPFeeManager deployed to: ${address}`);
  console.log(`\n📋 Configuration:`);
  console.log(`  Network: ${network}`);
  console.log(`  Position Manager: ${positionManager}`);
  console.log(`  Treasury: ${TREASURY_WALLET}`);
  console.log(`  LP Fee: ${LP_FEE_RATE / 100}%`);
  console.log(`\n🔍 Verify on block explorer:`);
  
  const explorers = {
    mainnet: "https://etherscan.io",
    ethereum: "https://etherscan.io",
    base: "https://basescan.org",
    arbitrum: "https://arbiscan.io",
    optimism: "https://optimistic.etherscan.io",
    polygon: "https://polygonscan.com",
    avalanche: "https://snowtrace.io"
  };

  console.log(`  ${explorers[network]}/address/${address}\n`);

  console.log(`\n📝 Next Steps:`);
  console.log(`  1. Verify contract on block explorer`);
  console.log(`  2. Update frontend with LPFeeManager address`);
  console.log(`  3. Update app/src/lib/uniswapV3Lp.ts:`);
  console.log(`     export const LP_FEE_MANAGER_ADDRESSES = {`);
  console.log(`       ${network === 'mainnet' ? '1' : hre.network.config.chainId}: "${address}",`);
  console.log(`     };`);
  console.log(`  4. Test add liquidity flow via LPFeeManager\n`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
