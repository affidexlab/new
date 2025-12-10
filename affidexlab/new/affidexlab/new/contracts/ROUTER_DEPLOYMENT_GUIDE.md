# LiquidityRouter Deployment Guide

The LiquidityRouter is a production-ready smart contract that integrates Uniswap v3 (primary) and Aerodrome (secondary) as a unified liquidity layer for DecaFlow.

## Overview

### Features
- ✅ **Uniswap V3 Integration**: Primary router for deep liquidity across all major chains
- ✅ **Aerodrome Integration**: Secondary router optimized for Base ecosystem pools and stable swaps
- ✅ **Automatic Fee Collection**: Built-in fee mechanism with treasury routing
- ✅ **Multi-hop Support**: Complex swap paths for better pricing
- ✅ **Production-Ready**: Battle-tested protocols with billions in TVL
- ✅ **Gas Optimized**: Efficient routing with minimal overhead

### Supported Chains

| Chain | Uniswap V3 | Aerodrome | Chain ID |
|-------|------------|-----------|----------|
| Ethereum | ✅ | ❌ | 1 |
| Arbitrum | ✅ | ❌ | 42161 |
| Optimism | ✅ | ❌ | 10 |
| Polygon | ✅ | ❌ | 137 |
| Base | ✅ | ✅ | 8453 |
| Avalanche | ✅ | ❌ | 43114 |

## Prerequisites

1. **Node.js** v16+ and npm
2. **Hardhat** (already configured in project)
3. **Private Key** with funds for deployment
4. **RPC Endpoints** (free public RPCs configured by default)

## Environment Setup

Create a `.env` file in the `contracts` directory:

```bash
DEPLOYER_PRIVATE_KEY=your_private_key_here
TREASURY_WALLET=0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901
ETHEREUM_RPC_URL=https://eth.llamarpc.com  # Optional
```

## Deployment

### Quick Deploy (All Chains)

Deploy to all supported chains sequentially:

```bash
cd contracts

# Deploy to Base (Uniswap V3 + Aerodrome)
npx hardhat run deploy_router.js --network base

# Deploy to Arbitrum (Uniswap V3)
npx hardhat run deploy_router.js --network arbitrum

# Deploy to Optimism (Uniswap V3)
npx hardhat run deploy_router.js --network optimism

# Deploy to Polygon (Uniswap V3)
npx hardhat run deploy_router.js --network polygon

# Deploy to Avalanche (Uniswap V3)
npx hardhat run deploy_router.js --network avalanche

# Deploy to Ethereum (Uniswap V3)
npx hardhat run deploy_router.js --network ethereum
```

### Single Chain Deploy

Example for Base:

```bash
cd contracts
npx hardhat run deploy_router.js --network base
```

Expected output:
```
🚀 Deploying LiquidityRouter to Base (Chain ID: 8453)
   Uniswap V3 Router: 0x2626664c2603336E57B271c5C0b26F421741e481
   Aerodrome Router: 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43
   Treasury: 0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901
   Fee Rate: 80 bps (0.8%)

   Deployer: 0x...
   Balance: 0.1 ETH

✅ LiquidityRouter deployed to: 0xABC...123
```

## Post-Deployment

### 1. Update Frontend Configuration

Add the deployed address to `app/src/lib/contracts.ts`:

```typescript
export const LIQUIDITY_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  8453: "0xYourDeployedAddressHere", // Base
  42161: "0x...", // Arbitrum
  // ... other chains
};
```

### 2. Verify Contracts (Optional but Recommended)

```bash
npx hardhat verify --network base <DEPLOYED_ADDRESS> \
  "0x2626664c2603336E57B271c5C0b26F421741e481" \
  "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43" \
  "0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901" \
  80
```

### 3. Test the Deployment

Create a test swap script:

```bash
# In contracts directory
node test_swap.js --network base --router <DEPLOYED_ADDRESS>
```

## Router Addresses

### Uniswap V3 Routers (Official)
- **Ethereum**: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- **Arbitrum**: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- **Optimism**: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- **Polygon**: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- **Base**: `0x2626664c2603336E57B271c5C0b26F421741e481`
- **Avalanche**: `0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE`

### Aerodrome Routers (Official)
- **Base**: `0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43`

## Fee Configuration

Default fee rate: **80 basis points (0.8%)**

The fee is deducted before swapping and sent to the treasury wallet. This can be updated by the contract owner:

```solidity
// Update fee rate (only owner)
router.updateFeeRate(100); // 1.0%
```

## Usage Examples

### Frontend Integration

```typescript
import { useWriteContract } from "wagmi";
import { LIQUIDITY_ROUTER_ABI, getLiquidityRouterAddress } from "@/lib/contracts";

// Swap via Uniswap V3
const { writeContract } = useWriteContract();

await writeContract({
  address: getLiquidityRouterAddress(chainId),
  abi: LIQUIDITY_ROUTER_ABI,
  functionName: "swapExactInputUniswapV3",
  args: [
    tokenIn,
    tokenOut,
    3000, // 0.3% fee tier
    amountIn,
    amountOutMinimum,
    deadline,
  ],
});
```

### Aerodrome Swap (Base only)

```typescript
const routes = [{
  from: tokenIn,
  to: tokenOut,
  stable: false,
  factory: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
}];

await writeContract({
  address: getLiquidityRouterAddress(8453),
  abi: LIQUIDITY_ROUTER_ABI,
  functionName: "swapExactInputAerodrome",
  args: [routes, amountIn, amountOutMin, deadline],
});
```

## Security

- ✅ Uses OpenZeppelin's battle-tested contracts
- ✅ ReentrancyGuard on all swap functions
- ✅ SafeERC20 for token transfers
- ✅ Integrates only audited protocols (Uniswap V3, Aerodrome)
- ✅ Owner-only administrative functions
- ✅ No upgrade mechanism (immutable after deployment)

## Troubleshooting

### "Invalid Uniswap router" Error
Check that you're deploying to a supported chain with correct router addresses in `deploy_router.js`.

### "Insufficient funds" Error
Ensure deployer wallet has enough native tokens (ETH, AVAX, MATIC, etc.) for gas.

### Deployment Hangs
Try increasing gas price or using a different RPC endpoint.

### Transaction Reverts
- Check token approvals
- Verify slippage tolerance
- Ensure liquidity exists for the pair

## Cost Estimates

Deployment costs vary by chain gas prices:

- **Base**: ~$2-5 USD
- **Arbitrum**: ~$5-10 USD
- **Polygon**: ~$0.50-2 USD
- **Avalanche**: ~$5-15 USD
- **Optimism**: ~$5-10 USD
- **Ethereum**: ~$50-150 USD

## Support

For issues or questions:
1. Check deployment logs for errors
2. Verify contract on block explorer
3. Test with small amounts first
4. Review transaction traces for failures

## Next Steps

After deployment:
1. ✅ Update frontend configuration
2. ✅ Enable direct router in swap UI
3. ✅ Test swaps on testnet/mainnet
4. ✅ Monitor fee collection
5. ✅ Set up analytics tracking
