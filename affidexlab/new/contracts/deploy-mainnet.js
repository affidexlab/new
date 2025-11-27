const fs = require('fs');
const path = require('path');
const solc = require('solc');
const Web3 = require('web3').default;

const CHAINS = {
  ethereum: { chainId: 1, rpc: process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth', explorer: 'https://etherscan.io' },
  optimism: { chainId: 10, rpc: process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io', explorer: 'https://optimistic.etherscan.io' },
  arbitrum: { chainId: 42161, rpc: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io' },
  base: { chainId: 8453, rpc: process.env.BASE_RPC || 'https://mainnet.base.org', explorer: 'https://basescan.org' },
  polygon: { chainId: 137, rpc: process.env.POLYGON_RPC || 'https://polygon-rpc.com', explorer: 'https://polygonscan.com' },
  avalanche: { chainId: 43114, rpc: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc', explorer: 'https://snowtrace.io' },
};

const ZEROX_PROXY = '0xDef1C0ded9bec7F1a1670819833240f027b25EfF';

function findImports(importPath) {
  try {
    const contractsDir = path.join(__dirname, 'contracts');
    const nodeModulesDir = path.join(__dirname, 'node_modules');
    
    if (importPath.startsWith('@openzeppelin/')) {
      const fullPath = path.join(nodeModulesDir, importPath);
      if (fs.existsSync(fullPath)) {
        return { contents: fs.readFileSync(fullPath, 'utf8') };
      }
    }
    
    const localPath = path.join(contractsDir, importPath);
    if (fs.existsSync(localPath)) {
      return { contents: fs.readFileSync(localPath, 'utf8') };
    }
    
    return { error: 'File not found: ' + importPath };
  } catch (e) {
    return { error: e.message };
  }
}

function compileContract() {
  console.log('Compiling FeeRouter.sol with OpenZeppelin dependencies...\n');

  const feeRouterSource = fs.readFileSync(path.join(__dirname, 'contracts/FeeRouter.sol'), 'utf8');

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
      console.error('Compilation errors:');
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
  console.log(`DEPLOYING TO ${chainName.toUpperCase()} (Chain ID: ${chainConfig.chainId})`);
  console.log(`${'='.repeat(70)}`);

  const web3 = new Web3(chainConfig.rpc);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  const balance = await web3.eth.getBalance(account.address);
  console.log(`Deployer: ${account.address}`);
  console.log(`Balance: ${web3.utils.fromWei(balance, 'ether')} native tokens`);

  if (BigInt(balance) === 0n) {
    console.log(`❌ Insufficient balance on ${chainName}\n`);
    return null;
  }

  const FeeRouter = new web3.eth.Contract(abi);
  const deployTx = FeeRouter.deploy({ data: '0x' + bytecode });

  console.log('Estimating deployment gas...');
  const gasEstimate = await deployTx.estimateGas({ from: account.address });
  console.log(`Gas estimate: ${gasEstimate}`);

  const gasPrice = await web3.eth.getGasPrice();
  console.log(`Gas price: ${web3.utils.fromWei(gasPrice, 'gwei')} gwei`);

  console.log('Deploying contract...');
  const contract = await deployTx.send({
    from: account.address,
    gas: Math.floor(Number(gasEstimate) * 1.3),
    gasPrice: gasPrice,
  });

  const contractAddress = contract.options.address;
  console.log(`✅ FeeRouter deployed at: ${contractAddress}`);
  console.log(`   View: ${chainConfig.explorer}/address/${contractAddress}\n`);

  console.log('Setting whitelisted target (0x Exchange Proxy)...');
  const whitelistTx = contract.methods.setWhitelistedTarget(ZEROX_PROXY, true);
  const whitelistGas = await whitelistTx.estimateGas({ from: account.address });
  
  const receipt = await whitelistTx.send({
    from: account.address,
    gas: Math.floor(Number(whitelistGas) * 1.3),
    gasPrice: gasPrice,
  });

  console.log(`✅ Whitelisted ${ZEROX_PROXY}`);
  console.log(`   Tx: ${chainConfig.explorer}/tx/${receipt.transactionHash}\n`);

  return contractAddress;
}

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ DEPLOYER_PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  console.log(`
╔══════════════════════════════════════════════════════════╗
║    FeeRouter Mainnet Deployment - Security Hardening    ║
║    Chains: Ethereum, Optimism, Arbitrum, Base, Polygon, Avalanche |
╚══════════════════════════════════════════════════════════╝
  `);

  const { abi, bytecode } = compileContract();
  const deployments = {};

  for (const [chainName, chainConfig] of Object.entries(CHAINS)) {
    try {
      const address = await deployToChain(chainName, chainConfig, abi, bytecode, privateKey);
      if (address) {
        deployments[chainConfig.chainId] = address;
      }
    } catch (error) {
      console.error(`❌ Deployment error on ${chainName}:`, error.message);
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('DEPLOYMENT SUMMARY');
  console.log(`${'='.repeat(70)}\n`);

  if (Object.keys(deployments).length === 0) {
    console.log('❌ No successful deployments');
    process.exit(1);
  }

  console.log(`✅ Successfully deployed to ${Object.keys(deployments).length} chain(s):\n`);
  Object.entries(deployments).forEach(([chainId, address]) => {
    const chainName = Object.keys(CHAINS).find(k => CHAINS[k].chainId === parseInt(chainId));
    console.log(`  ${chainName.toUpperCase().padEnd(12)} (${chainId}): ${address}`);
  });

  fs.writeFileSync(
    path.join(__dirname, 'deployments.json'),
    JSON.stringify(deployments, null, 2)
  );
  console.log(`\n✅ Deployment addresses saved to deployments.json\n`);

  console.log(`${'='.repeat(70)}`);
  console.log('NEXT: Update app/src/lib/constants.ts with these addresses:');
  console.log(`${'='.repeat(70)}\n`);
  console.log('export const ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {');
  Object.entries(deployments).forEach(([chainId, address]) => {
    const chainName = Object.keys(CHAINS).find(k => CHAINS[k].chainId === parseInt(chainId));
    console.log(`  ${chainId}: "${address}", // ${chainName.charAt(0).toUpperCase() + chainName.slice(1)}`);
  });
  console.log('};');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
