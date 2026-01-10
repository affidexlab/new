# DecaFlow Python SDK

Official Python SDK for integrating privacy-protected swaps into your Python applications, data science workflows, and backend services.

## Installation

```bash
pip install decaflow
```

## Quick Start

```python
from decaflow import PrivacyClient
from web3 import Web3

# Initialize client
client = PrivacyClient(
    network='arbitrum',
    api_key='your_api_key'  # Optional
)

# Connect wallet
w3 = Web3(Web3.HTTPProvider('https://arb1.arbitrum.io/rpc'))
account = w3.eth.account.from_key('your_private_key')

# Get privacy-protected swap quote
quote = await client.get_swap_quote(
    from_address=account.address,
    token_in='0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',  # WETH
    token_out='0xaf88d065e77c8cC2239327C5EDb3A432268e5831',  # USDC
    amount='1000000000000000000',  # 1 WETH
    slippage=0.5,
    enable_mev_protection=True
)

print(f"Output: {quote.output_amount}")
print(f"MEV Risk: {quote.mev_risk_score}/10")
print(f"Estimated MEV Saved: ${quote.mev_savings_usd}")

# Execute swap
execution = await client.execute_swap(quote, account)
print(f"Transaction: {execution.transaction_hash}")
```

## Features

- 🔒 MEV Protection: Automatic routing through privacy-preserving execution layers
- 🤖 AI Risk Scoring: Real-time MEV risk assessment  
- ⚡ Async/Await: Native asyncio support for high-performance applications
- 📊 Analytics: Track MEV saved and execution performance
- 🔗 Multi-Chain: Arbitrum, Ethereum, Base, Optimism, Polygon, Avalanche

## Documentation

Full documentation available at: https://docs.decaflow.io/sdk/python

## License

MIT License
