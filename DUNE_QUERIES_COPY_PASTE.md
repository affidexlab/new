# DecaFlow Dune Analytics - Copy-Paste Queries
## All 12 Queries Ready to Use

Simply copy each query, paste into Dune, click Run, then Save and add to dashboard.

---

## Query 1: Base Chain Daily Volume
**Visualization:** Line Chart (X: date, Y: daily_volume_usd)

```sql
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

---

## Query 2: Base Liquidity Positions  
**Visualization:** Line Chart (X: date, Y: total_positions)

```sql
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

---

## Query 3: Volume by Chain
**Visualization:** Bar Chart (X: chain, Y: volume_usd)

```sql
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

---

## Query 4: Base Unique Wallets
**Visualization:** Counter (Display: total_unique_wallets)

```sql
SELECT
    COUNT(DISTINCT taker) AS total_unique_wallets,
    COUNT(*) AS total_transactions
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '30' DAY
```

---

## Query 5: Daily Active Users on Base
**Visualization:** Line Chart (X: date, Y: daily_active_users)

```sql
SELECT
    DATE_TRUNC('day', block_time) AS date,
    COUNT(DISTINCT taker) AS daily_active_users,
    COUNT(*) AS daily_swaps
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '60' DAY
GROUP BY 1
ORDER BY 1 DESC
```

---

## Query 6: Recent Large Swaps
**Visualization:** Table

```sql
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

---

## Query 7: All Chain Liquidity Positions
**Visualization:** Bar Chart (X: chain, Y: position_count)

```sql
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

---

## Query 8: Top Trading Pairs
**Visualization:** Table

```sql
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

---

## Query 9: Weekly Volume Trend
**Visualization:** Area Chart (X: week, Y: volume_usd, Group by: chain)

```sql
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

---

## Query 10: Total Unique Users
**Visualization:** Counter (Display: total_unique_users)

```sql
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

---

## Query 11: Total Trading Volume
**Visualization:** Counter (Display: total_volume_30d, Prefix: $)

```sql
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

---

## Query 12: Router Interactions (DECAFLOW-SPECIFIC!)
**Visualization:** Line Chart (X: date, Y: tx_count, Group by: chain)

```sql
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

---

## HOW TO ADD EACH QUERY

**Step-by-step for each query above:**

1. Go to https://dune.com
2. Click **"New Query"** button (top right)
3. **Copy** the SQL code from above
4. **Paste** into the Dune editor
5. Click **"Run"** button
6. Wait for results (5-10 seconds)
7. Click **"Save"** button
8. Give it a name (e.g., "DecaFlow - Base Chain Daily Volume")
9. Click **"Save Query"**
10. Click **"Add to Dashboard"**
11. Select your "DecaFlow Protocol Metrics" dashboard
12. Choose visualization type (listed above each query)
13. Click **"Add"**

**Repeat for all 12 queries!**

---

## RECOMMENDED DASHBOARD LAYOUT

Once all queries are added to your dashboard, arrange them like this:

**Row 1: Title (Text Widget)**
```
📊 DecaFlow Protocol - Multi-Chain Analytics
Live on-chain data across 6 chains
```

**Row 2: Big Numbers (3 Counters)**
- Query 11 | Query 10 | Query 4

**Row 3: Volume Chart (Full Width)**
- Query 1

**Row 4: Chain Comparison (2 Charts)**
- Query 3 | Query 7

**Row 5: Weekly Trend (Full Width)**
- Query 9

**Row 6: User Metrics (2 Charts)**
- Query 5 | Query 2

**Row 7: Details (2 Tables)**
- Query 8 | Query 6

**Row 8: Router Activity (Full Width)**
- Query 12

---

## IMPORTANT NOTES

**Router Addresses Used (Your Actual Contracts):**
- Base: `0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4`
- Arbitrum: `0xDE8700785C7512a8397683A9BE9717B0aFdB18F3`
- Optimism: `0xA2fdf81b7967e7FA7610DeBe1901A40686c48992`
- Polygon: `0xFd05977256E8D5753728C78A3003BC3B75Fef1DD`

**Position Managers Used:**
- Ethereum: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Base: `0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1`
- Arbitrum: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Optimism: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Polygon: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Avalanche: `0x655C406EBFa14EE2006250925e54ec43AD184f8B`

**Query 12 is DecaFlow-Specific!** It tracks direct interactions with YOUR router contracts.

---

## TROUBLESHOOTING

**"Query failed" or "No results":**
- Some chains may have low activity - that's ok!
- Try reducing date range (change `90 DAY` to `30 DAY`)
- Make sure Dune selected the right blockchain

**"Query timeout":**
- Reduce INTERVAL from 180 to 90 or 60 days
- Simplify the query (remove one chain)

**"Table doesn't exist":**
- Make sure you're querying the right chain's table
- Try updating Dune (they sometimes rename tables)

---

## TIME ESTIMATE

- Query 1-6: **20 minutes** (simpler queries)
- Query 7-12: **25 minutes** (multi-chain queries take longer)
- Dashboard arrangement: **10 minutes**
- **Total: 55 minutes**

---

## AFTER YOU'RE DONE

1. Make dashboard public (Settings → Public)
2. Get shareable link
3. Test on mobile
4. Share with team
5. Add to website footer
6. Include in pitch deck
7. Tweet announcement

**You'll have a professional, VC-ready Dune Analytics dashboard!** 🎉
