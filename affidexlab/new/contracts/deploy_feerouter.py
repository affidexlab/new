#!/usr/bin/env python3
"""
Deploy FeeRouter contract to multiple chains
"""
import os
import sys
import json
from web3 import Web3
from solcx import compile_files

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

# Constructor parameters
CONSTRUCTOR_PARAMS = {
    'treasury': '0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901',  # TREASURY_WALLET
    'max_fee_bps': 100  # 1% maximum
}

def compile_contract():
    """Compile FeeRouter contract from file"""
    print("Compiling FeeRouter contract from file...")
    compiled = compile_files(
        ['FeeRouter.sol'],
        output_values=['abi', 'bin'],
        solc_version='0.8.20'
    )
    # Typical key: 'FeeRouter.sol:FeeRouter'
    key = 'FeeRouter.sol:FeeRouter'
    if key not in compiled:
        key = list(compiled.keys())[0]
    iface = compiled[key]
    return iface['abi'], iface['bin']


def deploy_to_chain(chain_name, chain_config, abi, bytecode, private_key, treasury, max_fee_bps):
    print(f"\n{'='*60}")
    print(f"Deploying to {chain_name.upper()} (Chain ID: {chain_config['chain_id']})")
    print(f"{'='*60}")

    w3 = Web3(Web3.HTTPProvider(chain_config['rpc']))
    if not w3.is_connected():
        print(f"❌ Failed to connect to {chain_name}")
        return None

    account = w3.eth.account.from_key(private_key)
    address = account.address

    balance = w3.eth.get_balance(address)
    print(f"✓ Deployer: {address} | Balance: {w3.from_wei(balance, 'ether'):.6f}")
    if balance == 0:
        print("❌ Insufficient balance")
        return None

    FeeRouter = w3.eth.contract(abi=abi, bytecode=bytecode)

    # Estimate gas
    try:
        gas_estimate = FeeRouter.constructor(treasury, max_fee_bps).estimate_gas({'from': address})
    except Exception as e:
        print(f"Warn: gas estimate failed: {e}")
        gas_estimate = 2_000_000

    gas_price = w3.eth.gas_price

    txn = FeeRouter.constructor(treasury, max_fee_bps).build_transaction({
        'from': address,
        'nonce': w3.eth.get_transaction_count(address),
        'gas': int(gas_estimate * 1.2),
        'gasPrice': gas_price,
        'chainId': chain_config['chain_id']
    })

    signed = w3.eth.account.sign_transaction(txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"✓ Sent: {tx_hash.hex()} | {chain_config['explorer']}/tx/{tx_hash.hex()}")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
    if receipt['status'] != 1:
        print("❌ Deploy failed")
        return None

    addr = receipt['contractAddress']
    print(f"✅ Deployed at: {addr} | {chain_config['explorer']}/address/{addr}")
    return addr


def main():
    print("""
╔══════════════════════════════════════════════════════════╗
║         FeeRouter Multi-Chain Deployment Script          ║
║                                                          ║
║  Constructor:                                            ║
║   - TREASURY    = 0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901        ║
║   - MAX_FEE_BPS = 100 (1%)                                ║
╚══════════════════════════════════════════════════════════╝
    """)

    private_key = os.getenv('DEPLOYER_PRIVATE_KEY')
    if not private_key:
        print("❌ DEPLOYER_PRIVATE_KEY not set")
        sys.exit(1)
    if not private_key.startswith('0x'):
        private_key = '0x' + private_key

    try:
        abi, bytecode = compile_contract()
        print("✅ Compiled\n")
    except Exception as e:
        print(f"❌ Compile error: {e}")
        sys.exit(1)

    treasury = CONSTRUCTOR_PARAMS['treasury']
    max_fee_bps = CONSTRUCTOR_PARAMS['max_fee_bps']

    deployments = {}
    order = ['arbitrum', 'base', 'polygon', 'avalanche', 'optimism']
    for name in order:
        cfg = CHAINS[name]
        addr = deploy_to_chain(name, cfg, abi, bytecode, private_key, treasury, max_fee_bps)
        if addr:
            deployments[cfg['chain_id']] = addr

    if not deployments:
        print("❌ No successful deployments")
        sys.exit(1)

    print("\n=== DEPLOYMENT SUMMARY ===")
    for cid, addr in deployments.items():
        print(f"  {cid}: {addr}")

    with open('deployments.json', 'w') as f:
        json.dump(deployments, f, indent=2)
    print("Saved deployments.json")

if __name__ == '__main__':
    main()
