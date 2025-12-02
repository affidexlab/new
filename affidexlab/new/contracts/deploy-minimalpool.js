const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

const CHAINS = {
  base: { chainId: 8453, name: 'Base', explorer: 'https://basescan.org' },
  arbitrum: { chainId: 42161, name: 'Arbitrum', explorer: 'https://arbiscan.io' },
  polygon: { chainId: 137, name: 'Polygon', explorer: 'https://polygonscan.com' },
  avalanche: { chainId: 43114, name: 'Avalanche', explorer: 'https://snowtrace.io' },
};

async function deployToChain(chainName) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`DEPLOYING TO ${chainName.toUpperCase()}`);
  console.log(`${'='.repeat(70)}`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} native tokens`);

  if (balance === 0n) {
    console.log(`❌ Insufficient balance on ${chainName}\n`);
    return null;
  }

  console.log('\nDeploying MinimalFactory...');
  const MinimalFactory = await ethers.getContractFactory('MinimalFactory');
  const factory = await MinimalFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log(`✅ MinimalFactory deployed at: ${factoryAddress}`);
  
  const chainInfo = CHAINS[chainName];
  console.log(`   View: ${chainInfo.explorer}/address/${factoryAddress}`);

  // Verify owner
  const owner = await factory.owner();
  console.log(`   Owner: ${owner}`);
  
  return factoryAddress;
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║       MinimalFactory Mainnet Deployment                  ║
║       For DecaFlow Campaign Pools                        ║
╚══════════════════════════════════════════════════════════╝
  `);

  console.log('⚠️  WARNING: MinimalPool contracts are for campaigns only.');
  console.log('    DO NOT use in production without comprehensive audit.\n');

  const networkName = network.name;
  console.log(`Network: ${networkName}`);

  if (!CHAINS[networkName]) {
    console.error(`❌ Unsupported network: ${networkName}`);
    console.log('Supported networks: base, arbitrum, polygon, avalanche');
    process.exit(1);
  }

  let factoryAddress;
  try {
    factoryAddress = await deployToChain(networkName);
  } catch (error) {
    console.error(`❌ Deployment error:`, error.message);
    process.exit(1);
  }

  if (!factoryAddress) {
    console.log('\n❌ Deployment failed');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('DEPLOYMENT COMPLETE');
  console.log(`${'='.repeat(70)}\n`);

  const chainInfo = CHAINS[networkName];
  console.log(`Chain: ${chainInfo.name} (${chainInfo.chainId})`);
  console.log(`MinimalFactory: ${factoryAddress}\n`);

  // Save deployment info
  const deploymentsFile = path.join(__dirname, 'minimal-pool-deployments.json');
  let deployments = {};
  
  if (fs.existsSync(deploymentsFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsFile, 'utf8'));
  }
  
  deployments[chainInfo.chainId] = factoryAddress;
  
  fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));
  console.log(`✅ Deployment addresses saved to minimal-pool-deployments.json\n`);

  console.log(`${'='.repeat(70)}`);
  console.log('NEXT STEPS:');
  console.log(`${'='.repeat(70)}\n`);
  console.log('1. Update app/src/lib/contracts.ts with:');
  console.log(`   ${chainInfo.chainId}: "${factoryAddress}", // ${chainInfo.name}\n`);
  console.log('2. Redeploy frontend to Vercel');
  console.log('3. Test pool creation on the Pools page');
  console.log('4. Only create pools for small campaigns with TVL caps\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
