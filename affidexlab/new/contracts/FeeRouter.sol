// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract FeeRouter {
    event Executed(address indexed user, address sellToken, uint256 grossAmount, uint256 feeAmount, address treasury, address target);

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
    ) external {
        require(sellToken != address(0), "sellToken=0");
        require(treasury != address(0), "treasury=0");
        (uint256 feeAmount, uint256 netAmount) = _split(grossAmount, feeBps);

        // Pull gross from user
        require(IERC20(sellToken).transferFrom(msg.sender, address(this), grossAmount), "transferFrom failed");
        // Send fee to treasury
        require(IERC20(sellToken).transfer(treasury, feeAmount), "fee transfer failed");
        // Approve allowanceTarget for net
        require(IERC20(sellToken).approve(allowanceTarget, 0), "approve reset failed");
        require(IERC20(sellToken).approve(allowanceTarget, netAmount), "approve failed");

        // Call 0x target with data (no ETH value)
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
    ) external payable {
        require(treasury != address(0), "treasury=0");
        (uint256 feeAmount, uint256 netAmount) = _split(msg.value, feeBps);

        // Send fee
        (bool s1, ) = treasury.call{value: feeAmount}("");
        require(s1, "fee send failed");

        // Call 0x target forwarding net ETH
        (bool ok, bytes memory ret) = target.call{value: netAmount}(data);
        require(ok, string(abi.encodePacked("swap call failed: ", _getRevertMsg(ret))));

        emit Executed(msg.sender, address(0), msg.value, feeAmount, treasury, target);
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