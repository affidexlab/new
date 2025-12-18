# VDM Time-Locked Staking - Solana Mainnet Deployment Guide

## Overview
This guide covers deploying the VDM time-locked staking program to Solana mainnet.

## Prerequisites

1. **Solana CLI Tools Installed**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   ```

2. **Anchor Framework Installed**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

3. **Rust Installed**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

4. **Mainnet Wallet with SOL**
   - You'll need ~5-10 SOL for deployment costs
   - Ensure your wallet is at `~/.config/solana/id.json`

## Step 1: Build the Program

```bash
cd /project/workspace/affidexlab/new/solana-staking-program

# Build the program
anchor build
```

This generates the program binary at `target/deploy/vdm_staking.so`

## Step 2: Get Program ID

```bash
# Generate a new program keypair
solana-keygen new -o target/deploy/vdm_staking-keypair.json

# Get the program ID
solana address -k target/deploy/vdm_staking-keypair.json
```

Copy this program ID and update it in:
- `Anchor.toml` (line 7)
- `src/lib.rs` (line 4: `declare_id!`)

Then rebuild:
```bash
anchor build
```

## Step 3: Set Solana Cluster to Mainnet

```bash
solana config set --url https://api.mainnet-beta.solana.com
```

Verify:
```bash
solana config get
```

## Step 4: Check Wallet Balance

```bash
solana balance
```

You need at least 5 SOL. If not enough, transfer SOL to your deployment wallet.

## Step 5: Deploy the Program

```bash
anchor deploy --provider.cluster mainnet
```

This will:
- Upload the program binary to mainnet
- Deploy the program to the ID generated earlier
- Make the program executable on-chain

**Expected output:**
```
Deploying cluster: mainnet
Upgrade authority: <your-wallet-address>
Deploying program "vdm_staking"...
Program Id: VDMStakingProgramXXXXXXXXXXXXXXXXXXXXXXXXXX

Deploy success
```

## Step 6: Initialize the Staking Pool

After deployment, you need to initialize the staking pool with the rewards vault.

### Prepare Initialization

1. **VDM Token Mint Address**: `B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5`
2. **Rewards Amount**: 150,000,000 VDM (150M tokens)
3. **Fee Wallet**: `3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk`

### Initialize Script

Create `scripts/initialize.ts`:

```typescript
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { VdmStaking } from '../target/types/vdm_staking';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

const VDM_MINT = new PublicKey('B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5');
const FEE_WALLET = new PublicKey('3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk');
const REWARDS_AMOUNT = new anchor.BN(150_000_000_000_000_000); // 150M VDM with 9 decimals

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VdmStaking as Program<VdmStaking>;

  const [stakingPool] = await PublicKey.findProgramAddress(
    [Buffer.from('staking_pool')],
    program.programId
  );

  const [vault] = await PublicKey.findProgramAddress(
    [Buffer.from('vault')],
    program.programId
  );

  const [rewardsVault] = await PublicKey.findProgramAddress(
    [Buffer.from('rewards_vault')],
    program.programId
  );

  console.log('Initializing staking pool...');
  console.log('Program ID:', program.programId.toString());
  console.log('Staking Pool:', stakingPool.toString());
  console.log('Vault:', vault.toString());
  console.log('Rewards Vault:', rewardsVault.toString());

  const tx = await program.methods
    .initialize(REWARDS_AMOUNT)
    .accounts({
      stakingPool,
      authority: provider.wallet.publicKey,
      vdmMint: VDM_MINT,
      vault,
      rewardsVault,
      feeWallet: FEE_WALLET,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  console.log('✅ Initialization successful!');
  console.log('Transaction signature:', tx);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
```

Run initialization:
```bash
ts-node scripts/initialize.ts
```

## Step 7: Fund the Rewards Vault

After initialization, you need to transfer 150M VDM tokens to the rewards vault.

```bash
# Get the rewards vault address from initialization output
REWARDS_VAULT="<rewards-vault-address>"

# Transfer 150M VDM tokens (assuming VDM has 9 decimals)
spl-token transfer B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5 \
  150000000000000000 \
  $REWARDS_VAULT \
  --fund-recipient
```

**⚠️ CRITICAL**: This is a one-time transfer of 150M VDM from VDM team's treasury to the rewards vault.

## Step 8: Verify Deployment

Create `scripts/verify.ts`:

```typescript
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VdmStaking as Program;

  const [stakingPool] = await PublicKey.findProgramAddress(
    [Buffer.from('staking_pool')],
    program.programId
  );

  const poolData = await program.account.stakingPool.fetch(stakingPool);

  console.log('Staking Pool Info:');
  console.log('- Total Staked:', poolData.totalStaked.toString());
  console.log('- Rewards Pool Remaining:', poolData.rewardsPoolRemaining.toString());
  console.log('- Total Stakers:', poolData.totalStakers);
  console.log('- Total Rewards Distributed:', poolData.totalRewardsDistributed.toString());
  console.log('✅ Program is live and operational!');
}

main();
```

Run verification:
```bash
ts-node scripts/verify.ts
```

## Step 9: Update Frontend Configuration

Update the frontend `.env` file with the deployed program ID:

```env
VITE_VDM_STAKING_PROGRAM_ID=<your-deployed-program-id>
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Step 10: Test with Small Amount

Before announcing, test with a small stake:

1. Connect wallet with small VDM amount (e.g., 1,000 VDM)
2. Stake for 6 months
3. Verify transaction on Solscan: `https://solscan.io/tx/<signature>`
4. Check program account on Solscan

## Program Addresses (Fill after deployment)

```
Program ID: _____________________________
Staking Pool: _____________________________
Vault: _____________________________
Rewards Vault: _____________________________
Fee Wallet: 3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
VDM Token Mint: B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5
```

## Security Considerations

1. **Program Authority**: The deployment wallet becomes the program upgrade authority
2. **Immutable After Launch**: Consider making the program immutable after testing
3. **Audit**: Recommend third-party audit before mainnet launch
4. **Gradual Rollout**: Start with limited marketing, scale after confidence

## Cost Breakdown

- Program deployment: ~2-3 SOL
- Account rent: ~0.5 SOL
- Testing transactions: ~0.1 SOL
- **Total**: ~3-5 SOL

## Troubleshooting

### "Insufficient funds"
Transfer more SOL to your deployment wallet.

### "Program modification prohibited"
The program is deployed as immutable. Redeploy with new program ID.

### "Invalid token account"
Ensure VDM token mint address is correct: `B2a9z1fwTvLXMDoaA3pm4MLXtfMjA3nQLs2dSNivCwS5`

## Support

For deployment issues:
- Solana Discord: https://discord.gg/solana
- Anchor Discord: https://discord.gg/anchorlang

---

**Next**: After successful deployment, update the backend API endpoints to interact with the deployed program.
