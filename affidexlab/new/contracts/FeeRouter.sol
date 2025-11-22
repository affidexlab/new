// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FeeRouter is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    event Executed(address indexed user, address sellToken, uint256 grossAmount, uint256 feeAmount, address treasury, address target);

    mapping(address => bool) public whitelistedTargets; // e.g., 0x Exchange Proxy

    constructor() Ownable(msg.sender) {}

    function setWhitelistedTarget(address target, bool allowed) external onlyOwner {
        whitelistedTargets[target] = allowed;
    }

    function _split(uint256 grossAmount, uint256 feeBps) internal pure returns (uint256 feeAmount, uint256 netAmount) {
        feeAmount = (grossAmount * feeBps) / 10000;
        netAmount = grossAmount - feeAmount;
    }

    // ERC20 path: user approves Router for grossAmount. Router pulls tokens, takes fee, approves allowanceTarget for net, and calls 0x target.
    function execute0xWithFee(
        address sellToken,
        uint256 grossAmount,
        uint256 feeBps,
        address treasury,
        address allowanceTarget,
        address target,
        bytes calldata data
    ) external nonReentrant whenNotPaused {
        require(sellToken != address(0), "sellToken=0");
        require(treasury != address(0), "treasury=0");
        require(allowanceTarget != address(0), "allowanceTarget=0");
        require(target != address(0), "target=0");
        require(feeBps <= 10000, "feeBps>100%");
        require(grossAmount > 0, "amount=0");
        require(whitelistedTargets[target], "target not whitelisted");

        (uint256 feeAmount, uint256 netAmount) = _split(grossAmount, feeBps);

        IERC20(sellToken).safeTransferFrom(msg.sender, address(this), grossAmount);
        IERC20(sellToken).safeTransfer(treasury, feeAmount);

        IERC20(sellToken).forceApprove(allowanceTarget, netAmount);

        (bool ok, bytes memory ret) = target.call(data);
        require(ok, string(abi.encodePacked("swap call failed: ", _getRevertMsg(ret))));

        emit Executed(msg.sender, sellToken, grossAmount, feeAmount, treasury, target);
    }

    // ETH path: msg.value = grossAmount. Router takes fee, forwards net value to 0x target.
    function execute0xWithFeeETH(
        uint256 feeBps,
        address payable treasury,
        address target,
        bytes calldata data
    ) external payable nonReentrant whenNotPaused {
        require(treasury != address(0), "treasury=0");
        require(target != address(0), "target=0");
        require(whitelistedTargets[target], "target not whitelisted");
        require(feeBps <= 10000, "feeBps>100%");
        require(msg.value > 0, "amount=0");

        (uint256 feeAmount, uint256 netAmount) = _split(msg.value, feeBps);

        (bool s1, ) = treasury.call{value: feeAmount}("");
        require(s1, "fee send failed");

        (bool ok, bytes memory ret) = target.call{value: netAmount}(data);
        require(ok, string(abi.encodePacked("swap call failed: ", _getRevertMsg(ret))));

        emit Executed(msg.sender, address(0), msg.value, feeAmount, treasury, target);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function emergencyWithdraw(address token, address to) external onlyOwner whenPaused {
        require(to != address(0), "to=0");
        if (token == address(0)) {
            (bool s, ) = payable(to).call{value: address(this).balance}("");
            require(s, "withdraw failed");
        } else {
            IERC20 erc = IERC20(token);
            erc.safeTransfer(to, erc.balanceOf(address(this)));
        }
    }

    function _getRevertMsg(bytes memory _returnData) private pure returns (string memory) {
        if (_returnData.length < 68) return "";
        assembly {
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string));
    }

    receive() external payable {}
}
