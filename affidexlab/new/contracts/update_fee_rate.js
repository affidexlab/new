/**
 * Script to update the fee rate on already-deployed LiquidityRouter contracts
 * Updates from 0.8% (80 bps) to 1.5% (150 bps)
 */

const { ethers } = require("ethers");
require("dotenv").config();

const NEW_FEE_RATE = 150; // 1.5% = 150 basis points

// Deployed LiquidityRouter addresses
const LIQUIDITY_ROUTER_ADDRESSES = {
  8453: "0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4",   // Base
  42161: "0xDE8700785C7512a8397683A9BE9717B0aFdB18F3",  // Arbitrum
  10: "0xA2fdf81b7967e7FA7610DeBe1901A40686c48992",     // Optimism
  137: "0xFd05977256E8D5753728C78A3003BC3B75Fef1DD",    // Polygon
};

// RPC URLs
const RPC_URLS = {
  8453: "https://mainnet.base.org",
  42161: "https://arb1.arbitrum.io/rpc",
  10: "https://mainnet.optimism.io",
  137: "https://polygon-rpc.com",
};

// Chain names for logging
const CHAIN_NAMES = {
  8453: "Base",
  42161: "Arbitrum",
  10: "Optimism",
  137: "Polygon",
};

// Minimal ABI for updateFeeRate
const LIQUIDITY_ROUTER_ABI = [
  "function updateFeeRate(uint256 _newFeeRate) external",
  "function feeRate() view returns (uint256)",
  "function owner() view returns (address)",
];

async function updateFeeRate(chainId) {
  const chainName = CHAIN_NAMES[chainId];
  const routerAddress = LIQUIDITY_ROUTER_ADDRESSES[chainId];
  const rpcUrl = RPC_URLS[chainId];

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Updating fee rate on ${chainName} (Chain ID: ${chainId})`);
  console.log(`Router Address: ${routerAddress}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`Using wallet: ${wallet.address}`);

    // Connect to contract
    const router = new ethers.Contract(routerAddress, LIQUIDITY_ROUTER_ABI, wallet);

    // Check current owner
    console.log("\n1. Checking contract owner...");
    const owner = await router.owner();
    console.log(`   Contract owner: ${owner}`);
    console.log(`   Your wallet: ${wallet.address}`);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error(`   ❌ ERROR: You are not the owner of this contract!`);
      return false;
    }

    // Check current fee rate
    console.log("\n2. Checking current fee rate...");
    const currentFeeRate = await router.feeRate();
    console.log(`   Current fee rate: ${currentFeeRate} bps (${Number(currentFeeRate) / 100}%)`);

    if (Number(currentFeeRate) === NEW_FEE_RATE) {
      console.log(`   ✓ Fee rate is already set to ${NEW_FEE_RATE} bps. No update needed.`);
      return true;
    }

    // Update fee rate
    console.log(`\n3. Updating fee rate to ${NEW_FEE_RATE} bps (${NEW_FEE_RATE / 100}%)...`);
    const tx = await router.updateFeeRate(NEW_FEE_RATE);
    console.log(`   Transaction hash: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);

    const receipt = await tx.wait();
    console.log(`   ✓ Transaction confirmed in block ${receipt.blockNumber}`);

    // Verify the update
    console.log("\n4. Verifying update...");
    const updatedFeeRate = await router.feeRate();
    console.log(`   New fee rate: ${updatedFeeRate} bps (${Number(updatedFeeRate) / 100}%)`);

    if (Number(updatedFeeRate) === NEW_FEE_RATE) {
      console.log(`\n   ✅ SUCCESS: Fee rate updated successfully on ${chainName}!`);
      return true;
    } else {
      console.error(`\n   ❌ ERROR: Fee rate verification failed!`);
      return false;
    }

  } catch (error) {
    console.error(`\n❌ Error updating fee rate on ${chainName}:`, error.message);
    if (error.reason) {
      console.error(`   Reason: ${error.reason}`);
    }
    return false;
  }
}

async function main() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║     DecaFlow Platform Fee Rate Update Script                  ║");
  console.log("║     Updating from 0.8% (80 bps) to 1.5% (150 bps)             ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("\n❌ ERROR: DEPLOYER_PRIVATE_KEY or PRIVATE_KEY not found in environment!");
    console.error("Please set your private key in .env file or environment.");
    process.exit(1);
  }

  const results = {};

  // Update on all chains
  for (const chainId of Object.keys(LIQUIDITY_ROUTER_ADDRESSES).map(Number)) {
    const success = await updateFeeRate(chainId);
    results[CHAIN_NAMES[chainId]] = success;
  }

  // Summary
  console.log("\n\n");
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║                        SUMMARY                                 ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log("");

  for (const [chainName, success] of Object.entries(results)) {
    const status = success ? "✅ SUCCESS" : "❌ FAILED";
    console.log(`   ${chainName.padEnd(15)} ${status}`);
  }

  console.log("\n");

  const allSuccess = Object.values(results).every(v => v === true);
  if (allSuccess) {
    console.log("🎉 All contracts updated successfully!");
  } else {
    console.log("⚠️  Some contracts failed to update. Please check the logs above.");
  }

  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
