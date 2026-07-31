# DecaFlow Institutional — RWA Contract Scaffold

**Status: unaudited reference implementation. Do not deploy for real securities.**

This folder implements the roadmap's Phase 1–3 architecture (Identity Registry →
Compliance Rules → Token with enforcement hooks) as working, compiling Solidity —
verified with `solc 0.8.20` against `@openzeppelin/contracts@5.4.0`, the same
versions already used elsewhere in this repo's `contracts/` folder.

## What's actually here

- **`IdentityRegistry.sol`** — records eligibility and accreditation status per
  wallet, plus a hash commitment to the off-chain record behind them. Revised
  after external counsel review: no longer stores a raw country code on-chain
  (GDPR concern — combinable with a public wallet address to re-identify
  someone, and immutability makes erasure impossible). Replaced with
  `jurisdictionEligible`, a single conclusion computed off-chain by whoever
  actually has the full residency/domicile/incorporation/location picture a
  real Reg S determination needs — the chain records the answer, not the
  reasoning or the underlying data.
- **`ComplianceRules.sol`** — the `canTransfer` check from Phase 3, consulted
  before every transfer. Checks identity verification, the jurisdiction
  eligibility flag, enforced holder-count cap, optional risk-score gating, and
  now an optional accreditation requirement (`requireAccreditation`) — the
  `accreditedInvestor` field existed from the start but was never actually
  enforced anywhere until this pass.
- **`RWAToken.sol`** — an ERC-20 that routes every mint/transfer/burn through
  `ComplianceRules.canTransfer`, plus `forcedTransfer` (the roadmap's
  "Global Kill-Switch") and pause/unpause. Hardened with `ReentrancyGuard`,
  an explicit self-transfer short-circuit, and a guard against sending tokens
  to the token contract's own address.
- **`RiskOracle.sol`** — a trusted-updater oracle for Verify API risk scores.
  Explicitly NOT Chainlink — see the file's own NatSpec for what a real
  Chainlink Functions upgrade would require.
- **`ZKIdentityGate.sol`** — real integration with the Semaphore protocol
  (semaphore-protocol's audited, published contracts — not custom cryptography
  written for this project) for anonymous group-membership proofs. Deliberately
  kept separate from `IdentityRegistry` rather than merged, because "anonymous"
  and "checkable per-wallet" are in real tension — see the file's NatSpec for
  the specific design decisions this doesn't make for you.

## What's deliberately not here yet

- UUPS upgradeability, Merkle-tree/bitmap gas optimization (Phase 5 concerns)
- Issuer portal is built (`/institutional/portal` in the app) but has not been
  full type-checked the way the contracts have been compile-checked
- Oracle integration is the trusted-updater version, not real Chainlink
- ZK-KYC gate exists and uses real cryptography, but isn't wired into the
  existing wallet-keyed `IdentityRegistry`/`ComplianceRules` flow — that
  binding is a protocol design decision, not a coding task, see
  `ZKIdentityGate.sol`'s NatSpec

## Before this touches a real offering

1. A professional smart contract security audit — not a substitute for one,
   a prerequisite to using this for anything with real money in it.
2. Securities counsel review, per jurisdiction you intend to offer in.
3. A real, licensed KYC/accreditation verification integration behind
   `IdentityRegistry.setIdentity` — right now nothing stops a compromised
   or misconfigured verifier key from marking anyone "accredited."
4. A decision on multi-sig tooling (Gnosis Safe or similar) for every
   `onlyOwner` function, before this is deployed anywhere holding real assets.
5. A real decision on how (or whether) `ZKIdentityGate` binds proofs to
   specific wallets/transfers before it's connected to anything live.

Treat this as the thing your engineering team scopes real work from, not
something to point a fund manager at today.
