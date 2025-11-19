# DECAFLOW - Cross-Chain Swap Aggregator

A production-ready DeFi protocol on Arbitrum with swap aggregation, cross-chain bridging, and MEV protection.

## Features

- **Swap Aggregator**: Best-price routing via 0x + CoW Protocol
- **Privacy Mode**: MEV-safe submission with Flashbots Protect
- **Cross-Chain Bridge**: CCTP (USDC), CCIP (Chainlink), Socket (fallback)
- **Multi-Chain**: Arbitrum, Base, Optimism, Polygon
- **Wallet Integration**: RainbowKit with multi-wallet support

## Quick Start

### 1. Install Dependencies
```bash
cd app
bun install
```

### 2. Get API Keys

**WalletConnect Project ID** (Required):
- Go to https://cloud.walletconnect.com
- Create a project and copy the Project ID
- Add to `src/wagmi.ts`

**Socket API Key** (Optional for bridge):
- Go to https://socket.tech
- Sign up and generate an API key
- Add to `src/lib/bridge.ts`

### 3. Run Locally
```bash
bun run dev
```

## Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `affidexlab/new` repository
3. Set **Root Directory** to `app`
4. Add environment variables:
   - `VITE_WALLETCONNECT_PROJECT_ID`
   - `VITE_SOCKET_API_KEY` (optional)
5. Deploy

### Option 2: Vercel CLI
```bash
cd app
vercel login
vercel --prod
```

See `app/DEPLOYMENT.md` for detailed instructions.

## Documentation

- **Build Roadmap**: `docs/build-roadmap.md`
- **MVP Plan**: `docs/swap-bridge-mvp-plan.md`
- **Investor One-Pager**: `docs/investor-one-pager-swap.md`
- **Deployment Guide**: `app/DEPLOYMENT.md`

## Architecture

```
app/
├── src/
│   ├── App.tsx (main UI)
│   ├── wagmi.ts (wallet config)
│   ├── components/TokenSelector.tsx
│   ├── pages/
│   │   ├── Swap.tsx (0x + CoW integration)
│   │   ├── Bridge.tsx (CCTP/CCIP/Socket)
│   │   ├── PrivacySwap.tsx
│   │   ├── Pools.tsx
│   │   ├── CreatePool.tsx
│   │   └── Analytics.tsx
│   └── lib/
│       ├── constants.ts (tokens, chains)
│       ├── aggregators.ts (0x + CoW routing)
│       ├── bridge.ts (CCTP/CCIP/Socket)
│       └── privacy.ts (Flashbots + MEV protection)
contracts/
└── MinimalPool.sol (AMM for campaigns)
```

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind V4
- **Wallet**: wagmi + viem + RainbowKit
- **Integrations**: 0x, CoW Protocol, CCTP, CCIP, Socket
- **Chains**: Arbitrum (primary), Base, Optimism, Polygon

## Security

- Non-custodial (users maintain custody at all times)
- Token approvals with allowance checks
- Privacy mode for MEV protection
- Smart contract audits recommended before mainnet pools

## License

MIT
