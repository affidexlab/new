// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MerkleAirdrop
 * @notice Gas-efficient airdrop contract using Merkle tree for DECA token distribution
 * 
 * How it works:
 * 1. Generate Merkle tree off-chain with (address, amount) pairs
 * 2. Deploy contract with Merkle root
 * 3. Users claim their allocation by providing Merkle proof
 * 4. Contract verifies proof and transfers tokens
 * 
 * Benefits:
 * - Minimal on-chain storage (only Merkle root)
 * - Gas-efficient claims (~50K gas per claim vs 200K+ for mapping)
 * - Supports millions of recipients
 * - 90-day claim window (unclaimed tokens returned to treasury)
 * 
 * Airdrop Distribution:
 * - 50M DECA (5% of total supply)
 * - Phase 1: Early traders (30M tokens)
 * - Phase 2: Liquidity providers (10M tokens)
 * - Phase 3: Ambassadors (5M tokens)
 * - Phase 4: Community contributors (5M tokens)
 */
contract MerkleAirdrop is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    // DECA token
    IERC20 public immutable token;
    
    // Merkle root of airdrop distribution
    bytes32 public merkleRoot;
    
    // Claim period
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public constant CLAIM_PERIOD = 90 days;
    
    // Tracking
    mapping(address => uint256) public claimed;
    uint256 public totalClaimed;
    uint256 public totalAllocation;
    
    // Treasury address for unclaimed tokens
    address public treasury;
    
    // Events
    event Claimed(address indexed account, uint256 amount, uint256 timestamp);
    event MerkleRootUpdated(bytes32 oldRoot, bytes32 newRoot);
    event UnclaimedTokensReturned(uint256 amount);
    
    /**
     * @notice Constructor
     * @param _token DECA token address
     * @param _merkleRoot Merkle root of distribution
     * @param _totalAllocation Total tokens allocated for airdrop
     * @param _treasury Treasury address for unclaimed tokens
     */
    constructor(
        address _token,
        bytes32 _merkleRoot,
        uint256 _totalAllocation,
        address _treasury
    ) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token");
        require(_merkleRoot != bytes32(0), "Invalid root");
        require(_treasury != address(0), "Invalid treasury");
        require(_totalAllocation > 0, "Invalid allocation");
        
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
        totalAllocation = _totalAllocation;
        treasury = _treasury;
        startTime = block.timestamp;
        endTime = block.timestamp + CLAIM_PERIOD;
    }
    
    /**
     * @notice Claim airdrop tokens
     * @param amount Amount of tokens to claim
     * @param merkleProof Merkle proof for verification
     */
    function claim(uint256 amount, bytes32[] calldata merkleProof) 
        external 
        nonReentrant 
    {
        require(block.timestamp >= startTime, "Airdrop not started");
        require(block.timestamp <= endTime, "Airdrop ended");
        require(claimed[msg.sender] == 0, "Already claimed");
        require(amount > 0, "Invalid amount");
        
        // Verify Merkle proof
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid proof"
        );
        
        // Mark as claimed
        claimed[msg.sender] = amount;
        totalClaimed += amount;
        
        // Transfer tokens
        token.safeTransfer(msg.sender, amount);
        
        emit Claimed(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Check if address has claimed
     * @param account Address to check
     * @return claimed Whether address has claimed
     * @return amount Amount claimed (0 if not claimed)
     */
    function hasClaimed(address account) external view returns (bool, uint256) {
        uint256 amount = claimed[account];
        return (amount > 0, amount);
    }
    
    /**
     * @notice Verify if a claim is valid (without claiming)
     * @param account Address to verify
     * @param amount Amount to verify
     * @param merkleProof Merkle proof
     * @return valid Whether the claim is valid
     */
    function verifyClaim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external view returns (bool valid) {
        if (claimed[account] > 0) {
            return false; // Already claimed
        }
        
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, amount))));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }
    
    /**
     * @notice Update Merkle root (emergency only, before claims start)
     * @param newRoot New Merkle root
     */
    function updateMerkleRoot(bytes32 newRoot) external onlyOwner {
        require(totalClaimed == 0, "Claims already started");
        require(newRoot != bytes32(0), "Invalid root");
        
        bytes32 oldRoot = merkleRoot;
        merkleRoot = newRoot;
        
        emit MerkleRootUpdated(oldRoot, newRoot);
    }
    
    /**
     * @notice Return unclaimed tokens to treasury after claim period
     */
    function returnUnclaimedTokens() external onlyOwner {
        require(block.timestamp > endTime, "Claim period not ended");
        
        uint256 unclaimedAmount = totalAllocation - totalClaimed;
        require(unclaimedAmount > 0, "No unclaimed tokens");
        
        token.safeTransfer(treasury, unclaimedAmount);
        
        emit UnclaimedTokensReturned(unclaimedAmount);
    }
    
    /**
     * @notice Emergency withdrawal (owner only, before claims start)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(totalClaimed == 0, "Claims already started");
        token.safeTransfer(owner(), amount);
    }
    
    /**
     * @notice Get airdrop statistics
     * @return _totalAllocation Total allocated
     * @return _totalClaimed Total claimed
     * @return _remaining Remaining to be claimed
     * @return _percentClaimed Percentage claimed (in basis points)
     * @return _timeRemaining Seconds remaining in claim period
     */
    function getStats() external view returns (
        uint256 _totalAllocation,
        uint256 _totalClaimed,
        uint256 _remaining,
        uint256 _percentClaimed,
        uint256 _timeRemaining
    ) {
        _totalAllocation = totalAllocation;
        _totalClaimed = totalClaimed;
        _remaining = totalAllocation - totalClaimed;
        _percentClaimed = (totalClaimed * 10000) / totalAllocation; // basis points
        
        if (block.timestamp >= endTime) {
            _timeRemaining = 0;
        } else {
            _timeRemaining = endTime - block.timestamp;
        }
    }
    
    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
    }
}
