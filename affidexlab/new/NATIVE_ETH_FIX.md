# Native ETH Support Fix for LiquidityRouter

## Issue Identified
The current deployed `LiquidityRouter` contracts do not support native ETH transactions. When users try to swap native ETH, the transaction reverts with "execution reverted" because:

1. The swap functions (`swapExactInputUniswapV3` and `swapExactInputAerodrome`) were not marked as `payable`
2. The contract had no logic to handle native ETH wrapping to WETH
3. The `receive()` function explicitly rejected all ETH transfers

## Fix Applied
Updated `LiquidityRouter.sol` with the following changes:

1. ✅ Added `IWETH` interface for wrapping/unwrapping ETH
2. ✅ Added immutable `WETH` address to constructor
3. ✅ Made all swap functions `payable`
4. ✅ Added logic to detect and wrap native ETH to WETH automatically
5. ✅ Added support for unwrapping WETH back to ETH for output
6. ✅ Updated `receive()` to accept ETH from WETH contract
7. ✅ Added `rescueETH()` function for emergency ETH recovery

## Current Deployed Addresses (OLD VERSION - NEEDS REDEPLOYMENT)
- **Base**: `0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4`
- **Arbitrum**: `0xDE8700785C7512a8397683A9BE9717B0aFdB18F3`
- **Optimism**: `0xA2fdf81b7967e7FA7610DeBe1901A40686c48992`
- **Polygon**: `0xFd05977256E8D5753728C78A3003BC3B75Fef1DD`

## Deployment Instructions

### Prerequisites
1. Ensure you have the deployer private key set: `export DEPLOYER_PRIVATE_KEY="0x..."`
2. Ensure sufficient native tokens for gas on each chain:
   - Base: ~0.001 ETH
   - Arbitrum: ~0.001 ETH
   - Optimism: ~0.001 ETH
   - Polygon: ~0.5 MATIC
   - Avalanche: ~0.1 AVAX
   - Ethereum: ~0.002 ETH

### Deploy to Individual Chains

```bash
cd /project/workspace/affidexlab/new/affidexlab/new/contracts

# Deploy to Base
npx hardhat run deploy_router.js --network base

# Deploy to Arbitrum
npx hardhat run deploy_router.js --network arbitrum

# Deploy to Optimism
npx hardhat run deploy_router.js --network optimism

# Deploy to Polygon
npx hardhat run deploy_router.js --network polygon

# Deploy to Avalanche
npx hardhat run deploy_router.js --network avalanche

# Deploy to Ethereum
npx hardhat run deploy_router.js --network ethereum
```

### After Deployment

1. **Update Frontend Addresses**: After each deployment, update the addresses in:
   - `affidexlab/new/app/src/lib/contracts.ts`
   - `affidexlab/new/app/src/lib/liquidityRouter.ts`

2. **Test on Testnet First** (Recommended):
   - Deploy to Base Sepolia or other testnets first
   - Test native ETH swaps thoroughly
   - Verify all swap paths work correctly

3. **Verify Contracts** (Optional but Recommended):
   ```bash
   npx hardhat verify --network base <DEPLOYED_ADDRESS> \
     "<UNISWAP_V3_ROUTER>" \
     "<AERODROME_ROUTER>" \
     "<WETH_ADDRESS>" \
     "<TREASURY_WALLET>" \
     150
   ```

## Testing Checklist

After deployment, test the following scenarios on each chain:

- [ ] Swap native ETH → ERC20 token (e.g., ETH → USDC)
- [ ] Swap ERC20 → ERC20 (e.g., USDC → DAI)
- [ ] Swap ERC20 → native ETH (e.g., USDC → ETH)
- [ ] Check fee collection works correctly
- [ ] Verify slippage protection
- [ ] Test with minimum and maximum amounts

## WETH Addresses Reference
- Ethereum: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- Arbitrum: `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1`
- Optimism: `0x4200000000000000000000000000000000000006`
- Polygon: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270` (WMATIC)
- Base: `0x4200000000000000000000000000000000000006`
- Avalanche: `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7` (WAVAX)

## Summary
This fix enables seamless native ETH swaps on your dApp. Users can now:
- Swap ETH directly without manually wrapping to WETH
- Enjoy a better UX with one-click ETH swaps
- Avoid the extra approval and wrapping transactions

The fix is backward compatible - ERC20 token swaps continue to work exactly as before.
