// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ComplianceRules.sol";

/**
 * ██  UNAUDITED REFERENCE IMPLEMENTATION — DO NOT USE FOR REAL SECURITIES  ██
 * See IdentityRegistry.sol for the full pre-production checklist. It applies here too.
 *
 * Status update (this commit): Guardian Enterprises' 31 Jul 2026 findings have been
 * remediated (see README.md + this file's own NatSpec) -- that is NOT the same as an
 * audit or re-audit. No re-audit has happened, and no multi-sig is actually configured
 * for owner/emergencyCouncil yet. Still not for real securities.
 *
 * @title RWAToken
 * @notice Reference ERC-20 with the Phase 3 "on-chain enforcement" pattern: every
 *         transfer is checked against ComplianceRules before it settles, and a
 *         multi-sig-controlled forced-transfer function exists for legitimate legal
 *         orders. This is illustrative — production RWA tokens (see the roadmap's
 *         "Security & Best Practices" section) should also add UUPS upgradeability,
 *         gas-optimized holder tracking (bitmaps/Merkle trees), and full NatSpec —
 *         none of which are in this reference version.
 *
 * @dev Hardening pass responding to Guardian Enterprises' 31 Jul 2026 audit:
 *      - CRITICAL "forcedTransfer Circular Trust": added `emergencyCouncil`, an
 *        immutable role entirely separate from `owner`, whose only power is
 *        `emergencyForcedTransfer` — a path that does NOT depend on
 *        ComplianceRules/IdentityRegistry at all, so it still works even if
 *        `owner` (and therefore IdentityRegistry, which `owner` also controls)
 *        is fully compromised. It can only move funds to a single pre-approved
 *        `escrowAddress`, which `emergencyCouncil` — not `owner` — controls,
 *        so owner compromise alone can't redirect it.
 *      - Re-review H-01 "ComplianceRules replacement resets holder-count state":
 *        live ComplianceRules replacement is now disabled for this reference
 *        implementation. Holder-count state lives in ComplianceRules and cannot be
 *        reconstructed from a plain ERC-20 without holder enumeration, so a safe
 *        upgrade path needs a separately audited migration design rather than a
 *        generic owner-controlled setter.
 */
contract RWAToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    ComplianceRules public immutable complianceRules;

    /// @notice Higher-threshold multi-sig role, entirely separate from `owner`, whose
    /// only power is `emergencyForcedTransfer` below. Set once at deployment and never
    /// reassignable afterward — if `owner` could reassign this, a compromised owner
    /// key could simply install itself as the council and defeat the entire point of
    /// separating the two roles. Mirrors ComplianceRules.token's "set once" pattern.
    address public immutable emergencyCouncil;

    /// @notice The only address `emergencyForcedTransfer` may ever send tokens to.
    /// Settable only by `emergencyCouncil` itself — never by `owner` — so a
    /// compromised owner key cannot redirect emergency funds by changing the
    /// destination out from under the council.
    address public escrowAddress;

    event ForcedTransfer(address indexed from, address indexed to, uint256 amount, string reason);
    event EmergencyForcedTransfer(address indexed from, uint256 amount, string reason);
    event EscrowAddressUpdated(address indexed escrowAddress);

    error TransferNotCompliant();
    error CannotSendToTokenContract();
    error NotEmergencyCouncil();
    error ZeroAddress();
    error EscrowNotSet();
    error InvalidFromAddress();
    error TimelockNotElapsed();
    error NoPendingComplianceRules();
    error NoContractCode();
    error ComplianceRulesUpdateDisabled();

    modifier onlyEmergencyCouncil() {
        if (msg.sender != emergencyCouncil) revert NotEmergencyCouncil();
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner,
        ComplianceRules _complianceRules,
        address _emergencyCouncil
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        if (_emergencyCouncil == address(0)) revert ZeroAddress();
        if (address(_complianceRules) == address(0)) revert ZeroAddress();
        if (address(_complianceRules).code.length == 0) revert NoContractCode();
        complianceRules = _complianceRules;
        emergencyCouncil = _emergencyCouncil;
    }

    /// @dev No separate compliance check needed here — _mint triggers _update below,
    /// which already runs the full canTransfer + holder-count logic.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice ComplianceRules replacement is deliberately disabled in this reference
    /// implementation. A live replacement without an audited state-migration path can
    /// reset holder-count accounting and bypass maxHolders.
    function proposeComplianceRules(ComplianceRules /* _complianceRules */) external pure {
        revert ComplianceRulesUpdateDisabled();
    }

    /// @notice Disabled with proposeComplianceRules; retained only so older callers
    /// get an explicit, typed revert rather than a missing-function failure.
    function executeComplianceRulesUpdate() external pure {
        revert ComplianceRulesUpdateDisabled();
    }

    /// @notice Disabled with proposeComplianceRules; retained only so older callers
    /// get an explicit, typed revert rather than a missing-function failure.
    function cancelPendingComplianceRules() external pure {
        revert ComplianceRulesUpdateDisabled();
    }

    /// @notice Settable only by `emergencyCouncil` — see the state variable's NatSpec
    /// for why `owner` deliberately cannot call this.
    function setEscrowAddress(address _escrowAddress) external onlyEmergencyCouncil {
        if (_escrowAddress == address(0)) revert ZeroAddress();
        if (_escrowAddress == address(this)) revert CannotSendToTokenContract();
        escrowAddress = _escrowAddress;
        emit EscrowAddressUpdated(_escrowAddress);
    }

    /**
     * @notice Standard transfer/transferFrom go through this hook automatically —
     *         OpenZeppelin v5's ERC20 routes all balance changes through _update.
     * @dev Hardening pass on holder tracking:
     *      - nonReentrant: recordHolderChange is an external call made AFTER state
     *        changes, which is the safer order, but adding the guard explicitly
     *        removes any doubt for an auditor rather than relying on call-order alone.
     *      - Self-transfers (from == to) are short-circuited before any holder-count
     *        logic runs, rather than relying on the balance-math happening to cancel
     *        out — makes the invariant "self-transfers never change holder count"
     *        checkable by inspection, not just by reasoning through the arithmetic.
     *      - Blocks sending tokens to the token contract's own address — a common
     *        footgun with no legitimate use case here, and it would otherwise count
     *        as a new "holder" that can never meaningfully transact.
     */
    function _update(address from, address to, uint256 amount) internal override whenNotPaused nonReentrant {
        if (to == address(this)) revert CannotSendToTokenContract();

        if (from == to) {
            // No identity/compliance bypass — still enforced — just no holder-count
            // side effects, since a self-transfer can't create or remove a holder.
            if (from != address(0) && !complianceRules.canTransfer(from, to, amount, false, false)) revert TransferNotCompliant();
            super._update(from, to, amount);
            return;
        }

        bool toIsNewHolder = to != address(0) && balanceOf(to) == 0 && amount > 0;
        bool fromWillBeEmptied = from != address(0) && amount > 0 && balanceOf(from) == amount;

        // Minting (from == 0) and burning (to == 0) still get checked — canTransfer
        // handles address(0) as "no identity check needed for that side" (see ComplianceRules).
        if (!complianceRules.canTransfer(from, to, amount, toIsNewHolder, fromWillBeEmptied)) revert TransferNotCompliant();

        super._update(from, to, amount);

        complianceRules.recordHolderTransfer(toIsNewHolder, fromWillBeEmptied);
    }

    /**
     * @notice Roadmap's "Global Kill-Switch" — forced transfer for a legitimate legal
     *         order (e.g., court-ordered asset recovery, lost-key remediation under a
     *         jurisdiction's securities rules). This is a standard, often
     *         regulator-required capability for compliant security tokens, not a
     *         hidden backdoor — but it concentrates real power in whoever controls
     *         the owner key, which is exactly why production deployments must put
     *         this behind a multi-sig with a documented, auditable approval process,
     *         never a single EOA as scaffolded here.
     * @param reason Freeform justification (e.g., court order reference) — emitted
     *        on-chain for the audit trail. Does not itself provide any legal basis;
     *        that has to actually exist before this function is ever called.
     * @dev Guardian audit CRITICAL finding: this function still routes through
     *      _update, which still checks complianceRules.canTransfer — and `owner`
     *      also controls IdentityRegistry (via its verifier role), so a fully
     *      compromised owner key can manipulate identity data to make an otherwise-
     *      blocked forcedTransfer pass anyway. That's an inherent limitation of this
     *      specific function, not something fixable by changing this function alone.
     *      `emergencyForcedTransfer` below is the actual answer — a genuinely
     *      separate path for exactly the scenario where `owner` (and therefore
     *      IdentityRegistry) can't be trusted.
     */
    function forcedTransfer(address from, address to, uint256 amount, string calldata reason) external onlyOwner {
        _update(from, to, amount);
        emit ForcedTransfer(from, to, amount, reason);
    }

    /**
     * @notice True break-glass path, added for the Guardian audit's CRITICAL
     *         "forcedTransfer Circular Trust" finding: moves tokens from `from` to
     *         the pre-approved `escrowAddress` WITHOUT ever consulting
     *         complianceRules.canTransfer, and therefore without depending on
     *         IdentityRegistry — or on `owner` — at all. Callable only by
     *         `emergencyCouncil`, an immutable role `owner` can never reassign, and
     *         even a fully malicious `emergencyCouncil` can only ever move funds to
     *         `escrowAddress`, never anywhere of its own choosing.
     * @dev Mirrors _update's holder-count bookkeeping and self-transfer handling by
     *      hand, since it must call super._update directly to actually skip the
     *      compliance check — going through this contract's own _update override
     *      would re-introduce the exact dependency this function exists to avoid.
     *      Still respects pause() and the reentrancy guard like every other path.
     *      Blocks from == address(0): this is for moving existing tokens out of a
     *      compromised/frozen account, not a compliance-bypassing mint.
     * @param reason Freeform justification, emitted on-chain for the audit trail —
     *        same convention as forcedTransfer above.
     */
    function emergencyForcedTransfer(address from, uint256 amount, string calldata reason)
        external
        onlyEmergencyCouncil
        whenNotPaused
        nonReentrant
    {
        if (escrowAddress == address(0)) revert EscrowNotSet();
        if (from == address(0)) revert InvalidFromAddress();

        if (from == escrowAddress) {
            super._update(from, escrowAddress, amount);
            emit EmergencyForcedTransfer(from, amount, reason);
            return;
        }

        bool toIsNewHolder = balanceOf(escrowAddress) == 0 && amount > 0;
        bool fromWillBeEmptied = amount > 0 && balanceOf(from) == amount;

        super._update(from, escrowAddress, amount);

        complianceRules.recordHolderTransfer(toIsNewHolder, fromWillBeEmptied);

        emit EmergencyForcedTransfer(from, amount, reason);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
