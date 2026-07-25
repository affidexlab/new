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

    event RiskScoreUpdated(address indexed wallet, uint8 score);
    event UpdaterSet(address indexed updater, bool allowed);

    error NotAnUpdater();
    error InvalidScore();

    modifier onlyUpdater() {
        if (!isUpdater[msg.sender] && msg.sender != owner()) revert NotAnUpdater();
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setUpdater(address updater, bool allowed) external onlyOwner {
        isUpdater[updater] = allowed;
        emit UpdaterSet(updater, allowed);
    }

    /// @notice Pushes a fresh Verify API risk score on-chain for a wallet.
    function setRiskScore(address wallet, uint8 score) external onlyUpdater {
        if (score > 100) revert InvalidScore();
        _riskScores[wallet] = RiskData({ score: score, updatedAt: uint40(block.timestamp), exists: true });
        emit RiskScoreUpdated(wallet, score);
    }

    /// @notice Batch version — same gas-per-update cost benefit any oracle push job wants.
    function setRiskScores(address[] calldata wallets, uint8[] calldata scores) external onlyUpdater {
        require(wallets.length == scores.length, "length mismatch");
        for (uint256 i = 0; i < wallets.length; i++) {
            if (scores[i] > 100) revert InvalidScore();
            _riskScores[wallets[i]] = RiskData({ score: scores[i], updatedAt: uint40(block.timestamp), exists: true });
            emit RiskScoreUpdated(wallets[i], scores[i]);
        }
    }

    /// @return score 0-100. @return fresh False if no score has ever been pushed for this wallet —
    /// callers (like ComplianceRules) must decide how to treat "no data" themselves; this
    /// contract doesn't assume unknown wallets are safe OR risky.
    function getRiskScore(address wallet) external view returns (uint8 score, bool fresh) {
        RiskData memory data = _riskScores[wallet];
        return (data.score, data.exists);
    }
}
