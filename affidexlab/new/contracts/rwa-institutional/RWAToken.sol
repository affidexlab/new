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
 * @title RWAToken
 * @notice Reference ERC-20 with the Phase 3 "on-chain enforcement" pattern: every
 *         transfer is checked against ComplianceRules before it settles, and a
 *         multi-sig-controlled forced-transfer function exists for legitimate legal
 *         orders. This is illustrative — production RWA tokens (see the roadmap's
 *         "Security & Best Practices" section) should also add UUPS upgradeability,
 *         gas-optimized holder tracking (bitmaps/Merkle trees), and full NatSpec —
 *         none of which are in this reference version.
 */
contract RWAToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    ComplianceRules public complianceRules;

    event ForcedTransfer(address indexed from, address indexed to, uint256 amount, string reason);
    event ComplianceRulesUpdated(address indexed newComplianceRules);

    error TransferNotCompliant();
    error CannotSendToTokenContract();

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner,
        ComplianceRules _complianceRules
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        complianceRules = _complianceRules;
    }

    /// @dev No separate compliance check needed here — _mint triggers _update below,
    /// which already runs the full canTransfer + holder-count logic.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function setComplianceRules(ComplianceRules _complianceRules) external onlyOwner {
        complianceRules = _complianceRules;
        emit ComplianceRulesUpdated(address(_complianceRules));
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
            if (from != address(0) && !complianceRules.canTransfer(from, to, amount, false)) revert TransferNotCompliant();
            super._update(from, to, amount);
            return;
        }

        bool toIsNewHolder = to != address(0) && balanceOf(to) == 0 && amount > 0;
        bool fromWillBeEmptied = from != address(0) && amount > 0 && balanceOf(from) == amount;

        // Minting (from == 0) and burning (to == 0) still get checked — canTransfer
        // handles address(0) as "no identity check needed for that side" (see ComplianceRules).
        if (!complianceRules.canTransfer(from, to, amount, toIsNewHolder)) revert TransferNotCompliant();

        super._update(from, to, amount);

        if (toIsNewHolder) complianceRules.recordHolderChange(true);
        if (fromWillBeEmptied) complianceRules.recordHolderChange(false);
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
     */
    function forcedTransfer(address from, address to, uint256 amount, string calldata reason) external onlyOwner {
        _update(from, to, amount);
        emit ForcedTransfer(from, to, amount, reason);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
