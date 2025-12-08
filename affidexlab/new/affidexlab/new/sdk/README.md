# @decaflow/partner-sdk

Official SDK for integrating DecaFlow DeFi services into your application.

## Installation

```bash
npm install @decaflow/partner-sdk
# or
yarn add @decaflow/partner-sdk
```

## Quick Start

```tsx
import { DecaFlowProvider, useSwapQuote, SwapWidget } from '@decaflow/partner-sdk';

function App() {
  return (
    <DecaFlowProvider
      config={{
        partnerId: 'pk_prod_your_partner_id',
        environment: 'production'
      }}
    >
      <YourApp />
    </DecaFlowProvider>
  );
}

function YourApp() {
  const { quote, loading } = useSwapQuote({
    fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    toToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: '1000000',
    chainId: 1
  });

  return <div>{quote && <div>Quote: {quote.toAmount}</div>}</div>;
}
```

## Pre-built Components

### Swap Widget

```tsx
import { SwapWidget } from '@decaflow/partner-sdk';

<SwapWidget
  chainId={1}
  onSwap={(quote) => console.log('Swap:', quote)}
  theme="dark"
/>
```

### Bridge Widget

```tsx
import { BridgeWidget } from '@decaflow/partner-sdk';

<BridgeWidget
  onBridge={(quote) => console.log('Bridge:', quote)}
  theme="dark"
/>
```

## Available Hooks

- `useSwapQuote(params)` - Get swap quotes
- `useBridgeQuote(params)` - Get bridge quotes
- `useLiquidityPools(chainId)` - Fetch liquidity pools
- `usePartnerStats()` - Get partner statistics

## Documentation

Full documentation: https://docs.decaflow.xyz/sdk

## License

MIT
