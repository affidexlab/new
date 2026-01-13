const hre = require("hardhat");

async function main() {
  // Check if the Uniswap router address is correct
  const routerAddress = "0x2626664c2603336E57B271c5C0b26F421741e481";
  
  console.log("Checking Uniswap V3 Router on Base:", routerAddress);
  console.log("This should be the SwapRouter02 contract\n");

  try {
    const code = await hre.ethers.provider.getCode(routerAddress);
    if (code === "0x") {
      console.log("❌ ERROR: No contract at this address!");
    } else {
      console.log("✅ Contract exists at this address");
      console.log("Code length:", code.length, "bytes");
      
      // Try to call a standard function to verify it's the right contract
      const [signer] = await hre.ethers.getSigners();
      const routerABI = [
        "function factory() external view returns (address)",
        "function WETH9() external view returns (address)"
      ];
      const router = new hre.ethers.Contract(routerAddress, routerABI, signer);
      
      try {
        const factory = await router.factory();
        console.log("Factory address:", factory);
      } catch (e) {
        console.log("Could not read factory() - might not be SwapRouter02");
      }
      
      try {
        const weth = await router.WETH9();
        console.log("WETH9 address:", weth);
      } catch (e) {
        console.log("Could not read WETH9() - might not be SwapRouter02");
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n=== Official Uniswap V3 addresses on Base ===");
  console.log("According to Uniswap docs:");
  console.log("SwapRouter02: 0x2626664c2603336E57B271c5C0b26F421741e481");
  console.log("UniversalRouter: 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD");
  console.log("\nWe are using SwapRouter02 which is correct.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
