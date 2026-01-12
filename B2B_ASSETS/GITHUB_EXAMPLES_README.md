# 📚 DecaFlow Integration Examples

> Real-world examples of DecaFlow SDK integrations across different protocols and frameworks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 What's Inside

This repository contains production-ready examples of DecaFlow SDK integrations for various DeFi protocols and use cases.

---

## 📁 Repository Structure

```
/examples
├── /react-dex          # DEX UI with privacy swaps
├── /vue-aggregator     # Aggregator with MEV protection
├── /nextjs-wallet      # Wallet with built-in protection
├── /hardhat-protocol   # Smart contract integration
├── /python-bot         # Trading bot with privacy
├── /rust-backend       # Backend service integration
└── /mobile-app         # React Native mobile app
```

---

## 🚀 Quick Start

### Clone the Repository

```bash
git clone https://github.com/decaflow/decaflow-examples.git
cd decaflow-examples
```

### Choose Your Example

Each example includes:
- ✅ Complete source code
- ✅ Setup instructions
- ✅ Configuration guide
- ✅ Best practices
- ✅ Common pitfalls to avoid

---

## 📖 Examples

### 1. React DEX UI

**Path**: `/examples/react-dex`

A complete DEX interface with DecaFlow privacy swaps integrated.

**Features**:
- Privacy swap interface
- MEV risk score display
- Real-time savings tracker
- Multi-chain support

**Tech Stack**: React, TypeScript, Wagmi, Viem

[View Example →](./examples/react-dex)

---

### 2. Vue Aggregator

**Path**: `/examples/vue-aggregator`

DEX aggregator with built-in MEV protection.

**Features**:
- Multi-DEX routing
- Privacy-first execution
- Price comparison with MEV savings
- Customizable slippage

**Tech Stack**: Vue 3, TypeScript, ethers.js

[View Example →](./examples/vue-aggregator)

---

### 3. Next.js Wallet

**Path**: `/examples/nextjs-wallet`

Self-custodial wallet with MEV protection for all swaps.

**Features**:
- Wallet management
- Protected swaps
- Transaction history
- MEV savings analytics

**Tech Stack**: Next.js, TypeScript, WalletConnect

[View Example →](./examples/nextjs-wallet)

---

### 4. Hardhat Protocol Integration

**Path**: `/examples/hardhat-protocol`

Smart contract integration for lending protocol.

**Features**:
- Solidity contracts with DecaFlow
- Liquidation protection
- Flash loan protection
- Unit tests

**Tech Stack**: Solidity, Hardhat, TypeScript

[View Example →](./examples/hardhat-protocol)

---

### 5. Python Trading Bot

**Path**: `/examples/python-bot`

Automated trading bot with privacy layer.

**Features**:
- Automated trading strategies
- MEV-protected execution
- Risk management
- Performance tracking

**Tech Stack**: Python, web3.py

[View Example →](./examples/python-bot)

---

### 6. Rust Backend Service

**Path**: `/examples/rust-backend`

High-performance backend service with DecaFlow integration.

**Features**:
- REST API for privacy swaps
- Batch transaction processing
- WebSocket real-time updates
- Production-ready error handling

**Tech Stack**: Rust, Actix-web, ethers-rs

[View Example →](./examples/rust-backend)

---

### 7. React Native Mobile App

**Path**: `/examples/mobile-app`

Cross-platform mobile wallet with MEV protection.

**Features**:
- Mobile-optimized UI
- Biometric authentication
- Push notifications for MEV alerts
- QR code scanning

**Tech Stack**: React Native, TypeScript, ethers.js

[View Example →](./examples/mobile-app)

---

## 🎓 Tutorials

### Getting Started
- [Your First Privacy Swap](./tutorials/first-swap.md)
- [Setting Up DecaFlow SDK](./tutorials/setup.md)
- [Understanding MEV Protection](./tutorials/mev-protection.md)

### Intermediate
- [Custom Risk Thresholds](./tutorials/risk-thresholds.md)
- [Batch Transactions](./tutorials/batch-transactions.md)
- [Error Handling](./tutorials/error-handling.md)

### Advanced
- [Custom Routing Logic](./tutorials/custom-routing.md)
- [White-Label Integration](./tutorials/white-label.md)
- [Performance Optimization](./tutorials/optimization.md)

---

## 🏗️ Protocol-Specific Examples

### DEX Integrations
- [Uniswap V3 Fork](./protocol-examples/uniswap-v3.md)
- [Curve Finance Integration](./protocol-examples/curve.md)
- [Balancer Integration](./protocol-examples/balancer.md)

### Lending Protocols
- [Aave Fork](./protocol-examples/aave.md)
- [Compound Fork](./protocol-examples/compound.md)

### Aggregators
- [1inch-style Aggregator](./protocol-examples/aggregator.md)

---

## 🔧 Common Use Cases

### 1. Adding Privacy to Existing DEX

```typescript
// Before
await router.swapExactTokensForTokens(...)

// After
import { DecaFlowSDK } from '@decaflow/privacy-sdk';
const sdk = new DecaFlowSDK({ apiKey: process.env.DECAFLOW_API_KEY });
await sdk.executePrivacySwap(quote);
```

[Full Example →](./use-cases/dex-integration.md)

---

### 2. Protecting Liquidations

```solidity
// Add privacy layer to liquidation calls
function liquidate(address user) external {
    // Calculate liquidation amount
    uint256 amount = calculateLiquidation(user);
    
    // Execute through DecaFlow for protection
    IPrivacyRouter(decaflowRouter).privacySwap(
        collateralToken,
        debtToken,
        amount,
        address(this)
    );
}
```

[Full Example →](./use-cases/liquidation-protection.md)

---

### 3. Wallet Integration

```typescript
// Add to your wallet's swap function
async function swapWithPrivacy(tokenIn, tokenOut, amount) {
  const quote = await sdk.getPrivacySwapQuote({
    tokenIn,
    tokenOut,
    amount
  });
  
  // Show MEV savings to user
  console.log(`You'll save ~$${quote.estimatedSavings} in MEV`);
  
  return await sdk.executePrivacySwap(quote);
}
```

[Full Example →](./use-cases/wallet-integration.md)

---

## 🧪 Testing Examples

Each example includes comprehensive tests:

```bash
cd examples/react-dex
npm install
npm test
```

---

## 🤝 Contributing Examples

Have a great integration example? We'd love to include it!

1. Fork this repository
2. Create your example in `/examples/your-example`
3. Include README, setup instructions, and tests
4. Submit a PR

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📊 Integration Showcase

Protocols using DecaFlow in production:

| Protocol | Type | Integration | Link |
|----------|------|-------------|------|
| *Be the first!* | - | - | - |

**Want to be featured?** [Submit your integration →](https://github.com/decaflow/decaflow-examples/issues/new?template=showcase.md)

---

## 🆘 Need Help?

- **Discord**: [Join our community](https://discord.gg/decaflow)
- **Schedule Call**: [Book 15-min integration call](https://calendly.com/decaflow/integration)
- **Email**: developers@decaflow.xyz
- **Docs**: https://docs.decaflow.xyz

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

<div align="center">

**[Main SDK](https://github.com/decaflow/privacy-sdk)** • **[Documentation](https://docs.decaflow.xyz)** • **[Website](https://decaflow.xyz)**

Made with ❤️ by the DecaFlow team

</div>
