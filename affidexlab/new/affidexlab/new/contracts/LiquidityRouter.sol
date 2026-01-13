// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function approve(address guy, uint256 wad) external returns (bool);
    function transfer(address dst, uint256 wad) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

interface IUniswapV3Router {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut);
}

interface IAerodromeRouter {
    struct Route {
        address from;
        address to;
        bool stable;
        address factory;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function getAmountsOut(uint256 amountIn, Route[] memory routes) external view returns (uint256[] memory amounts);
}

contract LiquidityRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum RouterType { UNISWAP_V3, AERODROME }

    address public immutable uniswapV3Router;
    address public immutable aerodromeRouter;
    address public immutable WETH;
    address public treasury;
    uint256 public feeRate;

    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        RouterType routerUsed
    );

    event FeeCollected(address indexed token, uint256 amount);
    event TreasuryUpdated(address indexed newTreasury);
    event FeeRateUpdated(uint256 newFeeRate);

    constructor(
        address _uniswapV3Router,
        address _aerodromeRouter,
        address _weth,
        address _treasury,
        uint256 _feeRate
    ) Ownable(msg.sender) {
        require(_uniswapV3Router != address(0), "Invalid Uniswap router");
        require(_weth != address(0), "Invalid WETH address");
        require(_treasury != address(0), "Invalid treasury");
        require(_feeRate <= 10000, "Fee rate too high");

        uniswapV3Router = _uniswapV3Router;
        aerodromeRouter = _aerodromeRouter;
        WETH = _weth;
        treasury = _treasury;
        feeRate = _feeRate;
    }

    function swapExactInputUniswapV3(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be > 0");
        require(deadline >= block.timestamp, "Deadline expired");

        bool isInputETH = msg.value > 0;
        bool isOutputETH = tokenOut == address(0);

        if (isInputETH) {
            require(msg.value == amountIn, "Incorrect ETH amount");
            require(tokenIn == WETH, "Token in must be WETH for ETH swaps");
            
            IWETH(WETH).deposit{value: msg.value}();
        } else {
            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        }

        uint256 feeAmount = (amountIn * feeRate) / 10000;
        uint256 amountInAfterFee = amountIn - feeAmount;

        if (feeAmount > 0) {
            if (isInputETH) {
                IERC20(WETH).safeTransfer(treasury, feeAmount);
                emit FeeCollected(WETH, feeAmount);
            } else {
                IERC20(tokenIn).safeTransfer(treasury, feeAmount);
                emit FeeCollected(tokenIn, feeAmount);
            }
        }

        IERC20(tokenIn).forceApprove(uniswapV3Router, amountInAfterFee);

        address recipient = isOutputETH ? address(this) : msg.sender;
        address actualTokenOut = isOutputETH ? WETH : tokenOut;

        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: actualTokenOut,
            fee: fee,
            recipient: recipient,
            deadline: deadline,
            amountIn: amountInAfterFee,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });

        amountOut = IUniswapV3Router(uniswapV3Router).exactInputSingle(params);

        if (isOutputETH) {
            IWETH(WETH).withdraw(amountOut);
            (bool success, ) = msg.sender.call{value: amountOut}("");
            require(success, "ETH transfer failed");
        }

        emit SwapExecuted(msg.sender, tokenIn, actualTokenOut, amountIn, amountOut, RouterType.UNISWAP_V3);

        return amountOut;
    }

    function swapExactInputUniswapV3MultiHop(
        bytes calldata path,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be > 0");
        require(deadline >= block.timestamp, "Deadline expired");
        require(path.length >= 43, "Invalid path");

        bool isInputETH = msg.value > 0;

        address tokenIn;
        assembly {
            tokenIn := shr(96, calldataload(path.offset))
        }

        if (isInputETH) {
            require(msg.value == amountIn, "Incorrect ETH amount");
            require(tokenIn == WETH, "Token in must be WETH for ETH swaps");
            
            IWETH(WETH).deposit{value: msg.value}();
        } else {
            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        }

        uint256 feeAmount = (amountIn * feeRate) / 10000;
        uint256 amountInAfterFee = amountIn - feeAmount;

        if (feeAmount > 0) {
            IERC20(tokenIn).safeTransfer(treasury, feeAmount);
            emit FeeCollected(tokenIn, feeAmount);
        }

        IERC20(tokenIn).forceApprove(uniswapV3Router, amountInAfterFee);

        IUniswapV3Router.ExactInputParams memory params = IUniswapV3Router.ExactInputParams({
            path: path,
            recipient: msg.sender,
            deadline: deadline,
            amountIn: amountInAfterFee,
            amountOutMinimum: amountOutMinimum
        });

        amountOut = IUniswapV3Router(uniswapV3Router).exactInput(params);

        address tokenOut;
        assembly {
            let pathLength := path.length
            tokenOut := shr(96, calldataload(add(path.offset, sub(pathLength, 20))))
        }

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut, RouterType.UNISWAP_V3);

        return amountOut;
    }

    function swapExactInputAerodrome(
        IAerodromeRouter.Route[] calldata routes,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable nonReentrant returns (uint256[] memory amounts) {
        require(aerodromeRouter != address(0), "Aerodrome not available");
        require(amountIn > 0, "Amount must be > 0");
        require(deadline >= block.timestamp, "Deadline expired");
        require(routes.length > 0, "Empty routes");

        bool isInputETH = msg.value > 0;
        bool isOutputETH = routes[routes.length - 1].to == address(0);

        address tokenIn = routes[0].from;
        address tokenOut = routes[routes.length - 1].to;

        if (isInputETH) {
            require(msg.value == amountIn, "Incorrect ETH amount");
            require(tokenIn == WETH, "Token in must be WETH for ETH swaps");
            
            IWETH(WETH).deposit{value: msg.value}();
        } else {
            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        }

        uint256 feeAmount = (amountIn * feeRate) / 10000;
        uint256 amountInAfterFee = amountIn - feeAmount;

        if (feeAmount > 0) {
            IERC20(tokenIn).safeTransfer(treasury, feeAmount);
            emit FeeCollected(tokenIn, feeAmount);
        }

        IERC20(tokenIn).forceApprove(aerodromeRouter, amountInAfterFee);

        address recipient = isOutputETH ? address(this) : msg.sender;

        amounts = IAerodromeRouter(aerodromeRouter).swapExactTokensForTokens(
            amountInAfterFee,
            amountOutMin,
            routes,
            recipient,
            deadline
        );

        if (isOutputETH) {
            uint256 amountOutFinal = amounts[amounts.length - 1];
            IWETH(WETH).withdraw(amountOutFinal);
            (bool success, ) = msg.sender.call{value: amountOutFinal}("");
            require(success, "ETH transfer failed");
        }

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amounts[amounts.length - 1], RouterType.AERODROME);

        return amounts;
    }

    function getAerodromeQuote(
        IAerodromeRouter.Route[] calldata routes,
        uint256 amountIn
    ) external view returns (uint256[] memory amounts) {
        require(aerodromeRouter != address(0), "Aerodrome not available");
        uint256 amountInAfterFee = amountIn - ((amountIn * feeRate) / 10000);
        return IAerodromeRouter(aerodromeRouter).getAmountsOut(amountInAfterFee, routes);
    }

    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    function updateFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 10000, "Fee rate too high");
        feeRate = _newFeeRate;
        emit FeeRateUpdated(_newFeeRate);
    }

    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    function rescueETH() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {
        require(msg.sender == WETH, "Only WETH contract can send ETH");
    }
}
