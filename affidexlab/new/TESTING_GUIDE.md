# 🧪 DecaFlow Testing Guide
## Comprehensive Testing Documentation for Production Launch

**Last Updated:** November 26, 2025  
**Version:** 1.0.0  
**Status:** Ready for Testing

---

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Testing Environments](#testing-environments)
3. [Feature Testing Checklist](#feature-testing-checklist)
4. [Bridge Testing](#bridge-testing)
5. [Swap Testing](#swap-testing)
6. [Security Testing](#security-testing)
7. [Performance Testing](#performance-testing)
8. [Bug Reporting](#bug-reporting)

---

## 🔧 Pre-Testing Setup

### Required Tools
- ✅ MetaMask or RainbowKit-compatible wallet
- ✅ Test ETH on all supported chains:
  - Ethereum Mainnet (use small amounts)
  - Arbitrum (~$10 in ETH)
  - Base (~$10 in ETH)
  - Optimism (~$10 in ETH)
  - Polygon (~$10 in MATIC)
  - Avalanche (~$10 in AVAX)
- ✅ Test tokens (USDC, USDT, DAI) on each chain
- ✅ Browser: Chrome, Firefox, or Brave (latest version)
- ✅ Network inspector (F12 Developer Tools)

### Testnet Recommendations (Start Here!)
Before testing on mainnet, use testnets:
- **Arbitrum Sepolia**: https://bridge.arbitrum.io/?destinationChain=arbitrum-sepolia
- **Base Sepolia**: https://bridge.base.org/
- **Optimism Sepolia**: https://app.optimism.io/bridge
- **Polygon Mumbai**: https://faucet.polygon.technology/

---

## 🌐 Testing Environments

### 1. **Local Development**
```bash
cd affidexlab/new/app
bun install
bun dev
# Open http://localhost:5173
```

### 2. **Staging/Preview (Vercel)**
- URL: https://decaflow-[preview-id].vercel.app
- Deploy preview branch for testing before merge

### 3. **Production**
- URL: https://decaflow.vercel.app
- Test ONLY after all staging tests pass

---

## ✅ Feature Testing Checklist

### SWAP Functionality

#### Basic Swap Flow
- [ ] Connect wallet (test all supported wallets)
- [ ] Select source chain
- [ ] Select source token
- [ ] Enter amount
- [ ] Check quote appears within 2 seconds
- [ ] Verify quote shows:
  - [ ] Route (0x Protocol or CoW Protocol)
  - [ ] Provider name
  - [ ] Estimated gas
  - [ ] Output amount
- [ ] Click "Approve [TOKEN]" (if ERC20)
  - [ ] MetaMask popup appears
  - [ ] Transaction confirms
  - [ ] Button changes to "Swap"
- [ ] Click "Swap"
  - [ ] MetaMask popup appears
  - [ ] Transaction confirms
  - [ ] Success notification appears
  - [ ] Transaction link works

#### Allowance Validation (CRITICAL)
- [ ] Swap token A → token B (complete full flow)
- [ ] Try swapping same token A again (same amount)
- [ ] **VERIFY**: Should NOT ask for approval again
- [ ] Increase amount by 10%
- [ ] **VERIFY**: Should still not ask for approval (max approval)
- [ ] Switch to different token
- [ ] **VERIFY**: Should ask for new approval

#### Edge Cases
- [ ] Enter amount larger than balance
  - [ ] Verify error message appears
- [ ] Disconnect wallet mid-quote
  - [ ] Verify UI updates correctly
- [ ] Switch chain mid-quote
  - [ ] Verify warning appears
  - [ ] Verify "Switch Network" button works
- [ ] Enter 0 amount
  - [ ] Verify button disabled
- [ ] Enter very small amount (< $0.01)
  - [ ] Verify no crashes
- [ ] MAX button functionality
  - [ ] Click MAX
  - [ ] Verify entire balance filled
  - [ ] Verify leaves gas buffer for native tokens

#### Token Selection
- [ ] Click token selector
- [ ] Search by symbol (type "USDC")
- [ ] Search by name (type "USD Coin")
- [ ] Search by address (type "0xaf88...")
- [ ] Select token from list
- [ ] Verify token updates in UI

#### Chain Selection
- [ ] Test each chain:
  - [ ] Ethereum Mainnet
  - [ ] Arbitrum
  - [ ] Base
  - [ ] Optimism
  - [ ] Polygon
  - [ ] Avalanche
- [ ] Verify chain logo appears
- [ ] Verify network switch prompt works
- [ ] Verify tokens update for each chain

---

### BRIDGE Functionality

#### Cross-Chain Transfer Setup
- [ ] Connect wallet
- [ ] Select source chain (e.g., Ethereum)
- [ ] Select destination chain (e.g., Arbitrum)
- [ ] Select token (test with USDC first)
- [ ] Enter amount

#### Bridge Quote Comparison
- [ ] Verify multiple quotes appear:
  - [ ] Li.Fi (should appear first)
  - [ ] CCTP (USDC only)
  - [ ] CCIP (major tokens)
  - [ ] Socket (fallback)
- [ ] Check each quote shows:
  - [ ] Provider name
  - [ ] Bridge route/path
  - [ ] Estimated time (ETA)
  - [ ] Fee estimate
- [ ] Verify quotes sorted by best rate

#### Bridge Execution (USDC via CCTP)
- [ ] Select CCTP quote
- [ ] Click "Bridge"
- [ ] Approve token (if needed)
- [ ] Confirm transaction
- [ ] Wait for confirmation
- [ ] **VERIFY**: Tokens arrive on destination chain
- [ ] Check transaction on explorer

#### Bridge Execution (ETH via Li.Fi)
- [ ] Select Li.Fi quote
- [ ] Click "Bridge"
- [ ] Confirm transaction
- [ ] Monitor status
- [ ] **VERIFY**: ETH arrives on destination
- [ ] Verify gas costs match estimate

#### Bridge Edge Cases
- [ ] Same source and destination chain
  - [ ] **VERIFY**: Error message appears
- [ ] Invalid amount (0 or negative)
  - [ ] **VERIFY**: Button disabled or error shown
- [ ] Bridge with disconnected wallet
  - [ ] **VERIFY**: Connect wallet prompt
- [ ] Insufficient gas for bridge
  - [ ] **VERIFY**: MetaMask shows error

---

### ANALYTICS Page

#### Data Display
- [ ] Navigate to Analytics tab
- [ ] Verify metrics load:
  - [ ] Total Volume (24h)
  - [ ] Total Swaps
  - [ ] Unique Wallets
  - [ ] Average Swap Size
- [ ] Check "Top Tokens by Volume" section
  - [ ] Verify top 5 tokens listed
  - [ ] Verify volume amounts
- [ ] Check "Recent Activity" section
  - [ ] Verify recent swaps appear
  - [ ] Verify timestamps correct
  - [ ] Click transaction links → verify opens explorer
- [ ] Check "Chain Distribution"
  - [ ] Verify all 6 chains shown
  - [ ] Verify percentages add up to 100%
- [ ] Check "Bridge Providers" stats
- [ ] Check "Swap Protocols" stats

#### User Stats (Connected Wallet)
- [ ] Connect wallet
- [ ] Navigate to Analytics
- [ ] Scroll to "Your Stats" section
- [ ] Verify shows:
  - [ ] Your swaps count
  - [ ] Your volume
  - [ ] Gas saved

---

## 🔒 Security Testing

### Allowance Security
- [ ] Approve token with max allowance
- [ ] Check allowance on Etherscan:
  ```
  Contract → Read Contract → allowance(your_address, spender_address)
  ```
- [ ] **VERIFY**: Shows max uint256
- [ ] Perform second swap
- [ ] **VERIFY**: No second approval needed

### Transaction Validation
- [ ] Attempt swap with malicious/unknown token
  - [ ] **VERIFY**: Quote fails gracefully
- [ ] Check quote data before signing
  - [ ] **VERIFY**: `to` address matches known DEX contracts
  - [ ] **VERIFY**: `data` field is valid hex
- [ ] Monitor for unexpected approval requests
  - [ ] **VERIFY**: Only approves to known contracts

### Rate Limiting
- [ ] Make 10+ quote requests rapidly
- [ ] **VERIFY**: No crashes or errors
- [ ] **VERIFY**: Debouncing works (waits 500ms)

---

## ⚡ Performance Testing

### Load Times
- [ ] Measure initial page load: **Target < 3 seconds**
- [ ] Measure quote fetch time: **Target < 2 seconds**
- [ ] Measure chain switch time: **Target < 1 second**

### Network Conditions
Test under different network speeds:
- [ ] Fast connection (WiFi)
- [ ] Slow connection (throttle to 3G in DevTools)
  - [ ] Verify loading states appear
  - [ ] Verify no crashes
  - [ ] Verify timeouts handled gracefully

### Mobile Testing
- [ ] Open on mobile browser (iOS Safari / Android Chrome)
- [ ] Verify responsive layout
- [ ] Test all touch interactions
- [ ] Verify MetaMask mobile integration
- [ ] Test landscape and portrait modes

---

## 🧪 Detailed Test Scenarios

### Scenario 1: First-Time User Swap (ERC20)
**Objective:** Test complete new user flow

1. Open app in incognito mode
2. Connect MetaMask (Arbitrum)
3. Select ETH → USDC
4. Enter 0.01 ETH
5. Wait for quote (should appear in ~1-2s)
6. Click "Approve WETH" (if wrapping needed)
7. Confirm in MetaMask
8. Wait for approval confirmation
9. Button should change to "Swap"
10. Click "Swap"
11. Confirm in MetaMask
12. Wait for swap confirmation
13. **VERIFY**: USDC balance increased
14. **VERIFY**: Transaction links work
15. **VERIFY**: No errors in console

### Scenario 2: Cross-Chain Bridge (USDC)
**Objective:** Test CCTP bridge for USDC

1. Connect wallet on Ethereum
2. Navigate to Bridge tab
3. Select Ethereum → Arbitrum
4. Select USDC token
5. Enter 10 USDC
6. Wait for quotes
7. **VERIFY**: CCTP appears as option
8. Select CCTP quote
9. Approve USDC (if needed)
10. Click "Bridge"
11. Confirm in MetaMask
12. Wait ~2-5 minutes
13. Switch to Arbitrum in MetaMask
14. **VERIFY**: USDC arrived on Arbitrum
15. Check Etherscan/Arbiscan for tx status

### Scenario 3: Multi-Route Comparison
**Objective:** Test Li.Fi vs other bridges

1. Connect wallet
2. Navigate to Bridge
3. Select Ethereum → Base
4. Select WETH (0.1 ETH)
5. Wait for all quotes to load
6. **VERIFY**: See Li.Fi, CCIP, Socket options
7. Compare:
   - [ ] Fee estimates
   - [ ] ETAs
   - [ ] Bridge routes
8. Select cheapest option
9. Execute bridge
10. **VERIFY**: Transaction succeeds

### Scenario 4: Error Handling
**Objective:** Test error states

1. **Insufficient Balance**
   - Enter amount > balance
   - **VERIFY**: Error message or disabled button

2. **Network Issues**
   - Disconnect internet mid-quote
   - **VERIFY**: Error message appears
   - **VERIFY**: Retry works when reconnected

3. **Transaction Rejection**
   - Start swap
   - Reject in MetaMask
   - **VERIFY**: UI resets correctly
   - **VERIFY**: Can retry immediately

4. **Wrong Network**
   - Switch to unsupported network
   - **VERIFY**: Warning appears
   - **VERIFY**: "Switch Network" button works

---

## 🔍 Testing Checklist by Priority

### 🔴 CRITICAL (Must Test Before Launch)
- [ ] Allowance validation works correctly
- [ ] No double approvals for same token
- [ ] Swap execution succeeds on all 6 chains
- [ ] CCTP bridge works for USDC
- [ ] Li.Fi bridge quotes appear
- [ ] No privacy mode toggle visible
- [ ] Transaction links all work
- [ ] Wallet connection stable
- [ ] No console errors on happy path

### 🟡 HIGH (Should Test Before Launch)
- [ ] All 6 chains work independently
- [ ] Token selector search works
- [ ] MAX button fills correct amount
- [ ] Chain switching works
- [ ] Quote debouncing works
- [ ] Loading states appear correctly
- [ ] Analytics page loads
- [ ] Mobile responsive

### 🟢 MEDIUM (Test in First Week)
- [ ] Analytics shows correct data
- [ ] Bridge provider comparison accurate
- [ ] Performance metrics reasonable
- [ ] User stats update correctly
- [ ] All token logos load
- [ ] All chain logos load

---

## 🐛 Bug Reporting Template

When you find a bug, document it using this template:

```markdown
## Bug Report

**Title:** [Brief description]

**Severity:** 🔴 Critical / 🟡 High / 🟢 Medium / ⚪ Low

**Environment:**
- Browser: [Chrome 120 / Firefox 121 / Safari 17]
- Device: [Desktop / Mobile]
- Network: [Arbitrum / Ethereum / etc.]
- Wallet: [MetaMask / Rainbow / etc.]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Screenshots:**
[Attach if applicable]

**Console Errors:**
```
[Paste any errors from DevTools console]
```

**Transaction Hash (if applicable):**
0x...

**Additional Context:**
Any other relevant information
```

---

## 📊 Test Results Template

Use this to track your testing progress:

```markdown
## Test Session Report

**Date:** [Date]
**Tester:** [Name]
**Duration:** [Time spent]
**Environment:** [Local / Staging / Production]

### Summary
- ✅ Tests Passed: X/Y
- ❌ Tests Failed: X
- ⚠️ Issues Found: X

### Critical Features
- [ ] Swap: PASS / FAIL / PARTIAL
- [ ] Bridge: PASS / FAIL / PARTIAL
- [ ] Allowance: PASS / FAIL / PARTIAL
- [ ] Analytics: PASS / FAIL / PARTIAL

### Issues Found
1. [Issue description] - Severity: 🔴/🟡/🟢
2. [Issue description] - Severity: 🔴/🟡/🟢

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

## 🎯 Chain-Specific Test Cases

### Ethereum Mainnet
**Gas costs are HIGH - use small amounts!**

Test tokens:
- ETH → USDC (0.01 ETH)
- USDC → DAI (10 USDC)
- WETH → WBTC (0.005 WETH)

**Expected Results:**
- ✅ Quote appears in < 2s
- ✅ Gas estimate: $5-$20 (varies)
- ✅ Swap succeeds
- ✅ 0x Protocol used

### Arbitrum
**Lowest gas costs - primary testing chain**

Test tokens:
- ETH → USDC (0.1 ETH)
- ARB → USDC (10 ARB)
- USDC → USDT (50 USDC)

**Expected Results:**
- ✅ Quote appears in < 2s
- ✅ Gas estimate: $0.10-$0.50
- ✅ CoW Protocol available
- ✅ Fast confirmations (< 1 min)

### Base
**Second-lowest gas costs**

Test tokens:
- ETH → USDC (0.1 ETH)
- USDC → DAI (20 USDC)

**Expected Results:**
- ✅ Quote appears in < 2s
- ✅ Gas estimate: $0.10-$1
- ✅ Fast confirmations

### Optimism
**Medium gas costs**

Test tokens:
- ETH → USDC (0.05 ETH)
- OP → USDC (10 OP)

**Expected Results:**
- ✅ Quote via 0x Protocol
- ✅ Gas estimate: $0.20-$2

### Polygon
**Very low gas costs (but MATIC gas token)**

Test tokens:
- MATIC → USDC (10 MATIC)
- USDC → USDT (20 USDC)
- WETH → WBTC (0.01 WETH)

**Expected Results:**
- ✅ Fast quotes
- ✅ Gas in MATIC (< $0.10)

### Avalanche
**Low-medium gas costs (AVAX gas token)**

Test tokens:
- AVAX → USDC (1 AVAX)
- USDC → USDT (20 USDC)

**Expected Results:**
- ✅ Quote via 0x Protocol
- ✅ Gas in AVAX

---

## 🌉 Bridge Testing

### CCTP Bridge (USDC Only)
**Best for:** USDC transfers  
**Chains:** Ethereum, Arbitrum, Base, Optimism, Polygon

#### Test Case 1: Ethereum → Arbitrum (USDC)
1. Connect to Ethereum
2. Bridge tab
3. Select USDC
4. Amount: 10 USDC
5. Destination: Arbitrum
6. **VERIFY**: CCTP quote appears
7. **VERIFY**: Fee < $0.20
8. **VERIFY**: ETA: 2-5 min
9. Execute bridge
10. **VERIFY**: USDC arrives on Arbitrum within 5 min
11. **VERIFY**: Amount matches (minus fees)

#### Test Case 2: Arbitrum → Base (USDC)
1. Source: Arbitrum
2. Destination: Base
3. Token: USDC (20 USDC)
4. **VERIFY**: CCTP cheapest option
5. Execute and verify arrival

### Li.Fi Bridge (All Tokens)
**Best for:** Best rates via aggregation  
**Chains:** All supported chains

#### Test Case 1: Ethereum → Optimism (ETH)
1. Connect to Ethereum
2. Bridge 0.1 ETH to Optimism
3. **VERIFY**: Li.Fi quote appears
4. **VERIFY**: Shows bridge route details
5. **VERIFY**: Fee estimate reasonable
6. Execute bridge
7. **VERIFY**: ETH arrives on Optimism
8. Check Li.Fi explorer: https://scan.li.fi

#### Test Case 2: Polygon → Avalanche (USDC)
1. Source: Polygon (USDC)
2. Destination: Avalanche
3. Amount: 50 USDC
4. **VERIFY**: Li.Fi provides route
5. Execute and track

### CCIP Bridge (Major Tokens)
**Best for:** LINK, WETH, USDC  
**Chains:** Ethereum, Arbitrum, Base, Optimism, Polygon

#### Test Case: Arbitrum → Base (LINK)
1. Source: Arbitrum
2. Token: LINK (10 LINK)
3. Destination: Base
4. **VERIFY**: CCIP quote appears
5. **VERIFY**: ETA: 5-10 min
6. Execute and verify

### Socket Bridge (Fallback)
**Best for:** Exotic routes

#### Test Case: Avalanche → Polygon (WETH.e)
1. Source: Avalanche
2. Token: WETH.e
3. Destination: Polygon
4. **VERIFY**: Socket provides fallback quote
5. Execute if other bridges unavailable

---

## 🚨 Critical Security Tests

### 1. Contract Address Validation
- [ ] Check all approval targets are whitelisted
- [ ] Verify swap `to` addresses match:
  - 0x Protocol: `0xDef1C0ded9bec7F1a1670819833240f027b25EfF`
  - CoW Settlement: `0x9008D19f58AAbD9eD0D60971565AA8510560ab41`
  - FeeRouter: Check `ROUTER_ADDRESSES` in constants.ts

### 2. Amount Validation
- [ ] Test with max uint256
  - [ ] **VERIFY**: Handled gracefully
- [ ] Test with negative amount
  - [ ] **VERIFY**: Rejected
- [ ] Test with decimal overflow
  - [ ] **VERIFY**: Proper rounding

### 3. Frontend Security
- [ ] Check no API keys in client bundle
  - [ ] Inspect Network tab
  - [ ] Search source for "sk_", "api_key"
- [ ] Verify environment variables not exposed
- [ ] Check CSP headers (Content Security Policy)

---

## 📈 Performance Benchmarks

### Target Metrics
- **Initial Page Load:** < 3 seconds
- **Quote Fetch:** < 2 seconds
- **Transaction Confirmation:** < 30 seconds (chain-dependent)
- **Chain Switch:** < 1 second
- **Analytics Load:** < 1 second

### How to Measure
1. Open DevTools (F12)
2. Go to Network tab
3. Disable cache
4. Reload page
5. Check "Load" time at bottom

### Performance Tests
- [ ] Load home page 3 times
  - [ ] Average time: ___ seconds
- [ ] Fetch quote 5 times
  - [ ] Average time: ___ seconds
- [ ] Switch chains 5 times
  - [ ] Average time: ___ seconds

---

## 🔄 Regression Testing

After any code changes, re-test:
- [ ] Allowance validation still works
- [ ] No privacy toggle visible
- [ ] Li.Fi quotes appear
- [ ] All 6 chains functional
- [ ] Analytics loads correctly

---

## 📝 Testing Notes

### Known Limitations
1. **Li.Fi API**: Requires API key for production (use public endpoint for testing)
2. **Socket API**: Proxied through backend (check backend is running)
3. **CoW Protocol**: Only on Ethereum, Arbitrum, Base, Optimism
4. **CCTP**: USDC only

### Testing Best Practices
- ✅ Always test on testnet first
- ✅ Start with small amounts on mainnet
- ✅ Keep MetaMask transaction history open
- ✅ Document every issue immediately
- ✅ Take screenshots of errors
- ✅ Test in multiple browsers
- ✅ Clear cache between test sessions

### Emergency Rollback
If critical issues found in production:
```bash
git revert HEAD
git push origin main
# Vercel will auto-deploy previous version
```

---

## 🎓 Training Checklist for QA Team

Before testing, ensure tester can:
- [ ] Connect MetaMask wallet
- [ ] Switch between networks
- [ ] Acquire test tokens from faucets
- [ ] Read transaction data on block explorers
- [ ] Use browser DevTools (Console, Network)
- [ ] Take and annotate screenshots
- [ ] File GitHub issues

---

## ✅ Pre-Launch Testing Sign-Off

**Before deploying to production, confirm:**

- [ ] All CRITICAL tests passed
- [ ] All HIGH priority tests passed
- [ ] Zero critical bugs found
- [ ] Performance meets benchmarks
- [ ] Security audit completed
- [ ] Tested on 3+ browsers
- [ ] Tested on mobile
- [ ] All team members approved

**Sign-offs required:**
- [ ] Lead Developer: _______________
- [ ] QA Lead: _______________
- [ ] Security Reviewer: _______________
- [ ] Product Owner: _______________

---

## 🔗 Useful Resources

### Block Explorers
- Ethereum: https://etherscan.io
- Arbitrum: https://arbiscan.io
- Base: https://basescan.org
- Optimism: https://optimistic.etherscan.io
- Polygon: https://polygonscan.com
- Avalanche: https://snowtrace.io

### Bridge Status Trackers
- Li.Fi Scan: https://scan.li.fi
- CCTP Status: https://iris.circle.com
- CCIP Explorer: https://ccip.chain.link

### Faucets (Testnets)
- Arbitrum Sepolia: https://faucet.quicknode.com/arbitrum/sepolia
- Base Sepolia: https://www.alchemy.com/faucets/base-sepolia
- Optimism Sepolia: https://www.alchemy.com/faucets/optimism-sepolia

### API Documentation
- 0x Protocol: https://0x.org/docs/api
- CoW Protocol: https://docs.cow.fi/
- Li.Fi: https://docs.li.fi/
- Socket: https://docs.socket.tech/

---

## 📞 Support & Questions

If you encounter issues during testing:
1. Check console for errors (F12)
2. Verify wallet is connected and on correct chain
3. Check transaction on block explorer
4. Review this guide for similar issues
5. File a GitHub issue with full details

---

**Happy Testing! 🚀**

*This guide is a living document. Update it as new features are added or issues discovered.*
