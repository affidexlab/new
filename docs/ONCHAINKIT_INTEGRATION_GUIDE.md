# OnchainKit Integration & Application Guide

This guide summarizes the steps required to integrate Coinbase's OnchainKit into DecaFlow properties and request access to the relevant developer resources.

## 1. Prerequisites

1. **Coinbase Developer Platform (CDP) account**  
   * Sign in at <https://developers.coinbase.com>.  
   * Enable 2FA on the associated Coinbase account.
2. **Coinbase Wallet-as-a-Service (WaaS) project** – used for WalletConnect/Smart Wallet flows.
3. **Base project alignment** – OnchainKit targets Base-first applications. Make sure DecaFlow messaging and assets highlight Base support.
4. **Public repository & docs** – Coinbase reviewers expect documentation (docs.decaflow.xyz) and live product screenshots.

## 2. Apply for OnchainKit Access

1. Navigate to the official docs: <https://docs.base.org/onchainkit/getting-started>
2. Click **“Request developer access”** (CTA at top of page).  
   * Provide:
     * Project name: `DecaFlow`
     * URL: `https://decaflow.xyz`
     * GitHub repo: `https://github.com/affidexlab/new`
     * Description: Base-native multi-chain DEX with points, leaderboard, privacy swaps.  
     * Contact email: `team@decaflow.tech`
     * Daily active users + roadmap (highlight Pioneer 100, African market focus, privacy features).
3. In the same form, request access to **Coinbase Developer Platform (CDP) API** and **Smart Wallet**. Mention that OnchainKit components (FundCard, Earn, Swap, etc.) will be embedded inside DecaFlow’s web app.
4. Submit. You’ll get an auto-response. Approval usually takes 1–3 business days; follow up via Base Discord’s `#onchainkit` channel if no response in 5 days.

## 3. Configure OnchainKit Once Approved

1. **Create CDP project**: <https://portal.cdp.coinbase.com> → “Create Project”.
2. **Generate API key** (restricted scope): `CDP_API_KEY`
3. **Create WalletConnect project**: <https://cloud.walletconnect.com> (needed for Smart Wallet / Wallet Connector components). Save `WALLETCONNECT_PROJECT_ID`.
4. **Environment variables** (for Next.js/Vite app):
   ```bash
   CDP_API_KEY=...
   WALLETCONNECT_PROJECT_ID=...
   NEXT_PUBLIC_ONCHAINKIT_API_URL=https://api.developer.coinbase.com/onchain/v1
   ```
5. **Install OnchainKit packages** (example for Next.js):
   ```bash
   npm install @coinbase/onchainkit wagmi viem
   ```
6. **Wrap app with `OnchainKitProvider`** (per <https://docs.base.org/onchainkit/getting-started>):
   ```tsx
   import { OnchainKitProvider } from '@coinbase/onchainkit';
   
   <OnchainKitProvider apiKey={process.env.CDP_API_KEY}>
     {children}
   </OnchainKitProvider>
   ```
7. **Select components** relevant to DecaFlow:
   * `<Swap />` – embed Coinbase’s swap UX in onboarding flows.
   * `<FundCard />` – fiat onramp for African users (Apple Pay / cards).
   * `<Earn />` – optional integration with partner yield routes.

## 4. Compliance & Review Checklist

Before submitting integration screenshots to Coinbase:

- [ ] docs.decaflow.xyz live with OnchainKit section.  
- [ ] /quests page published (guides users through OnchainKit onboarding).  
- [ ] Screenshots showing Base branding + wallet connection.  
- [ ] Privacy policy & terms updated (OnchainKit requires).  
- [ ] KYC/AML statement (if processing fiat onramps via FundCard).  
- [ ] Contact channel ready (Discord/Telegram) for Coinbase team.

## 5. Support Channels

* **Base Discord** (#onchainkit) – fastest for integration help.  
* **Coinbase Developer Support** – submit ticket via CDP portal.  
* **GitHub** – <https://github.com/coinbase/onchainkit> for issues/feature requests.

Document status: December 23, 2025.
