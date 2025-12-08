// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DecaFlowToken.sol";
import "@openzeppelin/contracts/governance/utils/Votes.sol";

/**
 * @title DecaFlowTokenWithVotes
 * @notice DECA token with built-in voting power tracking for governance
 * 
 * Extends DecaFlowToken with:
 * - ERC20Votes: Snapshot-based voting power
 * - Checkpoints: Historical balance tracking
 * - Delegation: Users can delegate voting power
 */
contract DecaFlowTokenWithVotes is DecaFlowToken, Votes {
    
    /**
     * @notice Constructor
     */
    constructor() DecaFlowToken() {}
    
    // The functions below are overrides required by Solidity
    
    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, Votes)
    {
        super._update(from, to, amount);
    }
    
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
