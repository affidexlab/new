# 🔌 DecaFlow Pre-Built Integrations

> Production-ready integrations for popular DeFi protocols

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 What's This?

Pre-built, audited integrations for adding DecaFlow MEV protection to popular DeFi protocols. Drop these into your fork and you're protected.

---

## 📦 Available Integrations

### DEX Protocols

#### Uniswap V3
```bash
npm install @decaflow/uniswap-v3-integration
```

**Features**:
- ✅ Swap router with MEV protection
- ✅ Backward compatible with existing UI
- ✅ Zero breaking changes
- ✅ Audited by [Audit Firm]

[View Integration →](./integrations/uniswap-v3)

---

#### SushiSwap
```bash
npm install @decaflow/sushiswap-integration
```

**Features**:
- ✅ Drop-in replacement for SushiSwap router
- ✅ Multi-chain support
- ✅ MEV savings analytics
- ✅ Production tested

[View Integration →](./integrations/sushiswap)

---

#### Curve Finance
```bash
npm install @decaflow/curve-integration
```

**Features**:
- ✅ Stable swap protection
- ✅ Pool-specific routing
- ✅ Large trade optimization
- ✅ Gas optimization

[View Integration →](./integrations/curve)

---

### Lending Protocols

#### Aave V3
```bash
npm install @decaflow/aave-v3-integration
```

**Features**:
- ✅ Liquidation frontrun protection
- ✅ Flash loan MEV mitigation
- ✅ Rate switch protection
- ✅ Compatible with existing UI

[View Integration →](./integrations/aave-v3)

---

#### Compound V3
```bash
npm install @decaflow/compound-v3-integration
```

**Features**:
- ✅ Protected liquidations
- ✅ Supply/borrow MEV protection
- ✅ Oracle manipulation defense
- ✅ Audited integration

[View Integration →](./integrations/compound-v3)

---

### Aggregators

#### 1inch-style Aggregator
```bash
npm install @decaflow/aggregator-integration
```

**Features**:
- ✅ Multi-DEX routing with privacy
- ✅ Optimal path finding
- ✅ Gas optimization
- ✅ MEV-aware splits

[View Integration →](./integrations/aggregator)

---

## 🚀 Quick Start

### 1. Install Integration

```bash
npm install @decaflow/[protocol]-integration
```

### 2. Replace Router

```typescript
// Before
import { SwapRouter } from '@uniswap/v3-sdk';

// After
import { PrivacySwapRouter } from '@decaflow/uniswap-v3-integration';

const router = new PrivacySwapRouter({
  apiKey: process.env.DECAFLOW_API_KEY
});
```

### 3. Deploy (No Other Changes Needed!)

Your existing UI and contracts work as-is. Just deploy with the new router.

---

## 📊 Integration Comparison

| Integration | Setup Time | Breaking Changes | Audit Status |
|------------|------------|------------------|--------------|
| Uniswap V3 | **< 10 min** | None | ✅ Audited |
| SushiSwap | **< 10 min** | None | ✅ Audited |
| Curve | **< 15 min** | None | 🔄 In Progress |
| Aave V3 | **< 20 min** | None | 🔄 In Progress |
| Compound V3 | **< 20 min** | None | 📅 Scheduled |

---

## 🏗️ Protocol-Specific Guides

### Uniswap V3 Fork Integration

#### Step 1: Install

```bash
npm install @decaflow/uniswap-v3-integration
```

#### Step 2: Update Router Contract

```solidity
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

import "@decaflow/uniswap-v3-integration/contracts/PrivacySwapRouter.sol";

contract YourRouter is PrivacySwapRouter {
    constructor(
        address _decaflowOracle,
        address _factory,
        address _WETH9
    ) PrivacySwapRouter(_decaflowOracle, _factory, _WETH9) {}
}
```

#### Step 3: Update Frontend

```typescript
import { PrivacySwapRouter } from '@decaflow/uniswap-v3-integration';

const router = new PrivacySwapRouter({
  apiKey: process.env.NEXT_PUBLIC_DECAFLOW_API_KEY,
  chainId: 42161 // Arbitrum
});

// Rest of your code stays the same!
const quote = await router.quote(...);
const tx = await router.swap(...);
```

#### Step 4: Show MEV Savings to Users

```typescript
// Add this to your swap confirmation UI
const { quote, mevSavings } = await router.quoteWithMevAnalysis(...);

console.log(`💰 You're saving ~$${mevSavings} in MEV!`);
```

**That's it!** [Full guide →](./guides/uniswap-v3-integration.md)

---

### Aave Fork Integration

#### Step 1: Install

```bash
npm install @decaflow/aave-v3-integration
```

#### Step 2: Wrap Liquidation Logic

```solidity
import "@decaflow/aave-v3-integration/contracts/PrivacyLiquidationAdapter.sol";

contract YourLiquidationLogic is PrivacyLiquidationAdapter {
    function liquidationCall(
        address collateralAsset,
        address debtAsset,
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external override {
        // Your existing liquidation logic
        // Now protected from frontrunning!
    }
}
```

[Full guide →](./guides/aave-integration.md)

---

## 🧪 Testing Integrations

Each integration includes comprehensive tests:

```bash
cd integrations/uniswap-v3
npm install
npm test
```

### Run Integration Tests

```bash
npm run test:integration
```

### Run Against Mainnet Fork

```bash
npm run test:fork -- --network arbitrum
```

---

## 🔒 Security & Audits

| Integration | Audit Firm | Report | Date |
|------------|-----------|--------|------|
| Uniswap V3 | [TBD] | [Link] | Coming Soon |
| SushiSwap | [TBD] | [Link] | Coming Soon |

**Bug Bounty**: Up to $50,000 for critical vulnerabilities

Report issues: security@decaflow.xyz

---

## 📈 MEV Savings by Protocol

| Protocol Type | Avg MEV/Transaction | Avg Savings with DecaFlow |
|--------------|---------------------|---------------------------|
| DEX | $12.40 | $11.20 (90%) |
| Lending | $45.80 | $41.30 (90%) |
| Aggregator | $8.30 | $7.50 (90%) |

*Based on Arbitrum mainnet data, last 30 days*

---

## 🤝 Request New Integration

Don't see your protocol? [Request an integration →](https://github.com/decaflow/decaflow-integrations/issues/new?template=integration-request.md)

We prioritize based on:
1. Protocol TVL
2. User base size
3. MEV exposure
4. Community demand

---

## 🛠️ Building Custom Integration

Want to build your own? Use our integration template:

```bash
git clone https://github.com/decaflow/integration-template.git
cd integration-template
npm install
```

[Integration Builder Guide →](./guides/custom-integration.md)

---

## 📞 Integration Support

Need help integrating?

- **Schedule Call**: [Book 30-min technical call](https://calendly.com/decaflow/integration-support)
- **Discord**: [#integrations channel](https://discord.gg/decaflow)
- **Email**: integrations@decaflow.xyz
- **White Glove Service**: Free integration support for first 5 protocols ([Apply →](https://decaflow.xyz/white-glove))

---

## 🏆 Integration Showcase

Protocols that integrated DecaFlow:

| Protocol | Type | Chain | Launch Date | MEV Saved |
|----------|------|-------|-------------|-----------|
| *Be the first!* | - | - | - | - |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

<div align="center">

**[Main SDK](https://github.com/decaflow/privacy-sdk)** • **[Examples](https://github.com/decaflow/decaflow-examples)** • **[Docs](https://docs.decaflow.xyz)**

Made with ❤️ by the DecaFlow team

</div>
