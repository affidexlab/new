const fs = require('fs');
const path = require('path');
const solc = require('solc');
const Web3 = require('web3').default;
const crypto = require('crypto');

// Configuration
const TREASURY_ADDRESS = '0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901';
const ZEROX_PROXY = '0xDef1C0ded9bec7F1a1670819833240f027b25EfF';

const CHAINS = {
  arbitrum: { 
    chainId: 42161, 
    rpc: 'https://arb1.arbitrum.io/rpc', 
    explorer: 'https://arbiscan.io',
    name: 'Arbitrum'
  },
  base: { 
    chainId: 8453, 
    rpc: 'https://mainnet.base.org', 
    explorer: 'https://basescan.org',
    name: 'Base'
  },
  polygon: { 
    chainId: 137, 
    rpc: 'https://polygon-rpc.com', 
    explorer: 'https://polygonscan.com',
    name: 'Polygon'
  },
  avalanche: { 
    chainId: 43114, 
    rpc: 'https://api.avax.network/ext/bc/C/rpc', 
    explorer: 'https://snowtrace.io',
    name: 'Avalanche'
  },
  optimism: {
    chainId: 10,
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    name: 'Optimism'
  },
  ethereum: {
    chainId: 1,
    rpc: 'https://eth.drpc.org',
    explorer: 'https://etherscan.io',
    name: 'Ethereum'
  }
};

function findImports(importPath) {
  try {
    const nodeModulesDir = path.join(__dirname, 'node_modules');
    
    if (importPath.startsWith('@openzeppelin/')) {
      const fullPath = path.join(nodeModulesDir, importPath);
      if (fs.existsSync(fullPath)) {
        return { contents: fs.readFileSync(fullPath, 'utf8') };
      }
    }
    
    return { error: 'File not found: ' + importPath };
  } catch (e) {
    return { error: e.message };
  }
}

function compileContract() {
  console.log('📦 Compiling FeeRouter.sol with OpenZeppelin dependencies...\n');

  const feeRouterSource = fs.readFileSync(path.join(__dirname, 'FeeRouter.sol'), 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'FeeRouter.sol': { content: feeRouterSource },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode'] },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('❌ Compilation errors:');
      errors.forEach(err => console.error(err.formattedMessage));
      process.exit(1);
    }
    output.errors.filter(e => e.severity === 'warning').forEach(w => console.warn(w.formattedMessage));
  }

  const contract = output.contracts['FeeRouter.sol']['FeeRouter'];
  console.log('✅ Compilation successful\n');

  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

async function deployToChain(chainName, chainConfig, abi, bytecode, privateKey) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 DEPLOYING TO ${chainConfig.name.toUpperCase()} (Chain ID: ${chainConfig.chainId})`);
  console.log(`${'='.repeat(70)}`);

  const web3 = new Web3(chainConfig.rpc);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  const balance = await web3.eth.getBalance(account.address);
  const balanceEth = web3.utils.fromWei(balance, 'ether');
  
  console.log(`📍 Deployer: ${account.address}`);
  console.log(`💰 Balance: ${balanceEth} native tokens`);

  if (BigInt(balance) === 0n) {
    console.log(`❌ Insufficient balance on ${chainConfig.name}\n`);
    return null;
  }

  try {
    const FeeRouter = new web3.eth.Contract(abi);
    const deployTx = FeeRouter.deploy({ data: '0x' + bytecode });

    console.log('⛽ Estimating deployment gas...');
    const gasEstimate = await deployTx.estimateGas({ from: account.address });
    console.log(`   Gas estimate: ${gasEstimate}`);

    const gasPrice = await web3.eth.getGasPrice();
    const gasPriceGwei = web3.utils.fromWei(gasPrice, 'gwei');
    console.log(`   Gas price: ${gasPriceGwei} gwei`);

    const estimatedCost = web3.utils.fromWei((BigInt(gasEstimate) * BigInt(gasPrice)).toString(), 'ether');
    console.log(`   Estimated cost: ${estimatedCost} native tokens`);

    console.log('\n📝 Deploying FeeRouter contract...');
    const contract = await deployTx.send({
      from: account.address,
      gas: Math.floor(Number(gasEstimate) * 1.3),
      gasPrice: gasPrice,
    });

    const contractAddress = contract.options.address;
    console.log(`✅ FeeRouter deployed at: ${contractAddress}`);
    console.log(`   📊 View: ${chainConfig.explorer}/address/${contractAddress}`);

    // Whitelist 0x Exchange Proxy
    console.log(`\n🔐 Whitelisting 0x Exchange Proxy (${ZEROX_PROXY})...`);
    const whitelistTx = contract.methods.setWhitelistedTarget(ZEROX_PROXY, true);
    const whitelistGas = await whitelistTx.estimateGas({ from: account.address });
    
    const whitelistReceipt = await whitelistTx.send({
      from: account.address,
      gas: Math.floor(Number(whitelistGas) * 1.3),
      gasPrice: gasPrice,
    });

    console.log(`✅ Whitelisted 0x Exchange Proxy`);
    console.log(`   📊 Tx: ${chainConfig.explorer}/tx/${whitelistReceipt.transactionHash}`);

    // Verify whitelist
    const isWhitelisted = await contract.methods.whitelistedTargets(ZEROX_PROXY).call();
    console.log(`   ✓ Verification: ${isWhitelisted ? 'SUCCESS' : 'FAILED'}`);

    return {
      address: contractAddress,
      deploymentTx: contract.options.address,
      whitelistTx: whitelistReceipt.transactionHash,
      deployer: account.address,
      chain: chainConfig.name,
      chainId: chainConfig.chainId
    };
  } catch (error) {
    console.error(`❌ Deployment error on ${chainConfig.name}:`, error.message);
    return null;
  }
}

function generateFeeSignerKey() {
  const privateKey = '0x' + crypto.randomBytes(32).toString('hex');
  const Web3Instance = new Web3();
  const account = Web3Instance.eth.accounts.privateKeyToAccount(privateKey);
  
  return {
    privateKey,
    address: account.address
  };
}

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ DEPLOYER_PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           🔐 FEE ENFORCEMENT DEPLOYMENT SYSTEM 🔐                ║
║                                                                  ║
║  Deploying FeeRouter with Onchain Fee Enforcement                ║
║  Treasury: ${TREASURY_ADDRESS}                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);

  // Generate Fee Signer Hot Key
  console.log('\n🔑 Generating Fee Signer Hot Key (Server Key)...\n');
  const feeSigner = generateFeeSignerKey();
  console.log(`✅ Fee Signer Generated:`);
  console.log(`   Address: ${feeSigner.address}`);
  console.log(`   Private Key: ${feeSigner.privateKey}`);
  console.log(`\n⚠️  SAVE THIS KEY SECURELY - It will be used by the backend server\n`);

  // Compile contract
  const { abi, bytecode } = compileContract();
  
  // Deploy to all chains
  const deployments = {};
  const deploymentDetails = [];

  for (const [chainName, chainConfig] of Object.entries(CHAINS)) {
    try {
      const result = await deployToChain(chainName, chainConfig, abi, bytecode, privateKey);
      if (result) {
        deployments[chainConfig.chainId] = result.address;
        deploymentDetails.push(result);
      }
    } catch (error) {
      console.error(`❌ Unexpected error deploying to ${chainName}:`, error.message);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log(`${'='.repeat(70)}\n`);

  if (Object.keys(deployments).length === 0) {
    console.log('❌ No successful deployments');
    process.exit(1);
  }

  console.log(`✅ Successfully deployed to ${Object.keys(deployments).length} chain(s):\n`);
  
  deploymentDetails.forEach(detail => {
    console.log(`  ${detail.chain.padEnd(12)} (${detail.chainId.toString().padEnd(5)}): ${detail.address}`);
  });

  // Save deployment info
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    treasury: TREASURY_ADDRESS,
    feeSigner: feeSigner.address,
    feeSignerPrivateKey: feeSigner.privateKey,
    zeroXProxy: ZEROX_PROXY,
    deployments: deployments,
    details: deploymentDetails
  };

  fs.writeFileSync(
    path.join(__dirname, 'fee_enforcement_deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n✅ Deployment info saved to fee_enforcement_deployment.json\n`);

  // Update instructions
  console.log(`${'='.repeat(70)}`);
  console.log('📝 NEXT STEPS - UPDATE CONSTANTS.TS');
  console.log(`${'='.repeat(70)}\n`);
  
  console.log('1. Update app/src/lib/constants.ts with these addresses:\n');
  console.log('export const ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {');
  Object.entries(deployments).forEach(([chainId, address]) => {
    const detail = deploymentDetails.find(d => d.chainId.toString() === chainId);
    console.log(`  ${chainId}: "${address}", // ${detail.chain}`);
  });
  console.log('};\n');

  console.log('2. Update backend environment variables:\n');
  console.log(`FEE_SIGNER_PRIVATE_KEY=${feeSigner.privateKey}`);
  console.log(`FEE_SIGNER_ADDRESS=${feeSigner.address}`);
  console.log(`TREASURY_ADDRESS=${TREASURY_ADDRESS}`);
  console.log(`SWAP_FEE_BPS=150 # 1.5% fee\n`);

  console.log(`${'='.repeat(70)}`);
  console.log('✅ DEPLOYMENT COMPLETE');
  console.log(`${'='.repeat(70)}\n`);
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
