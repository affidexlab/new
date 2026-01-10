// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDecaFlowOracle
 * @notice Interface for DecaFlow MEV risk oracle
 * @dev Provides real-time MEV risk scores for token swaps
 */
interface IDecaFlowOracle {
    /**
     * @notice Get MEV risk score for a swap
     * @param fromToken Source token address
     * @param toToken Destination token address
     * @param amount Swap amount in fromToken decimals
     * @return riskScore Risk score from 0-10000 (0-100.00%)
     * @return timestamp When the risk score was calculated
     */
    function getMEVRiskScore(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256 riskScore, uint256 timestamp);
    
    /**
     * @notice Check if MEV protection is recommended
     * @param fromToken Source token address
     * @param toToken Destination token address
     * @param amount Swap amount
     * @return shouldProtect True if protection is recommended
     */
    function shouldUseProtection(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (bool shouldProtect);
    
    /**
     * @notice Get estimated MEV that would be extracted
     * @param fromToken Source token address
     * @param toToken Destination token address
     * @param amount Swap amount
     * @return estimatedMEV Estimated MEV in USD (6 decimals)
     */
    function getEstimatedMEV(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256 estimatedMEV);
}
