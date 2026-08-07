# Setting up `owner` and `emergencyCouncil` — a runbook, not a default

This isn't something code can do for you, and it isn't something I did for you —
`owner` and `emergencyCouncil` are still whatever address you pass into the
constructor at deploy time (see `RWAToken.sol`). This document is the checklist for
making that a real, safe decision instead of an afterthought.

## Why this matters more than usual here

The Guardian audit's Critical finding (and this repo's fix for it) only holds if
`owner` and `emergencyCouncil` are **genuinely independent** — different people,
different hardware, different failure domains. If the same person/team controls
both, the separation `RWAToken.sol` implements is theater: whoever compromises that
person has both keys anyway. Re-read `RWAToken.sol`'s NatSpec on `emergencyCouncil`
before doing this — it explains exactly what property you're trying to preserve.

## Setup checklist

1. **Use a real multi-sig, not an EOA, for both roles.** [Safe](https://safe.global)
   (formerly Gnosis Safe) is the standard choice on every chain this project
   targets (Arbitrum, Base, Polygon, Avalanche). Deploy two separate Safes — one
   for `owner`, one for `emergencyCouncil`. Do not reuse signers between them if
   you can avoid it; if you must share some signers, `emergencyCouncil`'s
   threshold and quorum should still require at least one signer who is NOT on
   the `owner` Safe.

2. **Pick thresholds deliberately.**
   - `owner` signs day-to-day operational changes (proposing compliance-rules
     updates, minting, pausing). A 2-of-3 or 3-of-5 is typical.
   - `emergencyCouncil` exists for exactly one purpose — rescuing funds when
     `owner` may be compromised. Consider a HIGHER threshold and slower-moving
     membership than `owner` (e.g. legal/compliance leadership + an outside
     party, not the same engineers who hold `owner` keys). If the same people
     can move fast on both, the "break glass in an emergency" property is weaker
     than it looks.

3. **`emergencyCouncil` is immutable — get it right before deploying.**
   Unlike `owner` (a normal Safe you can change signers on later),
   `emergencyCouncil` in `RWAToken.sol` is set once in the constructor and can
   never be reassigned, by design (see the contract's NatSpec for why). Finalize
   Safe membership and test the Safe itself (a real testnet transaction) *before*
   deploying `RWAToken`. If you get this wrong, the fix is deploying a new token
   contract, not calling a setter.

4. **Set the escrow address deliberately, and know its custody model.**
   `emergencyForcedTransfer` can only ever send funds to `escrowAddress`
   (settable only by `emergencyCouncil`, per the contract). Decide *before* an
   emergency what that address is and who controls it afterward — e.g., another
   Safe, ideally with participation from legal/compliance, since funds landing
   there mid-incident will need a real, auditable process for getting them back
   to legitimate holders.

5. **Rehearse it once, on a testnet, before you need it for real.** Deploy the
   full stack to a testnet, actually call `emergencyForcedTransfer` from the
   `emergencyCouncil` Safe, and confirm every signer knows how to propose/sign a
   Safe transaction under pressure. The worst time to learn Safe's UI is during
   an actual incident.

6. **Document who holds what, off-chain, somewhere durable.** This repo can't
   record who's actually behind each Safe signer — that has to live in your own
   ops documentation (with a succession plan: what happens if a signer leaves the
   company or loses their hardware key).

## What this runbook is not

It's not a substitute for the professional security audit re-review Guardian's
report recommends, and it's not legal advice on custody obligations for a real
securities offering — get counsel involved in the threshold/membership decisions
above, particularly for `emergencyCouncil`, since "who can move investor funds
under what circumstances" is as much a legal question as a technical one.
