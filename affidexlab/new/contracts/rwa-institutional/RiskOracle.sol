// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ██  UNAUDITED REFERENCE IMPLEMENTATION — DO NOT USE FOR REAL SECURITIES  ██
 * See IdentityRegistry.sol for the full pre-production checklist. It applies here too.
 *
 * @title RiskOracle
 * @notice Roadmap Phase 5 asked for "Oracle Integration: Feed our off-chain Verify
 *         API risk scores directly into the on-chain Compliance Contract using a
 *         Decentralized Oracle (like Chainlink)." Being direct about what this is:
 *
 *         This is a TRUSTED-UPDATER oracle, not a decentralized one. A single
 *         authorized address (your backend's signer) pushes scores on-chain. That's
 *         a real, working pattern — plenty of production systems start here — but
 *         it is NOT Chainlink, and it does NOT have Chainlink's trust-minimization
 *         properties. A compromised or malicious updater key can push arbitrary
 *         risk scores, so this key needs the same operational care as the token's
 *         owner key: real key management, not a plaintext env var forever.
 *
 *         Real Chainlink Functions integration is a separate, later step that
 *         needs: a funded LINK subscription, a Chainlink Functions subscription ID,
 *         and a JS source snippet Chainlink's DON executes to call the Verify API.
 *         None of that can be set up by writing contract code alone — it requires
 *         real LINK tokens and dashboard configuration on Chainlink's side. This
 *         contract's interface (setRiskScore, getRiskScore) is intentionally close
 *         to what a Chainlink consumer contract would expose, so swapping the
 *         trust model later doesn't mean rewriting ComplianceRules' integration.
 */
contract RiskOracle is Ownable {
    struct RiskData {
        uint8 score;        // 0-100, matching Verify API's existing scale
        uint40 updatedAt;
        bool exists;
    }

    mapping(address => RiskData) private _riskScores;
    mapping(address => bool) public isUpdater;

    // --- Circuit breaker (Guardian audit MEDIUM "RiskOracle Updater Key
    // Compromise") --------------------------------------------------------------
    // The audit's main recommendation — manage the updater key via a real multi-sig
    // — is operational, not something Solidity can enforce. What IS enforceable:
    // bounding how much damage a single compromised-key call (or burst of calls) can
    // do before `owner` — a different, presumably better-protected key — gets a
    // chance to react. `owner` can always tune these via the setters below.
    uint256 public maxBatchSize = 200;
    uint256 public rapidChangeWindow = 1 hours;
    uint256 public rapidChangeThreshold = 500;

    uint256 public windowStart;
    uint256 public windowChangeCount;
    bool public updatesPaused;

    event RiskScoreUpdated(address indexed wallet, uint8 score);
    event UpdaterSet(address indexed updater, bool allowed);
    event CircuitBreakerParamsUpdated(uint256 maxBatchSize, uint256 rapidChangeWindow, uint256 rapidChangeThreshold);
    event UpdatesAutoPaused(uint256 changesInWindow, uint256 windowStart);
    event UpdatesResumed();

    error NotAnUpdater();
    error InvalidScore();
    error ArrayLengthMismatch();
    error BatchTooLarge();
    error UpdatesArePaused();

    modifier onlyUpdater() {
        if (!isUpdater[msg.sender] && msg.sender != owner()) revert NotAnUpdater();
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        windowStart = block.timestamp;
    }

    function setUpdater(address updater, bool allowed) external onlyOwner {
        isUpdater[updater] = allowed;
        emit UpdaterSet(updater, allowed);
    }

    /// @notice Tune the circuit breaker's sensitivity. Left owner-adjustable rather
    /// than hardcoded since the right thresholds depend heavily on how many wallets
    /// a real deployment actually scores — a fund with 50 investors and one with
    /// 50,000 need very different numbers here.
    function setCircuitBreakerParams(uint256 _maxBatchSize, uint256 _rapidChangeWindow, uint256 _rapidChangeThreshold) external onlyOwner {
        maxBatchSize = _maxBatchSize;
        rapidChangeWindow = _rapidChangeWindow;
        rapidChangeThreshold = _rapidChangeThreshold;
        emit CircuitBreakerParamsUpdated(_maxBatchSize, _rapidChangeWindow, _rapidChangeThreshold);
    }

    /// @notice Only `owner` can resume — deliberately a different key than
    /// `isUpdater`, so an updater key alone (compromised or not) can never
    /// un-pause itself after tripping the breaker.
    function resumeUpdates() external onlyOwner {
        updatesPaused = false;
        windowChangeCount = 0;
        windowStart = block.timestamp;
        emit UpdatesResumed();
    }

    function _trackChangesAndMaybeTrip(uint256 count) internal {
        if (block.timestamp >= windowStart + rapidChangeWindow) {
            windowStart = block.timestamp;
            windowChangeCount = 0;
        }
        windowChangeCount += count;
        if (windowChangeCount > rapidChangeThreshold && !updatesPaused) {
            updatesPaused = true;
            emit UpdatesAutoPaused(windowChangeCount, windowStart);
        }
    }

    /// @notice Pushes a fresh Verify API risk score on-chain for a wallet.
    function setRiskScore(address wallet, uint8 score) external onlyUpdater {
        if (updatesPaused) revert UpdatesArePaused();
        if (score > 100) revert InvalidScore();
        _riskScores[wallet] = RiskData({ score: score, updatedAt: uint40(block.timestamp), exists: true });
        emit RiskScoreUpdated(wallet, score);
        _trackChangesAndMaybeTrip(1);
    }

    /// @notice Batch version — same gas-per-update cost benefit any oracle push job wants.
    /// @dev Guardian audit MEDIUM finding + LOW "Batch Update Error Handling": the
    ///      length check is now a custom error instead of a require string (cheaper,
    ///      consistent with the rest of the codebase), and batch size is capped so
    ///      one compromised-key transaction can't reprice an unbounded number of
    ///      wallets — combined with the rolling-window check below, this is the
    ///      "monitoring for rapid, bulk score changes" the audit asked for, turned
    ///      into an actual enforced limit rather than something only visible after
    ///      the fact in logs.
    function setRiskScores(address[] calldata wallets, uint8[] calldata scores) external onlyUpdater {
        if (updatesPaused) revert UpdatesArePaused();
        if (wallets.length != scores.length) revert ArrayLengthMismatch();
        if (wallets.length > maxBatchSize) revert BatchTooLarge();
        for (uint256 i = 0; i < wallets.length; i++) {
            if (scores[i] > 100) revert InvalidScore();
            _riskScores[wallets[i]] = RiskData({ score: scores[i], updatedAt: uint40(block.timestamp), exists: true });
            emit RiskScoreUpdated(wallets[i], scores[i]);
        }
        _trackChangesAndMaybeTrip(wallets.length);
    }

    /// @return score 0-100. @return fresh False if no score has ever been pushed for this wallet —
    /// callers (like ComplianceRules) must decide how to treat "no data" themselves; this
    /// contract doesn't assume unknown wallets are safe OR risky.
    function getRiskScore(address wallet) external view returns (uint8 score, bool fresh) {
        RiskData memory data = _riskScores[wallet];
        return (data.score, data.exists);
    }
}
