const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Testing with address:", signer.address);

  const routerAddress = "0xd3e6E44a7E85a352987F665E2Ceba1cD364e0519"; // Base
  const WETH = "0x4200000000000000000000000000000000000006"; // WETH on Base
  const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base  
  
  const router = await hre.ethers.getContractAt("LiquidityRouter", routerAddress);

  console.log("\n=== Contract Info ===");
  console.log("Router Address:", routerAddress);
  console.log("WETH Address:", await router.WETH());
  console.log("Uniswap V3 Router:", await router.uniswapV3Router());
  console.log("Aerodrome Router:", await router.aerodromeRouter());
  console.log("Treasury:", await router.treasury());
  console.log("Fee Rate:", (await router.feeRate()).toString(), "bps");

  // Try a small swap: 0.001 ETH -> USDC
  const amountIn = hre.ethers.parseEther("0.001");
  const deadline = Math.floor(Date.now() / 1000) + 1200;
  const fee = 3000; // 0.3% fee tier

  console.log("\n=== Testing Swap ===");
  console.log("Amount In:", hre.ethers.formatEther(amountIn), "ETH");
  console.log("Token In:", WETH);
  console.log("Token Out:", USDC);
  console.log("Fee Tier:", fee);
  console.log("Deadline:", deadline);

  try {
    // Estimate gas first
    const gasEstimate = await router.swapExactInputUniswapV3.estimateGas(
      WETH,
      USDC,
      fee,
      amountIn,
      0n, // No minimum output for testing
      deadline,
      { value: amountIn }
    );
    console.log("Gas Estimate:", gasEstimate.toString());

    // Try the actual swap
    console.log("\nSending transaction...");
    const tx = await router.swapExactInputUniswapV3(
      WETH,
      USDC,
      fee,
      amountIn,
      0n,
      deadline,
      { value: amountIn }
    );
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Swap successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("\n❌ ERROR:");
    console.error(error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
