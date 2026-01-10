const { ethers } = require("hardhat");

async function main() {
  // FeeRouter addresses
  const routers = {
    base: "0x1E7b01f8D28e757B07887Ff6BF23e46BdE4e4Cbd",
    arbitrum: "0xdBBDBDcF4B9fc8F85ae549078199ee3fb27cadB3",
    polygon: "0x1E7b01f8D28e757B07887Ff6BF23e46BdE4e4Cbd",
    avalanche: "0x41475aDeB1172905Dd1085FBe525e1A79487e49C",
  };

  // 0x Exchange Proxy address (same on all chains)
  const ZEROX_EXCHANGE_PROXY = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";

  console.log("Whitelisting 0x Exchange Proxy on FeeRouter contracts...\n");

  // Get the network
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  let routerAddress;
  let chainName;

  if (chainId === 8453n) {
    routerAddress = routers.base;
    chainName = "Base";
  } else if (chainId === 42161n) {
    routerAddress = routers.arbitrum;
    chainName = "Arbitrum";
  } else if (chainId === 137n) {
    routerAddress = routers.polygon;
    chainName = "Polygon";
  } else if (chainId === 43114n) {
    routerAddress = routers.avalanche;
    chainName = "Avalanche";
  } else {
    console.error("Unsupported chain ID:", chainId);
    process.exit(1);
  }

  console.log(`Chain: ${chainName} (${chainId})`);
  console.log(`FeeRouter: ${routerAddress}`);
  console.log(`0x Exchange Proxy: ${ZEROX_EXCHANGE_PROXY}\n`);

  // Get FeeRouter contract
  const FeeRouter = await ethers.getContractFactory("FeeRouter");
  const router = FeeRouter.attach(routerAddress);

  // Check current whitelist status
  const isWhitelisted = await router.whitelistedTargets(ZEROX_EXCHANGE_PROXY);
  console.log(`Current whitelist status: ${isWhitelisted}\n`);

  if (isWhitelisted) {
    console.log("✅ 0x Exchange Proxy is already whitelisted!");
    return;
  }

  // Whitelist the 0x Exchange Proxy
  console.log("Whitelisting 0x Exchange Proxy...");
  const tx = await router.setWhitelistedTarget(ZEROX_EXCHANGE_PROXY, true);
  console.log(`Transaction hash: ${tx.hash}`);
  
  await tx.wait();
  console.log("✅ 0x Exchange Proxy whitelisted successfully!\n");

  // Verify
  const newStatus = await router.whitelistedTargets(ZEROX_EXCHANGE_PROXY);
  console.log(`New whitelist status: ${newStatus}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
