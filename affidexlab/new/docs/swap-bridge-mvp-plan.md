# Cross-Chain Swap Aggregator (DECAFLOW) — MVP Plan

Audience: Retail via wallets/exchanges
Scope: Arbitrum first; cross-chain via CCIP + CCTP with Socket fallback; private swap path; include minimal pools
Theme: Dark theme with modern UI

## 1) Product summary
A web app on Arbitrum L2 that provides:
- Swap: Best-price routing through 0x + CoW intents (MEV-safe). Private submission option via Protect/relayer.
- Bridge: Native USDC bridging with CCTP; generalized routes with CCIP; fallback to Socket API for long-tail routes.
- Privacy Swap: Uses CoW intents where supported, and private relayers/Protect RPC for direct AMM routes.
- Pools (minimal): Optional constant-product pools with Create Pool UI for specific pairs to run campaigns.
- Analytics: Basic counters (volume, unique wallets, top pairs).

We don’t bootstrap large liquidity day-one; we aggregate existing DEXs and bridges.

## 2) Architecture (frontend-first)
- UI: React + Vite (TS), Tailwind; pages: Swap, Bridge, Privacy, Pools, Create Pool, Analytics.
- Wallet: wagmi + RainbowKit (viem). Network config for Arbitrum.
- Routing:
  - 0x Swap API (Arbitrum) for price quotes + tx data.
  - CoW intents where supported; fallback to 0x protected submission.
- Privacy submission:
  - Private RPC/relayer abstraction for submission when user toggles Privacy; default to CoW intents when available.
- Bridging:
  - CCTP for USDC (burn/mint). CCIP for generic routes we explicitly support. Socket API (fallback) for any-to-any.
- Minimal Pools:
  - Solidity: Constant product pair + factory + router; guarded fees; capped TVL; events for analytics.
- Analytics: Index public events and 0x/CoW receipts client-side initially; export to a hosted dashboard later.

## 3) Week-by-week (3–4 weeks to public beta)
- Week 1
  - Scaffold app, nav, theme, wallet connect. Implement Swap page with 0x quotes and mock submit; slippage control.
  - Create Bridge page layout and CCIP/CCTP/Socket toggles with dry-run flows.
  - Write minimal pool contracts (Factory, Pair, Router) and Create Pool UI (form only).
- Week 2
  - Wire Cow intents path; add Privacy toggle and submission abstraction (private relay endpoint placeholder).
  - Implement Bridge integrations: CCTP (USDC), CCIP stubs, Socket quotes + deep links.
  - Add Analytics counters (local store + on-chain events hooks).
- Week 3
  - Integrate token lists, approvals/Permit2 stubs, route preview, error states.
  - Polish UI; add fee switch and referral code param.
  - Prepare gated beta on Arbitrum; security checklist and disclaimers (avoid US users).
- Week 4 (optional)
  - Deploy minimal pools with tiny caps; run first “Create Pool” campaign with a partner token.

## 4) Dependencies
- wagmi, viem, @rainbow-me/rainbowkit
- axios, zod
- 0x API, Cow API
- Socket SDK/API; CCIP/CCTP SDKs or simple adapters (where available)

## 5) Compliance & risk posture
- No privacy mixers; only private submission to avoid MEV.
- Disclaimers: not available to US persons; display regional restrictions; no custody.
- Pool caps and conservative parameters; kill-switch in contracts.

## 6) KPIs (first month)
- 5k+ swap intents, $1–5M routed volume, 1–2 exchange/wallet embeds
- Cross-chain USDC flows via CCTP; 1–2 token partner pools created

## 7) Next steps after MVP
- Add limit orders and DCA; batch intents; more chains; referral program; LP vaults for managed ranges.
