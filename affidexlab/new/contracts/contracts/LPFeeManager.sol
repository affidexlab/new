// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    function mint(MintParams calldata params) external payable returns (
        uint256 tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    function increaseLiquidity(IncreaseLiquidityParams calldata params) external payable returns (
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );
}

contract LPFeeManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    address public immutable positionManager;
    address public treasury;
    uint256 public lpFeeRate;

    event LPFeeCollected(address indexed token, uint256 amount, string operation);
    event TreasuryUpdated(address indexed newTreasury);
    event LPFeeRateUpdated(uint256 newFeeRate);
    event LiquidityAdded(address indexed user, uint256 tokenId, uint256 amount0, uint256 amount1);

    constructor(
        address _positionManager,
        address _treasury,
        uint256 _lpFeeRate
    ) Ownable(msg.sender) {
        require(_positionManager != address(0), "Invalid position manager");
        require(_treasury != address(0), "Invalid treasury");
        require(_lpFeeRate <= 1000, "Fee rate too high (max 10%)");

        positionManager = _positionManager;
        treasury = _treasury;
        lpFeeRate = _lpFeeRate;
    }

    function mintWithFee(
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline
    ) external payable nonReentrant returns (
        uint256 tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    ) {
        IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0Desired);
        IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1Desired);

        uint256 fee0 = (amount0Desired * lpFeeRate) / 10000;
        uint256 fee1 = (amount1Desired * lpFeeRate) / 10000;

        uint256 amount0AfterFee = amount0Desired - fee0;
        uint256 amount1AfterFee = amount1Desired - fee1;

        if (fee0 > 0) {
            IERC20(token0).safeTransfer(treasury, fee0);
            emit LPFeeCollected(token0, fee0, "mint");
        }
        if (fee1 > 0) {
            IERC20(token1).safeTransfer(treasury, fee1);
            emit LPFeeCollected(token1, fee1, "mint");
        }

        IERC20(token0).forceApprove(positionManager, amount0AfterFee);
        IERC20(token1).forceApprove(positionManager, amount1AfterFee);

        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: token0,
            token1: token1,
            fee: fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0AfterFee,
            amount1Desired: amount1AfterFee,
            amount0Min: (amount0Min * (10000 - lpFeeRate)) / 10000,
            amount1Min: (amount1Min * (10000 - lpFeeRate)) / 10000,
            recipient: msg.sender,
            deadline: deadline
        });

        (tokenId, liquidity, amount0, amount1) = INonfungiblePositionManager(positionManager).mint(params);

        if (IERC20(token0).balanceOf(address(this)) > 0) {
            IERC20(token0).safeTransfer(msg.sender, IERC20(token0).balanceOf(address(this)));
        }
        if (IERC20(token1).balanceOf(address(this)) > 0) {
            IERC20(token1).safeTransfer(msg.sender, IERC20(token1).balanceOf(address(this)));
        }

        emit LiquidityAdded(msg.sender, tokenId, amount0, amount1);

        return (tokenId, liquidity, amount0, amount1);
    }

    function increaseLiquidityWithFee(
        uint256 tokenId,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline,
        address token0,
        address token1
    ) external payable nonReentrant returns (
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    ) {
        IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0Desired);
        IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1Desired);

        uint256 fee0 = (amount0Desired * lpFeeRate) / 10000;
        uint256 fee1 = (amount1Desired * lpFeeRate) / 10000;

        uint256 amount0AfterFee = amount0Desired - fee0;
        uint256 amount1AfterFee = amount1Desired - fee1;

        if (fee0 > 0) {
            IERC20(token0).safeTransfer(treasury, fee0);
            emit LPFeeCollected(token0, fee0, "increase");
        }
        if (fee1 > 0) {
            IERC20(token1).safeTransfer(treasury, fee1);
            emit LPFeeCollected(token1, fee1, "increase");
        }

        IERC20(token0).forceApprove(positionManager, amount0AfterFee);
        IERC20(token1).forceApprove(positionManager, amount1AfterFee);

        INonfungiblePositionManager.IncreaseLiquidityParams memory params = INonfungiblePositionManager.IncreaseLiquidityParams({
            tokenId: tokenId,
            amount0Desired: amount0AfterFee,
            amount1Desired: amount1AfterFee,
            amount0Min: (amount0Min * (10000 - lpFeeRate)) / 10000,
            amount1Min: (amount1Min * (10000 - lpFeeRate)) / 10000,
            deadline: deadline
        });

        (liquidity, amount0, amount1) = INonfungiblePositionManager(positionManager).increaseLiquidity(params);

        if (IERC20(token0).balanceOf(address(this)) > 0) {
            IERC20(token0).safeTransfer(msg.sender, IERC20(token0).balanceOf(address(this)));
        }
        if (IERC20(token1).balanceOf(address(this)) > 0) {
            IERC20(token1).safeTransfer(msg.sender, IERC20(token1).balanceOf(address(this)));
        }

        return (liquidity, amount0, amount1);
    }

    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    function updateLPFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 1000, "Fee rate too high (max 10%)");
        lpFeeRate = _newFeeRate;
        emit LPFeeRateUpdated(_newFeeRate);
    }

    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    function rescueETH() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {}
}
