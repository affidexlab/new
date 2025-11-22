// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Minimal constant-product AMM pair with fee and TVL cap. For campaigns only.
// Do not use in production without audits.

contract MinimalFactory {
    event PairCreated(address token0, address token1, address pair);
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    address public owner;

    constructor(){ owner = msg.sender; }
    function createPair(address tokenA, address tokenB, uint24 feeBips, uint256 tvlCap) external returns (address pair){
        require(msg.sender == owner, "only owner");
        require(tokenA != tokenB, "identical");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(getPair[token0][token1] == address(0), "exists");
        pair = address(new MinimalPair(token0, token1, feeBips, tvlCap));
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair);
    }
}

contract MinimalPair is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable token0;
    address public immutable token1;
    uint24  public immutable feeBips; // e.g., 30 = 0.3%
    uint256 public immutable tvlCap; // raw sum in USD terms off-chain; here only informational

    uint112 private reserve0;
    uint112 private reserve1;

    event Sync(uint112 r0, uint112 r1);
    event Swap(address sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address to);

    constructor(address _t0, address _t1, uint24 _fee, uint256 _cap){
        token0 = _t0; token1 = _t1; feeBips = _fee; tvlCap = _cap;
    }

    function getReserves() public view returns (uint112, uint112){ return (reserve0, reserve1); }

    function _update(uint bal0, uint bal1) private {
        require(bal0 <= type(uint112).max && bal1 <= type(uint112).max, "reserve overflow");
        reserve0 = uint112(bal0); reserve1 = uint112(bal1); emit Sync(reserve0, reserve1);
    }

    function addLiquidity(uint amount0, uint amount1) external nonReentrant {
        require(amount0 > 0 && amount1 > 0, "amount=0");
        IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
        IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);
        _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)));
    }

    function swap(uint amount0Out, uint amount1Out, address to) external nonReentrant {
        require(amount0Out > 0 || amount1Out > 0, "insufficient");
        (uint112 r0, uint112 r1) = getReserves();
        require(amount0Out < r0 && amount1Out < r1, "liquidity");

        // Record balances before transfer
        uint bal0Before = IERC20(token0).balanceOf(address(this));
        uint bal1Before = IERC20(token1).balanceOf(address(this));

        if(amount0Out > 0) IERC20(token0).safeTransfer(to, amount0Out);
        if(amount1Out > 0) IERC20(token1).safeTransfer(to, amount1Out);

        uint bal0 = IERC20(token0).balanceOf(address(this));
        uint bal1 = IERC20(token1).balanceOf(address(this));

        uint amount0In = bal0 > r0 - amount0Out ? bal0 - (r0 - amount0Out) : 0;
        uint amount1In = bal1 > r1 - amount1Out ? bal1 - (r1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, "insufficient in");

        uint bal0Adj = (bal0 * 10000) - (amount0In * feeBips);
        uint bal1Adj = (bal1 * 10000) - (amount1In * feeBips);
        require(bal0Adj * bal1Adj >= uint(r0) * uint(r1) * 10000**2, "k");

        _update(bal0, bal1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
}
