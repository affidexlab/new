const hre = require("hardhat");

const ROUTER_CONFIG = {
  "ethereum": {
    chainId: 1,
    name: "Ethereum",
    uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  "arbitrum": {
    chainId: 42161,
    name: "Arbitrum",
    uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
    weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  "optimism": {
    chainId: 10,
    name: "Optimism",
    uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
    weth: "0x4200000000000000000000000000000000000006",
  },
  "polygon": {
    chainId: 137,
    name: "Polygon",
    uniswapV3Router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
    weth: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  "base": {
    chainId: 8453,
    name: "Base",
    uniswapV3Router: "0x2626664c2603336E57B271c5C0b26F421741e481",
    aerodromeRouter: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
    weth: "0x4200000000000000000000000000000000000006",
  },
  "avalanche": {
    chainId: 43114,
    name: "Avalanche",
    uniswapV3Router: "0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE",
    aerodromeRouter: "0x0000000000000000000000000000000000000000",
    weth: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
};

const TREASURY_WALLET = process.env.TREASURY_WALLET || "0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901";
const FEE_RATE = 150;

async function main() {
  const networkName = hre.network.name;
  const config = ROUTER_CONFIG[networkName];
  
  if (!config) {
    throw new Error(`Network ${networkName} not configured`);
  }

  const chainIdDecimal = config.chainId;

  console.log(`\n🚀 Deploying LiquidityRouter to ${config.name} (Chain ID: ${chainIdDecimal})`);
  console.log(`   Uniswap V3 Router: ${config.uniswapV3Router}`);
  console.log(`   Aerodrome Router: ${config.aerodromeRouter}`);
  console.log(`   WETH: ${config.weth}`);
  console.log(`   Treasury: ${TREASURY_WALLET}`);
  console.log(`   Fee Rate: ${FEE_RATE} bps (${FEE_RATE / 100}%)\n`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`   Deployer: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`   Balance: ${hre.ethers.formatEther(balance)} ${getNativeSymbol(chainIdDecimal)}\n`);

  const LiquidityRouter = await hre.ethers.getContractFactory("LiquidityRouter");
  
  console.log("   Deploying contract...");
  const router = await LiquidityRouter.deploy(
    config.uniswapV3Router,
    config.aerodromeRouter,
    config.weth,
    TREASURY_WALLET,
    FEE_RATE
  );

  await router.waitForDeployment();
  const address = await router.getAddress();

  console.log(`✅ LiquidityRouter deployed to: ${address}\n`);

  const deploymentInfo = {
    chainId: chainIdDecimal,
    chainName: config.name,
    routerAddress: address,
    uniswapV3Router: config.uniswapV3Router,
    aerodromeRouter: config.aerodromeRouter,
    weth: config.weth,
    treasury: TREASURY_WALLET,
    feeRate: FEE_RATE,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  console.log(`📄 Deployment Info:`);
  console.log(JSON.stringify(deploymentInfo, null, 2));

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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
