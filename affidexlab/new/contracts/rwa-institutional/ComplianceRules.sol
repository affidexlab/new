// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IdentityRegistry.sol";
import "./RiskOracle.sol";

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

    // Whether this offering requires accreditedInvestor == true to receive tokens
    // (e.g. a Rule 506(c) offering). Off by default — many offerings don't require
    // this, and the memo's point stands regardless: this contract enforces whatever
    // flag IdentityRegistry recorded, it doesn't verify accreditation itself.
    bool public requireAccreditation;

    // Cap on total distinct holders (common in Reg D offerings to stay under
    // investor-count thresholds). Enforced below — see canTransfer/recordHolderChange.
    uint256 public maxHolders;
    uint256 public currentHolders;

    // Only the linked token contract may call recordHolderChange — sequence matters:
    // set this once via setToken before the token goes live, or currentHolders
    // never updates and every transfer that would create a new holder reverts once
    // maxHolders is reached.
    address public token;

    // Optional — address(0) means "no risk gating," matching how this contract behaved
    // before RiskOracle existed. Setting it opts into Verify-API-driven risk filtering.
    RiskOracle public riskOracle;
    uint8 public maxRiskScore = 100; // 100 = no effective filtering until lowered

    event MaxHoldersUpdated(uint256 maxHolders);
    event TokenSet(address indexed token);
    event RiskOracleUpdated(address indexed riskOracle, uint8 maxRiskScore);

    error NotToken();
    error MaxHoldersReached();
    error TokenAlreadySet();
    error MaxHoldersExceeded();

    modifier onlyToken() {
        if (msg.sender != token) revert NotToken();
        _;
    }

    constructor(address initialOwner, IdentityRegistry _identityRegistry, uint256 _maxHolders) Ownable(initialOwner) {
        identityRegistry = _identityRegistry;
        maxHolders = _maxHolders;
    }

    /// @notice One-time link to the token contract this compliance module governs.
    /// @dev Deliberately callable only once (while currentHolders == 0) rather than
    /// freely reassignable — re-pointing to a different token mid-flight would leave
    /// currentHolders reflecting the OLD token's holders while enforcing the cap
    /// against a token that never produced those holders. If you genuinely need to
    /// change this, deploy a fresh ComplianceRules rather than repurposing one that's
    /// already been tracking a live token.
    function setToken(address _token) external onlyOwner {
        if (token != address(0)) revert TokenAlreadySet();
        token = _token;
        emit TokenSet(_token);
    }

    function setRequireAccreditation(bool required) external onlyOwner {
        requireAccreditation = required;
    }

    function setMaxHolders(uint256 _maxHolders) external onlyOwner {
        maxHolders = _maxHolders;
        emit MaxHoldersUpdated(_maxHolders);
    }

    /// @notice Opt into (or update) Verify-API-driven risk filtering. Pass
    /// address(0) to disable — canTransfer skips the risk check entirely then,
    /// same as before this feature existed.
    function setRiskOracle(RiskOracle _riskOracle, uint8 _maxRiskScore) external onlyOwner {
        require(_maxRiskScore <= 100, "score must be 0-100");
        riskOracle = _riskOracle;
        maxRiskScore = _maxRiskScore;
        emit RiskOracleUpdated(address(_riskOracle), _maxRiskScore);
    }

    /**
     * @notice Called by the token contract before every transfer settles.
     * @param toIsNewHolder True if `to` currently holds zero balance — i.e. this
     *        transfer would create a new distinct holder if it goes through.
     * @dev Kept intentionally simple beyond holder-count/risk enforcement — this is
     *      the function real compliance logic (accreditation checks, per-country
     *      investor limits, lockup periods, etc.) gets layered into. Treat this as
     *      the extension point, not the finished rule set.
     */
    function canTransfer(address from, address to, uint256 /* amount */, bool toIsNewHolder) external view returns (bool) {
        if (from != address(0) && !identityRegistry.isVerified(from)) return false;
        if (to != address(0) && !identityRegistry.isVerified(to)) return false;

        if (to != address(0)) {
            IdentityRegistry.Identity memory toIdentity = identityRegistry.getIdentity(to);
            if (!toIdentity.jurisdictionEligible) return false;
            if (requireAccreditation && !toIdentity.accreditedInvestor) return false;

            if (toIsNewHolder && maxHolders != 0 && currentHolders >= maxHolders) return false;

            if (address(riskOracle) != address(0)) {
                (uint8 score, bool fresh) = riskOracle.getRiskScore(to);
                // No score yet (fresh == false) does NOT block — an unscored wallet
                // isn't the same as a risky one, and defaulting to "block everyone
                // with no data" would make this oracle a denial-of-service switch
                // for anyone the updater hasn't gotten to yet. Choosing "allow until
                // scored" here; a stricter policy is a one-line change if you want it.
                if (fresh && score > maxRiskScore) return false;
            }
        }

        return true;
    }

    /// @notice Token calls this after a transfer it already validated via canTransfer
    /// actually settles, so currentHolders reflects reality even if a transfer that
    /// passed canTransfer later reverts for an unrelated reason (e.g. ERC20 balance check).
    /// @dev Guardian audit HIGH "Race Condition in Holder Count Tracking": on a
    ///      standard sequential-EVM chain (this includes every chain this project
    ///      targets — Arbitrum, Base, Polygon, Avalanche), each transaction fully
    ///      commits its state changes before the next transaction in a block begins
    ///      executing, so two separate transactions can't actually both observe the
    ///      same stale "balanceOf(to) == 0" read the way two threads racing against
    ///      shared memory could — canTransfer's toIsNewHolder check is genuinely up
    ///      to date for whichever transaction runs second. The literal cross-
    ///      transaction race described isn't reachable here, and RWAToken._update
    ///      already has nonReentrant covering the one case that WOULD matter
    ///      (same-transaction reentrancy).
    ///      This function still adds a real hardening, though: it now enforces
    ///      maxHolders as a hard invariant at the actual point currentHolders
    ///      changes, instead of relying solely on the earlier, separate check in
    ///      canTransfer. That's strictly better defense-in-depth — it holds even if
    ///      a future code path ever calls recordHolderChange without having gone
    ///      through canTransfer first, which the previous version had no protection
    ///      against at all.
    function recordHolderChange(bool increment) external onlyToken {
        if (increment) {
            currentHolders += 1;
            if (maxHolders != 0 && currentHolders > maxHolders) revert MaxHoldersExceeded();
        } else if (currentHolders > 0) {
            currentHolders -= 1;
        }
    }
}
