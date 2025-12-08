# LiquidityRouter Mainnet Deployment Checklist

## Pre-Deployment Requirements

### 1. Wallet Setup
- [ ] Private key with deployer wallet address
- [ ] Sufficient native tokens on each chain for gas:
  - **Base**: ~0.005 ETH (~$2-5)
  - **Arbitrum**: ~0.003 ETH (~$5-10)
  - **Optimism**: ~0.003 ETH (~$5-10)
  - **Polygon**: ~5 MATIC (~$2-5)
  - **Avalanche**: ~0.3 AVAX (~$5-15)
  - **Ethereum**: ~0.02 ETH (~$50-150) - Optional, expensive

### 2. Environment Variables
- [ ] `DEPLOYER_PRIVATE_KEY` - Your deployer wallet private key
- [ ] `TREASURY_WALLET` - Fee collection wallet (default: 0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901)

## Deployment Steps

### Step 1: Set Environment Variables

```bash
cd affidexlab/new/contracts

# Set your private key (KEEP THIS SECRET!)
export DEPLOYER_PRIVATE_KEY="your_private_key_here"

# Set treasury wallet (or use default)
export TREASURY_WALLET="0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901"
```

### Step 2: Deploy to Each Chain

#### Base (Uniswap V3 + Aerodrome) - RECOMMENDED FIRST
```bash
npx hardhat run deploy_router.js --network base
```
**Expected Cost**: ~$2-5
**Note**: Save the deployed address!

#### Arbitrum (Uniswap V3)
```bash
npx hardhat run deploy_router.js --network arbitrum
```
**Expected Cost**: ~$5-10

#### Optimism (Uniswap V3)
```bash
npx hardhat run deploy_router.js --network optimism
```
**Expected Cost**: ~$5-10

#### Polygon (Uniswap V3)
```bash
npx hardhat run deploy_router.js --network polygon
```
**Expected Cost**: ~$2-5

#### Avalanche (Uniswap V3)
```bash
npx hardhat run deploy_router.js --network avalanche
```
**Expected Cost**: ~$5-15

#### Ethereum (Uniswap V3) - OPTIONAL, EXPENSIVE
```bash
npx hardhat run deploy_router.js --network ethereum
```
**Expected Cost**: ~$50-150

### Step 3: Record Deployed Addresses

After each deployment, note the contract address. Example output:
```
✅ LiquidityRouter deployed to: 0xABC123...
```

Create a file `deployed_addresses.json`:
```json
{
  "base": "0x...",
  "arbitrum": "0x...",
  "optimism": "0x...",
  "polygon": "0x...",
  "avalanche": "0x..."
}
```

### Step 4: Update Frontend Configuration

Edit `app/src/lib/contracts.ts`:
```typescript
export const LIQUIDITY_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  8453: "0xYourBaseAddress",      // Base
  42161: "0xYourArbitrumAddress", // Arbitrum
  10: "0xYourOptimismAddress",    // Optimism
  137: "0xYourPolygonAddress",    // Polygon
  43114: "0xYourAvalancheAddress", // Avalanche
};
```

Edit `app/src/lib/liquidityRouter.ts`:
```typescript
export const LIQUIDITY_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  [CHAIN_IDS.BASE]: "0xYourBaseAddress",
  [CHAIN_IDS.ARBITRUM]: "0xYourArbitrumAddress",
  [CHAIN_IDS.OPTIMISM]: "0xYourOptimismAddress",
  [CHAIN_IDS.POLYGON]: "0xYourPolygonAddress",
  [CHAIN_IDS.AVALANCHE]: "0xYourAvalancheAddress",
};
```

### Step 5: Configure Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:
```
Variable Name: VITE_TREASURY_WALLET
Value: 0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901
Environment: Production, Preview, Development
```

**IMPORTANT**: The treasury wallet address needs to be set in TWO places:
1. ✅ **Smart Contracts** (during deployment) - Set via `TREASURY_WALLET` env var
2. ✅ **Frontend (Vercel)** - Set as `VITE_TREASURY_WALLET` in Vercel dashboard

### Step 6: Commit and Deploy

```bash
git add app/src/lib/contracts.ts app/src/lib/liquidityRouter.ts
git commit -m "chore: Update LiquidityRouter deployed addresses"
git push origin main
```

### Step 7: Verify Contracts (Optional but Recommended)

For each deployed contract:
```bash
npx hardhat verify --network base <DEPLOYED_ADDRESS> \
  "<UNISWAP_ROUTER>" \
  "<AERODROME_ROUTER>" \
  "<TREASURY_WALLET>" \
  80
```

Example for Base:
```bash
npx hardhat verify --network base 0xYourDeployedAddress \
  "0x2626664c2603336E57B271c5C0b26F421741e481" \
  "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43" \
  "0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901" \
  80
```

### Step 8: Test Swaps

1. Go to your deployed app
2. Connect wallet
3. Try a small test swap on Base first
4. Verify:
   - Quote appears with "Production Router Enabled" badge
   - Route shows "Uniswap V3" or "Aerodrome"
   - Swap executes successfully
   - Fees collected to treasury wallet
5. Test on other chains

## Quick Deploy Script (All Chains)

If you want to deploy to all chains at once:

```bash
cd affidexlab/new/contracts
chmod +x deploy_all_chains.sh
export DEPLOYER_PRIVATE_KEY="your_key"
export TREASURY_WALLET="0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901"
./deploy_all_chains.sh
```

## Troubleshooting

### "Insufficient funds for gas"
- Check your wallet has enough native tokens on that chain
- Use a blockchain explorer to verify balance

### "Nonce too low/high"
- Wait a few seconds and retry
- Clear any pending transactions

### "Contract creation failed"
- Check the RPC endpoint is working
- Try a different RPC URL in `hardhat.config.js`

### Deployment hangs
- Increase gas price in hardhat config
- Try a different time (lower network congestion)

## Post-Deployment Monitoring

After deployment, monitor:
- [ ] First swap executes successfully
- [ ] Fees arriving in treasury wallet
- [ ] Gas costs are reasonable
- [ ] No reverts or errors
- [ ] Block explorers show verified contracts

## Security Reminders

- ✅ Never commit private keys to git
- ✅ Use a dedicated deployer wallet (not your main wallet)
- ✅ Double-check all addresses before deploying
- ✅ Start with Base (cheapest) to test deployment flow
- ✅ Verify contracts on block explorers
- ✅ Test with small amounts first

## Estimated Total Deployment Cost

- **Minimum (Base only)**: ~$2-5
- **Recommended (Base + 4 L2s)**: ~$20-50
- **All chains (including Ethereum)**: ~$70-200

## Support

If you encounter issues:
1. Check the error message in the deployment output
2. Verify environment variables are set correctly
3. Ensure sufficient gas funds
4. Review hardhat.config.js for correct RPC URLs
5. Check network status (not experiencing downtime)

---

**Ready to deploy?** Start with Base (cheapest) and test thoroughly before deploying to other chains.
