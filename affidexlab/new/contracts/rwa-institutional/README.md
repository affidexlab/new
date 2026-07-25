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
- Holder-count enforcement (the variable exists, the check doesn't yet)
- UUPS upgradeability, Merkle-tree/bitmap gas optimization (Phase 5 concerns)
- Issuer portal, oracle integration, the SDK (Phases 4–5)
- Multi-sig on the owner role — every contract here uses a single-owner
  `Ownable` pattern for clarity. **Production must replace this with a real
  multi-sig**, especially for `forcedTransfer`, which otherwise gives one
  private key the power to move any holder's tokens.

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
