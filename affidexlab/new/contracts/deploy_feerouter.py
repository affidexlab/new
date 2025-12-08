#!/usr/bin/env python3
"""
Deploy FeeRouter contract to multiple chains
"""
import os
import sys
import json
from web3 import Web3
from solcx import compile_source

# Contract source
contract_source = '''
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
'''

# Chain configurations
CHAINS = {
    'arbitrum': {
        'chain_id': 42161,
        'rpc': 'https://arb1.arbitrum.io/rpc',
        'explorer': 'https://arbiscan.io'
    },
    'base': {
        'chain_id': 8453,
        'rpc': 'https://mainnet.base.org',
        'explorer': 'https://basescan.org'
    },
    'optimism': {
        'chain_id': 10,
        'rpc': 'https://mainnet.optimism.io',
        'explorer': 'https://optimistic.etherscan.io'
    },
    'polygon': {
        'chain_id': 137,
        'rpc': 'https://polygon-rpc.com',
        'explorer': 'https://polygonscan.com'
    },
    'avalanche': {
        'chain_id': 43114,
        'rpc': 'https://api.avax.network/ext/bc/C/rpc',
        'explorer': 'https://snowtrace.io'
    }
}

def compile_contract():
    """Compile FeeRouter contract"""
    print("Compiling FeeRouter contract...")
    compiled = compile_source(
        contract_source,
        output_values=['abi', 'bin'],
        solc_version='0.8.20'
    )
    
    contract_id, contract_interface = compiled.popitem()
    return contract_interface['abi'], contract_interface['bin']

def deploy_to_chain(chain_name, chain_config, abi, bytecode, private_key):
    """Deploy FeeRouter to a specific chain"""
    print(f"\n{'='*60}")
    print(f"Deploying to {chain_name.upper()} (Chain ID: {chain_config['chain_id']})")
    print(f"{'='*60}")
    
    # Connect to chain
    w3 = Web3(Web3.HTTPProvider(chain_config['rpc']))
    
    if not w3.is_connected():
        print(f"❌ Failed to connect to {chain_name}")
        return None
    
    print(f"✓ Connected to {chain_name}")
    
    # Setup account
    account = w3.eth.account.from_key(private_key)
    address = account.address
    
    balance = w3.eth.get_balance(address)
    balance_eth = w3.from_wei(balance, 'ether')
    print(f"✓ Deployer address: {address}")
    print(f"✓ Balance: {balance_eth:.6f} native tokens")
    
    if balance == 0:
        print(f"❌ Insufficient balance for deployment")
        return None
    
    # Get nonce
    nonce = w3.eth.get_transaction_count(address)
    
    # Create contract
    FeeRouter = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Build transaction
    print("Building deployment transaction...")
    
    # Estimate gas
    try:
        gas_estimate = FeeRouter.constructor().estimate_gas({'from': address})
        print(f"✓ Estimated gas: {gas_estimate}")
    except Exception as e:
        print(f"Warning: Could not estimate gas: {e}")
        gas_estimate = 2000000  # fallback
    
    # Get gas price
    try:
        gas_price = w3.eth.gas_price
        print(f"✓ Gas price: {w3.from_wei(gas_price, 'gwei'):.2f} gwei")
    except Exception as e:
        print(f"Warning: Could not fetch gas price: {e}")
        gas_price = w3.to_wei(50, 'gwei')  # fallback
    
    # Build transaction
    transaction = FeeRouter.constructor().build_transaction({
        'from': address,
        'nonce': nonce,
        'gas': int(gas_estimate * 1.2),  # Add 20% buffer
        'gasPrice': gas_price,
        'chainId': chain_config['chain_id']
    })
    
    # Sign transaction
    print("Signing transaction...")
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    # Send transaction
    print("Sending transaction...")
    try:
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"✓ Transaction sent: {tx_hash.hex()}")
        print(f"  View on explorer: {chain_config['explorer']}/tx/{tx_hash.hex()}")
        
        # Wait for receipt
        print("Waiting for confirmation...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
        
        if receipt['status'] == 1:
            contract_address = receipt['contractAddress']
            print(f"✅ SUCCESS! FeeRouter deployed at: {contract_address}")
            print(f"   View on explorer: {chain_config['explorer']}/address/{contract_address}")
            
            # Calculate gas cost
            gas_used = receipt['gasUsed']
            gas_cost_wei = gas_used * gas_price
            gas_cost_native = w3.from_wei(gas_cost_wei, 'ether')
            print(f"   Gas used: {gas_used}")
            print(f"   Cost: {gas_cost_native:.6f} native tokens")
            
            return contract_address
        else:
            print(f"❌ Transaction failed")
            return None
            
    except Exception as e:
        print(f"❌ Error during deployment: {e}")
        return None

def main():
    """Main deployment function"""
    print("""
╔══════════════════════════════════════════════════════════╗
║         FeeRouter Multi-Chain Deployment Script          ║
║                                                          ║
║  Target chains: Arbitrum, Base, Optimism,                ║
║                 Polygon, Avalanche                       ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    # Get private key from environment
    private_key = os.getenv('DEPLOYER_PRIVATE_KEY')
    
    if not private_key:
        print("❌ Error: DEPLOYER_PRIVATE_KEY environment variable not set")
        print("\nUsage:")
        print("  export DEPLOYER_PRIVATE_KEY=0x...")
        print("  python3 deploy_feerouter.py")
        sys.exit(1)
    
    # Ensure private key has 0x prefix
    if not private_key.startswith('0x'):
        private_key = '0x' + private_key
    
    # Compile contract
    try:
        abi, bytecode = compile_contract()
        print("✅ Contract compiled successfully\n")
    except Exception as e:
        print(f"❌ Error compiling contract: {e}")
        sys.exit(1)
    
    # Deploy to all chains
    deployments = {}
    
    for chain_name, chain_config in CHAINS.items():
        try:
            address = deploy_to_chain(chain_name, chain_config, abi, bytecode, private_key)
            if address:
                deployments[chain_config['chain_id']] = address
        except Exception as e:
            print(f"❌ Unexpected error deploying to {chain_name}: {e}")
            continue
    
    # Summary
    print(f"\n{'='*60}")
    print("DEPLOYMENT SUMMARY")
    print(f"{'='*60}\n")
    
    if not deployments:
        print("❌ No successful deployments")
        sys.exit(1)
    
    print(f"✅ Successfully deployed to {len(deployments)} chain(s):\n")
    
    for chain_id, address in deployments.items():
        chain_name = next(name for name, config in CHAINS.items() if config['chain_id'] == chain_id)
        print(f"  {chain_name.upper():<12} ({chain_id}): {address}")
    
    # Generate TypeScript constants
    print(f"\n{'='*60}")
    print("CONSTANTS.TS UPDATE")
    print(f"{'='*60}\n")
    
    print("Add these addresses to app/src/lib/constants.ts:\n")
    print("export const ROUTER_ADDRESSES: Partial<Record<number, `0x${string}`>> = {")
    for chain_id, address in sorted(deployments.items()):
        chain_name = next(name for name, config in CHAINS.items() if config['chain_id'] == chain_id)
        print(f'  {chain_id}: "{address}", // {chain_name.capitalize()}')
    print("};")
    
    # Save to file
    output_file = 'deployments.json'
    with open(output_file, 'w') as f:
        json.dump(deployments, f, indent=2)
    print(f"\n✅ Deployment addresses saved to {output_file}")

if __name__ == '__main__':
    main()
