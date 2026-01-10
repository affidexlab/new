# VDM Staking Program Updates - Summary

## Changes Implemented

### 1. Updated Wallet Addresses ✅

#### Custodial Wallet (Backend holds staked VDM)
- **New Address**: `EacwKwV6DwnGKmZ192bmF2jnmg15PJytwEc9n98537eR`
- **Purpose**: Holds all staked VDM tokens during the lock period
- **Updated in**:
  - Frontend: `app/src/lib/solanaStaking.ts`
  - Backend: `backend/src/services/solanaStakingService.js`

#### Treasury Wallet (Receives fees in SOL)
- **New Address**: `3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk`
- **Purpose**: Receives deposit and withdrawal fees (converted from VDM to SOL)
- **Updated in**:
  - Frontend: `app/src/lib/solanaStaking.ts`
  - Backend: `backend/src/services/solanaStakingService.js`

### 2. Fee Structure ✅

All fees are collected in VDM tokens and tracked in the database:
- **Deposit Fee**: 2.5% (250 basis points)
- **Withdrawal Fee**: 1.5% (150 basis points)

**Important**: Fees are recorded with the treasury wallet address as the recipient. These VDM fees need to be manually converted to SOL and sent to the treasury wallet. See the [Fee Conversion Guide](./VDM_STAKING_FEE_CONVERSION_GUIDE.md) for details.

### 3. New Admin API Endpoints ✅

#### Get Pending Fee Conversions
```
GET /v1/solana-staking/admin/fee-conversions
```
Returns aggregated VDM fees that need to be converted to SOL, including:
- Total VDM amount per fee type (deposit/withdrawal)
- USDT equivalent value
- Fee count
- Timestamps
- Conversion instructions

#### Get Wallet Addresses
```
GET /v1/solana-staking/admin/wallet-addresses
```
Returns the configured custodial and treasury wallet addresses.

### 4. Dashboard Behavior ✅

The dashboard now works exactly as requested:

#### ✅ After Successful Staking
- User is immediately shown a dashboard displaying:
  - Amount of VDM staked
  - Lock period duration
  - Days remaining until unlock
  - APY and rewards allocated
  - Staking start and unlock dates
  - VDM price snapshot

#### ✅ Cannot Unstake Until Duration Expires
- The claim button is disabled during the lock period
- A message indicates the stake is locked until the unlock date
- Users can only request a claim after the lock period ends

#### ✅ Automatic Wallet-Based Dashboard
- When a user connects their wallet (even on a different device):
  - The system checks if that wallet has an active stake
  - If yes, they are automatically shown the dashboard
  - If no, they see the staking form
- The dashboard is wallet-based, not device-based
- Works across any device or browser

#### ✅ One Stake Per Wallet
- Enforced at the backend level in `solanaStakingService.js` (line 204-211)
- Enforced at the frontend level in `SolanaStaking.tsx` (line 106-109)
- A wallet can only have one active stake at a time
- After claiming a stake, the user can stake again

## Files Modified

### Frontend
1. **`app/src/lib/solanaStaking.ts`**
   - Updated `AFFIDEX_CUSTODY_WALLET` to new address
   - Added `AFFIDEX_TREASURY_WALLET` constant

### Backend
1. **`backend/src/services/solanaStakingService.js`**
   - Updated custodial wallet address
   - Added treasury wallet address
   - Updated fee recipient to treasury wallet
   - Added `getPendingFeeConversions()` function
   - Added `getWalletAddresses()` function

2. **`backend/src/routes/v1/solana-staking.js`**
   - Added `/admin/fee-conversions` endpoint
   - Added `/admin/wallet-addresses` endpoint

## New Documentation

### Fee Conversion Guide
Created comprehensive documentation: **`VDM_STAKING_FEE_CONVERSION_GUIDE.md`**

This guide includes:
- Complete wallet configuration
- Fee tracking system
- Manual conversion steps using Jupiter or Raydium
- API endpoints for fee management
- Automation considerations with code examples
- Security best practices
- Monitoring recommendations

## How It Works

### Staking Flow
1. User visits `/staking` or `#staking`
2. If wallet is not connected, they see the connect wallet button
3. After connecting:
   - **Has active stake**: Dashboard is shown automatically
   - **No active stake or already claimed**: Staking form is shown

### Fee Collection and Conversion
1. When a user stakes:
   - 2.5% deposit fee is deducted from staked amount
   - Fee is tracked in database with treasury wallet as recipient
   
2. When a user claims:
   - 1.5% withdrawal fee is deducted from principal
   - Fee is tracked in database with treasury wallet as recipient

3. Fees remain in the custodial wallet as VDM tokens

4. **Manual conversion required**:
   - Use `/admin/fee-conversions` API to check accumulated fees
   - Convert VDM to SOL using Jupiter or Raydium
   - Send SOL to treasury wallet
   - (See Fee Conversion Guide for detailed steps)

### One Stake Per Wallet
- Checked at both frontend and backend
- When user tries to stake with a wallet that already has an active stake:
  - Error message: "You already have an active stake. One stake per wallet."
- After claiming, the stake status changes to 'claimed'
- User can then stake again with the same wallet

## Testing Checklist

- [ ] User can stake VDM tokens
- [ ] Custodial wallet receives the VDM tokens at the correct address
- [ ] Deposit fee (2.5%) is correctly calculated and recorded
- [ ] User sees dashboard after successful stake
- [ ] Dashboard shows correct staking information
- [ ] User cannot request claim before lock period expires
- [ ] User can request claim after lock period expires
- [ ] Withdrawal fee (1.5%) is correctly calculated and recorded
- [ ] One stake per wallet restriction works
- [ ] Wallet reconnection on different device shows dashboard if stake exists
- [ ] After claiming, user can stake again
- [ ] Admin can view pending fee conversions via API
- [ ] Admin can view wallet addresses via API

## Next Steps

1. **Deploy Changes**: Deploy the updated frontend and backend
2. **Test Staking Flow**: Test the complete staking and claiming flow
3. **Set Up Fee Conversion**: 
   - Monitor accumulated fees using `/admin/fee-conversions` endpoint
   - Set up a schedule for converting VDM fees to SOL (e.g., weekly or when threshold is reached)
   - Consider implementing automated conversion (see Fee Conversion Guide)
4. **Monitor**: Set up alerts for accumulated fees and treasury wallet balance

## Support

For questions about:
- **Staking functionality**: Check `app/src/pages/SolanaStaking.tsx`
- **Backend logic**: Check `backend/src/services/solanaStakingService.js`
- **Fee conversion**: See `VDM_STAKING_FEE_CONVERSION_GUIDE.md`
- **API endpoints**: Check `backend/src/routes/v1/solana-staking.js`
