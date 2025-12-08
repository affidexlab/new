// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenVesting
 * @notice Vesting contract for DECA tokens with cliff and linear vesting
 * 
 * Supports multiple vesting schedules:
 * - Team & Advisors: 12-month cliff, 36-month linear vest
 * - Seed Investors: 6-month cliff, 24-month linear vest
 * - Partners & Ambassadors: 6-month cliff, 24-month linear vest
 * 
 * Features:
 * - Multiple beneficiaries with individual schedules
 * - Cliff period (no tokens released until cliff ends)
 * - Linear vesting (tokens released proportionally over time)
 * - Revocable vesting (can be cancelled by owner if needed)
 * - Batch operations for gas efficiency
 */
contract TokenVesting is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    // Vesting schedule for each beneficiary
    struct VestingSchedule {
        uint256 totalAmount;          // Total tokens to be vested
        uint256 releasedAmount;       // Tokens already released
        uint256 startTime;            // Vesting start timestamp
        uint256 cliffDuration;        // Cliff period in seconds
        uint256 vestingDuration;      // Total vesting period in seconds (after cliff)
        bool revocable;               // Can vesting be cancelled?
        bool revoked;                 // Has vesting been revoked?
    }
    
    // Token to vest
    IERC20 public immutable token;
    
    // Beneficiary => VestingSchedule
    mapping(address => VestingSchedule) public vestingSchedules;
    
    // List of all beneficiaries
    address[] public beneficiaries;
    
    // Total tokens locked in vesting
    uint256 public totalVested;
    uint256 public totalReleased;
    
    // Events
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 unvestedAmount);
    
    /**
     * @notice Constructor
     * @param _token Address of DECA token
     */
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }
    
    /**
     * @notice Create vesting schedule for beneficiary
     * @param beneficiary Address of beneficiary
     * @param amount Total amount of tokens to vest
     * @param startTime Vesting start timestamp (usually now or TGE)
     * @param cliffDuration Cliff duration in seconds
     * @param vestingDuration Total vesting duration in seconds (after cliff)
     * @param revocable Whether vesting can be cancelled
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule exists");
        require(vestingDuration > 0, "Duration must be > 0");
        
        // Create vesting schedule
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            revocable: revocable,
            revoked: false
        });
        
        beneficiaries.push(beneficiary);
        totalVested += amount;
        
        // Transfer tokens to this contract
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        emit VestingScheduleCreated(
            beneficiary,
            amount,
            startTime,
            cliffDuration,
            vestingDuration,
            revocable
        );
    }
    
    /**
     * @notice Create multiple vesting schedules in one transaction
     * @param _beneficiaries Array of beneficiary addresses
     * @param _amounts Array of token amounts
     * @param _startTime Vesting start timestamp (same for all)
     * @param _cliffDuration Cliff duration in seconds (same for all)
     * @param _vestingDuration Vesting duration in seconds (same for all)
     * @param _revocable Whether vesting can be cancelled (same for all)
     */
    function batchCreateVestingSchedules(
        address[] calldata _beneficiaries,
        uint256[] calldata _amounts,
        uint256 _startTime,
        uint256 _cliffDuration,
        uint256 _vestingDuration,
        bool _revocable
    ) external onlyOwner {
        require(_beneficiaries.length == _amounts.length, "Length mismatch");
        require(_beneficiaries.length > 0, "Empty arrays");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            address beneficiary = _beneficiaries[i];
            uint256 amount = _amounts[i];
            
            require(beneficiary != address(0), "Invalid beneficiary");
            require(amount > 0, "Amount must be > 0");
            require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule exists");
            
            vestingSchedules[beneficiary] = VestingSchedule({
                totalAmount: amount,
                releasedAmount: 0,
                startTime: _startTime,
                cliffDuration: _cliffDuration,
                vestingDuration: _vestingDuration,
                revocable: _revocable,
                revoked: false
            });
            
            beneficiaries.push(beneficiary);
            totalAmount += amount;
            
            emit VestingScheduleCreated(
                beneficiary,
                amount,
                _startTime,
                _cliffDuration,
                _vestingDuration,
                _revocable
            );
        }
        
        totalVested += totalAmount;
        
        // Transfer all tokens in one transaction
        token.safeTransferFrom(msg.sender, address(this), totalAmount);
    }
    
    /**
     * @notice Release vested tokens to beneficiary
     */
    function release() external nonReentrant {
        _release(msg.sender);
    }
    
    /**
     * @notice Release vested tokens for specific beneficiary (anyone can call)
     * @param beneficiary Address of beneficiary
     */
    function releaseFor(address beneficiary) external nonReentrant {
        _release(beneficiary);
    }
    
    /**
     * @notice Calculate releasable amount for beneficiary
     * @param beneficiary Address of beneficiary
     * @return Amount of tokens that can be released
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        if (schedule.revoked) {
            return 0;
        }
        
        return _vestedAmount(schedule) - schedule.releasedAmount;
    }
    
    /**
     * @notice Calculate total vested amount for beneficiary (including released)
     * @param beneficiary Address of beneficiary
     * @return Total vested amount
     */
    function vestedAmount(address beneficiary) external view returns (uint256) {
        return _vestedAmount(vestingSchedules[beneficiary]);
    }
    
    /**
     * @notice Get vesting schedule for beneficiary
     * @param beneficiary Address of beneficiary
     * @return schedule VestingSchedule struct
     */
    function getVestingSchedule(address beneficiary) 
        external 
        view 
        returns (VestingSchedule memory schedule) 
    {
        return vestingSchedules[beneficiary];
    }
    
    /**
     * @notice Get all beneficiaries
     * @return Array of beneficiary addresses
     */
    function getAllBeneficiaries() external view returns (address[] memory) {
        return beneficiaries;
    }
    
    /**
     * @notice Revoke vesting schedule (if revocable)
     * @param beneficiary Address of beneficiary
     */
    function revoke(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        require(schedule.totalAmount > 0, "No schedule");
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");
        
        // Release vested tokens first
        uint256 vested = _vestedAmount(schedule);
        uint256 toRelease = vested - schedule.releasedAmount;
        
        if (toRelease > 0) {
            schedule.releasedAmount += toRelease;
            totalReleased += toRelease;
            token.safeTransfer(beneficiary, toRelease);
            emit TokensReleased(beneficiary, toRelease);
        }
        
        // Revoke unvested tokens
        uint256 unvested = schedule.totalAmount - vested;
        schedule.revoked = true;
        
        if (unvested > 0) {
            // Return unvested tokens to owner
            token.safeTransfer(owner(), unvested);
            emit VestingRevoked(beneficiary, unvested);
        }
    }
    
    /**
     * @notice Internal function to release vested tokens
     * @param beneficiary Address of beneficiary
     */
    function _release(address beneficiary) internal {
        uint256 amount = releasableAmount(beneficiary);
        require(amount > 0, "No tokens to release");
        
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        schedule.releasedAmount += amount;
        totalReleased += amount;
        
        token.safeTransfer(beneficiary, amount);
        
        emit TokensReleased(beneficiary, amount);
    }
    
    /**
     * @notice Calculate vested amount based on schedule
     * @param schedule VestingSchedule struct
     * @return Vested amount
     */
    function _vestedAmount(VestingSchedule memory schedule) internal view returns (uint256) {
        if (schedule.totalAmount == 0) {
            return 0;
        }
        
        // If before cliff, nothing is vested
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        // If after vesting period, everything is vested
        if (block.timestamp >= schedule.startTime + schedule.cliffDuration + schedule.vestingDuration) {
            return schedule.totalAmount;
        }
        
        // Calculate linear vesting
        uint256 timeFromCliff = block.timestamp - (schedule.startTime + schedule.cliffDuration);
        uint256 vestedAmount = (schedule.totalAmount * timeFromCliff) / schedule.vestingDuration;
        
        return vestedAmount;
    }
}
