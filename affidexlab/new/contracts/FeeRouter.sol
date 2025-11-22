// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract FeeRouter {
    event Executed(address indexed user, address sellToken, uint256 grossAmount, uint256 feeAmount, address treasury, address target);

    address public immutable TREASURY;
    uint256 public immutable MAX_FEE_BPS;

    bool private locked;

    constructor(address _treasury, uint256 _maxFeeBps) {
        require(_treasury != address(0), "treasury=0");
        require(_maxFeeBps <= 10000, "maxFeeBps>10000");
        TREASURY = _treasury;
        MAX_FEE_BPS = _maxFeeBps;
        locked = false;
    }

    modifier nonReentrant() {
        require(!locked, "reentrancy");
        locked = true;
        _;
        locked = false;
    }

    function _split(uint256 grossAmount, uint256 feeBps) internal pure returns (uint256 feeAmount, uint256 netAmount) {
        feeAmount = (grossAmount * feeBps) / 10000;
        netAmount = grossAmount - feeAmount;
    }

    function execute0xWithFee(
        address sellToken,
        uint256 grossAmount,
        uint256 feeBps,
        address treasury,
        address allowanceTarget,
        address target,
        bytes calldata data
    ) external nonReentrant {
        require(sellToken != address(0), "sellToken=0");
        require(grossAmount > 0, "grossAmount=0");
        require(allowanceTarget != address(0), "allowanceTarget=0");
        require(target != address(0), "target=0");
        require(treasury == TREASURY, "treasury mismatch");
        require(feeBps <= MAX_FEE_BPS, "feeBps>max");

        (uint256 feeAmount, uint256 netAmount) = _split(grossAmount, feeBps);

        require(IERC20(sellToken).transferFrom(msg.sender, address(this), grossAmount), "transferFrom failed");
        require(IERC20(sellToken).transfer(treasury, feeAmount), "fee transfer failed");

        require(IERC20(sellToken).approve(allowanceTarget, 0), "approve reset failed");
        require(IERC20(sellToken).approve(allowanceTarget, netAmount), "approve failed");

        (bool ok, bytes memory ret) = target.call(data);
        require(ok, string(abi.encodePacked("swap call failed: ", _getRevertMsg(ret))));

        // Cleanup
        require(IERC20(sellToken).approve(allowanceTarget, 0), "final approve reset failed");
        require(IERC20(sellToken).balanceOf(address(this)) == 0, "leftover tokens");

        emit Executed(msg.sender, sellToken, grossAmount, feeAmount, treasury, target);
    }

    function execute0xWithFeeETH(
        uint256 feeBps,
        address payable treasury,
        address target,
        bytes calldata data
    ) external payable nonReentrant {
        require(msg.value > 0, "msg.value=0");
        require(target != address(0), "target=0");
        require(treasury == payable(TREASURY), "treasury mismatch");
        require(feeBps <= MAX_FEE_BPS, "feeBps>max");

        (uint256 feeAmount, uint256 netAmount) = _split(msg.value, feeBps);

        (bool s1, ) = treasury.call{value: feeAmount, gas: 10000}("");
        require(s1, "fee send failed");

        (bool ok, bytes memory ret) = target.call{value: netAmount}(data);
        require(ok, string(abi.encodePacked("swap call failed: ", _getRevertMsg(ret))));

        require(address(this).balance == 0, "leftover eth");

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