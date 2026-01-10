const { ethers } = require("ethers");

async function main() {
  const routers = {
    base: "0x1E7b01f8D28e757B07887Ff6BF23e46BdE4e4Cbd",
    arbitrum: "0xdBBDBDcF4B9fc8F85ae549078199ee3fb27cadB3",
    polygon: "0x1E7b01f8D28e757B07887Ff6BF23e46BdE4e4Cbd",
    avalanche: "0x41475aDeB1172905Dd1085FBe525e1A79487e49C",
  };

  const ZEROX_EXCHANGE_PROXY = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";

  const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
  if (!DEPLOYER_PRIVATE_KEY) {
    console.error("DEPLOYER_PRIVATE_KEY not set");
    process.exit(1);
  }

  const RPC_URL = "https://mainnet.base.org";
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

  const network = await provider.getNetwork();
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

  console.log("Whitelisting 0x Exchange Proxy on FeeRouter contracts...\n");
  console.log(`Chain: ${chainName} (${chainId})`);
  console.log(`FeeRouter: ${routerAddress}`);
  console.log(`0x Exchange Proxy: ${ZEROX_EXCHANGE_PROXY}\n`);

  const FeeRouterABI = [
    "function whitelistedTargets(address) view returns (bool)",
    "function setWhitelistedTarget(address target, bool allowed)",
    "function owner() view returns (address)"
  ];

  const router = new ethers.Contract(routerAddress, FeeRouterABI, wallet);

  const owner = await router.owner();
  console.log(`Contract owner: ${owner}`);
  console.log(`Wallet address: ${wallet.address}\n`);

  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error("❌ ERROR: Wallet is not the contract owner!");
    console.error(`Expected: ${owner}`);
    console.error(`Got: ${wallet.address}`);
    process.exit(1);
  }

  const isWhitelisted = await router.whitelistedTargets(ZEROX_EXCHANGE_PROXY);
  console.log(`Current whitelist status: ${isWhitelisted}\n`);

  if (isWhitelisted) {
    console.log("✅ 0x Exchange Proxy is already whitelisted!");
    return;
  }

  console.log("Whitelisting 0x Exchange Proxy...");
  const tx = await router.setWhitelistedTarget(ZEROX_EXCHANGE_PROXY, true);
  console.log(`Transaction hash: ${tx.hash}`);
  
  console.log("Waiting for confirmation...");
  await tx.wait();
  console.log("✅ 0x Exchange Proxy whitelisted successfully!\n");

  const newStatus = await router.whitelistedTargets(ZEROX_EXCHANGE_PROXY);
  console.log(`New whitelist status: ${newStatus}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
