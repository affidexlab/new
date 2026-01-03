# DecaFlow Privacy SDK

The official SDK for integrating privacy-protected swaps into your Arbitrum dApp.

## Features

- 🔒 **MEV Protection**: Automatic routing through privacy-preserving execution layers
- 🤖 **AI Risk Scoring**: Real-time MEV risk assessment for every trade
- ⚡ **One-Line Integration**: Add privacy to your dApp in minutes
- 📊 **Analytics**: Track MEV saved and execution performance
- 🔗 **Multi-Chain**: Arbitrum, Ethereum, Base, Optimism, Polygon, Avalanche

## Installation

```bash
npm install @decaflow/privacy-sdk
# or
yarn add @decaflow/privacy-sdk
# or
pnpm add @decaflow/privacy-sdk
```

## Quick Start

### Basic Usage

```typescript
import { createPrivacyClient } from '@decaflow/privacy-sdk';
import { ethers } from 'ethers';

// Initialize the privacy client
const privacy = createPrivacyClient({
  network: 'arbitrum',
  apiKey: process.env.DECAFLOW_API_KEY, // Optional: get from https://decaflow.io/developers
});

// Connect your wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const address = await signer.getAddress();

// Get a privacy-protected swap quote
const quote = await privacy.getSwapQuote({
  from: address,
  tokenIn: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
  tokenOut: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum
  amount: '1000000000000000000', // 1 WETH
  slippage: 0.5,
  enableMEVProtection: true,
});

console.log(`Output: ${quote.outputAmount}`);
console.log(`MEV Risk Score: ${quote.mevRiskScore}/10`);
console.log(`Estimated MEV Saved: $${quote.mevSavingsUSD}`);

// Execute the swap
const execution = await privacy.executeSwap(quote, signer);
console.log(`Transaction: ${execution.transactionHash}`);
```

### Check MEV Risk Before Trading

```typescript
// Get MEV risk assessment without executing
const risk = await privacy.getMEVRiskScore({
  from: address,
  tokenIn: WETH_ADDRESS,
  tokenOut: USDC_ADDRESS,
  amount: '1000000000000000000',
});

console.log(`Risk Level: ${risk.riskLevel}`); // 'low' | 'medium' | 'high'
console.log(`Risk Score: ${risk.riskScore}/10`);
console.log(`Estimated MEV: $${risk.estimatedMEV}`);
console.log(`Recommendation: ${risk.recommendation}`);

// Decide whether to use privacy based on risk
if (risk.riskLevel === 'high') {
  // Use privacy routing
  const quote = await privacy.getSwapQuote({ ...params, enableMEVProtection: true });
} else {
  // Use direct routing for faster execution
  const quote = await privacy.getSwapQuote({ ...params, enableMEVProtection: false });
}
```

### Track Transaction Status

```typescript
// After execution, track the transaction
const execution = await privacy.executeSwap(quote, signer);

// Poll for status
const status = await privacy.getTransactionStatus(execution.transactionHash);
console.log(`Status: ${status.status}`);
console.log(`MEV Saved: $${status.mevSaved}`);
console.log(`Execution Time: ${status.executionTime}ms`);
```

## React Integration

```typescript
import { createPrivacyClient } from '@decaflow/privacy-sdk';
import { useWalletClient, useAccount } from 'wagmi';

function SwapComponent() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const privacy = createPrivacyClient({
    network: 'arbitrum',
  });

  const handleSwap = async () => {
    try {
      // Get quote
      const quote = await privacy.getSwapQuote({
        from: address,
        tokenIn: WETH_ADDRESS,
        tokenOut: USDC_ADDRESS,
        amount: '1000000000000000000',
      });

      // Execute with wallet client
      const execution = await privacy.executeSwap(quote, walletClient);
      
      console.log('Swap executed:', execution.transactionHash);
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  return (
    <button onClick={handleSwap}>
      Swap with Privacy
    </button>
  );
}
```

## API Reference

### `createPrivacyClient(config)`

Creates a new privacy client instance.

**Config Options:**
- `network` (required): `'arbitrum' | 'ethereum' | 'base' | 'optimism' | 'polygon' | 'avalanche'`
- `apiKey` (optional): Your DecaFlow API key for higher rate limits
- `apiUrl` (optional): Custom API endpoint (default: `https://api.decaflow.io`)

### `privacy.getSwapQuote(params)`

Get a privacy-protected swap quote.

**Parameters:**
- `from`: User's wallet address
- `tokenIn`: Input token address
- `tokenOut`: Output token address
- `amount`: Input amount in wei/smallest unit
- `slippage`: Maximum slippage percentage (default: 0.5)
- `enableMEVProtection`: Enable privacy routing (default: true)

**Returns:** `SwapQuote`
- `quoteId`: Unique quote identifier
- `inputAmount`: Input amount
- `outputAmount`: Expected output amount
- `priceImpact`: Price impact percentage
- `mevRiskScore`: MEV risk score (0-10)
- `estimatedGas`: Estimated gas cost
- `route`: Execution route ('direct' | 'cow-protocol' | 'private-rpc')
- `mevSavingsUSD`: Estimated MEV savings in USD
- `expiresAt`: Quote expiration timestamp

### `privacy.executeSwap(quote, signer)`

Execute a privacy-protected swap.

**Parameters:**
- `quote`: Quote object from `getSwapQuote()`
- `signer`: Ethers.js signer or wallet client

**Returns:** `SwapExecution`
- `transactionHash`: Transaction hash
- `status`: Execution status
- `actualOutput`: Actual output amount
- `gasUsed`: Gas used
- `mevSaved`: MEV saved in USD

### `privacy.getMEVRiskScore(params)`

Get MEV risk score for a potential trade without executing.

**Returns:**
- `riskScore`: Risk score (0-10)
- `riskLevel`: Risk category ('low' | 'medium' | 'high')
- `estimatedMEV`: Estimated MEV in USD
- `recommendation`: Human-readable recommendation

### `privacy.getTransactionStatus(txHash)`

Get status and MEV savings for a completed transaction.

**Returns:**
- `status`: Transaction status
- `mevSaved`: MEV saved in USD
- `executionTime`: Execution time in milliseconds

## Pricing & Fees

### Free Tier (No API Key Required)
- ✅ Unlimited MEV risk scores
- ✅ Up to 100 swaps/month
- ✅ Basic analytics

### Usage-Based Pricing (With API Key)
- **Protected Transaction Fee**: 1% of transaction value
- **Performance Fee**: 3.5% of MEV saved
- **Example**: On a $10,000 swap that saves $400 from MEV:
  - Usage fee: $100 (1% of $10,000)
  - Performance fee: $14 (3.5% of $400 saved)
  - **Total fee**: $114

### Enterprise Plan
For protocols integrating the SDK:
- **$2,000 - $20,000/month** based on volume
- ✅ SLA guarantees
- ✅ Dedicated support
- ✅ Custom routing logic
- ✅ Higher rate limits
- ✅ Advanced analytics dashboard
- ✅ White-label options

[Contact us](mailto:team@decaflow.tech) for enterprise pricing.

## Examples

Check out the [examples directory](./examples) for complete integration examples:

- [Next.js App](./examples/nextjs-app)
- [React + Wagmi](./examples/react-wagmi)
- [Vanilla JavaScript](./examples/vanilla-js)
- [Smart Contract Integration](./examples/solidity-contract)

## Support

- 📧 Email: team@decaflow.tech
- 💬 Discord: [Join our community](https://discord.gg/decaflow)
- 📚 Docs: [docs.decaflow.io](https://docs.decaflow.io)
- 🐦 Twitter: [@DecaFlowProtocol](https://twitter.com/DecaFlowProtocol)

## License

MIT License - see [LICENSE](LICENSE) for details.
