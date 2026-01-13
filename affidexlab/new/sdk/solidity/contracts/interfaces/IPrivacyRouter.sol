// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPrivacyRouter
 * @notice Interface for DecaFlow privacy routing
 * @dev Provides MEV-protected swap execution
 */
interface IPrivacyRouter {
    /**
     * @notice Execute a MEV-protected swap
     * @param fromToken Source token address
     * @param toToken Destination token address
     * @param amountIn Input amount
     * @param amountOutMin Minimum output amount
     * @param to Recipient address
     * @param deadline Transaction deadline
     * @return amountOut Actual output amount
     */
    function swapWithProtection(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);
    
    /**
     * @notice Get quote for a protected swap
     * @param fromToken Source token address
     * @param toToken Destination token address
     * @param amountIn Input amount
     * @return amountOut Expected output amount
     * @return mevSaved Estimated MEV saved in USD
     */
    function getProtectedQuote(
        address fromToken,
        address toToken,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 mevSaved);
}
