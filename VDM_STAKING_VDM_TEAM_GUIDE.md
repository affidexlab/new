# VDM × DecaFlow Staking – VDM Team Operations Overview

## 1. Purpose

This document explains how the **VDM staking program** on DecaFlow works and what the **VDM core team** needs to do operationally.

It is intended for the **VDM team only** (internal/partner use), not for public users.

---

## 2. High‑Level Overview

- VDM holders can stake their tokens on **DecaFlow** at: `https://decaflow.xyz/staking`.
- Users choose a **fixed lock period** and earn rewards in VDM:
  - 6 months
  - 9 months
  - 12 months
- Rewards are calculated according to the selected term and the amount the user stakes.

The implementation is a **managed staking program**:

- Users send VDM to the official staking wallet.
- DecaFlow’s backend records the stake, lock period, and rewards in a database.
- When the lock period ends, users request a claim through the UI.
- The VDM / Affidex operations team pays out principal and rewards from the staking wallet.

There is **no custom Solana smart contract** in this first version. All logic is enforced by DecaFlow infrastructure and by the agreed operational process between VDM and Affidex Lab.

---

## 3. Wallets and Fund Flow

There is one key wallet that users interact with for staking:

### 3.1 Staking Wallet

All staking deposits and payouts flow through a dedicated VDM staking wallet:

```text
Staking wallet (for deposits and payouts):
3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk
```

This wallet is controlled by the VDM × Affidex team for the purpose of this staking program.

### 3.2 Rewards Pool

- The VDM team has allocated **150,000,000 VDM** for staking rewards.
- This allocation is off‑chain (accounting) but should be reflected in how you manage balances for the staking wallet vs. any other VDM holdings.

The important point: **user deposits and user payouts for staking always go through the staking wallet above** so that the on‑chain history is clean and easy to audit.

---

## 4. How Staking Works (User Perspective)

Understanding the user flow helps the VDM team know what to expect.

1. The user connects their **Solana wallet** (Phantom, Solflare, etc.) on `decaflow.xyz/staking`.
2. The user selects:
   - A lock period: 6, 9, or 12 months
   - The amount of VDM they want to stake
3. The user is instructed to:
   - Send the chosen amount of VDM from their wallet to the **staking wallet**
     `3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk`.
   - Copy the **transaction signature** from their wallet and paste it into the staking form on DecaFlow.
4. DecaFlow’s backend:
   - Detects and records the stake in the database.
   - Stores: wallet address, staked amount, lock period, start date, unlock date, and total rewards for the lock.
5. On the staking page, the user can see:
   - Their staked amount
   - Selected lock period and APY
   - Expected rewards
   - Unlock date and remaining time
6. After the unlock date:
   - The user clicks **“Request Claim”**.
   - A claim request is recorded in the database for that wallet/position.
   - VDM / Affidex operations use this information to execute the payout from the staking wallet.

---

## 5. What DecaFlow Tracks for You

DecaFlow’s backend and database automatically maintain:

- **Stakes**
  - Wallet address
  - Amount staked
  - Lock period (6 / 9 / 12 months)
  - Start timestamp
  - Unlock timestamp
  - Rewards allocated for that lock
  - Status: active / claim requested / claimed

- **Claim requests**
  - Wallet address
  - Associated stake/position
  - Amount of principal expected
  - Amount of rewards expected
  - Time of request
  - Status: requested / processed

- **Pool statistics**
  - Total VDM staked
  - Number of stakers
  - Total rewards allocated/distributed
  - Remaining reward capacity (relative to the 150M VDM allocation)

These data points can be surfaced to the VDM team via internal views, CSV exports, or an admin dashboard.

---

## 6. VDM Team Responsibilities (Operations)

This section focuses on what the VDM team needs to do on a regular basis.

### 6.1 Before Launch

1. **Secure the staking wallet**
   - Make sure the staking wallet `3Z2y4VUjDYU6sapVFfmZAStGDaTrYcCjXinwZqBgMopk` is under appropriate security (hardware wallet, multi‑sig, or your preferred setup).

2. **Fund the staking wallet for payouts**
   - Move an initial amount of VDM to the staking wallet so there is enough balance to pay out early claims.
   - The amount is up to you, but it should comfortably cover the expected first wave of stakes and rewards.

3. **Review public communication**
   - Confirm that the wording on the staking page, FAQs, and announcements aligns with the VDM team’s expectations.

---

### 6.2 Ongoing / Daily Operations

#### A. Monitoring new stakes

DecaFlow can provide an internal list or export of new stakes, including:

- Wallet address
- Amount staked
- Lock period
- Stake start date
- Unlock date
- User’s deposit transaction signature

Recommended actions for VDM ops:

1. **Periodic spot checks**
   - Take a sample of new stakes and verify that the transaction signature:
     - Exists on Solana.
     - Sends VDM from the user wallet to the **staking wallet**.

2. **Balance reconciliation**
   - Regularly verify that the VDM balance of the staking wallet is consistent with:
     - Total active staked amounts.
     - Any additional buffer VDM that you have moved into the staking wallet.

#### B. Processing claim requests

When a user’s lock period ends and they click **“Request Claim”**, DecaFlow creates a claim record for that wallet.

What DecaFlow records for each claim:

- Wallet address
- Principal amount due
- Rewards amount due
- Associated stake/position
- Time of request
- Status (requested / processed)

VDM operations should:

1. **Review pending claims**
   - On a regular schedule (e.g., daily or several times per week), pull the list of claims with status **“requested”**.

2. **Execute payouts from the staking wallet**
   - For each claim:
     - Confirm the principal and rewards amounts from the DecaFlow data.
     - From the **staking wallet**, send the combined payout (principal + rewards) to the user’s wallet.
     - Capture the payout transaction signature.

3. **Mark claims as processed**
   - Provide the payout transaction signature back to DecaFlow (via an internal tool or CSV).
   - DecaFlow will update the claim status to **“processed”** and mark the underlying position as fully claimed.

4. **Internal logging**
   - Optionally keep an internal log for your own records:
     - Date processed
     - Operator who executed the payout
     - Payout transaction signature

---

### 6.3 Handling Edge Cases

1. **User says they staked but see nothing on the page**
   - Verify the transaction:
     - Does the signature show a transfer of VDM **to the staking wallet**?
   - If yes, but the record is missing, coordinate with DecaFlow to manually create/patch the stake in the database.
   - If no (e.g., wrong destination wallet), this is not a valid staking deposit.

2. **User cannot access their original wallet**
   - This is a standard wallet‑management risk.
   - Any exception handling (e.g., moving funds to a different wallet) should follow VDM’s internal governance and risk policies.

3. **Insufficient VDM in the staking wallet for payouts**
   - If many claims arrive at once and payouts would exceed the current balance of the staking wallet:
     - Move additional VDM into the staking wallet from your broader holdings.
     - Then process the pending claims.

---

## 7. Responsibilities Summary

**DecaFlow / Affidex Lab**

- Provide and maintain the staking UI on DecaFlow.
- Implement and operate the backend logic that:
  - Records stakes and calculates rewards.
  - Tracks lock periods, unlock dates, and statuses.
  - Records claim requests and pool statistics.
- Provide the VDM team with access to:
  - Stake and claim data (dashboard or export).
  - Any required tooling to mark claims as processed.

**VDM Team**

- Secure and manage the **staking wallet** that receives deposits and sends payouts.
- Ensure there is sufficient VDM liquidity in the staking wallet to cover expected claims.
- Use DecaFlow’s data to:
  - Monitor new stakes and confirm deposits as needed.
  - Process claim requests by sending principal and rewards back to users.
- Coordinate with DecaFlow on any discrepancies or special cases.

---

## 8. Final Notes for VDM Leadership

- The staking program is live on DecaFlow and ready for traffic once both teams confirm launch.
- All user‑facing complexity (APY, lock periods, tracking, UI) is handled by DecaFlow.
- The VDM team’s primary operational focus is:
  - Keeping the **staking wallet** secure and funded.
  - Regularly reviewing and fulfilling **claim requests** recorded by DecaFlow.

With this setup, VDM can offer a clear staking product to holders now, and both teams retain the flexibility to evolve the implementation in future (for example, moving to an on‑chain contract later) without disrupting the user experience.
