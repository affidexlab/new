import { ethers } from "ethers";
import fs from "fs";

const ROUTER_CONFIG = {
  8453: {
    chainId: 8453,
    name: "Base",
    rpc: "https://mainnet.base.org",
    uniswapV3Router: "0x2626664c2603336E57B271c5C0b26F421741e481",
    aerodromeRouter: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
  },
  42161: {
    chainId: 42161,
    name: "Arbitrum",
    rpc: "https://arb1.arbitrum.io/rpc",
    uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
  },
  10: {
    chainId: 10,
    name: "Optimism",
    rpc: "https://mainnet.optimism.io",
    uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
  },
  137: {
    chainId: 137,
    name: "Polygon",
    rpc: "https://polygon-rpc.com",
    uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
  },
  43114: {
    chainId: 43114,
    name: "Avalanche",
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    uniswapV3Router: "0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
  },
};

const TREASURY_WALLET = process.env.TREASURY_WALLET || "0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901";
const FEE_RATE = 150;

// Contract ABI (constructor and minimal interface)
const CONTRACT_ABI = [
  "constructor(address _uniswapV3Router, address _aerodromeRouter, address _treasury, uint256 _feeRate)"
];

async function compileContract() {
  const solcVersion = "0.8.20";
  const contractPath = "./LiquidityRouter.sol";
  
  // Read contract source
  const source = fs.readFileSync(contractPath, "utf8");
  
  // Import solc dynamically
  const solc = await import("solc");
  
  const input = {
    language: "Solidity",
    sources: {
      "LiquidityRouter.sol": { content: source },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.default.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === "error");
    if (errors.length > 0) {
      console.error("Compilation errors:");
      errors.forEach(err => console.error(err.formattedMessage));
      throw new Error("Contract compilation failed");
    }
  }

  const contract = output.contracts["LiquidityRouter.sol"]["LiquidityRouter"];
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

async function deployToChain(chainId, privateKey) {
  const config = ROUTER_CONFIG[chainId];
  if (!config) {
    throw new Error(`Chain ID ${chainId} not configured`);
  }

  console.log(`\n🚀 Deploying LiquidityRouter to ${config.name} (Chain ID: ${chainId})`);
  console.log(`   RPC: ${config.rpc}`);
  console.log(`   Uniswap V3 Router: ${config.uniswapV3Router}`);
  console.log(`   Aerodrome Router: ${config.aerodromeRouter}`);
  console.log(`   Treasury: ${TREASURY_WALLET}`);
  console.log(`   Fee Rate: ${FEE_RATE} bps (${FEE_RATE / 100}%)\n`);

  // Connect to provider
  const provider = new ethers.JsonRpcProvider(config.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`   Deployer: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} ${getNativeSymbol(chainId)}\n`);

  // Compile contract
  console.log("   Compiling contract...");
  const { abi, bytecode } = await compileContract();

  // Deploy contract
  console.log("   Deploying contract...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(
    config.uniswapV3Router,
    config.aerodromeRouter,
    TREASURY_WALLET,
    FEE_RATE
  );

  console.log(`   Transaction hash: ${contract.deploymentTransaction().hash}`);
  console.log("   Waiting for confirmation...");
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ LiquidityRouter deployed to: ${address}\n`);

  const deploymentInfo = {
    chainId,
    chainName: config.name,
    routerAddress: address,
    transactionHash: contract.deploymentTransaction().hash,
    uniswapV3Router: config.uniswapV3Router,
    aerodromeRouter: config.aerodromeRouter,
    treasury: TREASURY_WALLET,
    feeRate: FEE_RATE,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
  };

  return deploymentInfo;
}

function getNativeSymbol(chainId) {
  const symbols = {
    1: "ETH",
    42161: "ETH",
    10: "ETH",
    137: "MATIC",
    8453: "ETH",
    43114: "AVAX",
  };
  return symbols[chainId] || "ETH";
}

async function main() {
  const chainIdArg = process.argv[2];
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY environment variable not set");
  }

  if (!chainIdArg) {
    console.error("Usage: node deploy_direct.js <chainId>");
    console.error("Available chain IDs: 8453 (Base), 42161 (Arbitrum), 10 (Optimism), 137 (Polygon), 43114 (Avalanche)");
    process.exit(1);
  }

  const chainId = parseInt(chainIdArg);
  const deploymentInfo = await deployToChain(chainId, privateKey);

  console.log(`📄 Deployment Info:`);
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const filename = `deployment_${chainId}_${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
