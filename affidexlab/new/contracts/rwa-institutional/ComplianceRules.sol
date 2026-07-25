// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IdentityRegistry.sol";

/**
 * ██  UNAUDITED REFERENCE IMPLEMENTATION — DO NOT USE FOR REAL SECURITIES  ██
 * See IdentityRegistry.sol for the full pre-production checklist. It applies here too.
 *
 * @title ComplianceRules
 * @notice Reference implementation of the roadmap's Phase 3 "CanTransfer" check —
 *         a rules engine consulted before every token transfer. Deliberately simple:
 *         real deployments will need per-jurisdiction logic your legal team defines,
 *         not just the two example rules included here.
 */
contract ComplianceRules is Ownable {
    IdentityRegistry public immutable identityRegistry;

    // Example rule: block transfers to/from specific jurisdictions entirely.
    // Real logic (partial restrictions, investor caps per country, holding periods,
    // Reg S/Reg D distinctions, etc.) is offering-specific and must come from counsel.
    mapping(bytes2 => bool) public jurisdictionBlocked;

    // Example rule: cap total number of distinct holders (common in Reg D offerings
    // to stay under investor-count thresholds). Token contract is responsible for
    // calling recordHolderChange on mint/burn/transfer-to-zero-balance.
    uint256 public maxHolders;
    uint256 public currentHolders;

    event JurisdictionBlockUpdated(bytes2 countryCode, bool blocked);
    event MaxHoldersUpdated(uint256 maxHolders);

    constructor(address initialOwner, IdentityRegistry _identityRegistry, uint256 _maxHolders) Ownable(initialOwner) {
        identityRegistry = _identityRegistry;
        maxHolders = _maxHolders;
    }

    function setJurisdictionBlocked(bytes2 countryCode, bool blocked) external onlyOwner {
        jurisdictionBlocked[countryCode] = blocked;
        emit JurisdictionBlockUpdated(countryCode, blocked);
    }

    function setMaxHolders(uint256 _maxHolders) external onlyOwner {
        maxHolders = _maxHolders;
        emit MaxHoldersUpdated(_maxHolders);
    }

    /**
     * @notice Called by the token contract before every transfer settles.
     * @dev Kept intentionally simple — this is the function real compliance logic
     *      (accreditation checks, per-country investor limits, lockup periods, etc.)
     *      gets layered into. Treat this as the extension point, not the finished rule set.
     */
    function canTransfer(address from, address to, uint256 /* amount */) external view returns (bool) {
        if (from != address(0) && !identityRegistry.isVerified(from)) return false;
        if (to != address(0) && !identityRegistry.isVerified(to)) return false;

        if (to != address(0)) {
            IdentityRegistry.Identity memory toIdentity = identityRegistry.getIdentity(to);
            if (jurisdictionBlocked[toIdentity.countryCode]) return false;
        }

        // NOTE: does not enforce maxHolders here — that requires the token to track
        // holder count and pass it in, which the reference RWAToken.sol does not yet
        // implement. Flagging explicitly rather than pretending this rule is enforced.

        return true;
    }
}
