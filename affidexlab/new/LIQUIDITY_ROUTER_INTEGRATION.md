# DecaFlow Production Liquidity Router Integration

## Overview

DecaFlow has been upgraded with a production-ready smart liquidity layer that replaces the minimal pool implementation with battle-tested, audited AMM protocols:

- **Primary Router**: Uniswap V3 (All chains)
- **Secondary Router**: Aerodrome (Base chain)

This integration provides:
- ✅ Deep liquidity across all major tokens
- ✅ Optimal pricing through multi-source routing
- ✅ Production-ready security (audited protocols)
- ✅ Billions in TVL across supported chains
- ✅ Automatic best-route selection

## Architecture

### Smart Contract Layer

**LiquidityRouter.sol** - Main router contract that:
- Integrates with Uniswap V3 SwapRouter
- Integrates with Aerodrome Router (Base only)
- Collects protocol fees (0.8% default)
- Routes fees to treasury wallet
- Provides secure, non-upgradeable design

**Key Features:**
- ReentrancyGuard on all swap functions
- SafeERC20 for secure token transfers
- Owner-only administrative functions
- Multi-hop swap support for complex routes

### Frontend Integration

**routerIntegration.ts** - Smart routing logic that:
- Queries all Uniswap V3 fee tiers (0.01%, 0.05%, 0.3%, 1%)
- Queries Aerodrome stable and volatile pools
- Compares quotes and selects best route
- Calculates slippage-adjusted minimums
- Returns optimal swap parameters

**Updated Swap Component:**
- Direct router integration (bypass aggregators)
- Real-time quote comparison
- Visual routing information
- Automatic router selection
- Fallback to 0x aggregator if needed

## Deployment Status

### Contracts

| Chain | Chain ID | Router Status | Uniswap V3 | Aerodrome |
|-------|----------|---------------|------------|-----------|
| Base | 8453 | Ready to Deploy | ✅ | ✅ |
| Arbitrum | 42161 | Ready to Deploy | ✅ | ❌ |
| Optimism | 10 | Ready to Deploy | ✅ | ❌ |
| Polygon | 137 | Ready to Deploy | ✅ | ❌ |
| Avalanche | 43114 | Ready to Deploy | ✅ | ❌ |
| Ethereum | 1 | Ready to Deploy | ✅ | ❌ |

### Frontend

- ✅ Router integration complete
- ✅ Quote comparison logic implemented
- ✅ Swap execution updated
- ✅ UI components updated
- ✅ Error handling and fallbacks

## How to Deploy

### Prerequisites

1. Node.js v16+
2. Private key with native tokens for gas
3. Treasury wallet address (set in .env)

### Quick Deploy

```bash
cd affidexlab/new/contracts

# Set your private key
export DEPLOYER_PRIVATE_KEY=your_key_here
export TREASURY_WALLET=0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901

# Deploy to Base (Uniswap V3 + Aerodrome)
npx hardhat run deploy_router.js --network base

# Deploy to other chains
npx hardhat run deploy_router.js --network arbitrum
npx hardhat run deploy_router.js --network optimism
npx hardhat run deploy_router.js --network polygon
npx hardhat run deploy_router.js --network avalanche
```

### Post-Deployment

After deploying, update the router addresses in:
1. `app/src/lib/contracts.ts` - Add deployed addresses
2. `app/src/lib/liquidityRouter.ts` - Update LIQUIDITY_ROUTER_ADDRESSES

Example:
```typescript
export const LIQUIDITY_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  8453: "0xYourDeployedAddress", // Base
  42161: "0x...", // Arbitrum
  // ... other chains
};
```

## Usage Examples

### Frontend - Direct Router Swap

```typescript
import { useWriteContract } from "wagmi";
import { getLiquidityRouterAddress, LIQUIDITY_ROUTER_ABI } from "@/lib/contracts";
import { getBestRoute, calculateMinimumOutput } from "@/lib/routerIntegration";

// Get quote
const quote = await getBestRoute({
  fromToken: "0xTokenA",
  toToken: "0xTokenB",
  amount: "1000000", // 1 USDC (6 decimals)
  fromAddress: userAddress,
  chainId: 8453, // Base
  slippagePercentage: 0.5,
});

// Execute swap
if (quote.provider === "uniswap_v3") {
  await writeContract({
    address: getLiquidityRouterAddress(8453),
    abi: LIQUIDITY_ROUTER_ABI,
    functionName: "swapExactInputUniswapV3",
    args: [
      fromToken,
      toToken,
      quote.fee,
      amountIn,
      calculateMinimumOutput(quote.estimatedOutput, 0.5),
      deadline,
    ],
  });
} else if (quote.provider === "aerodrome") {
  await writeContract({
    address: getLiquidityRouterAddress(8453),
    abi: LIQUIDITY_ROUTER_ABI,
    functionName: "swapExactInputAerodrome",
    args: [
      quote.aerodromeRoutes,
      amountIn,
      calculateMinimumOutput(quote.estimatedOutput, 0.5),
      deadline,
    ],
  });
}
```

## File Structure

### Contracts
```
contracts/
├── LiquidityRouter.sol              # Main router contract
├── RouterAddresses.sol              # Protocol addresses library
├── deploy_router.js                 # Deployment script
├── hardhat.config.js                # Updated with all chains
└── ROUTER_DEPLOYMENT_GUIDE.md       # Detailed deployment guide
```

### Frontend
```
app/src/lib/
├── liquidityRouter.ts               # Router ABIs and addresses
├── routerIntegration.ts             # Quote and routing logic
├── contracts.ts                     # Updated with router exports
└── aggregators.ts                   # Updated with direct router option

app/src/pages/
├── Swap.tsx                         # Updated swap UI
└── Pools.tsx                        # New router info page
```

## Technical Details

### Uniswap V3 Integration

DecaFlow integrates with Uniswap V3's SwapRouter contract:

**Router Addresses:**
- Ethereum, Arbitrum, Optimism, Polygon: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- Base: `0x2626664c2603336E57B271c5C0b26F421741e481`
- Avalanche: `0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE`

**Fee Tiers:** 0.01%, 0.05%, 0.3%, 1%

The router queries all fee tiers and selects the one with the best output.

### Aerodrome Integration (Base Only)

Aerodrome is Base's leading DEX with:

**Router Address:** `0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43`
**Factory Address:** `0x420DD381b31aEf6683db6B902084cB0FFECe40Da`

**Pool Types:**
- Volatile: For uncorrelated assets (ETH/USDC)
- Stable: For correlated assets (USDC/DAI)

The router queries both pool types and selects the best.

### Fee Structure

**Protocol Fee:** 0.8% (80 basis points)
- Deducted before swap
- Sent to treasury wallet
- Configurable by contract owner

**Gas Estimates:**
- Uniswap V3 single-hop: ~120k-150k gas
- Aerodrome swap: ~150k-180k gas
- Multi-hop: Varies by route complexity

## Routing Logic

1. **Quote Phase:**
   - Query Uniswap V3 with all fee tiers (100, 500, 3000, 10000 bps)
   - Query Aerodrome volatile and stable pools (if on Base)
   - Calculate output amounts for each route

2. **Selection Phase:**
   - Compare all quotes
   - Factor in estimated gas costs
   - Select route with highest net output

3. **Execution Phase:**
   - User approves tokens to LiquidityRouter
   - Call appropriate swap function (Uniswap or Aerodrome)
   - Router collects fee and executes swap
   - Tokens delivered to user

## Security Considerations

✅ **Audited Protocols**: Both Uniswap V3 and Aerodrome are audited and battle-tested
✅ **ReentrancyGuard**: All swap functions protected against reentrancy
✅ **SafeERC20**: Prevents token transfer issues
✅ **Immutable**: No upgrade mechanism to prevent malicious changes
✅ **Minimal Permissions**: Only owner can update fee rate and treasury
✅ **Emergency Rescue**: Owner can rescue stuck tokens

## Migration from MinimalPool

The MinimalPool contracts are **deprecated** and should not be used in production:

- ❌ Not audited
- ❌ Minimal liquidity
- ❌ No price oracles
- ❌ Basic constant-product formula
- ❌ Campaign use only

The new LiquidityRouter provides:

- ✅ Production-ready security
- ✅ Deep liquidity (billions in TVL)
- ✅ Optimal pricing across sources
- ✅ Multi-chain support
- ✅ Battle-tested in production

## Monitoring & Analytics

### On-Chain Events

**SwapExecuted Event:**
```solidity
event SwapExecuted(
    address indexed user,
    address indexed tokenIn,
    address indexed tokenOut,
    uint256 amountIn,
    uint256 amountOut,
    RouterType routerUsed
);
```

**FeeCollected Event:**
```solidity
event FeeCollected(
    address indexed token,
    uint256 amount
);
```

### Recommended Tracking

- Total swap volume by chain
- Uniswap vs Aerodrome usage (on Base)
- Fee revenue by token
- Gas costs per route type
- Quote success rates
- Slippage vs estimates

## Troubleshooting

### "Router not deployed" error
- Check that LiquidityRouter is deployed to the chain
- Verify address is added to LIQUIDITY_ROUTER_ADDRESSES

### "Insufficient output amount" error
- Increase slippage tolerance
- Check if liquidity exists for the pair
- Try smaller trade size

### "Approval failed" error
- Verify token contract allows approvals
- Check user has sufficient balance
- Ensure not approving zero address

### Quote returns 0
- No liquidity for this pair
- Token addresses may be invalid
- Chain not supported

## Future Enhancements

Potential future additions:

- [ ] Curve Finance integration for stablecoin swaps
- [ ] Multi-hop routing optimization
- [ ] MEV protection (Flashbots/Eden)
- [ ] Limit orders via CoW Protocol
- [ ] Cross-chain swaps via bridges
- [ ] Gas optimization for multi-hop paths

## Support & Resources

- **Deployment Guide**: See `contracts/ROUTER_DEPLOYMENT_GUIDE.md`
- **Uniswap V3 Docs**: https://docs.uniswap.org/contracts/v3/overview
- **Aerodrome Docs**: https://aerodrome.finance/docs
- **Contract Source**: `contracts/LiquidityRouter.sol`

## Testing Checklist

Before production deployment:

- [ ] Deploy to testnet and verify
- [ ] Test Uniswap V3 swaps (all fee tiers)
- [ ] Test Aerodrome swaps (Base only)
- [ ] Test with native tokens (ETH/AVAX/MATIC)
- [ ] Test with ERC20 tokens
- [ ] Verify fee collection to treasury
- [ ] Test approval flow
- [ ] Test slippage protection
- [ ] Monitor gas costs
- [ ] Verify block explorer

## Conclusion

The LiquidityRouter integration positions DecaFlow as a production-ready DeFi platform with:

- Enterprise-grade security through audited protocols
- Optimal pricing via multi-source routing
- Deep liquidity from Uniswap V3 + Aerodrome
- Transparent fee structure
- Cross-chain support

This foundation enables DecaFlow to compete with leading DEX aggregators while maintaining full control over the routing logic and user experience.
