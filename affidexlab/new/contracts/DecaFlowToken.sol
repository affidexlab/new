// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DecaFlowToken
 * @notice The native governance and utility token for DecaFlow protocol
 * 
 * Token Details:
 * - Name: DecaFlow Token
 * - Symbol: DECA
 * - Total Supply: 1,000,000,000 (1 billion)
 * - Decimals: 18
 * - Chain: Arbitrum (with multichain bridging capability)
 * 
 * Features:
 * - Standard ERC-20 functionality
 * - Burnable (deflationary mechanism)
 * - ERC-20 Permit (gasless approvals via signatures)
 * - Ownable (for initial distribution, then renounced)
 * 
 * Distribution (via separate contracts):
 * - 30% (300M) - Community & Airdrops
 * - 20% (200M) - Team & Advisors
 * - 15% (150M) - Seed Investors
 * - 10% (100M) - Partners & Ambassadors
 * - 15% (150M) - Treasury & DAO
 * - 10% (100M) - Liquidity Provisions
 */
contract DecaFlowToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    
    // Total supply: 1 billion tokens (with 18 decimals)
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Allocation addresses (set during deployment)
    address public communityAllocation;      // 300M (30%)
    address public teamAllocation;           // 200M (20%)
    address public investorAllocation;       // 150M (15%)
    address public partnerAllocation;        // 100M (10%)
    address public treasuryAllocation;       // 150M (15%)
    address public liquidityAllocation;      // 100M (10%)
    
    // Events
    event TokensAllocated(address indexed recipient, uint256 amount, string allocationType);
    event OwnershipTransferredToDAO(address indexed daoAddress);
    
    /**
     * @notice Constructor - Deploys token and mints total supply to deployer
     * @dev Tokens will be distributed to allocation contracts after deployment
     */
    constructor() 
        ERC20("DecaFlow Token", "DECA") 
        ERC20Permit("DecaFlow Token")
        Ownable(msg.sender)
    {
        // Mint entire supply to deployer for initial distribution
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @notice Distribute tokens to allocation contracts
     * @dev Can only be called once by owner to set up initial distribution
     * @param _community Community & Airdrops contract address
     * @param _team Team & Advisors vesting contract address
     * @param _investor Seed Investors vesting contract address
     * @param _partner Partners & Ambassadors contract address
     * @param _treasury Treasury & DAO multisig address
     * @param _liquidity Liquidity provision address (DEX pools)
     */
    function distributeAllocations(
        address _community,
        address _team,
        address _investor,
        address _partner,
        address _treasury,
        address _liquidity
    ) external onlyOwner {
        require(communityAllocation == address(0), "Already distributed");
        require(_community != address(0), "Invalid community address");
        require(_team != address(0), "Invalid team address");
        require(_investor != address(0), "Invalid investor address");
        require(_partner != address(0), "Invalid partner address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_liquidity != address(0), "Invalid liquidity address");
        
        // Store allocation addresses
        communityAllocation = _community;
        teamAllocation = _team;
        investorAllocation = _investor;
        partnerAllocation = _partner;
        treasuryAllocation = _treasury;
        liquidityAllocation = _liquidity;
        
        // Transfer tokens to each allocation
        uint256 communityAmount = (TOTAL_SUPPLY * 30) / 100;  // 300M
        uint256 teamAmount = (TOTAL_SUPPLY * 20) / 100;       // 200M
        uint256 investorAmount = (TOTAL_SUPPLY * 15) / 100;   // 150M
        uint256 partnerAmount = (TOTAL_SUPPLY * 10) / 100;    // 100M
        uint256 treasuryAmount = (TOTAL_SUPPLY * 15) / 100;   // 150M
        uint256 liquidityAmount = (TOTAL_SUPPLY * 10) / 100;  // 100M
        
        _transfer(msg.sender, _community, communityAmount);
        _transfer(msg.sender, _team, teamAmount);
        _transfer(msg.sender, _investor, investorAmount);
        _transfer(msg.sender, _partner, partnerAmount);
        _transfer(msg.sender, _treasury, treasuryAmount);
        _transfer(msg.sender, _liquidity, liquidityAmount);
        
        emit TokensAllocated(_community, communityAmount, "Community");
        emit TokensAllocated(_team, teamAmount, "Team");
        emit TokensAllocated(_investor, investorAmount, "Investors");
        emit TokensAllocated(_partner, partnerAmount, "Partners");
        emit TokensAllocated(_treasury, treasuryAmount, "Treasury");
        emit TokensAllocated(_liquidity, liquidityAmount, "Liquidity");
    }
    
    /**
     * @notice Transfer ownership to DAO governance contract
     * @dev Should be called after all initial distributions are complete
     * @param daoGovernance Address of the DAO governance contract
     */
    function transferToDAO(address daoGovernance) external onlyOwner {
        require(daoGovernance != address(0), "Invalid DAO address");
        require(communityAllocation != address(0), "Distributions not complete");
        
        emit OwnershipTransferredToDAO(daoGovernance);
        transferOwnership(daoGovernance);
    }
    
    /**
     * @notice Renounce ownership completely (makes contract fully decentralized)
     * @dev Should only be called after DAO is fully operational
     */
    function renounceOwnershipPermanently() external onlyOwner {
        require(communityAllocation != address(0), "Distributions not complete");
        renounceOwnership();
    }
    
    /**
     * @notice Get token decimals
     * @return Number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
