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

    // Cap on total distinct holders (common in Reg D offerings to stay under
    // investor-count thresholds). Enforced below — see canTransfer/recordHolderChange.
    uint256 public maxHolders;
    uint256 public currentHolders;

    // Only the linked token contract may call recordHolderChange — sequence matters:
    // set this once via setToken before the token goes live, or currentHolders
    // never updates and every transfer that would create a new holder reverts once
    // maxHolders is reached.
    address public token;

    event JurisdictionBlockUpdated(bytes2 countryCode, bool blocked);
    event MaxHoldersUpdated(uint256 maxHolders);
    event TokenSet(address indexed token);

    error NotToken();
    error MaxHoldersReached();

    modifier onlyToken() {
        if (msg.sender != token) revert NotToken();
        _;
    }

    constructor(address initialOwner, IdentityRegistry _identityRegistry, uint256 _maxHolders) Ownable(initialOwner) {
        identityRegistry = _identityRegistry;
        maxHolders = _maxHolders;
    }

    /// @notice One-time (well, owner-controlled) link to the token contract this
    /// compliance module governs — required before holder-count enforcement works.
    function setToken(address _token) external onlyOwner {
        token = _token;
        emit TokenSet(_token);
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
     * @param toIsNewHolder True if `to` currently holds zero balance — i.e. this
     *        transfer would create a new distinct holder if it goes through.
     * @dev Kept intentionally simple beyond holder-count enforcement — this is the
     *      function real compliance logic (accreditation checks, per-country investor
     *      limits, lockup periods, etc.) gets layered into. Treat this as the
     *      extension point, not the finished rule set.
     */
    function canTransfer(address from, address to, uint256 /* amount */, bool toIsNewHolder) external view returns (bool) {
        if (from != address(0) && !identityRegistry.isVerified(from)) return false;
        if (to != address(0) && !identityRegistry.isVerified(to)) return false;

        if (to != address(0)) {
            IdentityRegistry.Identity memory toIdentity = identityRegistry.getIdentity(to);
            if (jurisdictionBlocked[toIdentity.countryCode]) return false;

            if (toIsNewHolder && maxHolders != 0 && currentHolders >= maxHolders) return false;
        }

        return true;
    }

    /// @notice Token calls this after a transfer it already validated via canTransfer
    /// actually settles, so currentHolders reflects reality even if a transfer that
    /// passed canTransfer later reverts for an unrelated reason (e.g. ERC20 balance check).
    function recordHolderChange(bool increment) external onlyToken {
        if (increment) {
            currentHolders += 1;
        } else if (currentHolders > 0) {
            currentHolders -= 1;
        }
    }
}
