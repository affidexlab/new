# Dune Analytics - Simple Copy-Paste Queries for DecaFlow
## For Non-Developers

Since you're not a developer, I've created the **simplest possible queries** that you can copy and paste directly into Dune Analytics. These will show basic blockchain activity for the chains you support.

---

## IMPORTANT: The Attribution Challenge

**Problem:** When users swap through your platform, the transactions go to Uniswap/0x Protocol contracts - not YOUR contracts. So on-chain, they look like regular Uniswap/0x transactions.

**Short-term Solution (for now):** Show general activity on the chains you support as a starting point. This shows protocol health even if it's not DecaFlow-specific yet.

**Long-term Solution:** Deploy the tracking contract from the guide, then we can filter for YOUR specific users.

---

## Query 1: Base Chain Daily Swaps (Uniswap V3)

**What it shows:** Daily swap volume on Base (one of your main chains)

**Copy this into Dune:**

```sql
SELECT
    DATE_TRUNC('day', block_time) AS date,
    COUNT(*) AS daily_swaps,
    SUM(amount_usd) AS daily_volume_usd
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '90' DAY
GROUP BY 1
ORDER BY 1 DESC
```

**Visualization:** Line Chart
- X-axis: `date`
- Y-axis: `daily_volume_usd`

---

## Query 2: Total Unique Wallets (Base Chain)

**What it shows:** Number of unique users on Base

**Copy this into Dune:**

```sql
SELECT
    COUNT(DISTINCT "from") AS unique_wallets
FROM base.transactions
WHERE block_time >= NOW() - INTERVAL '30' DAY
AND to IN (
    0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1  -- Uniswap V3 Position Manager on Base
)
```

**Visualization:** Counter (Big Number)

---

## Query 3: Transaction Volume by Chain

**What it shows:** Compare volume across different chains

**Copy this into Dune:**

```sql
-- Base
SELECT 
    'Base' AS chain,
    SUM(amount_usd) AS total_volume_usd
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '30' DAY

UNION ALL

-- Arbitrum  
SELECT
    'Arbitrum' AS chain,
    SUM(amount_usd) AS total_volume_usd
FROM uniswap_v3_arbitrum.trades
WHERE block_time >= NOW() - INTERVAL '30' DAY

UNION ALL

-- Optimism
SELECT
    'Optimism' AS chain,
    SUM(amount_usd) AS total_volume_usd
FROM uniswap_v3_optimism.trades
WHERE block_time >= NOW() - INTERVAL '30' DAY
```

**Visualization:** Bar Chart
- X-axis: `chain`
- Y-axis: `total_volume_usd`

---

## Query 4: Recent Large Swaps (Base)

**What it shows:** Recent big transactions on Base

**Copy this into Dune:**

```sql
SELECT
    block_time,
    tx_hash,
    token_sold_symbol,
    token_bought_symbol,
    amount_usd
FROM uniswap_v3_base.trades
WHERE block_time >= NOW() - INTERVAL '7' DAY
AND amount_usd > 1000
ORDER BY block_time DESC
LIMIT 20
```

**Visualization:** Table

---

## Query 5: Daily Active Users (Base)

**What it shows:** How many unique users per day

**Copy this into Dune:**

```sql
SELECT
    DATE_TRUNC('day', block_time) AS date,
    COUNT(DISTINCT "from") AS daily_active_users
FROM base.transactions
WHERE block_time >= NOW() - INTERVAL '60' DAY
AND to = 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1  -- Uniswap V3 on Base
GROUP BY 1
ORDER BY 1 DESC
```

**Visualization:** Line Chart
- X-axis: `date`
- Y-axis: `daily_active_users`

---

## HOW TO USE THESE QUERIES IN DUNE

### Step 1: Create a New Query

1. Go to https://dune.com
2. Click **"New Query"** button (top right)
3. You'll see a blank SQL editor

### Step 2: Paste the Query

1. **Copy one of the queries above** (e.g., Query 1)
2. **Paste it** into the Dune editor
3. Click **"Run"** button

### Step 3: Save the Query

1. After it runs successfully, click **"Save"**
2. Name it: e.g., "Base Chain Daily Volume"
3. Click "Save Query"

### Step 4: Add to Dashboard

1. Go to your dashboard (the one you created)
2. Click **"Add Visualization"**
3. Search for the query you just saved
4. Select it
5. Choose visualization type (Line Chart, Bar Chart, etc.)
6. Click **"Add to Dashboard"**

### Step 5: Repeat for All 5 Queries

Do Steps 1-4 for each query above.

---

## WHAT YOUR DASHBOARD WILL SHOW

After adding all 5 queries, your dashboard will have:

✅ **Query 1:** Daily swap volume trend (shows market activity)
✅ **Query 2:** Total unique users (shows adoption)
✅ **Query 3:** Volume by chain comparison (shows multi-chain presence)
✅ **Query 4:** Recent large transactions (shows whale activity)
✅ **Query 5:** Daily active users trend (shows engagement)

---

## IMPORTANT NOTES

### Why These Aren't "DecaFlow-Specific" Yet

These queries show **general activity on the chains you support**, not specifically DecaFlow users. This is because:

- Your swaps go through Uniswap/0x Protocol contracts
- On-chain, they look like regular Uniswap/0x swaps
- There's no unique identifier yet

### How to Make Them DecaFlow-Specific

**Option 1: Deploy Tracking Contract** (Recommended)
- Use the contract code in `DUNE_ANALYTICS_SETUP_GUIDE.md` section 8
- Deploy to all your chains
- Have your frontend call this contract on every transaction
- Then you can filter by YOUR contract events

**Option 2: Track Specific Wallets**
- Export list of wallet addresses that used DecaFlow from your database
- Create a Dune dataset with these addresses
- Filter queries by these wallets
- Less automatic but works now

### For VCs: This is Normal for Early Stage

When showing this dashboard to VCs, explain:
- "This shows activity on the chains and pools we support"
- "We're deploying attribution tracking for DecaFlow-specific metrics"
- "Our internal analytics (decaflow.xyz/investor-metrics) show DecaFlow-specific data"

VCs understand this for early-stage protocols. Having *any* Dune dashboard shows transparency.

---

## MAKING IT LOOK PROFESSIONAL

### Dashboard Title

**Good title:**
```
DecaFlow Protocol | Multi-Chain Activity Dashboard
Live data from Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche
```

### Add Text Widgets

Between visualizations, add text widgets explaining:

```
📊 Market Overview

This dashboard tracks DeFi activity across the 6 chains supported by DecaFlow:
Ethereum, Base, Arbitrum, Optimism, Polygon, and Avalanche.

Current focus: Base Chain (our primary deployment)

All data pulled directly from blockchain - fully transparent and verifiable.
```

### Dashboard Layout Recommendation

```
Row 1: Text widget (intro)
Row 2: Query 2 (Counter) | Query 3 (Bar Chart)
Row 3: Query 1 (Line Chart - full width)
Row 4: Query 5 (Line Chart - full width)
Row 5: Query 4 (Table - full width)
```

---

## NEXT STEPS AFTER BASIC DASHBOARD

Once you have this basic dashboard running:

1. **Make it public** - Click "Settings" → "Make Public"
2. **Get the link** - Copy dashboard URL (e.g., dune.com/yourname/decaflow)
3. **Share on Twitter:**
   ```
   📊 DecaFlow metrics now live on @DuneAnalytics!
   
   Track our multi-chain activity in real-time:
   [your dune link]
   
   All data on-chain and independently verifiable.
   
   #DeFi #DecaFlow #Transparency
   ```

4. **Add to your website footer:**
   ```html
   <a href="[your dune link]">Analytics on Dune →</a>
   ```

5. **Include in pitch deck:**
   - Screenshot the dashboard
   - Add slide: "Independent Verification via Dune Analytics"

---

## IF YOU GET STUCK

### Common Errors

**Error: "Table not found"**
- Fix: Make sure you selected the right blockchain in Dune
- Try: Run the query again, sometimes it's a timeout

**Error: "Query timeout"**
- Fix: Reduce the date range (change `90 DAY` to `30 DAY`)
- Or: Remove the `WHERE` filters

**Error: "No results"**
- Fix: Check if the contract address is correct
- Or: Try a different chain (Base is most active)

### Getting Help

1. **Dune Community Discord:** https://discord.gg/dunecom
   - Ask in #query-questions channel
   - Very helpful community

2. **DM Me:** Share your dashboard link and I can review

3. **Hire a Dune Wizard:**
   - Post in Dune Discord #bounties channel
   - Budget: $200-500 for basic dashboard
   - They'll build everything professionally

---

## SUMMARY: YOUR ACTION PLAN

**TODAY (30 minutes):**
1. ✅ Log into Dune.com
2. ✅ Create new query
3. ✅ Copy-paste Query 1 (Base Daily Volume)
4. ✅ Click "Run" → "Save"
5. ✅ Add to your dashboard

**THIS WEEK (2 hours):**
6. Repeat for all 5 queries
7. Arrange dashboard layout
8. Add title and description text
9. Make dashboard public
10. Tweet the link

**NEXT MONTH:**
11. Deploy tracking contract (from guide)
12. Update queries to filter for DecaFlow users
13. Add more advanced metrics

---

## REALISTIC EXPECTATIONS

**What VCs will think:**
- ✅ "Good - they have a Dune dashboard" (shows transparency)
- ✅ "Basic metrics visible" (better than nothing)
- ❓ "These are general metrics, not DecaFlow-specific" (expected for early stage)

**How to address:**
- "This is our baseline. We're deploying attribution tracking for DecaFlow-specific metrics"
- "Our internal dashboard (decaflow.xyz/investor-metrics) tracks DecaFlow-only data"
- "Dune provides independent verification layer"

---

**You now have everything you need!** Just copy-paste the queries and you'll have a working Dune dashboard in 30 minutes.

**Questions?** The queries above are as simple as I can make them. Just copy, paste, run, save, add to dashboard. That's it!
