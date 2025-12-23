# Coinbase OnchainKit

This page summarizes the integration + application steps. For full details, see [`docs/ONCHAINKIT_INTEGRATION_GUIDE.md`](../../ONCHAINKIT_INTEGRATION_GUIDE.md).

## Why OnchainKit?
- Coinbase-native components (FundCard, Earn, Swap)
- Gasless Smart Wallet onboarding
- Base-first UX with pre-built React components

## Application Checklist
1. Request developer access via <https://docs.base.org/onchainkit/getting-started> (CTA at top).
2. Provide DecaFlow URLs, GitHub repo, and usage description.
3. Request CDP API + Smart Wallet scopes in the same form.
4. Follow up in Base Discord `#onchainkit` if no response after 5 business days.

## Integration Steps (Once Approved)
1. Create a project in Coinbase Developer Portal (CDP).
2. Generate `CDP_API_KEY` (scoped).
3. Create WalletConnect project → `WALLETCONNECT_PROJECT_ID`.
4. Install package:
   ```bash
   npm install @coinbase/onchainkit wagmi viem
   ```
5. Wrap app with `OnchainKitProvider` and drop in components like `<Swap />`, `<FundCard />`, `<Earn />` inside onboarding flows.
6. Configure Paymaster if sponsoring gas via Smart Wallet.

## Compliance
- Ensure docs.decaflow.xyz lists privacy policy + support channels.
- Capture telemetry opt-in if using Coinbase analytics.
- Prepare screenshots of integration for Coinbase review.
