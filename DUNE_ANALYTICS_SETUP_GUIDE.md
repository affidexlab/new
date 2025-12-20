# Dune Analytics Dashboard Setup Guide for DecaFlow

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

#### Query 1: Total Trading Volume

```sql
-- DecaFlow Total Trading Volume (via 0x Protocol)
WITH decaflow_swaps AS (
    SELECT
        block_time,
        tx_hash,
        taker AS trader,
        maker_token,
        taker_token,
        maker_token_amount,
        taker_token_amount,
        "takerTokenFillAmount" / 1e18 AS amount_in,
        "makerTokenFillAmount" / 1e18 AS amount_out
    FROM zeroex_ethereum.ExchangeProxy_evt_LimitOrderFilled
    WHERE taker IN (
        -- Add wallet addresses of your users or track specific patterns
        -- For now, track all 0x swaps as you route through them
        SELECT DISTINCT "from" FROM ethereum.transactions
        WHERE to IN (0x...) -- Your router addresses
    )
    AND block_time >= NOW() - INTERVAL '30' DAY
)

SELECT
    DATE_TRUNC('day', block_time) AS date,
    COUNT(*) AS daily_swaps,
    COUNT(DISTINCT trader) AS unique_traders
FROM decaflow_swaps
GROUP BY 1
ORDER BY 1 DESC
```

**Note:** Since you route through 0x Protocol, you'll need to track transactions that originate from your frontend or use a specific identifier.

#### Query 2: TVL from Liquidity Positions

```sql
-- DecaFlow TVL from Uniswap V3 Positions
SELECT
    DATE_TRUNC('day', evt_block_time) AS date,
    COUNT(DISTINCT tokenId) AS total_positions,
    SUM(amount0) / 1e6 AS total_token0_usd,  -- Assuming USDC
    SUM(amount1) / 1e18 AS total_token1_eth   -- Assuming WETH
FROM uniswap_v3_base.NonfungiblePositionManager_evt_IncreaseLiquidity
WHERE contract_address = 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1  -- Base
AND evt_block_time >= NOW() - INTERVAL '90' DAY
GROUP BY 1
ORDER BY 1 DESC
```

#### Query 3: Unique Users Growth

```sql
-- DecaFlow Unique Users Over Time
WITH user_activity AS (
    SELECT
        DATE_TRUNC('day', block_time) AS date,
        "from" AS user
    FROM ethereum.transactions
    WHERE to IN (
        0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4,  -- Your routers
        0xDE8700785C7512a8397683A9BE9717B0aFdB18F3,
        0xA2fdf81b7967e7FA7610DeBe1901A40686c48992,
        0xFd05977256E8D5753728C78A3003BC3B75Fef1DD
    )
    AND block_time >= NOW() - INTERVAL '90' DAY
)

SELECT
    date,
    COUNT(DISTINCT user) AS daily_active_users,
    SUM(COUNT(DISTINCT user)) OVER (ORDER BY date) AS cumulative_users
FROM user_activity
GROUP BY 1
ORDER BY 1
```

#### Query 4: Protocol Revenue (if you charge fees)

```sql
-- DecaFlow Protocol Revenue
-- Track fee collection events from your fee router contracts
SELECT
    DATE_TRUNC('day', evt_block_time) AS date,
    SUM(amount / 1e18) AS fees_collected_eth,
    COUNT(*) AS fee_events
FROM ethereum.logs
WHERE contract_address IN (
    -- Your fee collection contracts
)
AND topic0 = 0x... -- Fee collection event signature
GROUP BY 1
ORDER BY 1 DESC
```

### 5. Dashboard Layout Best Practices

**Top Row - Key Metrics (Big Numbers):**
- Total Value Locked (TVL)
- 30-Day Trading Volume
- Total Unique Users
- Protocol Revenue (30d)

**Second Row - Growth Charts:**
- Daily Trading Volume (Line Chart)
- Cumulative Users (Line Chart)
- Daily Active Users (Bar Chart)

**Third Row - Detailed Analytics:**
- Volume by Chain (Pie Chart)
- Top Trading Pairs (Table)
- User Retention Cohorts (Heatmap)
- Protocol Revenue Trend (Area Chart)

**Bottom Row - Recent Activity:**
- Recent Large Swaps (Table)
- Recent Liquidity Additions (Table)

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

1. **TODAY:** Create Dune account and blank dashboard
2. **THIS WEEK:** Deploy tracking contract to all chains
3. **THIS WEEK:** Build first 4 queries (TVL, Volume, Users, Revenue)
4. **NEXT WEEK:** Polish dashboard and make public
5. **BEFORE FUNDRAISING:** Include dashboard link in all investor materials

Remember: VCs will check Dune BEFORE your call. Having a professional dashboard shows you're serious about transparency and understand what metrics matter.
