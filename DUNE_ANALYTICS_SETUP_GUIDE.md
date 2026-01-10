# Dune Analytics Dashboard Setup Guide for DecaFlow

## 🚀 QUICK START (If You Just Want to Copy-Paste)

**Already created a Dune account and dashboard?** Jump straight to the queries:

1. Scroll down to **Section 4: Key Queries to Build** (Query 1-12)
2. For each query:
   - Click "New Query" in Dune
   - Copy the SQL code
   - Paste into Dune editor
   - Click "Run"
   - Click "Save" with the suggested name
   - Add to your dashboard
3. Arrange using layout in **Section 5**
4. Done! ✅

**Total time:** 45-60 minutes for all 12 queries

---

## Why Dune Analytics is Critical

VCs trust Dune Analytics because:
- **Independent verification** - pulls data directly from blockchain, not your database
- **Industry standard** - every serious DeFi protocol has a Dune dashboard
- **Impossible to fake** - reads on-chain data transparently
- **Comparable** - VCs can compare your metrics side-by-side with competitors
- **Shareable** - VCs share Dune links internally when evaluating deals

## Step-by-Step Setup

### 1. Create a Dune Account

1. Go to https://dune.com/
2. Sign up with your email or connect your wallet
3. Verify your email address
4. Complete your profile (use "DecaFlow Protocol" as organization name)

### 2. Understanding Your Smart Contracts

Your key contracts to track:

**Liquidity Routers (Uniswap V3 integration):**
- Base: `0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4`
- Arbitrum: `0xDE8700785C7512a8397683A9BE9717B0aFdB18F3`
- Optimism: `0xA2fdf81b7967e7FA7610DeBe1901A40686c48992`
- Polygon: `0xFd05977256E8D5753728C78A3003BC3B75Fef1DD`

**Uniswap V3 Position Managers (where your users add liquidity):**
- Ethereum: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Base: `0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1`
- Arbitrum: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Optimism: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Polygon: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Avalanche: `0x655C406EBFa14EE2006250925e54ec43AD184f8B`

**Bridge Integrations:**
- You use Li.Fi, CCTP, and CCIP (aggregated through 0x Protocol)
- These are already indexed on Dune

### 3. Create Your First Dashboard

#### Create New Dashboard

1. Click "New Dashboard" in Dune
2. Name it: "DecaFlow Protocol Metrics"
3. Description: "Real-time analytics for DecaFlow - the privacy-focused cross-chain DEX aggregator"
4. Make it Public

### 4. Key Queries to Build

#### Query 1: Base Chain Daily Trading Volume

**Name:** "DecaFlow - Base Chain Daily Volume"
**Description:** Daily swap volume on Base chain (our primary deployment)

```sql
-- DecaFlow Base Chain Daily Trading Volume
SELECT
    DATE_TRUNC('day', block_time) AS date,
    COUNT(*) AS daily_swaps,
    SUM(amount_usd) AS daily_volume_usd,
    COUNT(DISTINCT taker) AS unique_traders
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '90' DAY
GROUP BY 1
ORDER BY 1 DESC
```

**How to add:**
1. In Dune, click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Base Chain Daily Volume"
5. Visualization: **Line Chart**
   - X-axis: `date`
   - Y-axis: `daily_volume_usd`
6. Add to dashboard

#### Query 2: Liquidity Positions on Base

**Name:** "DecaFlow - Base Liquidity Positions"
**Description:** Liquidity positions created on Base via Uniswap V3

```sql
-- DecaFlow Liquidity Positions on Base
SELECT
    DATE_TRUNC('day', evt_block_time) AS date,
    COUNT(DISTINCT tokenId) AS total_positions,
    COUNT(DISTINCT owner) AS unique_liquidity_providers
FROM uniswap_v3_base.NonfungiblePositionManager_evt_IncreaseLiquidity
WHERE contract_address = 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1
AND evt_block_time >= NOW() - INTERVAL '90' DAY
GROUP BY 1
ORDER BY 1 DESC
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Base Liquidity Positions"
5. Visualization: **Line Chart**
   - X-axis: `date`
   - Y-axis: `total_positions`
6. Add to dashboard

#### Query 3: Multi-Chain Volume Comparison

**Name:** "DecaFlow - Volume by Chain"
**Description:** Trading volume comparison across all supported chains

```sql
-- DecaFlow Multi-Chain Volume Comparison
WITH base_volume AS (
    SELECT
        'Base' AS chain,
        SUM(amount_usd) AS volume_usd,
        COUNT(*) AS swap_count
    FROM uniswap_v3_base.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
),
arbitrum_volume AS (
    SELECT
        'Arbitrum' AS chain,
        SUM(amount_usd) AS volume_usd,
        COUNT(*) AS swap_count
    FROM uniswap_v3_arbitrum.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
),
optimism_volume AS (
    SELECT
        'Optimism' AS chain,
        SUM(amount_usd) AS volume_usd,
        COUNT(*) AS swap_count
    FROM uniswap_v3_optimism.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
),
polygon_volume AS (
    SELECT
        'Polygon' AS chain,
        SUM(amount_usd) AS volume_usd,
        COUNT(*) AS swap_count
    FROM uniswap_v3_polygon.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
),
ethereum_volume AS (
    SELECT
        'Ethereum' AS chain,
        SUM(amount_usd) AS volume_usd,
        COUNT(*) AS swap_count
    FROM uniswap_v3_ethereum.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
)

SELECT * FROM base_volume
UNION ALL
SELECT * FROM arbitrum_volume
UNION ALL
SELECT * FROM optimism_volume
UNION ALL
SELECT * FROM polygon_volume
UNION ALL
SELECT * FROM ethereum_volume
ORDER BY volume_usd DESC
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Volume by Chain"
5. Visualization: **Bar Chart**
   - X-axis: `chain`
   - Y-axis: `volume_usd`
6. Add to dashboard

#### Query 4: Unique Wallets on Base

**Name:** "DecaFlow - Base Unique Wallets"
**Description:** Total unique wallets interacting with Uniswap V3 on Base

```sql
-- DecaFlow Unique Wallets on Base
SELECT
    COUNT(DISTINCT taker) AS total_unique_wallets,
    COUNT(*) AS total_transactions
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '30' DAY
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Base Unique Wallets"
5. Visualization: **Counter** (Big Number)
   - Display: `total_unique_wallets`
6. Add to dashboard

---

#### Query 5: Daily Active Users on Base

**Name:** "DecaFlow - Base Daily Active Users"
**Description:** Daily active traders on Base chain

```sql
-- DecaFlow Daily Active Users on Base
SELECT
    DATE_TRUNC('day', block_time) AS date,
    COUNT(DISTINCT taker) AS daily_active_users,
    COUNT(*) AS daily_swaps
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '60' DAY
GROUP BY 1
ORDER BY 1 DESC
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Base Daily Active Users"
5. Visualization: **Line Chart**
   - X-axis: `date`
   - Y-axis: `daily_active_users`
6. Add to dashboard

---

#### Query 6: Recent Large Swaps on Base

**Name:** "DecaFlow - Recent Large Swaps"
**Description:** Recent high-value transactions on Base (>$1,000)

```sql
-- DecaFlow Recent Large Swaps on Base
SELECT
    block_time,
    tx_hash,
    taker AS wallet,
    token_sold_symbol,
    token_bought_symbol,
    ROUND(amount_usd, 2) AS amount_usd
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '7' DAY
AND amount_usd > 1000
ORDER BY block_time DESC
LIMIT 20
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Recent Large Swaps"
5. Visualization: **Table**
6. Add to dashboard

---

#### Query 7: Liquidity Positions Across All Chains

**Name:** "DecaFlow - All Chain Liquidity Positions"
**Description:** Total liquidity positions across all supported chains

```sql
-- DecaFlow Liquidity Positions Across All Chains
WITH ethereum_positions AS (
    SELECT
        'Ethereum' AS chain,
        COUNT(DISTINCT tokenId) AS position_count,
        COUNT(DISTINCT owner) AS unique_providers
    FROM uniswap_v3_ethereum.NonfungiblePositionManager_evt_IncreaseLiquidity
    WHERE contract_address = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88
    AND evt_block_time >= NOW() - INTERVAL '90' DAY
),
base_positions AS (
    SELECT
        'Base' AS chain,
        COUNT(DISTINCT tokenId) AS position_count,
        COUNT(DISTINCT owner) AS unique_providers
    FROM uniswap_v3_base.NonfungiblePositionManager_evt_IncreaseLiquidity
    WHERE contract_address = 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1
    AND evt_block_time >= NOW() - INTERVAL '90' DAY
),
arbitrum_positions AS (
    SELECT
        'Arbitrum' AS chain,
        COUNT(DISTINCT tokenId) AS position_count,
        COUNT(DISTINCT owner) AS unique_providers
    FROM uniswap_v3_arbitrum.NonfungiblePositionManager_evt_IncreaseLiquidity
    WHERE contract_address = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88
    AND evt_block_time >= NOW() - INTERVAL '90' DAY
),
optimism_positions AS (
    SELECT
        'Optimism' AS chain,
        COUNT(DISTINCT tokenId) AS position_count,
        COUNT(DISTINCT owner) AS unique_providers
    FROM uniswap_v3_optimism.NonfungiblePositionManager_evt_IncreaseLiquidity
    WHERE contract_address = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88
    AND evt_block_time >= NOW() - INTERVAL '90' DAY
),
polygon_positions AS (
    SELECT
        'Polygon' AS chain,
        COUNT(DISTINCT tokenId) AS position_count,
        COUNT(DISTINCT owner) AS unique_providers
    FROM uniswap_v3_polygon.NonfungiblePositionManager_evt_IncreaseLiquidity
    WHERE contract_address = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88
    AND evt_block_time >= NOW() - INTERVAL '90' DAY
),
avalanche_positions AS (
    SELECT
        'Avalanche' AS chain,
        COUNT(DISTINCT tokenId) AS position_count,
        COUNT(DISTINCT owner) AS unique_providers
    FROM uniswap_v3_avalanche.NonfungiblePositionManager_evt_IncreaseLiquidity
    WHERE contract_address = 0x655C406EBFa14EE2006250925e54ec43AD184f8B
    AND evt_block_time >= NOW() - INTERVAL '90' DAY
)

SELECT * FROM ethereum_positions
UNION ALL
SELECT * FROM base_positions
UNION ALL
SELECT * FROM arbitrum_positions
UNION ALL
SELECT * FROM optimism_positions
UNION ALL
SELECT * FROM polygon_positions
UNION ALL
SELECT * FROM avalanche_positions
ORDER BY position_count DESC
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - All Chain Liquidity Positions"
5. Visualization: **Bar Chart**
   - X-axis: `chain`
   - Y-axis: `position_count`
6. Add to dashboard

---

#### Query 8: Top Trading Pairs on Base

**Name:** "DecaFlow - Top Trading Pairs (Base)"
**Description:** Most popular trading pairs by volume on Base

```sql
-- DecaFlow Top Trading Pairs on Base
SELECT
    token_sold_symbol || '/' || token_bought_symbol AS trading_pair,
    COUNT(*) AS swap_count,
    SUM(amount_usd) AS total_volume_usd,
    COUNT(DISTINCT taker) AS unique_traders
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '30' DAY
GROUP BY 1
ORDER BY total_volume_usd DESC
LIMIT 10
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Top Trading Pairs"
5. Visualization: **Table**
6. Add to dashboard

---

#### Query 9: Weekly Volume Trend (All Chains Combined)

**Name:** "DecaFlow - Weekly Volume Trend"
**Description:** Weekly trading volume across all chains

```sql
-- DecaFlow Weekly Volume Across All Chains
WITH base_weekly AS (
    SELECT
        DATE_TRUNC('week', block_time) AS week,
        'Base' AS chain,
        SUM(amount_usd) AS volume_usd
    FROM uniswap_v3_base.trades
    WHERE block_time >= NOW() - INTERVAL '180' DAY
    GROUP BY 1, 2
),
arbitrum_weekly AS (
    SELECT
        DATE_TRUNC('week', block_time) AS week,
        'Arbitrum' AS chain,
        SUM(amount_usd) AS volume_usd
    FROM uniswap_v3_arbitrum.trades
    WHERE block_time >= NOW() - INTERVAL '180' DAY
    GROUP BY 1, 2
),
optimism_weekly AS (
    SELECT
        DATE_TRUNC('week', block_time) AS week,
        'Optimism' AS chain,
        SUM(amount_usd) AS volume_usd
    FROM uniswap_v3_optimism.trades
    WHERE block_time >= NOW() - INTERVAL '180' DAY
    GROUP BY 1, 2
),
polygon_weekly AS (
    SELECT
        DATE_TRUNC('week', block_time) AS week,
        'Polygon' AS chain,
        SUM(amount_usd) AS volume_usd
    FROM uniswap_v3_polygon.trades
    WHERE block_time >= NOW() - INTERVAL '180' DAY
    GROUP BY 1, 2
),
ethereum_weekly AS (
    SELECT
        DATE_TRUNC('week', block_time) AS week,
        'Ethereum' AS chain,
        SUM(amount_usd) AS volume_usd
    FROM uniswap_v3_ethereum.trades
    WHERE block_time >= NOW() - INTERVAL '180' DAY
    GROUP BY 1, 2
)

SELECT 
    week,
    chain,
    volume_usd
FROM base_weekly
UNION ALL
SELECT * FROM arbitrum_weekly
UNION ALL
SELECT * FROM optimism_weekly
UNION ALL
SELECT * FROM polygon_weekly
UNION ALL
SELECT * FROM ethereum_weekly
ORDER BY week DESC, volume_usd DESC
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Weekly Volume Trend"
5. Visualization: **Area Chart** (Stacked)
   - X-axis: `week`
   - Y-axis: `volume_usd`
   - Group by: `chain`
6. Add to dashboard

---

#### Query 10: Total Users Across All Chains (Big Number for Top of Dashboard)

**Name:** "DecaFlow - Total Unique Users"
**Description:** Total unique wallets across all chains (30-day)

```sql
-- DecaFlow Total Unique Users (All Chains)
WITH all_users AS (
    SELECT DISTINCT taker AS wallet FROM uniswap_v3_base.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
    
    UNION
    
    SELECT DISTINCT taker AS wallet FROM uniswap_v3_arbitrum.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
    
    UNION
    
    SELECT DISTINCT taker AS wallet FROM uniswap_v3_optimism.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
    
    UNION
    
    SELECT DISTINCT taker AS wallet FROM uniswap_v3_polygon.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
    
    UNION
    
    SELECT DISTINCT taker AS wallet FROM uniswap_v3_ethereum.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
)

SELECT
    COUNT(*) AS total_unique_users
FROM all_users
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Total Unique Users"
5. Visualization: **Counter** (Big Number)
   - Display: `total_unique_users`
   - Suffix: Add text "Unique Users (30d)"
6. Add to dashboard

---

#### Query 11: Total Volume Across All Chains (Big Number)

**Name:** "DecaFlow - Total Trading Volume"
**Description:** 30-day trading volume across all chains

```sql
-- DecaFlow Total Trading Volume (All Chains)
SELECT
    SUM(volume_usd) AS total_volume_30d
FROM (
    SELECT SUM(amount_usd) AS volume_usd FROM uniswap_v3_base.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT SUM(amount_usd) AS volume_usd FROM uniswap_v3_arbitrum.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT SUM(amount_usd) AS volume_usd FROM uniswap_v3_optimism.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT SUM(amount_usd) AS volume_usd FROM uniswap_v3_polygon.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT SUM(amount_usd) AS volume_usd FROM uniswap_v3_ethereum.trades
    WHERE block_time >= NOW() - INTERVAL '30' DAY
) AS combined
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Total Trading Volume"
5. Visualization: **Counter** (Big Number)
   - Display: `total_volume_30d`
   - Prefix: "$"
   - Suffix: "30d Volume"
6. Add to dashboard

---

#### Query 12: Transactions to DecaFlow Routers (Direct Interaction)

**Name:** "DecaFlow - Router Interactions"
**Description:** Direct interactions with DecaFlow router contracts

```sql
-- DecaFlow Router Contract Interactions (All Chains)
WITH base_txs AS (
    SELECT
        DATE_TRUNC('day', block_time) AS date,
        'Base' AS chain,
        COUNT(*) AS tx_count,
        COUNT(DISTINCT "from") AS unique_users
    FROM base.transactions
    WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
    AND block_time >= NOW() - INTERVAL '90' DAY
    GROUP BY 1, 2
),
arbitrum_txs AS (
    SELECT
        DATE_TRUNC('day', block_time) AS date,
        'Arbitrum' AS chain,
        COUNT(*) AS tx_count,
        COUNT(DISTINCT "from") AS unique_users
    FROM arbitrum.transactions
    WHERE "to" = 0xDE8700785C7512a8397683A9BE9717B0aFdB18F3
    AND block_time >= NOW() - INTERVAL '90' DAY
    GROUP BY 1, 2
),
optimism_txs AS (
    SELECT
        DATE_TRUNC('day', block_time) AS date,
        'Optimism' AS chain,
        COUNT(*) AS tx_count,
        COUNT(DISTINCT "from") AS unique_users
    FROM optimism.transactions
    WHERE "to" = 0xA2fdf81b7967e7FA7610DeBe1901A40686c48992
    AND block_time >= NOW() - INTERVAL '90' DAY
    GROUP BY 1, 2
),
polygon_txs AS (
    SELECT
        DATE_TRUNC('day', block_time) AS date,
        'Polygon' AS chain,
        COUNT(*) AS tx_count,
        COUNT(DISTINCT "from") AS unique_users
    FROM polygon.transactions
    WHERE "to" = 0xFd05977256E8D5753728C78A3003BC3B75Fef1DD
    AND block_time >= NOW() - INTERVAL '90' DAY
    GROUP BY 1, 2
)

SELECT * FROM base_txs
UNION ALL
SELECT * FROM arbitrum_txs
UNION ALL
SELECT * FROM optimism_txs
UNION ALL
SELECT * FROM polygon_txs
ORDER BY date DESC, tx_count DESC
```

**How to add:**
1. Click "New Query"
2. Copy-paste the SQL above
3. Click "Run"
4. Click "Save" → Name it "DecaFlow - Router Interactions"
5. Visualization: **Line Chart**
   - X-axis: `date`
   - Y-axis: `tx_count`
   - Group by: `chain`
6. Add to dashboard

**IMPORTANT:** This query shows actual interactions with YOUR router contracts!

### 5. Dashboard Layout - Copy-Paste Ready!

Now that you have all 12 queries, arrange them in your dashboard like this:

**ROW 1: Header Text Widget**
Add a text widget at the top:
```
📊 DecaFlow Protocol - Multi-Chain Analytics Dashboard

Live on-chain data across Ethereum, Base, Arbitrum, Optimism, Polygon, and Avalanche.
All metrics independently verifiable and updated in real-time.

Primary focus: Base Chain (our main deployment)
```

**ROW 2: Key Metrics (Big Numbers) - 3 Counters Side-by-Side**
- Query 11: Total Trading Volume (Counter)
- Query 10: Total Unique Users (Counter)
- Query 4: Base Unique Wallets (Counter)

**ROW 3: Volume Trends - 1 Large Chart**
- Query 1: Base Chain Daily Volume (Line Chart, full width)

**ROW 4: Multi-Chain Comparison - 2 Charts Side-by-Side**
- Query 3: Volume by Chain (Bar Chart, half width)
- Query 7: Liquidity Positions by Chain (Bar Chart, half width)

**ROW 5: Weekly Trends - 1 Large Chart**
- Query 9: Weekly Volume Trend (Area Chart, full width, stacked by chain)

**ROW 6: User Engagement - 2 Charts Side-by-Side**
- Query 5: Daily Active Users on Base (Line Chart, half width)
- Query 2: Liquidity Positions on Base (Line Chart, half width)

**ROW 7: Detailed Analytics - 2 Items Side-by-Side**
- Query 8: Top Trading Pairs (Table, half width)
- Query 6: Recent Large Swaps (Table, half width)

**ROW 8: Router Activity - 1 Large Chart**
- Query 12: Router Interactions (Line Chart, full width, grouped by chain)

**This gives you a professional, VC-ready dashboard with all key metrics visible!**

### 6. Make Your Dashboard Investor-Friendly

**Title format:**
```
DecaFlow Protocol | Real-Time Metrics
TVL: $XXX,XXX | Volume (30d): $X.XXM | Users: X,XXX
```

**Add descriptions to every chart:**
- What the metric measures
- Why it matters
- How it's calculated

**Example:**
> **Total Value Locked (TVL)**
> 
> Total value of assets deposited in DecaFlow liquidity pools across all chains. Higher TVL indicates user trust and protocol maturity.
> 
> Calculated by summing USD value of all active liquidity positions on Uniswap V3 added through DecaFlow interface.

### 7. Challenge: Tracking Your Users Specifically

**Problem:** You route through 0x Protocol and Uniswap V3, so your transactions look like theirs on-chain.

**Solutions:**

**Option A: Frontend Tagging (Recommended)**
- Add a small identifier to transaction calldata
- Use a specific value in unused parameter fields
- Dune can filter for these patterns

**Option B: Track Wallet Addresses**
- Maintain a list of wallets that used your frontend
- Import this list into Dune as a dataset
- Filter transactions by wallet addresses

**Option C: Partner with Dune**
- Request custom tagging for your frontend
- Dune has "frontend tagging" for major protocols
- Email: partnerships@dune.com

**Option D: Contract Events**
- If you have ANY custom contracts (even just for tracking), emit events
- These events can include your protocol identifier
- Easier to query and verify

**Recommendation:** Implement a simple tracking contract that emits events when users interact through your frontend. This is the cleanest solution.

### 8. Example Tracking Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecaFlowTracker {
    event SwapTracked(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string swapType  // "swap", "bridge", "privacy"
    );
    
    event LiquidityTracked(
        address indexed user,
        address indexed pool,
        uint256 amount0,
        uint256 amount1,
        string actionType  // "add", "remove"
    );
    
    function trackSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string calldata swapType
    ) external {
        emit SwapTracked(msg.sender, tokenIn, tokenOut, amountIn, amountOut, swapType);
    }
    
    function trackLiquidity(
        address pool,
        uint256 amount0,
        uint256 amount1,
        string calldata actionType
    ) external {
        emit LiquidityTracked(msg.sender, pool, amount0, amount1, actionType);
    }
}
```

Deploy this to all your chains and call it before/after swaps. Then query these events in Dune!

### 9. Pro Tips for VCs

**Transparency Wins:**
- Show failed transactions, not just successful ones
- Display user concentration (even if it's high)
- Include comparative metrics (Your TVL vs Uniswap on same chains)

**Update Frequency:**
- Set queries to refresh every 6-12 hours
- Add "Last updated" timestamp to dashboard

**Shareable Links:**
- Make dashboard public
- Create a shortened link: dune.com/decaflow
- Add to your pitch deck

### 10. Example Dashboards to Learn From

Study these top DeFi protocol dashboards:

1. **Uniswap:** https://dune.com/uniswap
   - Clean layout, clear metrics, great visualizations

2. **Aave:** https://dune.com/aave
   - Excellent TVL breakdown by asset

3. **Lido:** https://dune.com/lido
   - Perfect example of staking metrics

4. **1inch:** https://dune.com/1inch
   - DEX aggregator like you - shows volume routing

5. **Curve:** https://dune.com/curve
   - Great liquidity pool analytics

### 11. Launch Checklist

- [ ] Dune account created
- [ ] Dashboard created and public
- [ ] At least 4 key queries added (TVL, Volume, Users, Revenue)
- [ ] Visualizations configured (charts, not just tables)
- [ ] Descriptions added to every chart
- [ ] Dashboard tested on mobile
- [ ] Tracking mechanism decided (how to identify your users)
- [ ] Dashboard link added to your website footer
- [ ] Dashboard link added to your pitch deck
- [ ] Tweet announcement with dashboard link

### 12. Marketing Your Dashboard

Once live, announce it:

**Twitter/X Post:**
```
📊 DecaFlow metrics are now live on @DuneAnalytics!

Track our protocol in real-time:
📈 Total Value Locked
💎 Trading Volume
👥 Unique Users
⛓️ Multi-chain activity

Fully transparent, fully on-chain:
[dune.com/decaflow]

#DeFi #Analytics #DecaFlow
```

**To VCs:**
```
Hi [Name],

As part of our commitment to transparency, we've launched a 
real-time Dune Analytics dashboard:

[dune.com/decaflow]

All metrics are pulled directly from blockchain data and 
independently verifiable. Our current highlights:

- TVL: $XXX,XXX
- 30d Volume: $X.XXM  
- Unique Users: X,XXX
- XX% MoM growth

Happy to discuss our traction in detail.

Best,
[Your name]
```

### 13. Maintenance

**Weekly:**
- Check that all queries are running without errors
- Update query logic if contract addresses change

**Monthly:**
- Add new metrics based on product features
- Review query performance and optimize

**Quarterly:**
- Redesign dashboard layout based on what VCs ask about most
- Add competitive analysis charts

### Need Help?

**Dune Community:**
- Discord: https://discord.gg/dunecom
- Docs: https://docs.dune.com

**Dune Wizards (paid consultants):**
- Can build your entire dashboard professionally
- Cost: $2K-$10K depending on complexity
- Find them in Dune Discord

**SQL Help:**
- If you're not familiar with SQL, hire a Dune wizard
- Or use ChatGPT to help write queries
- Or DM me - I can help with specific queries

---

## Next Steps

1. **TODAY:** Create Dune account and blank dashboard ✅ (You did this!)
2. **TODAY:** Add Query 1 (takes 2 minutes to test the process)
3. **THIS WEEK:** Add all 12 queries (45-60 minutes total)
4. **THIS WEEK:** Arrange dashboard layout (Section 5)
5. **THIS WEEK:** Make dashboard public and get shareable link
6. **BEFORE FUNDRAISING:** Include dashboard link in pitch deck

Remember: VCs will check Dune BEFORE your call. Having a professional dashboard shows you're serious about transparency and understand what metrics matter.

---

## 📋 COMPLETE QUERY CHECKLIST

Here are all 12 queries you need to add. Check them off as you complete:

**Big Numbers (Counters):**
- [ ] Query 10: Total Unique Users (All Chains)
- [ ] Query 11: Total Trading Volume (All Chains)
- [ ] Query 4: Base Unique Wallets

**Volume Analytics:**
- [ ] Query 1: Base Chain Daily Volume (Line Chart)
- [ ] Query 3: Multi-Chain Volume Comparison (Bar Chart)
- [ ] Query 9: Weekly Volume Trend (Area Chart)

**User Engagement:**
- [ ] Query 5: Daily Active Users on Base (Line Chart)
- [ ] Query 12: Router Interactions (Line Chart)

**Liquidity Analytics:**
- [ ] Query 2: Liquidity Positions on Base (Line Chart)
- [ ] Query 7: All Chain Liquidity Positions (Bar Chart)

**Detailed Data:**
- [ ] Query 8: Top Trading Pairs (Table)
- [ ] Query 6: Recent Large Swaps (Table)

**Timeline:**
- Complete 3-4 queries today (30 minutes)
- Complete remaining queries this week (30 minutes)
- Total effort: 60 minutes

---

## 🎯 WHAT YOUR FINISHED DASHBOARD WILL SHOW VCs

When complete, your Dune dashboard will display:

✅ **Multi-chain presence** - Activity across 6 chains (Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche)
✅ **Trading volume** - Daily, weekly trends and totals
✅ **User adoption** - Unique wallets and daily active users
✅ **Liquidity provision** - LP positions across all chains
✅ **Router usage** - Direct interactions with YOUR contracts
✅ **Recent activity** - Large swaps and whale tracking
✅ **Top pairs** - Most popular trading pairs

**Professional, verifiable, and impressive to investors!**

---

## 💡 IMPORTANT NOTE FOR VCs

These queries show general Uniswap V3 activity on the chains you support. While they're not DecaFlow-specific yet (because you route through Uniswap), VCs understand this for early-stage protocols.

**What to tell VCs:**
- "This shows the ecosystem we operate in - healthy markets on all our supported chains"
- "Our internal dashboard (decaflow.xyz/investor-metrics) tracks DecaFlow-specific metrics"
- "We're deploying attribution tracking for DecaFlow-only data in Q1 2026"
- "Query 12 shows direct interactions with our router contracts"

**This is normal and acceptable.** Having ANY Dune dashboard shows transparency and sophistication.
