# DecaFlow React Hooks

Production-ready React hooks for MEV protection and privacy swaps.

## Installation

```bash
npm install @decaflow/react-hooks @tanstack/react-query wagmi viem
# or
yarn add @decaflow/react-hooks @tanstack/react-query wagmi viem
```

## Quick Start

### 1. Setup Provider

```tsx
import { DecaFlowProvider } from '@decaflow/react-hooks';
import { WagmiProvider } from 'wagmi';

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <DecaFlowProvider
        config={{
          apiKey: 'your-api-key', // optional
          chain: 'arbitrum',
        }}
      >
        <YourApp />
      </DecaFlowProvider>
    </WagmiProvider>
  );
}
```

### 2. Use Hooks

```tsx
import { useSwapQuote, usePrivacySwap, useMEVRisk } from '@decaflow/react-hooks';

function SwapComponent() {
  const { data: quote, isLoading } = useSwapQuote({
    fromToken: '0x...',
    toToken: '0x...',
    amount: '1000000000000000000',
    fromAddress: address,
  });
  
  const { executeSwap, isExecuting } = usePrivacySwap();
  
  const handleSwap = async () => {
    const txHash = await executeSwap({ quote });
    console.log('Swap executed:', txHash);
  };
  
  return (
    <div>
      {quote && (
        <>
          <p>Output: {quote.toAmount}</p>
          <p>MEV Saved: ${quote.estimatedMevSaved}</p>
          <button onClick={handleSwap} disabled={isExecuting}>
            {isExecuting ? 'Swapping...' : 'Execute Swap'}
          </button>
        </>
      )}
    </div>
  );
}
```

## Available Hooks

### useSwapQuote
Get swap quotes with MEV protection.

```tsx
const { data, isLoading, error } = useSwapQuote(params, options);
```

**Params:**
- `fromToken`: Source token address
- `toToken`: Destination token address  
- `amount`: Swap amount (in token decimals)
- `fromAddress`: User's wallet address
- `chain?`: Blockchain network (default: 'arbitrum')
- `slippageBps?`: Slippage tolerance (default: 50)
- `usePrivacy?`: Enable MEV protection (default: true)

**Returns:**
- `data`: SwapQuote object with pricing and MEV analysis
- `isLoading`: Loading state
- `error`: Error if request failed

### usePrivacySwap
Execute MEV-protected swaps.

```tsx
const { executeSwap, isExecuting, error, reset } = usePrivacySwap();

const txHash = await executeSwap({
  quote,
  onSuccess: (hash) => console.log('Success!', hash),
  onError: (err) => console.error('Error:', err),
});
```

### useMEVRisk
Get real-time MEV risk assessment.

```tsx
const { data: risk } = useMEVRisk({
  fromToken: '0x...',
  toToken: '0x...',
  amount: '1000000000000000000',
});

// risk.riskScore: 0-10
// risk.riskLevel: 'low' | 'medium' | 'high' | 'critical'
// risk.estimatedMev: USD value
```

### useProtectionStats
Get user's MEV protection statistics.

```tsx
const { data: stats } = useProtectionStats();

// stats.totalSwaps: number
// stats.totalMevSaved: USD saved
// stats.protectionRate: percentage
// stats.rank: global ranking
```

### useSwapHistory
Get user's swap history with pagination.

```tsx
const { data: history } = useSwapHistory({ limit: 10, offset: 0 });

// history: array of SwapHistoryItem
```

### useTransactionStatus
Track transaction status in real-time.

```tsx
const { data: status } = useTransactionStatus(txHash, {
  refetchInterval: 3000, // Poll every 3 seconds
});

// status.status: 'pending' | 'confirmed' | 'failed'
// status.mevSaved: USD saved (when confirmed)
```

### useMEVDashboard
Get MEV analytics dashboard data.

```tsx
const { data: dashboard } = useMEVDashboard('arbitrum');

// dashboard.totalMEVExtracted
// dashboard.transactionsAffected
// dashboard.timeline: array of daily data
```

### useMEVStream
Real-time MEV risk updates via WebSocket.

```tsx
const { riskScore, isConnected } = useMEVStream({
  fromToken: '0x...',
  toToken: '0x...',
  enabled: true,
});

// riskScore: real-time MEV risk (updated every second)
```

### useDebounceSwapQuote
Debounced quotes for input fields (prevents excessive API calls).

```tsx
const { data: quote } = useDebounceSwapQuote(params, 500); // 500ms delay
```

### useBridgeQuote
Get cross-chain bridge quotes.

```tsx
const { data: quote } = useBridgeQuote({
  fromChain: 'ethereum',
  toChain: 'arbitrum',
  token: '0x...',
  amount: '1000000000000000000',
  recipient: address,
});
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  SwapParams,
  SwapQuote,
  MEVRiskScore,
  TransactionStatus,
  ProtectionStats,
} from '@decaflow/react-hooks';
```

## Error Handling

```tsx
import { DecaFlowError, NetworkError, QuoteExpiredError } from '@decaflow/react-hooks';

try {
  await executeSwap({ quote });
} catch (error) {
  if (error instanceof QuoteExpiredError) {
    console.log('Quote expired, fetch new quote');
  } else if (error instanceof NetworkError) {
    console.log('Network error, retry later');
  }
}
```

## Advanced Usage

### Custom Configuration

```tsx
<DecaFlowProvider
  config={{
    apiKey: process.env.DECAFLOW_API_KEY,
    baseUrl: 'https://api.decaflow.xyz',
    chain: 'arbitrum',
  }}
>
  <App />
</DecaFlowProvider>
```

### Batch Operations

```tsx
import { useSwapQuote } from '@decaflow/react-hooks';

function BatchSwap() {
  const swaps = [
    { fromToken: '0x...', toToken: '0x...', amount: '1000' },
    { fromToken: '0x...', toToken: '0x...', amount: '2000' },
  ];
  
  const quotes = swaps.map(params => useSwapQuote(params));
  
  // Execute all swaps
  const handleBatchSwap = async () => {
    for (const { data: quote } of quotes) {
      if (quote) await executeSwap({ quote });
    }
  };
}
```

## Examples

See [examples/](./examples) for complete integration examples:
- Basic swap integration
- Advanced analytics dashboard
- Multi-chain bridge
- Batch swap execution

## Support

- [Documentation](https://docs.decaflow.xyz)
- [Discord](https://discord.gg/decaflow)
- [Twitter](https://twitter.com/DecaFlowProtocol)

## License

MIT
