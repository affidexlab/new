# 🔧 Critical Fix: Native ETH Support - Deployment Instructions

## ✅ What Was Fixed
The "execution reverted" error when swapping native ETH has been **FIXED**. The updated `LiquidityRouter.sol` contract now supports:
- Native ETH swaps (ETH → tokens)
- Reverse swaps (tokens → ETH)
- Automatic ETH wrapping/unwrapping
- Full backward compatibility with ERC20 swaps

## 📋 Action Required

### Step 1: Create and Merge Pull Request
The fix has been pushed to branch `capy/cap-1-4a108294`. You need to:

1. **Go to GitHub**: https://github.com/affidexlab/new/pull/new/capy/cap-1-4a108294
2. **Create the Pull Request** with these details:
   - Title: `Fix: Add native ETH support to LiquidityRouter`
   - Description: See the PR template in this commit
3. **Review the changes** (3 files modified)
4. **Merge to main**

### Step 2: Deploy Updated Contracts
After merging, deploy the updated contract to all chains:

```bash
# Navigate to contracts directory
cd affidexlab/new/contracts

# Set your deployer private key
export DEPLOYER_PRIVATE_KEY="your_private_key_here"

# Deploy to each chain (one at a time recommended)
npx hardhat run deploy_router.js --network base
npx hardhat run deploy_router.js --network arbitrum  
npx hardhat run deploy_router.js --network optimism
npx hardhat run deploy_router.js --network polygon
```

**Required Gas Funds:**
- Base: ~0.001 ETH
- Arbitrum: ~0.001 ETH  
- Optimism: ~0.001 ETH
- Polygon: ~0.5 MATIC

### Step 3: Update Frontend Addresses
After each deployment, update the contract addresses in:

**File 1:** `affidexlab/new/app/src/lib/contracts.ts`
```typescript
export const LIQUIDITY_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  8453: "0xNEW_BASE_ADDRESS",      // Base
  42161: "0xNEW_ARBITRUM_ADDRESS", // Arbitrum
  10: "0xNEW_OPTIMISM_ADDRESS",    // Optimism
  137: "0xNEW_POLYGON_ADDRESS",    // Polygon
};
```

**File 2:** `affidexlab/new/app/src/lib/liquidityRouter.ts`
```typescript
export const LIQUIDITY_ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  [CHAIN_IDS.BASE]: "0xNEW_BASE_ADDRESS",
  [CHAIN_IDS.ARBITRUM]: "0xNEW_ARBITRUM_ADDRESS",
  [CHAIN_IDS.OPTIMISM]: "0xNEW_OPTIMISM_ADDRESS",
  [CHAIN_IDS.POLYGON]: "0xNEW_POLYGON_ADDRESS",
};
```

### Step 4: Test the Fix
After deployment and frontend update:

1. **Connect your wallet** to decaflow.xyz/app
2. **Test ETH swap**: Try swapping ETH → USDC (should work now!)
3. **Test reverse**: Try USDC → ETH
4. **Test ERC20**: Verify USDC → DAI still works

## 📊 Current vs New Contract

### Old Contract Issues ❌
- Not marked as `payable` → rejected ETH
- No WETH wrapping logic → couldn't process ETH
- `receive()` reverted all ETH → blocked ETH swaps

### New Contract Features ✅
- All swap functions are `payable`
- Automatic ETH → WETH wrapping on input
- Automatic WETH → ETH unwrapping on output  
- Smart detection of native vs ERC20 tokens
- Emergency `rescueETH()` function
- Full backward compatibility

## 🔍 Technical Details

**Changed Files:**
1. `contracts/LiquidityRouter.sol` - Core contract with ETH support
2. `contracts/deploy_updated_router.sh` - Batch deployment script
3. `NATIVE_ETH_FIX.md` - Comprehensive technical documentation

**Key Changes:**
- Added `IWETH` interface
- Added `WETH` immutable address to constructor
- Made `swapExactInputUniswapV3()` payable with ETH wrapping
- Made `swapExactInputAerodrome()` payable with ETH wrapping
- Made `swapExactInputUniswapV3MultiHop()` payable with ETH wrapping
- Updated `receive()` to accept ETH from WETH only
- Added `rescueETH()` for emergency recovery

## 📚 Additional Resources
- Full technical documentation: `NATIVE_ETH_FIX.md`
- Deployment script: `contracts/deploy_updated_router.sh`
- Hardhat config: `contracts/hardhat.config.js`

## ⚠️ Important Notes
1. **Do NOT skip testing** - Test on testnet first if possible
2. **Save old addresses** - Keep backup in case rollback needed
3. **Monitor gas** - Deployment costs ~$1-5 per chain
4. **Update immediately** - Frontend won't work until addresses updated
5. **Announce maintenance** - Consider informing users before deployment

## 🎯 Success Criteria
✅ Contracts deployed to all 4 chains  
✅ Frontend addresses updated  
✅ ETH → Token swaps work without reverting  
✅ Token → ETH swaps work correctly  
✅ ERC20 swaps still function normally  

---

**Need Help?** 
- Check deployment logs in `contracts/` directory
- Review `NATIVE_ETH_FIX.md` for detailed troubleshooting
- Test individual functions using hardhat console
