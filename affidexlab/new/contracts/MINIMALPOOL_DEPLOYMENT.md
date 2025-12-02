# MinimalPool Factory Deployment Guide

## ⚠️ IMPORTANT WARNINGS

**MinimalPool contracts are for CAMPAIGNS ONLY:**
- ✅ Small TVL campaigns (under $50k)
- ✅ Testing liquidity provision
- ✅ Short-term promotional pools
- ❌ NOT for production DeFi use
- ❌ NOT audited for mainnet production
- ❌ USE AT YOUR OWN RISK

**Recommended:** Get a professional security audit before production use.

---

## 📋 Prerequisites

1. **Private Key** - Deployer wallet with native tokens on target chains
2. **Node.js** - v18+ with npm/yarn installed
3. **Hardhat** - Already configured in this project

**Minimum Balance Required per Chain:**
- Base: ~0.0005 ETH (~$2)
- Arbitrum: ~0.0005 ETH (~$2)
- Polygon: ~0.5 MATIC (~$0.50)
- Avalanche: ~0.05 AVAX (~$2)

---

## 🚀 Quick Deployment

### Step 1: Install Dependencies

```bash
cd affidexlab/new/contracts
npm install
```

### Step 2: Set Private Key

```bash
export DEPLOYER_PRIVATE_KEY="your_private_key_here"
```

**⚠️ Security:** Never commit your private key. Use a deployment wallet separate from your main wallet.

### Step 3: Deploy to Base (Primary Chain)

```bash
npx hardhat run deploy-minimalpool.js --network base
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════╗
║       MinimalFactory Mainnet Deployment                  ║
║       For DecaFlow Campaign Pools                        ║
╚══════════════════════════════════════════════════════════╝

Network: base
...
✅ MinimalFactory deployed at: 0x...
```

### Step 4: Deploy to Other Chains (Optional)

```bash
# Arbitrum
npx hardhat run deploy-minimalpool.js --network arbitrum

# Polygon
npx hardhat run deploy-minimalpool.js --network polygon

# Avalanche
npx hardhat run deploy-minimalpool.js --network avalanche
```

### Step 5: Update Frontend Configuration

After deployment, copy the contract addresses to `app/src/lib/contracts.ts`:

```typescript
export const MINIMAL_FACTORY_ADDRESSES: Partial<Record<number, `0x${string}`>> = {
  8453: "0x...",   // Base (from deployment output)
  42161: "0x...",  // Arbitrum
  137: "0x...",    // Polygon
  43114: "0x...",  // Avalanche
};
```

### Step 6: Commit and Deploy Frontend

```bash
cd ../app
git add src/lib/contracts.ts
git commit -m "feat: deploy MinimalFactory to mainnet chains"
git push origin main
```

Vercel will auto-deploy the updated frontend.

---

## 🧪 Testing After Deployment

### 1. Verify Contract on Block Explorer

- Base: https://basescan.org/address/YOUR_CONTRACT
- Arbitrum: https://arbiscan.io/address/YOUR_CONTRACT
- Polygon: https://polygonscan.com/address/YOUR_CONTRACT
- Avalanche: https://snowtrace.io/address/YOUR_CONTRACT

### 2. Test Pool Creation (Owner Only)

The factory owner (deployer wallet) can create pools. Visit the Pools page on your app:

```
https://decaflow.xyz/app
```

Navigate to "Pools" tab and you should see the pool creation interface.

### 3. Create Test Pool

**Example Pool:** ETH/USDC with 0.3% fee and $10k TVL cap

Using the contract directly (via Etherscan):
1. Go to contract address on Etherscan
2. Click "Contract" → "Write Contract"
3. Connect your deployer wallet
4. Call `createPair`:
   - `tokenA`: ETH address (0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)
   - `tokenB`: USDC address (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 on Base)
   - `feeBips`: 30 (for 0.3%)
   - `tvlCap`: 10000000000000000000000 (10k in wei)

---

## 📊 Deployment Costs

Estimated gas costs per chain:

| Chain | Gas Used | ETH/MATIC/AVAX | USD Cost |
|-------|----------|----------------|----------|
| Base | ~400,000 | 0.0004 ETH | ~$1.60 |
| Arbitrum | ~400,000 | 0.0004 ETH | ~$1.60 |
| Polygon | ~400,000 | 0.4 MATIC | ~$0.40 |
| Avalanche | ~400,000 | 0.04 AVAX | ~$1.60 |

**Total:** ~$5.20 to deploy on all 4 chains

---

## 🔒 Security Considerations

### Contract Features:
- ✅ **ReentrancyGuard** - Prevents reentrancy attacks
- ✅ **SafeERC20** - Safe token transfers
- ✅ **Owner-only pool creation** - Only deployer can create pools
- ✅ **TVL Cap** - Informational limit per pool
- ✅ **Constant-product AMM** - Standard x*y=k formula

### Limitations:
- ❌ **No liquidity tokens** - No LP tokens minted
- ❌ **No fee withdrawal** - Fees stay in pool
- ❌ **No governance** - Deployer has full control
- ❌ **Not audited** - Use for campaigns only
- ❌ **Simple implementation** - Missing advanced features

### Recommended Use Cases:
- ✅ Small marketing campaigns
- ✅ Community incentive pools
- ✅ Short-term promotional swaps
- ✅ Testing liquidity strategies

### NOT Recommended:
- ❌ Large TVL production pools
- ❌ Long-term liquidity provision
- ❌ Yield farming protocols
- ❌ Any scenario requiring high security

---

## 🛠️ Manual Verification (Optional)

To verify contracts on block explorers for transparency:

### Via Hardhat

```bash
npx hardhat verify --network base YOUR_CONTRACT_ADDRESS
```

### Via Block Explorer UI

1. Go to contract on explorer (Basescan, etc.)
2. Click "Contract" → "Verify & Publish"
3. Select:
   - Compiler: v0.8.20
   - Optimization: Yes (200 runs)
   - License: MIT
4. Upload MinimalPool.sol with OpenZeppelin imports
5. Submit

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Deployer wallet has sufficient balance on all target chains
- [ ] Private key is securely stored (not in git)
- [ ] Hardhat configuration verified (`hardhat.config.js`)
- [ ] Read and understood security warnings
- [ ] Decision made: Which chains to deploy to?

After deploying:
- [ ] Contract addresses saved to `minimal-pool-deployments.json`
- [ ] Contract addresses updated in `app/src/lib/contracts.ts`
- [ ] Contracts verified on block explorers (optional but recommended)
- [ ] Test pool created successfully
- [ ] Frontend deployed to Vercel
- [ ] Pools page functional

---

## 🆘 Troubleshooting

### Error: "Insufficient funds"
**Solution:** Add more native tokens to deployer wallet on target chain.

### Error: "nonce too low"
**Solution:** Wait a few blocks or increase gas price.

### Error: "Contract creation code storage out of gas"
**Solution:** Increase gas limit in deployment script.

### Error: "Invalid private key"
**Solution:** Check `DEPLOYER_PRIVATE_KEY` format (64 hex characters, no 0x prefix).

### Frontend doesn't show pools
**Solution:** 
1. Check `MINIMAL_FACTORY_ADDRESSES` in contracts.ts has correct addresses
2. Verify contracts are deployed (check explorer)
3. Clear browser cache and reload
4. Check browser console for errors

---

## 🔗 Useful Links

- **Hardhat Docs:** https://hardhat.org/docs
- **OpenZeppelin Contracts:** https://docs.openzeppelin.com/contracts
- **Base Block Explorer:** https://basescan.org
- **Arbitrum Block Explorer:** https://arbiscan.io
- **Polygon Block Explorer:** https://polygonscan.com
- **Avalanche Block Explorer:** https://snowtrace.io

---

## 📞 Support

For deployment issues:
1. Check this guide thoroughly
2. Review Hardhat documentation
3. Verify block explorer shows deployment
4. Check contract ABI matches expected interface

**Remember:** MinimalPool is for campaigns only. Get a professional audit before production use.

---

**Deployment Script:** `deploy-minimalpool.js`  
**Contract Source:** `contracts/MinimalPool.sol`  
**Frontend Config:** `app/src/lib/contracts.ts`

**Good luck! 🚀**
