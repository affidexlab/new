# DecaFlow Institutional — RWA Contract Scaffold

**Status: unaudited reference implementation. Do not deploy for real securities.**

This folder implements the roadmap's Phase 1–3 architecture (Identity Registry →
Compliance Rules → Token with enforcement hooks) as working, compiling Solidity —
verified with `solc 0.8.20` against `@openzeppelin/contracts@5.4.0`, the same
versions already used elsewhere in this repo's `contracts/` folder.

## Guardian Enterprises audit (31 Jul 2026) — response

Guardian's report flagged 1 Critical, 3 High, 4 Medium, 2 Low, and 1 Informational
finding across these contracts and the backend routes in `backend/src/routes/v1/`.
All 11 have been addressed as of this commit — see each file's NatSpec for the
specific fix and reasoning next to the code it changed. Two are worth flagging here:

- The **Critical** finding (owner-key compromise defeating `forcedTransfer` via the
  circular trust with `IdentityRegistry`) is answered with a new, separate
  `emergencyCouncil` role and `emergencyForcedTransfer` path in `RWAToken.sol` that
  doesn't depend on compliance/identity state at all, and can only pay out to a
  pre-approved escrow the council itself controls. This was exercised end-to-end
  against a local test chain (deploy, simulate the exact owner-compromise attack
  chain from the report, confirm the new path still protects funds) — not just
  written and compiled.
- The **High** "Race Condition in Holder Count Tracking" finding is answered
  differently than literally suggested. On every chain this project targets,
  transactions execute sequentially per block — the cross-transaction race the
  report describes isn't reachable the way it would be in a multi-threaded system.
  `ComplianceRules.recordHolderChange` now enforces `maxHolders` as a hard
  invariant at the point state actually changes regardless, which is a real
  hardening against a different, genuinely reachable failure mode (anything ever
  calling it without going through `canTransfer` first) — see its NatSpec.

A re-review pass, as Guardian's own report recommends, is still the right move
before this touches production — this pass hardens the trust boundaries the audit
found, it doesn't re-run the audit itself.

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
  eligibility flag, enforced holder-count cap (now also hard-enforced at the
  point `currentHolders` actually changes, not just in `canTransfer` — see the
  audit response above), optional risk-score gating, and now an optional
  accreditation requirement (`requireAccreditation`) — the `accreditedInvestor`
  field existed from the start but was never actually enforced anywhere until
  this pass.
- **`RWAToken.sol`** — an ERC-20 that routes every mint/transfer/burn through
  `ComplianceRules.canTransfer`, plus `forcedTransfer` (the roadmap's
  "Global Kill-Switch"), `emergencyForcedTransfer` (the audit-response break-glass
  path — see above), and pause/unpause. Re-review hardening now disables live
  `ComplianceRules` replacement because holder-count state cannot be safely reset
  or migrated without a separately audited migration design. Hardened with
  `ReentrancyGuard`, an explicit self-transfer short-circuit, and a guard against
  sending tokens to the token contract's own address.
- **`RiskOracle.sol`** — a trusted-updater oracle for Verify API risk scores, now
  with an owner-tunable circuit breaker that auto-pauses updates if a single
  updater key pushes an unusually large burst of score changes (Guardian audit
  MEDIUM response). Explicitly NOT Chainlink — see the file's own NatSpec for
  what a real Chainlink Functions upgrade would require.
- **`ZKIdentityGate.sol`** — real integration with the Semaphore protocol
  (semaphore-protocol's audited, published contracts — not custom cryptography
  written for this project) for anonymous group-membership proofs. Now binds
  each proof to the wallet that submits it (Guardian audit HIGH response), so a
  valid proof can't be resubmitted by a different caller than the one it was
  generated for, and records a queryable verification status per wallet. Still
  deliberately NOT merged into `IdentityRegistry`/`ComplianceRules` — see below.

## What's deliberately not here yet

- UUPS upgradeability, Merkle-tree/bitmap gas optimization (Phase 5 concerns)
- Issuer portal is built (`/institutional/portal` in the app) but has not been
  full type-checked the way the contracts have been compile-checked
- Oracle integration is the trusted-updater version, not real Chainlink
- ZK-KYC gate now binds proofs to the submitting wallet and records verification
  status (see audit response above), but still isn't wired into the existing
  wallet-keyed `IdentityRegistry`/`ComplianceRules` flow — that binding is a
  protocol design decision, not a coding task, see `ZKIdentityGate.sol`'s NatSpec
- **Automated tests now exist**: `test/rwa-institutional/` (run `npm test` from
  `contracts/`), covering IdentityRegistry, ComplianceRules, RWAToken (including
  the Critical-finding attack/fix scenario end to end), RiskOracle, and
  ZKIdentityGate's access control + new proof-binding check. Not covered: an
  actually-valid Semaphore proof verifying successfully — that needs the
  off-chain proof-generation toolchain (`@semaphore-protocol/identity`/`proof` +
  snarkjs), noted as a scoped gap in the test file itself rather than silently
  skipped.

## Before this touches a real offering

1. A professional smart contract security audit — not a substitute for one,
   a prerequisite to using this for anything with real money in it. (Guardian's
   31 Jul 2026 report was a first pass; its own conclusion recommends a
   re-review once these findings are addressed — see above.)
2. Securities counsel review, per jurisdiction you intend to offer in.
3. A real, licensed KYC/accreditation verification integration behind
   `IdentityRegistry.setIdentity` — right now nothing stops a compromised
   or misconfigured verifier key from marking anyone "accredited."
4. A decision on multi-sig tooling (Safe or similar) for `owner` AND for the
   new `emergencyCouncil` role — the Critical-finding fix above only holds if
   these are genuinely separate, well-protected multisigs, not two EOAs (or two
   Safes with the same effective signers) controlled by the same person. See
   `MULTISIG_SETUP.md` in this folder for the concrete checklist — this is a
   real-world custody decision, not something addressable in code.
5. `ZKIdentityGate` proofs are now bound to the submitting wallet, but whether
   (and how) to merge anonymous ZK verification into the wallet-keyed compliance
   flow is still an open product decision — see the file's NatSpec.

Treat this as the thing your engineering team scopes real work from, not
something to point a fund manager at today.
