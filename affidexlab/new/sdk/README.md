# @decaflow/partner-sdk

Official DecaFlow Partner SDK for integrating swaps, liquidity pools, and cross-chain bridges into your application.

## Installation

```bash
npm install @decaflow/partner-sdk
```

## Quick Start

### 1. Wrap your app with DecaFlowProvider

```tsx
import { DecaFlowProvider } from '@decaflow/partner-sdk';

function App() {
  return (
    <DecaFlowProvider
      config={{
        partnerId: 'your_partner_id_here',
        environment: 'production' // or 'sandbox'
      }}
    >
      <YourApp />
    </DecaFlowProvider>
  );
}
```

### 2. Use hooks in your components

#### Swap

```tsx
import { useSwapQuote, useSwapExecute } from '@decaflow/partner-sdk';

function SwapComponent() {
  const { getQuote, loading, data } = useSwapQuote();
  const { execute } = useSwapExecute();

  const handleSwap = async () => {
    const quote = await getQuote({
      fromToken: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      toToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '1000000',
      chainId: 1,
      slippage: 0.5,
      walletAddress: userAddress
    });

    if (quote) {
      const tx = await execute({
        quoteId: quote.data.quoteId,
        walletAddress: userAddress
      });
      // Send transaction using your wallet provider
    }
  };

  return <button onClick={handleSwap}>Get Quote</button>;
}
```

#### Bridge

```tsx
import { useBridgeQuote, useBridgeExecute, useBridgeStatus } from '@decaflow/partner-sdk';

function BridgeComponent() {
  const { getQuote } = useBridgeQuote();
  const { execute } = useBridgeExecute();
  const { getStatus } = useBridgeStatus();

  const handleBridge = async () => {
    const quote = await getQuote({
      fromChainId: 1,
      toChainId: 42161,
      fromToken: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      toToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      amount: '1000000',
      walletAddress: userAddress
    });

    const result = await execute({
      quoteId: quote.data.quoteId,
      walletAddress: userAddress
    });

    // Poll for status
    const status = await getStatus(result.data.trackingId);
  };

  return <button onClick={handleBridge}>Bridge</button>;
}
```

#### Liquidity

```tsx
import { useLiquidityPools, useAddLiquidity, useUserPositions } from '@decaflow/partner-sdk';

function LiquidityComponent() {
  const { pools, loading } = useLiquidityPools(8453); // Base chain
  const { addLiquidity } = useAddLiquidity();
  const { positions } = useUserPositions(userAddress, 8453);

  const handleAddLiquidity = async (pool) => {
    const result = await addLiquidity({
      poolId: pool.id,
      token0Amount: '1000000',
      token1Amount: '500000000000000000',
      chainId: 8453,
      walletAddress: userAddress
    });
    // Send transaction
  };

  return (
    <div>
      {pools.map(pool => (
        <div key={pool.id}>
          {pool.token0.symbol}/{pool.token1.symbol} - APR: {pool.apr}%
          <button onClick={() => handleAddLiquidity(pool)}>Add Liquidity</button>
        </div>
      ))}
    </div>
  );
}
```

## Pre-built Widgets

```tsx
import { SwapWidget, BridgeWidget, LiquidityWidget } from '@decaflow/partner-sdk';

function App() {
  return (
    <DecaFlowProvider config={{ partnerId: 'your_id' }}>
      <SwapWidget 
        theme="dark" 
        accentColor="#4F46E5"
        chainId={8453}
      />
      <BridgeWidget 
        fromChainId={1} 
        toChainId={42161}
        theme="dark"
      />
      <LiquidityWidget 
        chainId={8453}
        theme="light"
      />
    </DecaFlowProvider>
  );
}
```

## API Reference

### Hooks

- `useSwapQuote()` - Get swap quotes
- `useSwapExecute()` - Execute swaps
- `useBridgeQuote()` - Get bridge quotes
- `useBridgeExecute()` - Execute bridges
- `useBridgeStatus(trackingId)` - Check bridge status
- `useLiquidityPools(chainId)` - Get available pools
- `useAddLiquidity()` - Add liquidity to pools
- `useRemoveLiquidity()` - Remove liquidity from pools
- `useUserPositions(wallet, chainId)` - Get user's LP positions

### Components

- `<SwapWidget />` - Pre-built swap interface
- `<BridgeWidget />` - Pre-built bridge interface
- `<LiquidityWidget />` - Pre-built liquidity interface

## Configuration

```typescript
interface DecaFlowConfig {
  partnerId: string;              // Required: Your partner API key
  apiBaseUrl?: string;            // Optional: Custom API URL
  environment?: 'production' | 'sandbox'; // Default: 'production'
}
```

## Support

- Documentation: https://docs.decaflow.xyz
- Technical Support: techpartners@decaflow.xyz
- Issues: https://github.com/decaflow/partner-sdk/issues

## License

MIT
