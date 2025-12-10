# Complete Polygon and Avalanche Deployment Later

The Polygon and Avalanche networks are experiencing high congestion. Complete these deployments manually:

## Polygon Deployment

```bash
cd affidexlab/new/contracts

export DEPLOYER_PRIVATE_KEY=0x38dfa5cff69a715ece91503067aa60d574f585ffa9d4c1fddb6e27e72f5a8000
export TREASURY_WALLET=0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901

# Try during off-peak hours (late night UTC) for faster confirmation
npx hardhat run deploy_router.js --network polygon
```

**After successful deployment:**
1. Note the deployed contract address
2. Update `app/src/lib/contracts.ts`:
   ```typescript
   137: "0xYourPolygonAddress", // Polygon
   ```
3. Update `app/src/lib/liquidityRouter.ts`:
   ```typescript
   [CHAIN_IDS.POLYGON]: "0xYourPolygonAddress",
   ```
4. Commit and push: `git commit -m "feat: Add Polygon router address" && git push`

## Avalanche Deployment

```bash
cd affidexlab/new/contracts

export DEPLOYER_PRIVATE_KEY=0x38dfa5cff69a715ece91503067aa60d574f585ffa9d4c1fddb6e27e72f5a8000
export TREASURY_WALLET=0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901

npx hardhat run deploy_router.js --network avalanche
```

**After successful deployment:**
1. Note the deployed contract address
2. Update `app/src/lib/contracts.ts`:
   ```typescript
   43114: "0xYourAvalancheAddress", // Avalanche
   ```
3. Update `app/src/lib/liquidityRouter.ts`:
   ```typescript
   [CHAIN_IDS.AVALANCHE]: "0xYourAvalancheAddress",
   ```
4. Commit and push: `git commit -m "feat: Add Avalanche router address" && git push`

## Tips for Successful Deployment

1. **Try during off-peak hours** - Late night UTC typically has lower gas prices and faster confirmations
2. **Monitor gas prices** - Use https://polygonscan.com/gastracker or https://snowtrace.io/gastracker
3. **Increase gas price if needed** - Edit hardhat.config.js to increase gasPrice
4. **Use alternative RPCs** if one fails:
   - Polygon: https://polygon-rpc.com, https://rpc-mainnet.matic.network
   - Avalanche: https://api.avax.network/ext/bc/C/rpc

## Current Status

**Deployed and Working** (3 chains):
- ✅ Base - Uniswap V3 + Aerodrome
- ✅ Arbitrum - Uniswap V3
- ✅ Optimism - Uniswap V3

**Platform is production-ready on these 3 chains!**

Polygon and Avalanche can be added later without affecting the core platform functionality.
