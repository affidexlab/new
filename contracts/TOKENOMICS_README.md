# DecaFlow Tokenomics Implementation

Complete smart contract suite for $DECA token ecosystem on Arbitrum.

## 📋 Overview

**Token:** DecaFlow Token ($DECA)
**Total Supply:** 1,000,000,000 (1 billion)
**Chain:** Arbitrum
**Standard:** ERC-20 with voting capabilities

## 📦 Contracts

### Core Contracts

1. **DecaFlowTokenWithVotes.sol**
   - ERC-20 token with built-in governance voting
   - Total supply: 1 billion DECA
   - Burnable, Permit (gasless approvals), Votes (snapshots)

2. **DECAStaking.sol**
   - Stake DECA to earn USDC from protocol fees
   - Fee tier system (stake more = higher discounts)
   - Flexible staking (no lock period)
   - Estimated APY: 15-30%

3. **TokenVesting.sol**
   - Linear vesting with cliff periods
   - Supports team, investor, and partner schedules
   - Revocable vesting option
   - Batch operations for gas efficiency

4. **MerkleAirdrop.sol**
   - Gas-efficient airdrop using Merkle proofs
   - 90-day claim window
   - 50M DECA allocation (5% of supply)
   - Unclaimed tokens returned to treasury

5. **DecaFlowGovernor.sol**
   - On-chain DAO governance
   - Proposal threshold: 100K DECA (0.01%)
   - Quorum: 4% of total supply
   - Voting period: 7 days
   - Execution delay: 2 days (via Timelock)

## 🎯 Token Distribution

| Allocation | Amount | Percentage | Vesting |
|------------|--------|------------|---------|
| Community & Airdrops | 300M | 30% | Linear over 48 months |
| Team & Advisors | 200M | 20% | 12-month cliff, 36-month linear |
| Seed Investors | 150M | 15% | 6-month cliff, 24-month linear |
| Partners & Ambassadors | 100M | 10% | 6-month cliff, 24-month linear |
| Treasury & DAO | 150M | 15% | Unlocked, governed by DAO |
| Liquidity Provisions | 100M | 10% | Unlocked at launch |

## 🚀 Deployment

### Prerequisites

```bash
npm install
# or
bun install
```

### Configuration

1. Update `deploy_tokenomics.js` with:
   - Deployer address
   - Treasury address (multisig recommended)
   - Team/investor/partner addresses
   - Merkle root for airdrop

2. Set up `.env`:
```env
PRIVATE_KEY=your_private_key
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
ARBISCAN_API_KEY=your_arbiscan_api_key
```

### Deploy to Arbitrum Mainnet

```bash
npx hardhat run scripts/deploy_tokenomics.js --network arbitrum
```

### Deploy to Arbitrum Sepolia (Testnet)

```bash
npx hardhat run scripts/deploy_tokenomics.js --network arbitrumSepolia
```

## 🔍 Contract Verification

After deployment, verify contracts on Arbiscan:

```bash
npx hardhat verify --network arbitrum <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:
```bash
npx hardhat verify --network arbitrum 0x123...abc
npx hardhat verify --network arbitrum 0x456...def "0x123...abc" "0xaf88...831"
```

## 📊 Staking Fee Tiers

| Tier | Min Stake | Swap Fee Discount |
|------|-----------|-------------------|
| 0 | 0 DECA | 0% |
| 1 | 1,000 DECA | 10% |
| 2 | 10,000 DECA | 25% |
| 3 | 50,000 DECA | 50% |
| 4 | 100,000 DECA | 75% |
| 5 | 500,000 DECA | 100% (no fees) |

## 🎁 Airdrop Details

**Total Allocation:** 50M DECA (5% of supply)

**Eligibility:**
- **Phase 1 (30M):** Early traders (before seed round)
- **Phase 2 (10M):** Liquidity providers
- **Phase 3 (5M):** Active ambassadors
- **Phase 4 (5M):** Community contributors

**Claim Period:** 90 days from launch

**How to Generate Merkle Root:**

See `scripts/generate_merkle_tree.js` for example.

```bash
node scripts/generate_merkle_tree.js
```

## 🏛️ Governance

### Creating a Proposal

```solidity
// Example: Update staking fee tier
address[] memory targets = new address[](1);
targets[0] = address(staking);

uint256[] memory values = new uint256[](1);
values[0] = 0;

bytes[] memory calldatas = new bytes[](1);
calldatas[0] = abi.encodeWithSignature(
    "updateFeeTier(uint256,uint256,uint256)",
    1, // tier ID
    5000 * 1e18, // 5K DECA min stake
    1500 // 15% discount
);

string memory description = "Proposal: Update Tier 1 to 5K DECA for 15% discount";

governor.propose(targets, values, calldatas, description);
```

### Voting

```solidity
governor.castVote(proposalId, 1); // 1 = For, 0 = Against, 2 = Abstain
```

### Execution

After voting period and timelock delay:
```solidity
governor.execute(targets, values, calldatas, descriptionHash);
```

## 🔐 Security

- **Audits:** External audit recommended before mainnet launch
- **Bug Bounty:** $100K-$500K rewards for critical vulnerabilities
- **Multisig:** Use Gnosis Safe for treasury and admin functions
- **Timelock:** 2-day delay for governance execution
- **Pausable:** Emergency pause on staking contract

## 📚 Testing

```bash
npx hardhat test
npx hardhat coverage
```

## 🛠️ Useful Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy locally
npx hardhat node
npx hardhat run scripts/deploy_tokenomics.js --network localhost

# Check contract size
npx hardhat size-contracts

# Flatten contract (for verification)
npx hardhat flatten contracts/DecaFlowTokenWithVotes.sol > flattened.sol
```

## 📞 Support

- **Docs:** https://docs.decaflow.xyz
- **Discord:** https://discord.gg/decaflow
- **Twitter:** @DecaFlowHQ
- **Email:** dev@decaflow.xyz

## ⚖️ License

MIT

---

**⚠️ IMPORTANT:** This is unaudited code. Do NOT deploy to mainnet without:
1. Comprehensive testing
2. External security audit
3. Legal review
4. Community review period
