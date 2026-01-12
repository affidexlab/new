# 📚 DecaFlow API Documentation Outline

> Complete structure for developer-friendly API documentation

---

## 🎯 Documentation Structure

```
/docs
├── /getting-started
│   ├── introduction.md
│   ├── quickstart.md
│   ├── authentication.md
│   └── rate-limiting.md
├── /sdk
│   ├── /typescript
│   ├── /python
│   ├── /solidity
│   └── /react
├── /api
│   ├── overview.md
│   ├── /endpoints
│   ├── errors.md
│   └── webhooks.md
├── /guides
│   ├── protocol-integration.md
│   ├── wallet-integration.md
│   ├── trading-bot-integration.md
│   └── best-practices.md
├── /examples
│   ├── basic-swap.md
│   ├── batch-swaps.md
│   ├── risk-analysis.md
│   └── custom-routing.md
└── /reference
    ├── glossary.md
    ├── chains.md
    └── changelog.md
```

---

## 📖 GETTING STARTED

### introduction.md

```markdown
# Introduction to DecaFlow

## What is DecaFlow?

DecaFlow is MEV protection infrastructure for DeFi protocols. We provide:

1. **Privacy SDK**: Developer tools to integrate MEV protection
2. **MEV Dashboard**: Real-time MEV intelligence platform

## Why DecaFlow?

### The Problem

$6.24M MEV extracted on Arbitrum monthly. Your users are losing money to:
- Sandwich attacks
- Frontrunning
- Backrunning

### The Solution

DecaFlow provides:
- ✅ Real-time MEV detection
- ✅ Privacy-preserving transaction routing
- ✅ CoW Protocol integration
- ✅ Multi-chain support

## Who Should Use DecaFlow?

- **Protocol Developers**: Integrate MEV protection
- **Wallet Developers**: Offer built-in privacy
- **Trading Firms**: Access MEV intelligence
- **Researchers**: Analyze MEV patterns

## Quick Links

- [Quickstart Guide](#quickstart)
- [SDK Documentation](#sdk)
- [API Reference](#api-reference)
- [Examples](#examples)
```

---

### quickstart.md

```markdown
# Quickstart Guide

Get up and running with DecaFlow in 5 minutes.

## 1. Get API Key

```bash
# Sign up at decaflow.xyz/dashboard
# Copy your API key from settings
```

## 2. Install SDK

### TypeScript/JavaScript

```bash
npm install @decaflow/privacy-sdk
```

### Python

```bash
pip install decaflow-sdk
```

### Solidity

```bash
forge install decaflow/contracts
```

## 3. Make Your First Request

### TypeScript

```typescript
import { DecaFlowSDK } from '@decaflow/privacy-sdk';

const sdk = new DecaFlowSDK({ 
  apiKey: 'your_api_key_here' 
});

// Get a privacy swap quote
const quote = await sdk.getPrivacySwapQuote({
  tokenIn: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
  tokenOut: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
  amount: '1000000000000000000', // 1 WETH
  chainId: 42161 // Arbitrum
});

console.log('Quote:', quote);
console.log('MEV Risk Score:', quote.mevRiskScore);
console.log('Estimated Savings:', quote.estimatedSavings);

// Execute the swap
const tx = await sdk.executePrivacySwap(quote);
console.log('Transaction:', tx.hash);
```

### Python

```python
from decaflow import DecaFlowClient

client = DecaFlowClient(api_key="your_api_key_here")

# Get a privacy swap quote
quote = client.get_privacy_swap_quote(
    token_in="0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    token_out="0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    amount="1000000000000000000",
    chain_id=42161
)

print(f"Quote: {quote}")
print(f"MEV Risk Score: {quote.mev_risk_score}")
print(f"Estimated Savings: {quote.estimated_savings}")

# Execute the swap
tx = client.execute_privacy_swap(quote)
print(f"Transaction: {tx.hash}")
```

## 4. Check Results

View your transaction on the MEV Dashboard:
https://decaflow.xyz/mev-dashboard?tx={tx_hash}

## Next Steps

- [Authentication](./authentication.md)
- [SDK Documentation](../sdk/typescript/overview.md)
- [API Reference](../api/overview.md)
- [Examples](../examples/basic-swap.md)
```

---

### authentication.md

```markdown
# Authentication

## API Keys

All DecaFlow API requests require an API key.

### Get Your API Key

1. Sign up at [decaflow.xyz/dashboard](https://decaflow.xyz/dashboard)
2. Navigate to Settings → API Keys
3. Click "Generate New Key"
4. Copy and store securely

### Using API Keys

#### HTTP Headers

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.decaflow.xyz/v1/mev/overview
```

#### SDK Configuration

**TypeScript**:
```typescript
const sdk = new DecaFlowSDK({ 
  apiKey: process.env.DECAFLOW_API_KEY 
});
```

**Python**:
```python
client = DecaFlowClient(
    api_key=os.environ.get('DECAFLOW_API_KEY')
)
```

## Security Best Practices

✅ **DO**:
- Store API keys in environment variables
- Use different keys for dev/staging/production
- Rotate keys regularly (every 90 days)
- Revoke compromised keys immediately

❌ **DON'T**:
- Commit keys to version control
- Share keys across teams
- Use production keys in client-side code
- Expose keys in logs

## Rate Limiting

See [Rate Limiting Guide](./rate-limiting.md) for details.
```

---

### rate-limiting.md

```markdown
# Rate Limiting

DecaFlow implements rate limiting to ensure fair usage.

## Rate Limits by Tier

| Tier | Requests/Day | Requests/Second | WebSockets |
|------|-------------|-----------------|------------|
| Free | 1,000 | 2 | ❌ |
| Pro | 100,000 | 20 | ✅ |
| Enterprise | Unlimited | Unlimited | ✅ |
| Custom | Custom | Custom | ✅ |

## Rate Limit Headers

Every API response includes rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1673452800
```

## Handling Rate Limits

### Error Response

When rate limited, you'll receive:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Limit: 1000 req/day",
  "retryAfter": 3600
}
```

HTTP Status: `429 Too Many Requests`

### Retry Logic

**TypeScript**:
```typescript
async function requestWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const retryAfter = error.retryAfter || 60;
        await sleep(retryAfter * 1000);
        continue;
      }
      throw error;
    }
  }
}
```

## Increase Your Limits

Need higher limits?

- **Pro Tier**: $99/mo → [Upgrade](https://decaflow.xyz/pricing)
- **Enterprise**: $499/mo → [Contact Sales](https://calendly.com/decaflow/enterprise)
- **Custom**: [Contact Us](https://decaflow.xyz/contact)
```

---

## 🔧 SDK DOCUMENTATION

### /sdk/typescript/overview.md

```markdown
# TypeScript SDK Overview

## Installation

```bash
npm install @decaflow/privacy-sdk
# or
yarn add @decaflow/privacy-sdk
```

## Basic Usage

```typescript
import { DecaFlowSDK } from '@decaflow/privacy-sdk';

const sdk = new DecaFlowSDK({
  apiKey: 'your_api_key',
  chainId: 42161 // Arbitrum
});
```

## Features

- ✅ Privacy swaps
- ✅ Batch transactions
- ✅ MEV risk analysis
- ✅ Real-time quotes
- ✅ Transaction tracking
- ✅ Custom routing

## API Reference

### Constructor

```typescript
new DecaFlowSDK(config: DecaFlowConfig)
```

**Parameters**:
- `config.apiKey` (string, required): Your API key
- `config.chainId` (number, optional): Default chain ID (default: 42161)
- `config.riskThreshold` (string, optional): 'low' | 'medium' | 'high' (default: 'medium')
- `config.timeout` (number, optional): Request timeout in ms (default: 30000)

### Methods

#### getPrivacySwapQuote()

Get a quote for a privacy swap.

```typescript
await sdk.getPrivacySwapQuote(params: SwapQuoteParams): Promise<SwapQuote>
```

**Parameters**:
```typescript
interface SwapQuoteParams {
  tokenIn: string;        // Token address to swap from
  tokenOut: string;       // Token address to swap to
  amount: string;         // Amount in wei
  slippageBps?: number;   // Slippage in basis points (default: 50)
  chainId?: number;       // Chain ID (optional)
  recipient?: string;     // Recipient address (optional)
}
```

**Returns**:
```typescript
interface SwapQuote {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  mevRiskScore: number;      // 0-100
  estimatedSavings: string;  // USD
  route: Route[];
  expiresAt: number;
}
```

**Example**:
```typescript
const quote = await sdk.getPrivacySwapQuote({
  tokenIn: WETH_ADDRESS,
  tokenOut: USDC_ADDRESS,
  amount: '1000000000000000000',
  slippageBps: 50
});

console.log(`MEV Risk: ${quote.mevRiskScore}/100`);
console.log(`Estimated Savings: $${quote.estimatedSavings}`);
```

#### executePrivacySwap()

Execute a privacy swap.

```typescript
await sdk.executePrivacySwap(quote: SwapQuote): Promise<Transaction>
```

**Parameters**:
- `quote` (SwapQuote): Quote from `getPrivacySwapQuote()`

**Returns**:
```typescript
interface Transaction {
  hash: string;
  chainId: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}
```

**Example**:
```typescript
const quote = await sdk.getPrivacySwapQuote({ ... });
const tx = await sdk.executePrivacySwap(quote);

console.log(`Transaction: ${tx.hash}`);
```

[See full API reference →](./api-reference.md)
```

---

## 🌐 API REFERENCE

### /api/endpoints/mev-overview.md

```markdown
# GET /api/v1/mev/overview

Get MEV overview statistics.

## Endpoint

```
GET https://api.decaflow.xyz/v1/mev/overview
```

## Authentication

Required. See [Authentication Guide](../../getting-started/authentication.md).

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chainId` | number | No | Filter by chain ID (default: all chains) |
| `timeRange` | string | No | Time range: '24h', '7d', '30d' (default: '30d') |

## Response

```json
{
  "totalMevUsd": 6240000,
  "affectedTxs": 188000,
  "avgVictimLoss": 33.19,
  "chains": {
    "arbitrum": {
      "chainId": 42161,
      "mevUsd": 6240000,
      "txCount": 188000
    }
  },
  "topVictims": [
    {
      "protocol": "UniswapV3",
      "mevUsd": 2100000,
      "txCount": 65000
    }
  ],
  "updatedAt": "2026-01-10T12:00:00Z"
}
```

## Example Request

**cURL**:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.decaflow.xyz/v1/mev/overview?chainId=42161&timeRange=30d"
```

**TypeScript**:
```typescript
const response = await fetch(
  'https://api.decaflow.xyz/v1/mev/overview?chainId=42161',
  {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  }
);
const data = await response.json();
```

**Python**:
```python
import requests

response = requests.get(
    'https://api.decaflow.xyz/v1/mev/overview',
    headers={'Authorization': f'Bearer {API_KEY}'},
    params={'chainId': 42161, 'timeRange': '30d'}
)
data = response.json()
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": "unauthorized",
  "message": "Invalid API key"
}
```

### 429 Too Many Requests

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded",
  "retryAfter": 3600
}
```

## Rate Limits

- Free: 1,000 requests/day
- Pro: 100,000 requests/day
- Enterprise: Unlimited

[View all rate limits →](../../getting-started/rate-limiting.md)
```

---

## 📚 GUIDES

### /guides/protocol-integration.md

```markdown
# Protocol Integration Guide

Complete guide for integrating DecaFlow into your DeFi protocol.

## Overview

This guide covers:
1. Integration options
2. Implementation steps
3. Testing
4. Deployment
5. Monitoring

## Integration Options

### Option 1: SDK Integration (Recommended)

**Best for**: Most protocols

**Pros**:
- Fastest integration (< 5 minutes)
- Auto-updates
- Managed infrastructure
- Zero maintenance

**Cons**:
- Requires trust in DecaFlow infrastructure

### Option 2: Smart Contract Integration

**Best for**: Protocols requiring on-chain verification

**Pros**:
- Fully on-chain
- No external dependencies
- Maximum security

**Cons**:
- More complex integration
- Gas overhead
- Manual updates

### Option 3: Hybrid Approach

**Best for**: Large protocols with custom needs

**Pros**:
- Best of both worlds
- Flexible configuration
- Custom optimizations

**Cons**:
- Most complex setup

## Implementation: SDK Integration

### Step 1: Install SDK

```bash
npm install @decaflow/privacy-sdk
```

### Step 2: Initialize SDK

```typescript
import { DecaFlowSDK } from '@decaflow/privacy-sdk';

const sdk = new DecaFlowSDK({
  apiKey: process.env.DECAFLOW_API_KEY,
  chainId: 42161
});
```

### Step 3: Replace Swap Logic

**Before**:
```typescript
async function swap(tokenIn, tokenOut, amount) {
  const route = await router.getRoute(tokenIn, tokenOut, amount);
  return await router.swap(route);
}
```

**After**:
```typescript
async function swap(tokenIn, tokenOut, amount) {
  const quote = await sdk.getPrivacySwapQuote({
    tokenIn,
    tokenOut,
    amount
  });
  return await sdk.executePrivacySwap(quote);
}
```

### Step 4: Update UI

Show MEV savings to users:

```typescript
const quote = await sdk.getPrivacySwapQuote({ ... });

// Display to user
console.log(`MEV Risk: ${quote.mevRiskScore}/100`);
console.log(`Estimated Savings: $${quote.estimatedSavings}`);
```

### Step 5: Test

Run integration tests:

```bash
npm run test:integration
```

### Step 6: Deploy

Deploy to testnet first:

```bash
npm run deploy:testnet
```

Test thoroughly, then deploy to mainnet:

```bash
npm run deploy:mainnet
```

[Full implementation example →](../examples/uniswap-v3-integration.md)

## Monitoring

Track MEV protection impact:

```typescript
const stats = await sdk.getProtectionStats({
  protocol: 'your-protocol',
  timeRange: '30d'
});

console.log(`Total MEV Saved: $${stats.totalSaved}`);
console.log(`Transactions Protected: ${stats.txCount}`);
```

## Support

Need help?
- **Discord**: [#integrations](https://discord.gg/decaflow)
- **Email**: integrations@decaflow.xyz
- **Schedule Call**: [Book 30-min call](https://calendly.com/decaflow/integration)
```

---

## 🎯 EXAMPLES

### /examples/basic-swap.md

```markdown
# Example: Basic Privacy Swap

Complete example of a basic privacy swap.

## Code

```typescript
import { DecaFlowSDK } from '@decaflow/privacy-sdk';

async function main() {
  // Initialize SDK
  const sdk = new DecaFlowSDK({
    apiKey: process.env.DECAFLOW_API_KEY,
    chainId: 42161 // Arbitrum
  });

  // Token addresses
  const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
  const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

  // Get quote
  const quote = await sdk.getPrivacySwapQuote({
    tokenIn: WETH,
    tokenOut: USDC,
    amount: '1000000000000000000', // 1 WETH
    slippageBps: 50 // 0.5%
  });

  // Display quote info
  console.log('Quote Details:');
  console.log(`  Amount In: ${quote.amountIn}`);
  console.log(`  Amount Out: ${quote.amountOut}`);
  console.log(`  MEV Risk Score: ${quote.mevRiskScore}/100`);
  console.log(`  Estimated MEV Savings: $${quote.estimatedSavings}`);

  // Execute swap
  const tx = await sdk.executePrivacySwap(quote);
  
  console.log(`Transaction submitted: ${tx.hash}`);
  console.log(`View on Explorer: https://arbiscan.io/tx/${tx.hash}`);

  // Wait for confirmation
  await tx.wait();
  console.log('Transaction confirmed!');
}

main().catch(console.error);
```

## Running the Example

1. Install dependencies:
```bash
npm install @decaflow/privacy-sdk
```

2. Set API key:
```bash
export DECAFLOW_API_KEY="your_api_key_here"
```

3. Run:
```bash
node basic-swap.js
```

## Expected Output

```
Quote Details:
  Amount In: 1000000000000000000
  Amount Out: 2850340000
  MEV Risk Score: 45/100
  Estimated MEV Savings: $12.34
Transaction submitted: 0x...
View on Explorer: https://arbiscan.io/tx/0x...
Transaction confirmed!
```

## Next Steps

- [Batch Swaps](./batch-swaps.md)
- [Custom Risk Thresholds](./risk-analysis.md)
- [Advanced Routing](./custom-routing.md)
```

---

## 📊 Documentation Best Practices

### Style Guide

1. **Use clear headings**: H1 for page title, H2 for sections, H3 for subsections
2. **Code examples**: Always include working code examples
3. **Error handling**: Show error cases, not just happy path
4. **Links**: Cross-link related documentation
5. **Versioning**: Indicate which SDK version examples use
6. **Diagrams**: Use Mermaid for architecture diagrams

### Example Template

```markdown
# [Feature Name]

[One-sentence description]

## Overview

[What this feature does and why it matters]

## Prerequisites

- [Requirement 1]
- [Requirement 2]

## Quick Start

```[language]
[Minimal working example]
```

## Detailed Usage

### [Sub-feature 1]

[Explanation + code example]

### [Sub-feature 2]

[Explanation + code example]

## Advanced Options

[Optional/advanced configurations]

## Error Handling

[Common errors and solutions]

## Best Practices

- ✅ [Do this]
- ❌ [Don't do this]

## Examples

- [Link to example 1]
- [Link to example 2]

## Related Documentation

- [Related doc 1]
- [Related doc 2]

## Support

[How to get help]
```

---

## 🚀 Next Steps

This outline should be turned into full documentation at:

**docs.decaflow.xyz**

Using tools like:
- **Docusaurus**: https://docusaurus.io/
- **GitBook**: https://www.gitbook.com/
- **ReadTheDocs**: https://readthedocs.org/
- **Mintlify**: https://mintlify.com/

---

**Need help building docs?** Contact: developers@decaflow.xyz
