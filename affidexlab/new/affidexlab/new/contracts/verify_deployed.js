const hre = require("hardhat");

async function main() {
  console.log("=== Verifying Deployed Contract ===\n");

  const routerAddress = "0xd3e6E44a7E85a352987F665E2Ceba1cD364e0519";
  
  // Get the contract code
  const code = await hre.ethers.provider.getCode(routerAddress);
  console.log("Contract code length:", code.length, "bytes");
  console.log("Contract exists:", code !== "0x" ? "✅ Yes" : "❌ No");
  
  // Try to read the WETH address (this was added in the new version)
  const router = await hre.ethers.getContractAt("LiquidityRouter", routerAddress);
  
  try {
    const weth = await router.WETH();
    console.log("\n✅ WETH immutable exists:", weth);
    console.log("This confirms the new contract with ETH support was deployed!");
  } catch (error) {
    console.error("\n❌ WETH immutable NOT found!");
    console.error("This means the OLD contract was deployed, not the new one!");
    console.error("Error:", error.message);
  }
  
  // Check other contract properties
  console.log("\n=== Contract Configuration ===");
  try {
    console.log("Uniswap Router:", await router.uniswapV3Router());
    console.log("Aerodrome Router:", await router.aerodromeRouter());
    console.log("Treasury:", await router.treasury());
    console.log("Fee Rate:", (await router.feeRate()).toString(), "bps");
  } catch (error) {
    console.error("Error reading config:", error.message);
  }

  // Try to call a function to see if it's payable
  console.log("\n=== Testing Function Signature ===");
  
  // The function selector for swapExactInputUniswapV3 should be the same
  const iface = router.interface;
  const fragment = iface.getFunction("swapExactInputUniswapV3");
  console.log("Function selector:", fragment.selector);
  console.log("Is payable:", fragment.payable ? "✅ Yes" : "❌ No");
  
  if (!fragment.payable) {
    console.log("\n🔴 CRITICAL: The deployed contract's swapExactInputUniswapV3 is NOT payable!");
    console.log("This means the wrong contract was deployed or compiled incorrectly.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
