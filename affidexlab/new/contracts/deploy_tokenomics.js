/**
 * Deployment script for DECA token and ecosystem contracts
 * 
 * Run: npx hardhat run scripts/deploy_tokenomics.js --network arbitrum
 */

const hre = require("hardhat");
const fs = require("fs");

// Deployment configuration
const CONFIG = {
  // Token allocation addresses (UPDATE THESE BEFORE DEPLOYMENT)
  DEPLOYER: "", // Will be set to deployer address
  USDC_ADDRESS: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum USDC
  
  // Allocation amounts (matching white paper)
  TOTAL_SUPPLY: ethers.parseEther("1000000000"), // 1 billion
  COMMUNITY_ALLOCATION: ethers.parseEther("300000000"),  // 30%
  TEAM_ALLOCATION: ethers.parseEther("200000000"),       // 20%
  INVESTOR_ALLOCATION: ethers.parseEther("150000000"),   // 15%
  PARTNER_ALLOCATION: ethers.parseEther("100000000"),    // 10%
  TREASURY_ALLOCATION: ethers.parseEther("150000000"),   // 15%
  LIQUIDITY_ALLOCATION: ethers.parseEther("100000000"),  // 10%
  
  // Airdrop allocation
  AIRDROP_ALLOCATION: ethers.parseEther("50000000"), // 5% (from community allocation)
  
  // Vesting schedules (in seconds)
  TEAM_CLIFF: 365 * 24 * 60 * 60,      // 12 months
  TEAM_VESTING: 3 * 365 * 24 * 60 * 60, // 36 months after cliff
  
  INVESTOR_CLIFF: 180 * 24 * 60 * 60,   // 6 months
  INVESTOR_VESTING: 2 * 365 * 24 * 60 * 60, // 24 months after cliff
  
  PARTNER_CLIFF: 180 * 24 * 60 * 60,    // 6 months
  PARTNER_VESTING: 2 * 365 * 24 * 60 * 60, // 24 months after cliff
  
  // Governance
  TIMELOCK_DELAY: 2 * 24 * 60 * 60, // 2 days
  
  // Merkle root (will be generated off-chain)
  MERKLE_ROOT: "0x0000000000000000000000000000000000000000000000000000000000000000", // PLACEHOLDER
};

async function main() {
  console.log("🚀 Starting DECA Tokenomics Deployment\n");
  
  const [deployer] = await ethers.getSigners();
  CONFIG.DEPLOYER = deployer.address;
  
  console.log(`📝 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);
  
  const deployedContracts = {};
  
  // ========================================
  // 1. Deploy DECA Token with Votes
  // ========================================
  console.log("📜 Deploying DECA Token with Votes...");
  const DecaToken = await ethers.getContractFactory("DecaFlowTokenWithVotes");
  const decaToken = await DecaToken.deploy();
  await decaToken.waitForDeployment();
  deployedContracts.decaToken = await decaToken.getAddress();
  console.log(`✅ DECA Token deployed: ${deployedContracts.decaToken}\n`);
  
  // ========================================
  // 2. Deploy Staking Contract
  // ========================================
  console.log("🏦 Deploying Staking Contract...");
  const Staking = await ethers.getContractFactory("DECAStaking");
  const staking = await Staking.deploy(
    deployedContracts.decaToken,
    CONFIG.USDC_ADDRESS
  );
  await staking.waitForDeployment();
  deployedContracts.staking = await staking.getAddress();
  console.log(`✅ Staking deployed: ${deployedContracts.staking}\n`);
  
  // ========================================
  // 3. Deploy Vesting Contracts
  // ========================================
  console.log("⏰ Deploying Vesting Contracts...");
  
  // Team Vesting
  const TeamVesting = await ethers.getContractFactory("TokenVesting");
  const teamVesting = await TeamVesting.deploy(deployedContracts.decaToken);
  await teamVesting.waitForDeployment();
  deployedContracts.teamVesting = await teamVesting.getAddress();
  console.log(`✅ Team Vesting deployed: ${deployedContracts.teamVesting}`);
  
  // Investor Vesting
  const InvestorVesting = await ethers.getContractFactory("TokenVesting");
  const investorVesting = await InvestorVesting.deploy(deployedContracts.decaToken);
  await investorVesting.waitForDeployment();
  deployedContracts.investorVesting = await investorVesting.getAddress();
  console.log(`✅ Investor Vesting deployed: ${deployedContracts.investorVesting}`);
  
  // Partner Vesting
  const PartnerVesting = await ethers.getContractFactory("TokenVesting");
  const partnerVesting = await PartnerVesting.deploy(deployedContracts.decaToken);
  await partnerVesting.waitForDeployment();
  deployedContracts.partnerVesting = await partnerVesting.getAddress();
  console.log(`✅ Partner Vesting deployed: ${deployedContracts.partnerVesting}\n`);
  
  // ========================================
  // 4. Deploy Timelock for Governance
  // ========================================
  console.log("🕐 Deploying Timelock Controller...");
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelock = await TimelockController.deploy(
    CONFIG.TIMELOCK_DELAY,
    [], // proposers (will be set to governor)
    [], // executors (will be set to governor)
    deployer.address // admin
  );
  await timelock.waitForDeployment();
  deployedContracts.timelock = await timelock.getAddress();
  console.log(`✅ Timelock deployed: ${deployedContracts.timelock}\n`);
  
  // ========================================
  // 5. Deploy Governance
  // ========================================
  console.log("🏛️  Deploying Governance Contract...");
  const Governor = await ethers.getContractFactory("DecaFlowGovernor");
  const governor = await Governor.deploy(
    deployedContracts.decaToken,
    deployedContracts.timelock
  );
  await governor.waitForDeployment();
  deployedContracts.governor = await governor.getAddress();
  console.log(`✅ Governor deployed: ${deployedContracts.governor}\n`);
  
  // ========================================
  // 6. Setup Timelock Roles
  // ========================================
  console.log("🔐 Setting up Timelock roles...");
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();
  
  await timelock.grantRole(PROPOSER_ROLE, deployedContracts.governor);
  console.log("✅ Granted PROPOSER_ROLE to Governor");
  
  await timelock.grantRole(EXECUTOR_ROLE, deployedContracts.governor);
  console.log("✅ Granted EXECUTOR_ROLE to Governor");
  
  // Optionally renounce admin role (for full decentralization)
  // await timelock.revokeRole(ADMIN_ROLE, deployer.address);
  // console.log("✅ Renounced admin role\n");
  
  // ========================================
  // 7. Deploy Airdrop Contract
  // ========================================
  console.log("🎁 Deploying Airdrop Contract...");
  const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
  const airdrop = await MerkleAirdrop.deploy(
    deployedContracts.decaToken,
    CONFIG.MERKLE_ROOT, // UPDATE THIS with actual Merkle root before deployment
    CONFIG.AIRDROP_ALLOCATION,
    deployedContracts.timelock // Treasury = Timelock (controlled by DAO)
  );
  await airdrop.waitForDeployment();
  deployedContracts.airdrop = await airdrop.getAddress();
  console.log(`✅ Airdrop deployed: ${deployedContracts.airdrop}\n`);
  
  // ========================================
  // 8. Distribute Token Allocations
  // ========================================
  console.log("📤 Distributing token allocations...");
  
  // Community allocation address (airdrop contract will get some, rest goes to DAO)
  const communityAllocationAddress = deployedContracts.airdrop;
  
  await decaToken.distributeAllocations(
    communityAllocationAddress,
    deployedContracts.teamVesting,
    deployedContracts.investorVesting,
    deployedContracts.partnerVesting,
    deployedContracts.timelock, // Treasury controlled by DAO
    deployer.address // Liquidity (will be added to DEX pools manually)
  );
  console.log("✅ Token allocations distributed\n");
  
  // ========================================
  // Summary
  // ========================================
  console.log("✅ ===================================");
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("✅ ===================================\n");
  
  console.log("📋 Deployed Contracts:");
  console.log(`   DECA Token: ${deployedContracts.decaToken}`);
  console.log(`   Staking: ${deployedContracts.staking}`);
  console.log(`   Team Vesting: ${deployedContracts.teamVesting}`);
  console.log(`   Investor Vesting: ${deployedContracts.investorVesting}`);
  console.log(`   Partner Vesting: ${deployedContracts.partnerVesting}`);
  console.log(`   Timelock: ${deployedContracts.timelock}`);
  console.log(`   Governor: ${deployedContracts.governor}`);
  console.log(`   Airdrop: ${deployedContracts.airdrop}`);
  console.log(`   Liquidity Holder: ${deployer.address}\n`);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: deployedContracts,
    config: CONFIG,
  };
  
  fs.writeFileSync(
    `deployments-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`✅ Deployment info saved to deployments-${hre.network.name}.json\n`);
  
  // ========================================
  // Next Steps
  // ========================================
  console.log("📝 NEXT STEPS:");
  console.log("   1. Verify contracts on Arbiscan");
  console.log("   2. Generate Merkle root for airdrop");
  console.log("   3. Update airdrop Merkle root");
  console.log("   4. Fund airdrop contract with tokens");
  console.log("   5. Add liquidity to DEX (from liquidity allocation)");
  console.log("   6. Create vesting schedules for team, investors, partners");
  console.log("   7. Transfer token ownership to DAO (governor)");
  console.log("   8. Announce token launch!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
