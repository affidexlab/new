# DecaFlow Institutional — RWA Contract Scaffold

**Status: unaudited reference implementation. Do not deploy for real securities.**

This folder implements the roadmap's Phase 1–3 architecture (Identity Registry →
Compliance Rules → Token with enforcement hooks) as working, compiling Solidity —
verified with `solc 0.8.20` against `@openzeppelin/contracts@5.4.0`, the same
versions already used elsewhere in this repo's `contracts/` folder.

## What's actually here

- **`IdentityRegistry.sol`** — records KYC status, jurisdiction, and accreditation
  per wallet. Does not perform verification itself — it records the outcome of a
  check that happens off-chain, through a real KYC/accreditation provider you
  integrate separately.
- **`ComplianceRules.sol`** — the `canTransfer` check from Phase 3, consulted
  before every transfer. Ships with exactly two example rules (jurisdiction
  blocklist, a `maxHolders` variable that isn't wired up yet — see the code
  comment). Real compliance logic for a specific offering is not a generic
  problem; it's defined by your securities counsel for that offering.
- **`RWAToken.sol`** — an ERC-20 that routes every mint/transfer/burn through
  `ComplianceRules.canTransfer`, plus `forcedTransfer` (the roadmap's
  "Global Kill-Switch") and pause/unpause.

## What's deliberately not here yet

- ZK-KYC (Phase 2's own "mid-term goal", not immediate)
- UUPS upgradeability, Merkle-tree/bitmap gas optimization (Phase 5 concerns)
- Issuer portal, oracle integration, the SDK (Phases 4–5)

~~Holder-count enforcement~~ — now wired up: `RWAToken` tracks new/emptied holders
per transfer and `ComplianceRules` reverts once `maxHolders` is hit. Re-verified
compiling after this change, not just assumed correct.

**On multi-sig:** this isn't a code gap — `Ownable` doesn't need to change for the
owner to *be* a multi-sig. Deploy with a Gnosis Safe (or similar) address as
`initialOwner` rather than a single EOA, especially before `forcedTransfer` is
ever wired to anything real. Worth stating plainly since it's easy to assume
"multi-sig support" means a code change when it's actually a deployment decision.

## Before this touches a real offering

1. A professional smart contract security audit — not a substitute for one,
   a prerequisite to using this for anything with real money in it.
2. Securities counsel review, per jurisdiction you intend to offer in.
3. A real, licensed KYC/accreditation verification integration behind
   `IdentityRegistry.setIdentity` — right now nothing stops a compromised
   or misconfigured verifier key from marking anyone "accredited."
4. A decision on multi-sig tooling (Gnosis Safe or similar) for every
   `onlyOwner` function, before this is deployed anywhere holding real assets.

Treat this as the thing your engineering team scopes real work from, not
something to point a fund manager at today.
