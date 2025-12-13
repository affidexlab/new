const hre = require("hardhat");

async function main() {
  console.log("=== Checking Uniswap V3 Pool Existence on Base ===\n");

  const WETH = "0x4200000000000000000000000000000000000006";
  const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const factory = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD"; // Uniswap V3 Factory on Base
  
  const factoryABI = [
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
  ];
  
  const poolABI = [
    "function liquidity() external view returns (uint128)",
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
  ];

  const factoryContract = await hre.ethers.getContractAt(factoryABI, factory);
  
  const feeTiers = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%
  
  for (const fee of feeTiers) {
    try {
      const poolAddress = await factoryContract.getPool(WETH, USDC, fee);
      
      if (poolAddress === "0x0000000000000000000000000000000000000000") {
        console.log(`❌ Fee ${fee/10000}%: No pool exists`);
      } else {
        console.log(`✅ Fee ${fee/10000}%: Pool exists at ${poolAddress}`);
        
        // Check liquidity
        const pool = await hre.ethers.getContractAt(poolABI, poolAddress);
        try {
          const liquidity = await pool.liquidity();
          const slot0 = await pool.slot0();
          console.log(`   Liquidity: ${liquidity.toString()}`);
          console.log(`   Current price: ${slot0.sqrtPriceX96.toString()}`);
          console.log(`   Unlocked: ${slot0.unlocked}\n`);
        } catch (e) {
          console.log(`   Could not read pool data: ${e.message}\n`);
        }
      }
    } catch (error) {
      console.log(`Error checking ${fee/10000}%: ${error.message}\n`);
    }
  }
  
  console.log("=== Recommendation ===");
  console.log("The frontend should use a fee tier that has an active pool with liquidity.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
