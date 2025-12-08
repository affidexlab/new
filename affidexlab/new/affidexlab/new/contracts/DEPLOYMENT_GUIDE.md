# MinimalPool Contract Deployment Guide

This guide provides step-by-step instructions for deploying the MinimalPool AMM contracts to EVM-compatible chains.

## ⚠️ Important Security Notice

**This contract is designed for campaigns and testing purposes only. DO NOT use in production without a comprehensive security audit.**

## Contract Overview

The MinimalPool system consists of two contracts:

1. **MinimalFactory**: Factory contract for creating new liquidity pools
2. **MinimalPair**: Individual AMM pool with constant product formula (x * y = k)

### Features
- Constant product AMM (Uniswap V2 style)
- Configurable trading fees (in basis points)
- TVL cap tracking (informational)
- Permissioned pool creation (owner-only)

## Deployment Methods

### Method 1: Remix IDE (Recommended for Beginners)

1. **Open Remix**
   - Go to [https://remix.ethereum.org/](https://remix.ethereum.org/)

2. **Create Contract File**
   - In File Explorer, create a new file: `MinimalPool.sol`
   - Copy the entire contract code from `contracts/MinimalPool.sol`
   - Paste it into Remix

3. **Compile Contract**
   - Click on "Solidity Compiler" tab (left sidebar)
   - Select compiler version: `0.8.20` or higher
   - Click "Compile MinimalPool.sol"
   - Ensure no errors appear

4. **Deploy Contract**
   - Click on "Deploy & Run Transactions" tab
   - Set Environment to "Injected Provider - MetaMask"
   - Connect your MetaMask wallet
   - Select the network where you want to deploy:
     - Arbitrum One
     - Avalanche C-Chain
     - Base
     - Optimism
     - Polygon
   - In the "CONTRACT" dropdown, select `MinimalFactory`
   - Click "Deploy"
   - Confirm the transaction in MetaMask

5. **Copy Contract Address**
   - After deployment, expand the deployed contract
   - Copy the contract address
   - Save it securely - you'll need it to update the app

6. **Verify on Block Explorer** (Optional but Recommended)
   - Go to the appropriate block explorer:
     - Arbitrum: [arbiscan.io](https://arbiscan.io)
     - Avalanche: [snowtrace.io](https://snowtrace.io)
     - Base: [basescan.org](https://basescan.org)
     - Optimism: [optimistic.etherscan.io](https://optimistic.etherscan.io)
     - Polygon: [polygonscan.com](https://polygonscan.com)
   - Search for your contract address
   - Click "Contract" tab → "Verify and Publish"
   - Select compiler version `0.8.20`
   - Select optimization: "No"
   - Paste the contract code
   - Submit for verification

### Method 2: Foundry (Recommended for Developers)

1. **Install Foundry**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Initialize Project**
   ```bash
   cd contracts
   forge init --no-commit
   ```

3. **Add Contract**
   ```bash
   cp MinimalPool.sol src/
   ```

4. **Create Deployment Script**
   ```bash
   cat > script/Deploy.s.sol << 'EOF'
   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.20;

   import "forge-std/Script.sol";
   import "../src/MinimalPool.sol";

   contract DeployScript is Script {
       function run() external {
           uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
           vm.startBroadcast(deployerPrivateKey);

           MinimalFactory factory = new MinimalFactory();
           console.log("MinimalFactory deployed to:", address(factory));

           vm.stopBroadcast();
       }
   }
   EOF
   ```

5. **Set Environment Variables**
   ```bash
   export PRIVATE_KEY=your_private_key_here
   export RPC_URL=your_rpc_url_here
   ```

6. **Deploy to Network**
   ```bash
   # Arbitrum
   forge script script/Deploy.s.sol:DeployScript --rpc-url $ARBITRUM_RPC --broadcast --verify

   # Avalanche
   forge script script/Deploy.s.sol:DeployScript --rpc-url $AVALANCHE_RPC --broadcast --verify

   # Base
   forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_RPC --broadcast --verify

   # Optimism
   forge script script/Deploy.s.sol:DeployScript --rpc-url $OPTIMISM_RPC --broadcast --verify

   # Polygon
   forge script script/Deploy.s.sol:DeployScript --rpc-url $POLYGON_RPC --broadcast --verify
   ```

### Method 3: Hardhat

1. **Install Hardhat**
   ```bash
   cd contracts
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Initialize Hardhat**
   ```bash
   npx hardhat init
   ```

3. **Configure Network**
   Edit `hardhat.config.js`:
   ```javascript
   module.exports = {
     solidity: "0.8.20",
     networks: {
       arbitrum: {
         url: process.env.ARBITRUM_RPC,
         accounts: [process.env.PRIVATE_KEY]
       },
       avalanche: {
         url: process.env.AVALANCHE_RPC,
         accounts: [process.env.PRIVATE_KEY]
       },
       base: {
         url: process.env.BASE_RPC,
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

4. **Create Deployment Script**
   ```bash
   cat > scripts/deploy.js << 'EOF'
   async function main() {
     const Factory = await ethers.getContractFactory("MinimalFactory");
     const factory = await Factory.deploy();
     await factory.deployed();
     console.log("MinimalFactory deployed to:", factory.address);
   }

   main().catch((error) => {
     console.error(error);
     process.exitCode = 1;
   });
   EOF
   ```

5. **Deploy**
   ```bash
   npx hardhat run scripts/deploy.js --network arbitrum
   ```

## Post-Deployment Steps

### 1. Update App Configuration

After deploying, update the contract addresses in your app:

Edit `app/src/lib/contracts.ts`:

```typescript
export const MINIMAL_FACTORY_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  42161: "0xYourArbitrumAddress", // Arbitrum
  43114: "0xYourAvalancheAddress", // Avalanche
  8453: "0xYourBaseAddress",  // Base
  10: "0xYourOptimismAddress",     // Optimism
  137: "0xYourPolygonAddress",    // Polygon
};
```

### 2. Test Deployment

Test the factory by creating a pool:

```javascript
// Using ethers.js
const factory = new ethers.Contract(factoryAddress, MINIMAL_FACTORY_ABI, signer);

// Create a USDC/ETH pool with 0.3% fee and $1M TVL cap
const tx = await factory.createPair(
  "0xUSDCAddress",
  "0xETHAddress",
  30, // 0.3% fee in basis points
  ethers.utils.parseEther("1000000") // $1M TVL cap
);

const receipt = await tx.wait();
console.log("Pool created at:", receipt.events[0].args.pair);
```

### 3. Verify Contract Functions

Test essential functions:

```javascript
// Get pool address
const pairAddress = await factory.getPair(token0Address, token1Address);

// Check pool reserves
const pair = new ethers.Contract(pairAddress, MINIMAL_PAIR_ABI, provider);
const [reserve0, reserve1] = await pair.getReserves();
console.log("Reserves:", reserve0.toString(), reserve1.toString());
```

## Gas Cost Estimates

| Network | Factory Deployment | Pool Creation |
|---------|-------------------|---------------|
| Arbitrum | ~$2-3 | ~$1-2 |
| Avalanche | ~$0.50-1 | ~$0.25-0.50 |
| Base | ~$0.10-0.30 | ~$0.05-0.15 |
| Optimism | ~$0.50-1 | ~$0.25-0.50 |
| Polygon | ~$0.05-0.10 | ~$0.02-0.05 |

*Prices are approximate and vary with gas prices*

## RPC Endpoints

### Public RPC URLs (Free)

- **Arbitrum**: `https://arb1.arbitrum.io/rpc`
- **Avalanche**: `https://api.avax.network/ext/bc/C/rpc`
- **Base**: `https://mainnet.base.org`
- **Optimism**: `https://mainnet.optimism.io`
- **Polygon**: `https://polygon-rpc.com`

### Recommended RPC Providers (Better Reliability)

- [Alchemy](https://www.alchemy.com/)
- [Infura](https://infura.io/)
- [QuickNode](https://www.quicknode.com/)
- [Ankr](https://www.ankr.com/)

## Troubleshooting

### "Insufficient funds for gas"
- Ensure your wallet has enough native tokens for gas
- Arbitrum: ETH
- Avalanche: AVAX
- Base: ETH
- Optimism: ETH
- Polygon: MATIC

### "Contract creation code storage out of gas"
- Try deploying on a network with lower gas prices
- Or increase your gas limit

### "Transaction failed"
- Check you're connected to the correct network
- Verify you have enough gas
- Ensure contract code is correct

### "Already exists" error when creating pool
- This pool pair already exists
- Call `getPair(token0, token1)` to get existing pool address

## Security Best Practices

1. **Test on Testnet First**
   - Deploy to testnet (Arbitrum Goerli, Avalanche Fuji, etc.)
   - Test all functions thoroughly
   - Only then deploy to mainnet

2. **Private Key Security**
   - Never commit private keys to git
   - Use environment variables
   - Consider using a hardware wallet for production deployments

3. **Start Small**
   - Create pools with small TVL caps initially
   - Monitor for any issues
   - Gradually increase limits as confidence grows

4. **Audit Recommendation**
   - For production use, get a professional security audit
   - Popular auditors: OpenZeppelin, Trail of Bits, ConsenSys Diligence

## Support

For deployment issues or questions:
- Check DecaFlow documentation
- Review contract code comments
- Test on testnet first

## License

MIT License - See contract file for details
