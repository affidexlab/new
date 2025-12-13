const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  console.log("=== Testing Direct Uniswap V3 Swap ===\n");
  console.log("This tests if Uniswap itself works, bypassing our router\n");

  const WETH = "0x4200000000000000000000000000000000000006";
  const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const uniswapRouter = "0x2626664c2603336E57B271c5C0b26F421741e481";
  
  const uniswapABI = [
    "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
  ];
  
  const wethABI = [
    "function deposit() external payable",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address) external view returns (uint256)"
  ];

  const router = new hre.ethers.Contract(uniswapRouter, uniswapABI, signer);
  const weth = new hre.ethers.Contract(WETH, wethABI, signer);

  // Wrap some ETH to WETH first
  console.log("Step 1: Wrapping ETH to WETH...");
  const wrapAmount = hre.ethers.parseEther("0.0001");
  const wrapTx = await weth.deposit({ value: wrapAmount });
  await wrapTx.wait();
  console.log("✅ Wrapped", hre.ethers.formatEther(wrapAmount), "ETH to WETH");
  
  const wethBalance = await weth.balanceOf(signer.address);
  console.log("WETH balance:", hre.ethers.formatEther(wethBalance), "\n");

  // Approve Uniswap to spend WETH
  console.log("Step 2: Approving Uniswap to spend WETH...");
  const approveTx = await weth.approve(uniswapRouter, wrapAmount);
  await approveTx.wait();
  console.log("✅ Approved\n");

  // Swap WETH for USDC via Uniswap
  console.log("Step 3: Swapping WETH for USDC via Uniswap...");
  const deadline = Math.floor(Date.now() / 1000) + 1200;
  
  const params = {
    tokenIn: WETH,
    tokenOut: USDC,
    fee: 3000,
    recipient: signer.address,
    deadline: deadline,
    amountIn: wrapAmount,
    amountOutMinimum: 0n,
    sqrtPriceLimitX96: 0n
  };

  try {
    const swapTx = await router.exactInputSingle(params);
    console.log("Transaction sent:", swapTx.hash);
    const receipt = await swapTx.wait();
    console.log("✅ Swap successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("\n🎉 Uniswap works directly! The issue is in our LiquidityRouter contract.");
  } catch (error) {
    console.error("❌ Direct Uniswap swap failed!");
    console.error("Error:", error.message);
    console.error("\nThis means the issue is with Uniswap itself or the parameters.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
