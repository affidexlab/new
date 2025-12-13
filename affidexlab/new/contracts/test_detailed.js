const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", signer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH\n");

  const routerAddress = "0xd3e6E44a7E85a352987F665E2Ceba1cD364e0519";
  const WETH = "0x4200000000000000000000000000000000000006";
  const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  console.log("=== Step-by-Step Contract Call Test ===\n");

  // Create contract instance
  const router = await hre.ethers.getContractAt("LiquidityRouter", routerAddress);
  
  const amountIn = hre.ethers.parseEther("0.0001");
  const deadline = Math.floor(Date.now() / 1000) + 1200;
  const fee = 500; // Try 0.05% fee tier which has most liquidity

  console.log("Parameters:");
  console.log("  tokenIn:", WETH);
  console.log("  tokenOut:", USDC);
  console.log("  fee:", fee);
  console.log("  amountIn:", amountIn.toString());
  console.log("  msg.value:", amountIn.toString());
  console.log("  deadline:", deadline, "\n");

  // Try static call first to see the revert reason
  console.log("Attempting static call to get revert reason...");
  try {
    const result = await router.swapExactInputUniswapV3.staticCall(
      WETH,
      USDC,
      fee,
      amountIn,
      0n,
      deadline,
      { value: amountIn }
    );
    console.log("✅ Static call succeeded! Estimated output:", result.toString());
  } catch (error) {
    console.error("❌ Static call failed!");
    
    // Try to extract revert reason
    if (error.data) {
      console.log("\nError data:", error.data);
      
      // Common error signatures
      const errorSignatures = {
        '0x08c379a0': 'Error(string)',
        '0x4e487b71': 'Panic(uint256)',
      };
      
      const errorSig = error.data.substring(0, 10);
      if (errorSignatures[errorSig]) {
        console.log("Error type:", errorSignatures[errorSig]);
        
        if (errorSig === '0x08c379a0') {
          // Try to decode Error(string)
          try {
            const reason = hre.ethers.AbiCoder.defaultAbiCoder().decode(
              ['string'],
              '0x' + error.data.substring(10)
            );
            console.log("Revert reason:", reason[0]);
          } catch (e) {
            console.log("Could not decode revert reason");
          }
        }
      }
    }
    
    console.log("\nRaw error:", error.message);
    
    // Check if it might be a require statement
    if (error.message.includes("execution reverted")) {
      console.log("\nPossible causes:");
      console.log("1. Amount too small (< minimum swap amount)");
      console.log("2. Pool doesn't have enough liquidity");
      console.log("3. WETH deposit/transfer failed");
      console.log("4. Approval failed");
      console.log("5. Uniswap router call failed");
    }
  }

  // Also check contract state
  console.log("\n=== Contract State ===");
  console.log("WETH address in contract:", await router.WETH());
  console.log("Uniswap router in contract:", await router.uniswapV3Router());
  console.log("Treasury:", await router.treasury());
  console.log("Fee rate:", (await router.feeRate()).toString(), "bps");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
