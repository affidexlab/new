// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
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
contract RWAToken is ERC20, Ownable, Pausable {
    ComplianceRules public complianceRules;

    event ForcedTransfer(address indexed from, address indexed to, uint256 amount, string reason);
    event ComplianceRulesUpdated(address indexed newComplianceRules);

    error TransferNotCompliant();

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner,
        ComplianceRules _complianceRules
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        complianceRules = _complianceRules;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (!complianceRules.canTransfer(address(0), to, amount)) revert TransferNotCompliant();
        _mint(to, amount);
    }

    function setComplianceRules(ComplianceRules _complianceRules) external onlyOwner {
        complianceRules = _complianceRules;
        emit ComplianceRulesUpdated(address(_complianceRules));
    }

    /**
     * @notice Standard transfer/transferFrom go through this hook automatically —
     *         OpenZeppelin v5's ERC20 routes all balance changes through _update.
     */
    function _update(address from, address to, uint256 amount) internal override whenNotPaused {
        // Minting (from == 0) and burning (to == 0) still get checked — canTransfer
        // handles address(0) as "no identity check needed for that side" (see ComplianceRules).
        if (!complianceRules.canTransfer(from, to, amount)) revert TransferNotCompliant();
        super._update(from, to, amount);
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
