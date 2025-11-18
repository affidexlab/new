# Handoff Prompt for New Capy Session

Use this prompt when starting a new Capy session with the affidexlab/new repo:

---

I'm continuing development on my DeFi protocol (cross-chain swap aggregator). 

**Context:**
- Repo: affidexlab/new (main branch)
- Live site: decaflow.vercel.app
- Product: DeFiSwap-style aggregator on Arbitrum with Swap (0x + CoW routing), Bridge (CCTP/CCIP/Socket), and Privacy mode (MEV protection)
- Status: Phase 1-3 complete (wallet integration, swap execution, bridge routing all coded and merged to main)
- Tech stack: React + wagmi + RainbowKit, deployed on Vercel
- Docs: Check docs/ folder for MVP plans, roadmap, and investor one-pager

**What's been completed:**
- Wallet connection with RainbowKit (Arbitrum/Base/Optimism/Polygon)
- Token selector with balances for 10 major tokens
- Live swap quotes from 0x API with real-time pricing
- ERC20 approval flow and swap execution with tx tracking
- CoW Protocol integration for privacy/intents
- Flashbots Protect integration for MEV-safe submission
- Bridge page with CCTP (native USDC), CCIP (Chainlink), Socket (fallback aggregator)
- Smart route selection logic with comparison UI
- Production build deployed to Vercel at decaflow.vercel.app
- Build roadmap (7 phases), MVP plans, and investor materials in docs/

**What I need next:**
[Specify your priority, for example:]
- Polish the UI with a hero landing page like the DeFiSwap reference
- Add analytics indexing to track swap volume, unique wallets, and top pairs
- Add legal compliance layer (ToS, US IP blocking, disclaimers)
- Build Phase 4 (minimal AMM pools for campaigns)
- Create VC pitch deck and outreach email templates
- Add limit orders and DCA features
- [Or tell Capy your specific priority]

Please review the code in the repo (especially app/src/pages/, app/src/lib/, and docs/) and continue from where we left off.

---

**File Locations Reference:**
- Main app: `app/src/App.tsx`
- Swap logic: `app/src/pages/Swap.tsx` + `app/src/lib/aggregators.ts`
- Bridge logic: `app/src/pages/Bridge.tsx` + `app/src/lib/bridge.ts`
- Privacy: `app/src/lib/privacy.ts`
- Token list: `app/src/lib/constants.ts`
- Wallet config: `app/src/wagmi.ts`
- Smart contracts: `contracts/MinimalPool.sol`
- Documentation: `docs/build-roadmap.md`, `docs/investor-one-pager-swap.md`
- Deployment: `app/DEPLOYMENT.md`, `VERCEL_DEPLOY.md`
