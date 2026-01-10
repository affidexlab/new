# DecaFlow Solidity SDK

On-chain MEV protection for Solidity smart contracts.

## Installation

```bash
npm install @decaflow/solidity-sdk
# or
yarn add @decaflow/solidity-sdk
```

## Quick Start

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@decaflow/solidity-sdk/contracts/DecaFlowRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyDeFiProtocol {
    DecaFlowRouter public decaflowRouter;
    
    constructor(address _decaflowRouter) {
        decaflowRouter = DecaFlowRouter(_decaflowRouter);
    }
    
    function swapWithAutoProtection(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external returns (uint256 amountOut) {
        // Approve tokens
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(decaflowRouter), amountIn);
        
        // Execute smart swap with automatic MEV protection
        amountOut = decaflowRouter.smartSwap(
            tokenIn,
            tokenOut,
            amountIn,
            amountOutMin,
            msg.sender,
            block.timestamp + 300 // 5 minute deadline
        );
        
        return amountOut;
    }
}
```

## Features

### Automatic MEV Protection
The `smartSwap` function automatically detects MEV risk and routes through privacy network when needed:
- **Low Risk (<50%)**: Direct swap for gas efficiency
- **High Risk (≥50%)**: Privacy routing to prevent MEV extraction

### Risk Assessment
Check MEV risk before swapping:

```solidity
(uint256 amountOut, bool shouldProtect, uint256 estimatedMEV) = 
    decaflowRouter.getQuoteWithRisk(tokenIn, tokenOut, amountIn);

if (shouldProtect) {
    // Use privacy routing
    decaflowRouter.forceProtectedSwap(...);
} else {
    // Use direct swap
    decaflowRouter.smartSwap(...);
}
```

## Contract Addresses

### Arbitrum (Chain ID: 42161)
- **DecaFlowRouter**: `0x...` (Coming soon)
- **Oracle**: `0x...` (Coming soon)
- **Privacy Router**: `0x...` (Coming soon)

## API Reference

### DecaFlowRouter

#### smartSwap
```solidity
function smartSwap(
    address fromToken,
    address toToken,
    uint256 amountIn,
    uint256 amountOutMin,
    address to,
    uint256 deadline
) external returns (uint256 amountOut)
```
Execute a swap with automatic MEV protection based on risk score.

#### getQuoteWithRisk
```solidity
function getQuoteWithRisk(
    address fromToken,
    address toToken,
    uint256 amountIn
) external view returns (
    uint256 amountOut,
    bool shouldProtect,
    uint256 estimatedMEV
)
```
Get quote with MEV risk assessment.

#### forceProtectedSwap
```solidity
function forceProtectedSwap(
    address fromToken,
    address toToken,
    uint256 amountIn,
    uint256 amountOutMin,
    address to,
    uint256 deadline
) external returns (uint256 amountOut)
```
Force use of privacy protection regardless of risk level.

## Events

```solidity
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
```

## Security

- ✅ ReentrancyGuard protection
- ✅ SafeERC20 for token transfers
- ✅ Owner-controlled parameters
- ✅ Emergency pause functionality
- ✅ Audited by OpenZeppelin contracts

## License

MIT
