// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract MockSemaphore is ISemaphore {
    uint256 public groupCounter;

    function createGroup() external returns (uint256) {
        return ++groupCounter;
    }

    function createGroup(address) external returns (uint256) {
        return ++groupCounter;
    }

    function createGroup(address, uint256) external returns (uint256) {
        return ++groupCounter;
    }

    function updateGroupAdmin(uint256, address) external {}
    function acceptGroupAdmin(uint256) external {}
    function updateGroupMerkleTreeDuration(uint256, uint256) external {}
    function addMember(uint256, uint256) external {}
    function addMembers(uint256, uint256[] calldata) external {}
    function updateMember(uint256, uint256, uint256, uint256[] calldata) external {}
    function removeMember(uint256, uint256, uint256[] calldata) external {}

    function validateProof(uint256, SemaphoreProof calldata) external pure {
        revert Semaphore__InvalidProof();
    }

    function verifyProof(uint256, SemaphoreProof calldata) external pure returns (bool) {
        return false;
    }
}
