# DecaFlow SDK Examples

This directory contains working examples of DecaFlow SDK integration.

## Examples

### 1. Basic Swap ([basic-swap.ts](./basic-swap.ts))

Simple example showing how to:
- Initialize the SDK
- Get a privacy swap quote
- Execute a MEV-protected swap
- Track transaction status

**Run**:
```bash
export DECAFLOW_API_KEY="your_key"
export PRIVATE_KEY="your_private_key"
npx ts-node examples/basic-swap.ts
```

---

### 2. React Integration ([react-integration.tsx](./react-integration.tsx))

Complete React component showing:
- DecaFlow Provider setup
- useSwapQuote hook
- Real-time quote updates
- MEV savings display
- Error handling

**Usage**:
```tsx
import App from './examples/react-integration';

// In your app
<App />
```

---

### 3. MEV Risk Check ([mev-risk-check.ts](./mev-risk-check.ts))

Example showing how to:
- Analyze MEV risk before trading
- Get risk scores and recommendations
- Implement conditional protection
- Display warnings to users

**Run**:
```bash
export DECAFLOW_API_KEY="your_key"
npx ts-node examples/mev-risk-check.ts
```

---

## Prerequisites

All examples require:
- Node.js 18+
- DecaFlow API key (get free at [decaflow.xyz/dashboard](https://decaflow.xyz/dashboard))
- Private key (for executing swaps)
- RPC endpoint access

## Environment Setup

Create a `.env` file:

```env
DECAFLOW_API_KEY=your_api_key_here
PRIVATE_KEY=your_private_key_here
RPC_URL=https://arb1.arbitrum.io/rpc
```

## Running Examples

1. Install dependencies:
```bash
npm install @decaflow/privacy-sdk ethers
```

2. Set environment variables (see above)

3. Run any example:
```bash
npx ts-node examples/basic-swap.ts
```

## Support

Questions? Join our [Discord](https://discord.gg/decaflow) or check the [docs](https://docs.decaflow.xyz).
