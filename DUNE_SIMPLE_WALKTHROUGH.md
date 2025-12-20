# 🎯 SIMPLE DUNE ANALYTICS WALKTHROUGH
## For Non-Developers - Just Follow Screenshots

Since you're not a developer, here's the **exact step-by-step process** with what to click.

---

## ✅ YOU'VE ALREADY DONE:
1. Created Dune account ✅
2. Created a dashboard ✅

**Great! Now let's add the queries...**

---

## 📝 ADDING YOUR FIRST QUERY (Start Here!)

### Step 1: Open Dune and Click "New Query"

Go to: https://dune.com

Look for a button that says **"New Query"** or **"Create Query"** (usually top right corner)

Click it.

### Step 2: You'll See a Blank SQL Editor

It looks like a big text box with "SELECT" or similar placeholder text.

### Step 3: Open the Query File on Your Computer

On your computer, open this file:
**`DUNE_QUERIES_COPY_PASTE.md`**

(It's in your GitHub repo at: affidexlab/new/DUNE_QUERIES_COPY_PASTE.md)

### Step 4: Copy Query 11 (Easiest One!)

Scroll to **"Query 11: Total Trading Volume"**

Select and copy this entire code block:

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

### Step 5: Paste Into Dune

- Click in the Dune editor (the big text box)
- Press Ctrl+A (Windows) or Cmd+A (Mac) to select all
- Press Delete to clear it
- Press Ctrl+V (Windows) or Cmd+V (Mac) to paste your query

### Step 6: Click "Run"

Look for a **"Run"** button (usually blue, near top right of the editor)

Click it.

**Wait 5-10 seconds.** You'll see results appear below!

### Step 7: Save the Query

You should see results like:
```
total_volume_30d
123456789.50
```

Look for a **"Save"** or **"Save Query"** button.

Click it.

### Step 8: Name Your Query

A popup will ask for a name.

Type: **"DecaFlow - Total Volume"**

Click **"Save"** or **"Save Query"**

### Step 9: Add to Dashboard

After saving, look for **"Add to Dashboard"** button.

Click it.

Select your dashboard: **"DecaFlow Protocol Metrics"**

### Step 10: Choose Visualization

A menu will appear asking for visualization type.

For Query 11, choose: **"Counter"**

(This makes it a big number display)

Click **"Add to Dashboard"** or **"Confirm"**

### Step 11: Done! 🎉

**You just added your first query!**

The dashboard should now show a big number with the total trading volume.

---

## 🔁 NOW REPEAT FOR THE OTHER 11 QUERIES

The process is IDENTICAL for each:

1. Click "New Query"
2. Open `DUNE_QUERIES_COPY_PASTE.md`
3. Copy the next query
4. Paste into Dune
5. Click "Run"
6. Click "Save"
7. Name it
8. Add to dashboard
9. Choose visualization type (listed in the file)

**Do them in this order (easiest to hardest):**

**EASY (Big Numbers - 5 min each):**
1. Query 11: Total Volume ✅ (You just did this!)
2. Query 10: Total Users
3. Query 4: Base Unique Wallets

**MEDIUM (Simple Charts - 5 min each):**
4. Query 1: Base Daily Volume
5. Query 5: Daily Active Users
6. Query 2: Liquidity Positions on Base

**ADVANCED (Multi-Chain - 5 min each):**
7. Query 3: Volume by Chain
8. Query 7: All Chain Liquidity
9. Query 9: Weekly Volume Trend
10. Query 12: Router Interactions

**TABLES (Easiest Visualization - 3 min each):**
11. Query 8: Top Trading Pairs
12. Query 6: Recent Large Swaps

**Total time: 60 minutes max**

---

## 🎨 ARRANGING YOUR DASHBOARD

After all queries are added:

1. Go to your dashboard
2. Click **"Edit"** or pencil icon
3. **Drag and drop** the visualizations to arrange them
4. Put the 3 counters (Query 10, 11, 4) at the top in a row
5. Put charts below
6. Put tables at bottom

**Reference layout:** See Section 5 in `DUNE_ANALYTICS_SETUP_GUIDE.md`

---

## 🚀 MAKING IT PUBLIC

After your dashboard looks good:

1. In dashboard view, look for **"Settings"** or gear icon
2. Find option: **"Make Public"** or "Visibility: Public"
3. Click to enable
4. Copy the dashboard URL (should be like: dune.com/yourname/decaflow-protocol-metrics)
5. Save that link!

---

## 📱 SHARE YOUR DASHBOARD

**Once public, share it:**

### On Twitter:
```
📊 DecaFlow is now live on @DuneAnalytics!

Real-time multi-chain metrics:
✅ Trading volume across 6 chains
✅ Unique users & daily activity
✅ Liquidity positions
✅ Fully transparent & verifiable

Dashboard: [your dune link]

#DeFi #DecaFlow
```

### On Your Website:
Add to footer:
```html
<a href="[your dune link]">Analytics on Dune →</a>
```

### To VCs:
Include in every pitch deck and email.

---

## ❓ COMMON QUESTIONS

**"Do I need to understand SQL?"**
No! Just copy and paste. The queries are ready.

**"What if a query doesn't return results?"**
That's ok! Some chains have low activity. Just add it anyway.

**"How long will this take?"**
- First 3 queries: 15 minutes (learning the process)
- Next 9 queries: 35 minutes (you'll be faster)
- Arranging dashboard: 10 minutes
- **Total: 60 minutes**

**"What if I make a mistake?"**
You can't break anything! Just try again. Delete the query and re-add it.

**"Can someone do this for me?"**
Yes - hire a "Dune Wizard" in Dune Discord for $200-500. But it's honestly easier to just do it yourself. Copy-paste is simple!

---

## 🎬 VIDEO WALKTHROUGH (If You Want)

Search YouTube for: **"How to create Dune Analytics dashboard"**

Lots of tutorials available. The process is:
1. New Query
2. Paste SQL
3. Run
4. Save
5. Add to dashboard

That's it!

---

## ⚡ QUICK WIN

**Just do the first 3 queries today (15 minutes):**
- Query 11: Total Volume
- Query 10: Total Users
- Query 1: Base Daily Volume

**See how easy it is!**

Then do the rest this week.

You don't need to do all 12 at once. Start small, build confidence, then add more.

---

## 🏁 FINAL CHECKLIST

**Today:**
- [ ] Merge PR #138
- [ ] Test https://decaflow.xyz/investor-metrics
- [ ] Add Query 11 to Dune (your first query!)
- [ ] Add Query 10 to Dune
- [ ] Add Query 1 to Dune

**This Week:**
- [ ] Add remaining 9 queries to Dune
- [ ] Arrange dashboard layout
- [ ] Make dashboard public
- [ ] Get shareable link
- [ ] Tweet announcement

**Before Fundraising:**
- [ ] Submit to DeFiLlama
- [ ] Add Dune link to website
- [ ] Add Dune link to pitch deck
- [ ] Test investor dashboard on mobile

---

**YOU'VE GOT THIS! The hard part (code) is done. Now just copy-paste and you're ready for VCs! 🚀**
