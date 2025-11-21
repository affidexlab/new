# 🚀 Quick Start: Deploy MinimalPool Contract

## Prerequisites
- ✅ MetaMask wallet installed
- ✅ ETH for gas (~$3-5) on target network
- ✅ 5 minutes of time

---

## Step-by-Step Deployment (Remix IDE)

### Step 1: Open Remix
1. Go to **https://remix.ethereum.org/**
2. Wait for Remix IDE to load

### Step 2: Create Contract File
1. In the left sidebar, click the **"File Explorer"** icon
2. Right-click on "contracts" folder
3. Select **"New File"**
4. Name it: `MinimalPool.sol`

### Step 3: Copy Contract Code
1. Open `contracts/MinimalPool.sol` from this repo
2. Copy ALL the code (Ctrl+A, Ctrl+C)
3. Paste into Remix `MinimalPool.sol` file

### Step 4: Compile
1. Click **"Solidity Compiler"** icon (left sidebar)
2. Set compiler version: **0.8.20** or higher
3. Enable **Optimization**: 200 runs
4. Click **"Compile MinimalPool.sol"**
5. Wait for ✅ green checkmark

### Step 5: Connect MetaMask
1. Click **"Deploy & Run Transactions"** icon (left sidebar)
2. Environment: Select **"Injected Provider - MetaMask"**
3. MetaMask will popup - click **"Connect"**
4. Ensure MetaMask is on **Arbitrum network**
5. Check your address appears under "Account"

### Step 6: Deploy Factory
1. Under "Contract" dropdown, select **"MinimalFactory"**
2. Click orange **"Deploy"** button
3. MetaMask popup appears - review gas fee
4. Click **"Confirm"** in MetaMask
5. Wait for transaction confirmation (~10-30 seconds)

### Step 7: Copy Contract Address
1. After deployment, look under "Deployed Contracts"
2. You'll see "MINIMALFACTORY AT 0x..."
3. Click the **copy icon** next to the address
4. Save this address!

### Step 8: Update App Code
1. Open `app/src/lib/contracts.ts`
2. Find `MINIMAL_FACTORY_ADDRESSES`
3. Replace the Arbitrum address:
```typescript
export const MINIMAL_FACTORY_ADDRESSES: Record<number, string> = {
  [CHAIN_IDS.ARBITRUM]: "0xYOUR_ADDRESS_HERE", // ← Paste here
  // ...
};
```
4. Save file

### Step 9: Commit & Deploy
```bash
cd /path/to/project
git add app/src/lib/contracts.ts
git commit -m "Update MinimalFactory contract address for Arbitrum"
git push origin main
```

### Step 10: Verify (Optional but Recommended)
1. Go to **https://arbiscan.io**
2. Search for your contract address
3. Click **"Contract"** tab
4. Click **"Verify and Publish"**
5. Fill in:
   - Compiler: 0.8.20
   - Optimization: Yes (200 runs)
   - Contract: MinimalFactory
6. Paste source code from `MinimalPool.sol`
7. Click **"Verify and Publish"**

---

## ✅ Success Checklist

After deployment, you should have:
- [x] Contract deployed on Arbitrum
- [x] Contract address copied
- [x] `contracts.ts` updated with address
- [x] Changes committed and pushed
- [x] Vercel redeployed automatically
- [x] Pools tab shows "Factory: 0x..." (green)
- [x] CreatePool tab allows pool creation

---

## 🎯 Quick Test

After updating the address:

1. Visit: https://decaflow.vercel.app/
2. Click **"ENTER DAPP"**
3. Go to **"Pools"** tab
4. Should show: ✅ Factory address (green alert)
5. Go to **"Create Pool"** tab
6. Should show: Create pool form (not warning)

If you see warnings, double-check the address in `contracts.ts`.

---

## 🐛 Troubleshooting

### "Deployment Failed"
- Check MetaMask has enough ETH for gas
- Ensure you're on Arbitrum network
- Try increasing gas limit in MetaMask

### "Compilation Error"
- Verify Solidity version is 0.8.20+
- Check all code was copied correctly
- Enable optimization (200 runs)

### "Contract Not Showing in UI"
- Verify address in `contracts.ts` is correct
- Check address format starts with "0x"
- Ensure Vercel redeployed (check deployment log)
- Try hard refresh (Ctrl+Shift+R)

### "Only Owner Can Create"
- MinimalFactory has an owner
- Only the deploying wallet can call createPair
- This is by design for security

---

## 💰 Costs

### Deployment
- **Arbitrum**: ~$3 (~0.001 ETH)
- **Base**: ~$1.50 (~0.0005 ETH)
- **Optimism**: ~$3 (~0.001 ETH)

### Verification (Optional)
- Free on all networks

---

## 📞 Need Help?

1. Check full guide: `contracts/DEPLOYMENT_GUIDE.md`
2. Review contract code: `contracts/MinimalPool.sol`
3. Test on testnet first (Arbitrum Sepolia)

---

## 🎓 Additional Resources

- **Remix Docs**: https://remix-ide.readthedocs.io/
- **Arbitrum Docs**: https://docs.arbitrum.io/
- **MetaMask Guide**: https://metamask.io/faqs/
- **Etherscan Verification**: https://docs.etherscan.io/tutorials/verifying-contracts-programmatically

---

**Estimated Time**: 5-10 minutes
**Difficulty**: Beginner-friendly
**Cost**: ~$3 in ETH

Ready? Let's go! 🚀
