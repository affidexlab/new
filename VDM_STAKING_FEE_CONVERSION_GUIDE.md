# VDM Staking Fee Conversion Guide

## Overview
The VDM staking system collects fees in VDM tokens but needs to convert them to SOL before sending to the treasury wallet.

## Wallet Configuration

### Custodial Wallet (Holds Staked VDM)
```
EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR
```
This wallet holds all staked VDM tokens from users during the lock period.

### Treasury Wallet (Receives Fees in SOL)
```
3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
```
This wallet receives all fees (deposit and withdrawal) in SOL after conversion from VDM.

## Fee Structure
- **Deposit Fee**: 2.5% (250 basis points) - charged in VDM when user stakes
- **Withdrawal Fee**: 1.5% (150 basis points) - charged in VDM when user claims

## Fee Conversion Process

### Automatic Tracking
All fees are automatically tracked in the database with the `solana_staking_fees` table:
- `fee_type`: 'deposit' or 'withdrawal'
- `recipient`: Treasury wallet address (3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk)
- `amount`: Amount in VDM tokens
- `timestamp`: When the fee was collected

### API Endpoints for Fee Management

#### Get Pending Fee Conversions
```
GET /v1/solana-staking/admin/fee-conversions
```
Returns aggregated fees that need to be converted from VDM to SOL:
```json
{
  "success": true,
  "data": [
    {
      "feeType": "deposit",
      "recipient": "3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk",
      "totalVdmAmount": 1250.5,
      "totalUsdtValue": 125.05,
      "feeCount": 50,
      "earliestFee": 1704067200000,
      "latestFee": 1704153600000,
      "conversionNote": "These VDM fees should be converted to SOL and sent to treasury wallet",
      "treasuryWallet": "3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk",
      "custodyWallet": "EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR"
    }
  ]
}
```

#### Get Wallet Addresses
```
GET /v1/solana-staking/admin/wallet-addresses
```
Returns the configured wallet addresses:
```json
{
  "success": true,
  "data": {
    "vdmTokenAddress": "B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5",
    "custodyWallet": "EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR",
    "treasuryWallet": "3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk",
    "note": "VDM fees collected in custody wallet should be converted to SOL and sent to treasury wallet"
  }
}
```

## Manual Fee Conversion Steps

### 1. Check Pending Fees
Call the `/v1/solana-staking/admin/fee-conversions` endpoint to see how much VDM needs to be converted.

### 2. Convert VDM to SOL
Use a Solana DEX aggregator like Jupiter or Raydium to swap VDM tokens to SOL:

**Using Jupiter (Recommended)**:
1. Go to https://jup.ag/
2. Connect the custodial wallet: `EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR`
3. Enter the VDM amount from step 1
4. Swap VDM → SOL
5. Confirm the transaction

**Using Raydium**:
1. Go to https://raydium.io/swap/
2. Connect the custodial wallet
3. Swap VDM → SOL
4. Confirm the transaction

### 3. Transfer SOL to Treasury
After conversion, send the SOL to the treasury wallet:
```
3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
```

### 4. Record the Conversion
Keep a record of:
- Amount of VDM converted
- Amount of SOL received
- Transaction signature
- Timestamp
- Exchange rate used

## Automation Considerations

To fully automate this process, you would need to:

1. **Set up a Solana wallet service** in the backend with secure private key management
2. **Integrate with Jupiter Aggregator API** for best swap rates:
   - API: https://quote-api.jup.ag/v6
   - Documentation: https://station.jup.ag/docs/apis/swap-api
3. **Create an automated conversion script** that:
   - Checks pending fees periodically (e.g., daily)
   - If fees exceed a threshold (e.g., $100 worth), trigger conversion
   - Swap VDM → SOL using Jupiter API
   - Transfer SOL to treasury wallet
   - Log all transactions

### Example Automation Flow (Node.js with @solana/web3.js)

```javascript
import { Connection, Keypair, Transaction } from '@solana/web3.js';
import fetch from 'node-fetch';

// This is a simplified example - production code needs proper error handling
async function convertFeesToSOL(vdmAmount) {
  // 1. Get quote from Jupiter
  const quoteResponse = await fetch(
    `https://quote-api.jup.ag/v6/quote?inputMint=B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5&outputMint=So11111111111111111111111111111111111111112&amount=${vdmAmount * 1e9}&slippageBps=50`
  );
  const quoteData = await quoteResponse.json();

  // 2. Get swap transaction
  const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse: quoteData,
      userPublicKey: 'EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR',
      wrapAndUnwrapSol: true,
    }),
  });
  const { swapTransaction } = await swapResponse.json();

  // 3. Sign and send transaction (requires private key)
  // ... implementation details
  
  // 4. Transfer SOL to treasury
  // ... implementation details
  
  return { success: true, signature: '...' };
}
```

## Security Considerations

⚠️ **Important Security Notes**:
1. **Never** commit private keys to version control
2. Use environment variables or secure key management systems (AWS KMS, HashiCorp Vault, etc.)
3. Implement multi-signature wallets for large amounts
4. Set up alerts for large transactions
5. Maintain audit logs of all conversions
6. Consider using a time-locked contract for additional security

## Monitoring and Alerts

Set up monitoring for:
- Accumulated fees reaching certain thresholds ($100, $500, $1000)
- Failed conversion attempts
- Unusual fee patterns
- Treasury wallet balance
- Custodial wallet balance

## Support

For questions or issues with fee conversion, contact the DecaFlow team or VDM team.
