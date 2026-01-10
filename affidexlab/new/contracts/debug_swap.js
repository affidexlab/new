const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Testing with address:", signer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH\n");

  const routerAddress = "0xd3e6E44a7E85a352987F665E2Ceba1cD364e0519"; // Base
  const WETH = "0x4200000000000000000000000000000000000006";
  const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
  const router = await hre.ethers.getContractAt("LiquidityRouter", routerAddress);

  console.log("=== Contract Configuration ===");
  console.log("WETH:", await router.WETH());
  console.log("Uniswap Router:", await router.uniswapV3Router());
  console.log("Fee Rate:", (await router.feeRate()).toString(), "bps\n");

  // Test parameters
  const amountIn = hre.ethers.parseEther("0.0001"); // Very small amount
  const deadline = Math.floor(Date.now() / 1000) + 1200;
  const fee = 3000;

  console.log("=== Testing Native ETH Swap ===");
  console.log("Amount:", hre.ethers.formatEther(amountIn), "ETH");
  console.log("From: ETH (native)");
  console.log("To: USDC");
  console.log("Passing tokenIn as:", WETH);
  console.log("Sending value:", hre.ethers.formatEther(amountIn), "ETH\n");

  try {
    // First, let's check if WETH works
    console.log("--- Testing WETH contract ---");
    const wethContract = await hre.ethers.getContractAt(
      ["function deposit() external payable", "function balanceOf(address) external view returns (uint256)"],
      WETH
    );
    
    // Test deposit
    console.log("Testing WETH.deposit()...");
    const depositTx = await wethContract.deposit({ value: hre.ethers.parseEther("0.0001") });
    await depositTx.wait();
    console.log("✅ WETH deposit works");
    
    const wethBalance = await wethContract.balanceOf(signer.address);
    console.log("WETH balance:", hre.ethers.formatEther(wethBalance), "\n");

    // Now test the router
    console.log("--- Testing Router Swap ---");
    console.log("Calling swapExactInputUniswapV3...");
    console.log("  tokenIn:", WETH);
    console.log("  tokenOut:", USDC);
    console.log("  fee:", fee);
    console.log("  amountIn:", amountIn.toString());
    console.log("  amountOutMinimum: 0");
    console.log("  deadline:", deadline);
    console.log("  value:", amountIn.toString(), "\n");

    // Try to call the function
    const tx = await router.swapExactInputUniswapV3(
      WETH,
      USDC,
      fee,
      amountIn,
      0n,
      deadline,
      { 
        value: amountIn,
        gasLimit: 500000n // Set explicit gas limit
      }
    );
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log("\n✅ SUCCESS!");
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Status:", receipt.status);

  } catch (error) {
    console.error("\n❌ ERROR DETAILS:");
    console.error("Message:", error.message);
    
    if (error.data) {
      console.error("\nError data:", error.data);
      
      // Try to decode the revert reason
      try {
        const iface = new hre.ethers.Interface([
          "error Error(string)",
          "function swapExactInputUniswapV3(address,address,uint24,uint256,uint256,uint256) payable"
        ]);
        
        if (typeof error.data === 'string') {
          try {
            const decoded = iface.parseError(error.data);
            console.error("Decoded error:", decoded);
          } catch (e) {
            console.error("Raw error data:", error.data);
          }
        }
      } catch (e) {
        console.error("Could not decode error");
      }
    }
    
    if (error.transaction) {
      console.error("\nTransaction details:");
      console.error("  to:", error.transaction.to);
      console.error("  value:", error.transaction.value?.toString());
      console.error("  data length:", error.transaction.data?.length);
    }

    if (error.receipt) {
      console.error("\nReceipt status:", error.receipt.status);
    }

    // Try to simulate the transaction to get more details
    console.error("\n--- Trying to get more details ---");
    try {
      await router.swapExactInputUniswapV3.staticCall(
        WETH,
        USDC,
        fee,
        amountIn,
        0n,
        deadline,
        { value: amountIn }
      );
    } catch (staticError) {
      console.error("Static call error:", staticError.message);
      if (staticError.data) {
        console.error("Static call error data:", staticError.data);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
