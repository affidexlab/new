// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DECAStaking
 * @notice Staking contract for DECA tokens with protocol fee revenue sharing
 * 
 * Features:
 * - Stake DECA tokens to earn USDC rewards from protocol fees
 * - Flexible staking (no lock period) with instant unstaking
 * - Fee tiers based on staking amount (more stake = higher discounts)
 * - Weekly reward distributions from protocol revenue
 * - Emergency pause functionality
 * 
 * Reward Calculation:
 * - Rewards distributed proportionally to stake
 * - Example: If you stake 1% of total staked DECA, you earn 1% of weekly USDC fees
 * - Estimated APY: 15-30% (varies with protocol volume)
 */
contract DECAStaking is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    // Tokens
    IERC20 public immutable decaToken;
    IERC20 public immutable usdcToken;
    
    // Staking info
    struct StakeInfo {
        uint256 amount;           // Amount of DECA staked
        uint256 rewardDebt;       // Reward debt for accurate reward calculation
        uint256 pendingRewards;   // Accumulated but unclaimed rewards
        uint256 stakedAt;         // Timestamp of first stake
        uint256 lastClaimAt;      // Timestamp of last reward claim
    }
    
    // Fee tier thresholds (for swap fee discounts)
    struct FeeTier {
        uint256 minStake;         // Minimum DECA stake required
        uint256 discountBps;      // Discount in basis points (10000 = 100%)
    }
    
    // State variables
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public accRewardPerShare;      // Accumulated rewards per share (scaled by 1e18)
    uint256 public lastRewardBlock;
    uint256 public totalRewardsDistributed;
    
    // Fee tiers (can be updated by governance)
    FeeTier[] public feeTiers;
    
    // Constants
    uint256 private constant PRECISION = 1e18;
    uint256 private constant MAX_FEE_DISCOUNT = 10000; // 100% in bps
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDeposited(uint256 amount, uint256 timestamp);
    event FeeTierUpdated(uint256 indexed tierId, uint256 minStake, uint256 discountBps);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    
    /**
     * @notice Constructor
     * @param _decaToken Address of DECA token
     * @param _usdcToken Address of USDC token (reward token)
     */
    constructor(address _decaToken, address _usdcToken) Ownable(msg.sender) {
        require(_decaToken != address(0), "Invalid DECA address");
        require(_usdcToken != address(0), "Invalid USDC address");
        
        decaToken = IERC20(_decaToken);
        usdcToken = IERC20(_usdcToken);
        lastRewardBlock = block.number;
        
        // Initialize default fee tiers
        feeTiers.push(FeeTier(0, 0));                       // Tier 0: No stake = 0% discount
        feeTiers.push(FeeTier(1_000 * 1e18, 1000));        // Tier 1: 1K DECA = 10% discount
        feeTiers.push(FeeTier(10_000 * 1e18, 2500));       // Tier 2: 10K DECA = 25% discount
        feeTiers.push(FeeTier(50_000 * 1e18, 5000));       // Tier 3: 50K DECA = 50% discount
        feeTiers.push(FeeTier(100_000 * 1e18, 7500));      // Tier 4: 100K DECA = 75% discount
        feeTiers.push(FeeTier(500_000 * 1e18, 10000));     // Tier 5: 500K DECA = 100% discount (no fees)
    }
    
    /**
     * @notice Stake DECA tokens
     * @param amount Amount of DECA to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        
        StakeInfo storage staker = stakes[msg.sender];
        
        // Update pending rewards before changing stake
        _updateRewards(msg.sender);
        
        // Transfer DECA tokens from user
        decaToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update stake info
        if (staker.amount == 0) {
            staker.stakedAt = block.timestamp;
        }
        staker.amount += amount;
        staker.rewardDebt = (staker.amount * accRewardPerShare) / PRECISION;
        
        // Update total staked
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @notice Unstake DECA tokens
     * @param amount Amount of DECA to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage staker = stakes[msg.sender];
        require(staker.amount >= amount, "Insufficient stake");
        require(amount > 0, "Cannot unstake 0");
        
        // Update pending rewards before changing stake
        _updateRewards(msg.sender);
        
        // Update stake info
        staker.amount -= amount;
        staker.rewardDebt = (staker.amount * accRewardPerShare) / PRECISION;
        
        // Update total staked
        totalStaked -= amount;
        
        // Transfer DECA tokens back to user
        decaToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @notice Claim accumulated USDC rewards
     */
    function claimRewards() external nonReentrant {
        _updateRewards(msg.sender);
        
        StakeInfo storage staker = stakes[msg.sender];
        uint256 pending = staker.pendingRewards;
        
        require(pending > 0, "No rewards to claim");
        
        // Reset pending rewards
        staker.pendingRewards = 0;
        staker.lastClaimAt = block.timestamp;
        
        // Transfer USDC rewards to user
        usdcToken.safeTransfer(msg.sender, pending);
        
        emit RewardsClaimed(msg.sender, pending);
    }
    
    /**
     * @notice Deposit USDC rewards for distribution (called by protocol)
     * @param amount Amount of USDC to distribute
     */
    function depositRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Cannot deposit 0");
        require(totalStaked > 0, "No stakers");
        
        // Transfer USDC from sender
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update reward per share
        accRewardPerShare += (amount * PRECISION) / totalStaked;
        lastRewardBlock = block.number;
        totalRewardsDistributed += amount;
        
        emit RewardsDeposited(amount, block.timestamp);
    }
    
    /**
     * @notice Get user's fee discount tier
     * @param user Address of user
     * @return Discount in basis points (10000 = 100%)
     */
    function getUserFeeDiscount(address user) external view returns (uint256) {
        uint256 userStake = stakes[user].amount;
        uint256 discount = 0;
        
        // Find highest tier user qualifies for
        for (uint256 i = feeTiers.length; i > 0; i--) {
            if (userStake >= feeTiers[i - 1].minStake) {
                discount = feeTiers[i - 1].discountBps;
                break;
            }
        }
        
        return discount;
    }
    
    /**
     * @notice Get pending USDC rewards for user
     * @param user Address of user
     * @return Pending reward amount
     */
    function pendingRewards(address user) external view returns (uint256) {
        StakeInfo memory staker = stakes[user];
        
        if (staker.amount == 0) {
            return staker.pendingRewards;
        }
        
        uint256 accReward = accRewardPerShare;
        uint256 pending = ((staker.amount * accReward) / PRECISION) - staker.rewardDebt;
        
        return staker.pendingRewards + pending;
    }
    
    /**
     * @notice Get stake info for user
     * @param user Address of user
     * @return amount Amount staked
     * @return stakedAt Timestamp of first stake
     * @return pending Pending rewards
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 stakedAt,
        uint256 pending
    ) {
        StakeInfo memory staker = stakes[user];
        amount = staker.amount;
        stakedAt = staker.stakedAt;
        
        if (staker.amount > 0) {
            pending = ((staker.amount * accRewardPerShare) / PRECISION) - staker.rewardDebt + staker.pendingRewards;
        } else {
            pending = staker.pendingRewards;
        }
    }
    
    /**
     * @notice Update fee tiers (governance)
     * @param tierId Index of tier to update
     * @param minStake Minimum stake required
     * @param discountBps Discount in basis points
     */
    function updateFeeTier(
        uint256 tierId,
        uint256 minStake,
        uint256 discountBps
    ) external onlyOwner {
        require(tierId < feeTiers.length, "Invalid tier");
        require(discountBps <= MAX_FEE_DISCOUNT, "Discount too high");
        
        feeTiers[tierId].minStake = minStake;
        feeTiers[tierId].discountBps = discountBps;
        
        emit FeeTierUpdated(tierId, minStake, discountBps);
    }
    
    /**
     * @notice Add new fee tier (governance)
     * @param minStake Minimum stake required
     * @param discountBps Discount in basis points
     */
    function addFeeTier(uint256 minStake, uint256 discountBps) external onlyOwner {
        require(discountBps <= MAX_FEE_DISCOUNT, "Discount too high");
        
        feeTiers.push(FeeTier(minStake, discountBps));
        
        emit FeeTierUpdated(feeTiers.length - 1, minStake, discountBps);
    }
    
    /**
     * @notice Emergency withdraw (forfeit rewards)
     * @dev Only use in emergency situations
     */
    function emergencyWithdraw() external nonReentrant {
        StakeInfo storage staker = stakes[msg.sender];
        uint256 amount = staker.amount;
        
        require(amount > 0, "No stake");
        
        // Reset stake info (forfeit rewards)
        staker.amount = 0;
        staker.rewardDebt = 0;
        staker.pendingRewards = 0;
        
        // Update total staked
        totalStaked -= amount;
        
        // Transfer DECA back to user
        decaToken.safeTransfer(msg.sender, amount);
        
        emit EmergencyWithdraw(msg.sender, amount);
    }
    
    /**
     * @notice Pause staking (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause staking
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Internal function to update rewards for a user
     * @param user Address of user
     */
    function _updateRewards(address user) internal {
        StakeInfo storage staker = stakes[user];
        
        if (staker.amount == 0) {
            return;
        }
        
        uint256 pending = ((staker.amount * accRewardPerShare) / PRECISION) - staker.rewardDebt;
        
        if (pending > 0) {
            staker.pendingRewards += pending;
        }
        
        staker.rewardDebt = (staker.amount * accRewardPerShare) / PRECISION;
    }
    
    /**
     * @notice Get total number of fee tiers
     * @return Number of tiers
     */
    function getFeeTierCount() external view returns (uint256) {
        return feeTiers.length;
    }
}
