# DecaFlow-Specific Dune Queries
## Queries That Will Actually Work for Your Protocol

These queries track YOUR router contracts directly, not general Uniswap activity.

---

## Query 1: DecaFlow Daily Transaction Count
**What it tracks:** Direct interactions with your router contracts  
**Visualization:** Line Chart (X: date, Y: tx_count)

```sql
WITH all_chains AS (
    -- Base
    SELECT
        DATE_TRUNC('day', block_time) AS date,
        'Base' AS chain,
        COUNT(*) AS tx_count,
        COUNT(DISTINCT "from") AS unique_users
    FROM base.transactions
    WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
    AND block_time >= NOW() - INTERVAL '90' DAY
    GROUP BY 1, 2
    
    UNION ALL
    
    -- Arbitrum
    SELECT
        DATE_TRUNC('day', block_time) AS date,
        'Arbitrum' AS chain,
        COUNT(*) AS tx_count,
        COUNT(DISTINCT "from") AS unique_users
    FROM arbitrum.transactions
    WHERE "to" = 0xDE8700785C7512a8397683A9BE9717B0aFdB18F3
    AND block_time >= NOW() - INTERVAL '90' DAY
    GROUP BY 1, 2
    
    UNION ALL
    
    -- Optimism
    SELECT
        DATE_TRUNC('day', block_time) AS date,
        'Optimism' AS chain,
        COUNT(*) AS tx_count,
        COUNT(DISTINCT "from") AS unique_users
    FROM optimism.transactions
    WHERE "to" = 0xA2fdf81b7967e7FA7610DeBe1901A40686c48992
    AND block_time >= NOW() - INTERVAL '90' DAY
    GROUP BY 1, 2
    
    UNION ALL
    
    -- Polygon
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

SELECT 
    date,
    SUM(tx_count) AS daily_transactions,
    SUM(unique_users) AS daily_active_users
FROM all_chains
GROUP BY 1
ORDER BY 1 DESC
```

---

## Query 2: Total DecaFlow Users (30 Days)
**What it tracks:** Unique wallet addresses using your routers  
**Visualization:** Counter

```sql
WITH all_users AS (
    SELECT DISTINCT "from" AS wallet FROM base.transactions
    WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION
    
    SELECT DISTINCT "from" AS wallet FROM arbitrum.transactions
    WHERE "to" = 0xDE8700785C7512a8397683A9BE9717B0aFdB18F3
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION
    
    SELECT DISTINCT "from" AS wallet FROM optimism.transactions
    WHERE "to" = 0xA2fdf81b7967e7FA7610DeBe1901A40686c48992
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION
    
    SELECT DISTINCT "from" AS wallet FROM polygon.transactions
    WHERE "to" = 0xFd05977256E8D5753728C78A3003BC3B75Fef1DD
    AND block_time >= NOW() - INTERVAL '30' DAY
)

SELECT COUNT(*) AS total_unique_users
FROM all_users
```

---

## Query 3: Transactions by Chain
**What it tracks:** Which chains are most popular  
**Visualization:** Bar Chart (X: chain, Y: tx_count)

```sql
SELECT 'Base' AS chain, COUNT(*) AS tx_count
FROM base.transactions
WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
AND block_time >= NOW() - INTERVAL '30' DAY

UNION ALL

SELECT 'Arbitrum' AS chain, COUNT(*) AS tx_count
FROM arbitrum.transactions
WHERE "to" = 0xDE8700785C7512a8397683A9BE9717B0aFdB18F3
AND block_time >= NOW() - INTERVAL '30' DAY

UNION ALL

SELECT 'Optimism' AS chain, COUNT(*) AS tx_count
FROM optimism.transactions
WHERE "to" = 0xA2fdf81b7967e7FA7610DeBe1901A40686c48992
AND block_time >= NOW() - INTERVAL '30' DAY

UNION ALL

SELECT 'Polygon' AS chain, COUNT(*) AS tx_count
FROM polygon.transactions
WHERE "to" = 0xFd05977256E8D5753728C78A3003BC3B75Fef1DD
AND block_time >= NOW() - INTERVAL '30' DAY

ORDER BY tx_count DESC
```

---

## Query 4: Base Chain Activity (Most Active)
**What it tracks:** Base chain transactions over time  
**Visualization:** Line Chart

```sql
SELECT
    DATE_TRUNC('day', block_time) AS date,
    COUNT(*) AS transactions,
    COUNT(DISTINCT "from") AS unique_users,
    SUM(gas_price * gas_used) / 1e18 AS total_gas_eth
FROM base.transactions
WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
AND block_time >= NOW() - INTERVAL '90' DAY
GROUP BY 1
ORDER BY 1 DESC
```

---

## Query 5: Recent Transactions
**What it tracks:** Latest transactions across all chains  
**Visualization:** Table

```sql
WITH all_txs AS (
    SELECT 
        block_time,
        'Base' AS chain,
        hash AS tx_hash,
        "from" AS user_wallet,
        gas_price * gas_used / 1e18 AS gas_cost_eth
    FROM base.transactions
    WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
    AND block_time >= NOW() - INTERVAL '7' DAY
    
    UNION ALL
    
    SELECT 
        block_time,
        'Arbitrum' AS chain,
        hash AS tx_hash,
        "from" AS user_wallet,
        gas_price * gas_used / 1e18 AS gas_cost_eth
    FROM arbitrum.transactions
    WHERE "to" = 0xDE8700785C7512a8397683A9BE9717B0aFdB18F3
    AND block_time >= NOW() - INTERVAL '7' DAY
    
    UNION ALL
    
    SELECT 
        block_time,
        'Optimism' AS chain,
        hash AS tx_hash,
        "from" AS user_wallet,
        gas_price * gas_used / 1e18 AS gas_cost_eth
    FROM optimism.transactions
    WHERE "to" = 0xA2fdf81b7967e7FA7610DeBe1901A40686c48992
    AND block_time >= NOW() - INTERVAL '7' DAY
    
    UNION ALL
    
    SELECT 
        block_time,
        'Polygon' AS chain,
        hash AS tx_hash,
        "from" AS user_wallet,
        gas_price * gas_used / 1e18 AS gas_cost_eth
    FROM polygon.transactions
    WHERE "to" = 0xFd05977256E8D5753728C78A3003BC3B75Fef1DD
    AND block_time >= NOW() - INTERVAL '7' DAY
)

SELECT *
FROM all_txs
ORDER BY block_time DESC
LIMIT 50
```

---

## Query 6: Weekly Growth Rate
**What it tracks:** Week-over-week transaction growth  
**Visualization:** Line Chart

```sql
WITH weekly_data AS (
    SELECT
        DATE_TRUNC('week', block_time) AS week,
        COUNT(*) AS tx_count,
        COUNT(DISTINCT "from") AS unique_users
    FROM base.transactions
    WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
    AND block_time >= NOW() - INTERVAL '180' DAY
    GROUP BY 1
)

SELECT 
    week,
    tx_count,
    unique_users,
    LAG(tx_count) OVER (ORDER BY week) AS prev_week_txs,
    CASE 
        WHEN LAG(tx_count) OVER (ORDER BY week) > 0 
        THEN ((tx_count - LAG(tx_count) OVER (ORDER BY week))::FLOAT / LAG(tx_count) OVER (ORDER BY week) * 100)
        ELSE 0 
    END AS growth_rate_pct
FROM weekly_data
ORDER BY week DESC
```

---

## Query 7: Gas Usage Analysis
**What it tracks:** Gas costs for DecaFlow users  
**Visualization:** Bar Chart

```sql
WITH gas_data AS (
    SELECT
        'Base' AS chain,
        AVG(gas_used) AS avg_gas,
        AVG(gas_price * gas_used / 1e18) AS avg_cost_eth
    FROM base.transactions
    WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT
        'Arbitrum' AS chain,
        AVG(gas_used) AS avg_gas,
        AVG(gas_price * gas_used / 1e18) AS avg_cost_eth
    FROM arbitrum.transactions
    WHERE "to" = 0xDE8700785C7512a8397683A9BE9717B0aFdB18F3
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT
        'Optimism' AS chain,
        AVG(gas_used) AS avg_gas,
        AVG(gas_price * gas_used / 1e18) AS avg_cost_eth
    FROM optimism.transactions
    WHERE "to" = 0xA2fdf81b7967e7FA7610DeBe1901A40686c48992
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT
        'Polygon' AS chain,
        AVG(gas_used) AS avg_gas,
        AVG(gas_price * gas_used / 1e18) AS avg_cost_eth
    FROM polygon.transactions
    WHERE "to" = 0xFd05977256E8D5753728C78A3003BC3B75Fef1DD
    AND block_time >= NOW() - INTERVAL '30' DAY
)

SELECT 
    chain,
    ROUND(avg_gas::NUMERIC, 0) AS avg_gas_used,
    ROUND(avg_cost_eth::NUMERIC, 6) AS avg_cost_eth
FROM gas_data
ORDER BY avg_cost_eth DESC
```

---

## Query 8: Power Users (Top 10)
**What it tracks:** Most active wallet addresses  
**Visualization:** Table

```sql
WITH all_users AS (
    SELECT "from" AS wallet, 'Base' AS chain
    FROM base.transactions
    WHERE "to" = 0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT "from" AS wallet, 'Arbitrum' AS chain
    FROM arbitrum.transactions
    WHERE "to" = 0xDE8700785C7512a8397683A9BE9717B0aFdB18F3
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT "from" AS wallet, 'Optimism' AS chain
    FROM optimism.transactions
    WHERE "to" = 0xA2fdf81b7967e7FA7610DeBe1901A40686c48992
    AND block_time >= NOW() - INTERVAL '30' DAY
    
    UNION ALL
    
    SELECT "from" AS wallet, 'Polygon' AS chain
    FROM polygon.transactions
    WHERE "to" = 0xFd05977256E8D5753728C78A3003BC3B75Fef1DD
    AND block_time >= NOW() - INTERVAL '30' DAY
)

SELECT 
    wallet,
    COUNT(*) AS total_transactions,
    COUNT(DISTINCT chain) AS chains_used,
    STRING_AGG(DISTINCT chain, ', ') AS chains_list
FROM all_users
GROUP BY wallet
ORDER BY total_transactions DESC
LIMIT 10
```

---

## IMPORTANT: Why The Other Queries Failed

The queries in `DUNE_QUERIES_COPY_PASTE.md` were pulling from:
- `uniswap_v3_base.trades` 
- `uniswap_v3_arbitrum.trades`

**This tracks ALL Uniswap V3 trades, not DecaFlow-specific activity.**

Unless your router shows up in Uniswap's aggregated trade data (which requires significant volume), those queries will return zero results.

---

## What These New Queries Do

✅ **Track YOUR router contracts directly**  
✅ **Count transactions sent TO your addresses**  
✅ **Will show data even with low volume**  
✅ **Multi-chain support**  
✅ **Gas cost analysis**  
✅ **User growth metrics**

---

## How to Use

1. Start with **Query 1** (should work immediately)
2. Then try **Query 2** and **Query 3**
3. If those work, proceed with the rest

If you get "No value present" on Query 1, it means:
- No transactions have been sent to your router contracts in the last 90 days
- Try reducing `INTERVAL '90' DAY` to `INTERVAL '365' DAY` to check historical data
- Verify your router addresses are deployed and active

---

## Your Router Addresses (from your contracts)

- **Base:** `0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4`
- **Arbitrum:** `0xDE8700785C7512a8397683A9BE9717B0aFdB18F3`
- **Optimism:** `0xA2fdf81b7967e7FA7610DeBe1901A40686c48992`
- **Polygon:** `0xFd05977256E8D5753728C78A3003BC3B75Fef1DD`

---

## Next Steps

1. Try Query 1 first - this is the simplest test
2. If it returns 0 results, check if any transactions have hit your routers
3. You can verify on block explorers:
   - Base: https://basescan.org/address/0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4
   - Arbitrum: https://arbiscan.io/address/0xDE8700785C7512a8397683A9BE9717B0aFdB18F3
4. If no transactions exist, you need to drive usage to your protocol first
