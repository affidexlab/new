// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDecaFlowOracle.sol";
import "./interfaces/IPrivacyRouter.sol";

/**
 * @title DecaFlowRouter
 * @notice On-chain router with automatic MEV protection
 * @dev Integrates with DecaFlow privacy network for MEV-protected swaps
 * 
 * Features:
 * - Automatic MEV risk detection
 * - Privacy routing for high-risk swaps
 * - Gas-optimized execution
 * - Compatible with standard DEX interfaces
 * 
 * Example integration:
 * ```solidity
 * IDecaFlowRouter router = IDecaFlowRouter(ROUTER_ADDRESS);
 * 
 * // Approve tokens
 * IERC20(tokenIn).approve(address(router), amountIn);
 * 
 * // Execute protected swap
 * uint256 amountOut = router.smartSwap(
 *     tokenIn,
 *     tokenOut,
 *     amountIn,
 *     amountOutMin,
 *     msg.sender,
 *     block.timestamp + 300
 * );
 * ```
 */
contract DecaFlowRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    /// @notice DecaFlow MEV oracle
    IDecaFlowOracle public oracle;
    
    /// @notice Privacy router for protected swaps
    IPrivacyRouter public privacyRouter;
    
    /// @notice MEV risk threshold (0-10000, representing 0-100%)
    uint256 public riskThreshold = 5000; // 50%
    
    /// @notice Fee in basis points (1 = 0.01%)
    uint256 public feeBps = 30; // 0.3%
    
    /// @notice Fee recipient
    address public treasury;
    
    /// @notice Emergency pause
    bool public paused;
    
    /// @dev Events
    event SwapExecuted(
        address indexed user,
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut,
        bool protected
    );
    
    event MEVPrevented(
        address indexed user,
        uint256 estimatedMEV,
        uint256 saved
    );
    
    event OracleUpdated(address indexed newOracle);
    event PrivacyRouterUpdated(address indexed newRouter);
    event RiskThresholdUpdated(uint256 newThreshold);
    
    /// @dev Errors
    error Paused();
    error ZeroAddress();
    error InvalidAmount();
    error InsufficientOutput();
    error Deadline();
    error TransferFailed();
    
    /// @dev Modifiers
    modifier notPaused() {
        if (paused) revert Paused();
        _;
    }
    
    /**
     * @notice Initialize the router
     * @param _oracle DecaFlow oracle address
     * @param _privacyRouter Privacy router address
     * @param _treasury Fee recipient address
     */
    constructor(
        address _oracle,
        address _privacyRouter,
        address _treasury
    ) Ownable(msg.sender) {
        if (_oracle == address(0) || _privacyRouter == address(0) || _treasury == address(0)) {
            revert ZeroAddress();
        }
        
        oracle = IDecaFlowOracle(_oracle);
        privacyRouter = IPrivacyRouter(_privacyRouter);
        treasury = _treasury;
    }
    
    /**
     * @notice Execute a smart swap with automatic MEV protection
     * @dev Automatically routes through privacy network if MEV risk is high
     * @param fromToken Source token
     * @param toToken Destination token
     * @param amountIn Input amount
     * @param amountOutMin Minimum acceptable output
     * @param to Recipient address
     * @param deadline Transaction deadline
     * @return amountOut Actual output amount
     */
    function smartSwap(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        uint256 deadline
    ) external nonReentrant notPaused returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Deadline();
        if (amountIn == 0) revert InvalidAmount();
        if (to == address(0)) revert ZeroAddress();
        
        // Transfer tokens from user
        IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Check MEV risk
        (uint256 riskScore, ) = oracle.getMEVRiskScore(fromToken, toToken, amountIn);
        bool useProtection = riskScore >= riskThreshold;
        
        if (useProtection) {
            // High risk - use privacy routing
            IERC20(fromToken).safeIncreaseAllowance(address(privacyRouter), amountIn);
            
            amountOut = privacyRouter.swapWithProtection(
                fromToken,
                toToken,
                amountIn,
                amountOutMin,
                to,
                deadline
            );
            
            uint256 estimatedMEV = oracle.getEstimatedMEV(fromToken, toToken, amountIn);
            emit MEVPrevented(msg.sender, estimatedMEV, estimatedMEV * 95 / 100);
        } else {
            // Low risk - direct swap (implement your DEX integration here)
            amountOut = _executeDirectSwap(fromToken, toToken, amountIn, to);
        }
        
        if (amountOut < amountOutMin) revert InsufficientOutput();
        
        emit SwapExecuted(
            msg.sender,
            fromToken,
            toToken,
            amountIn,
            amountOut,
            useProtection
        );
        
        return amountOut;
    }
    
    /**
     * @notice Get quote with MEV protection recommendation
     * @param fromToken Source token
     * @param toToken Destination token
     * @param amountIn Input amount
     * @return amountOut Expected output
     * @return shouldProtect Whether protection is recommended
     * @return estimatedMEV Estimated MEV that would be extracted
     */
    function getQuoteWithRisk(
        address fromToken,
        address toToken,
        uint256 amountIn
    ) external view returns (
        uint256 amountOut,
        bool shouldProtect,
        uint256 estimatedMEV
    ) {
        (uint256 riskScore, ) = oracle.getMEVRiskScore(fromToken, toToken, amountIn);
        shouldProtect = riskScore >= riskThreshold;
        estimatedMEV = oracle.getEstimatedMEV(fromToken, toToken, amountIn);
        
        if (shouldProtect) {
            (amountOut, ) = privacyRouter.getProtectedQuote(fromToken, toToken, amountIn);
        } else {
            // Return direct swap quote
            amountOut = _getDirectQuote(fromToken, toToken, amountIn);
        }
        
        return (amountOut, shouldProtect, estimatedMEV);
    }
    
    /**
     * @notice Force use of privacy protection regardless of risk
     * @param fromToken Source token
     * @param toToken Destination token
     * @param amountIn Input amount
     * @param amountOutMin Minimum output
     * @param to Recipient
     * @param deadline Transaction deadline
     * @return amountOut Actual output
     */
    function forceProtectedSwap(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        uint256 deadline
    ) external nonReentrant notPaused returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert Deadline();
        if (amountIn == 0) revert InvalidAmount();
        
        IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(fromToken).safeIncreaseAllowance(address(privacyRouter), amountIn);
        
        amountOut = privacyRouter.swapWithProtection(
            fromToken,
            toToken,
            amountIn,
            amountOutMin,
            to,
            deadline
        );
        
        if (amountOut < amountOutMin) revert InsufficientOutput();
        
        emit SwapExecuted(msg.sender, fromToken, toToken, amountIn, amountOut, true);
        
        return amountOut;
    }
    
    /**
     * @dev Execute direct swap (to be implemented with DEX integration)
     */
    function _executeDirectSwap(
        address fromToken,
        address toToken,
        uint256 amountIn,
        address to
    ) internal returns (uint256 amountOut) {
        // Implement DEX integration here (Uniswap V3, Camelot, etc.)
        // For now, just transfer tokens
        IERC20(fromToken).safeTransfer(to, amountIn);
        return amountIn; // Placeholder
    }
    
    /**
     * @dev Get direct swap quote
     */
    function _getDirectQuote(
        address fromToken,
        address toToken,
        uint256 amountIn
    ) internal view returns (uint256) {
        // Implement quote logic here
        return amountIn; // Placeholder
    }
    
    // Admin functions
    
    function setOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert ZeroAddress();
        oracle = IDecaFlowOracle(_oracle);
        emit OracleUpdated(_oracle);
    }
    
    function setPrivacyRouter(address _router) external onlyOwner {
        if (_router == address(0)) revert ZeroAddress();
        privacyRouter = IPrivacyRouter(_router);
        emit PrivacyRouterUpdated(_router);
    }
    
    function setRiskThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold <= 10000, "Invalid threshold");
        riskThreshold = _threshold;
        emit RiskThresholdUpdated(_threshold);
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
