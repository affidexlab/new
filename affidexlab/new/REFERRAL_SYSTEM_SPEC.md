# DecaFlow Referral System - Implementation Spec
## Turn Users Into Your Marketing Team (Zero Cost Growth Engine)

**Priority:** CRITICAL - Build This First  
**Implementation Time:** 2-3 days  
**Cost:** $0  
**Expected Impact:** 2-5x organic growth rate

---

## 🎯 WHY THIS MATTERS

**Without referrals:** You manually recruit each user  
**With referrals:** Users recruit users (exponential growth)

**Example:**
- You recruit 100 users manually
- Each refers 2 friends = 200 new users
- Those refer 2 friends = 400 new users
- **Total: 700 users from 100 initial**

**This is how you hit 1000+ users with zero budget.**

---

## 📋 SYSTEM OVERVIEW

### Core Mechanics

**Every user gets:**
1. Unique referral code (e.g., `DECA-A7X9M`)
2. Shareable referral link: `decaflow.xyz?ref=DECA-A7X9M`
3. 10% points bonus on all referrals' transactions

**Referred users get:**
1. 10% points bonus on their transactions (first 30 days)
2. Welcome message: "You were referred by 0x123...456"

**Top referrers get:**
1. Weekly prize: 5% of platform fees
2. Monthly prize: 10% of platform fees
3. Leaderboard rank: "Top Referrer" badge
4. Public recognition on Twitter

---

## 🗄️ DATABASE SCHEMA

### Add to Users Table

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(42); -- wallet address
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_points_earned DECIMAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_bonus_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_bonus_expires_at TIMESTAMP;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
```

### Add Referrals Tracking Table

```sql
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_wallet VARCHAR(42) NOT NULL,
    referee_wallet VARCHAR(42) NOT NULL,
    referral_code VARCHAR(50) NOT NULL,
    referee_first_transaction_at TIMESTAMP,
    referee_total_points DECIMAL DEFAULT 0,
    referrer_bonus_points DECIMAL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(referee_wallet),
    FOREIGN KEY (referrer_wallet) REFERENCES users(wallet_address),
    FOREIGN KEY (referee_wallet) REFERENCES users(wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
```

---

## 🔧 BACKEND IMPLEMENTATION

### 1. Referral Code Generation

**File:** `backend/src/services/referralService.js`

```javascript
const crypto = require('crypto');

class ReferralService {
  
  // Generate unique referral code
  generateReferralCode() {
    const prefix = 'DECA-';
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${random}`;
  }
  
  // Create or get user's referral code
  async getOrCreateReferralCode(walletAddress) {
    const query = 'SELECT referral_code FROM users WHERE wallet_address = $1';
    const result = await db.query(query, [walletAddress.toLowerCase()]);
    
    if (result.rows[0]?.referral_code) {
      return result.rows[0].referral_code;
    }
    
    // Generate new code
    let code;
    let isUnique = false;
    
    while (!isUnique) {
      code = this.generateReferralCode();
      const check = await db.query(
        'SELECT COUNT(*) FROM users WHERE referral_code = $1',
        [code]
      );
      isUnique = check.rows[0].count === '0';
    }
    
    // Update user with code
    await db.query(
      'UPDATE users SET referral_code = $1 WHERE wallet_address = $2',
      [code, walletAddress.toLowerCase()]
    );
    
    return code;
  }
  
  // Record referral when new user connects wallet
  async recordReferral(refereeWallet, referralCode) {
    // Check if referee already referred
    const existing = await db.query(
      'SELECT * FROM referrals WHERE referee_wallet = $1',
      [refereeWallet.toLowerCase()]
    );
    
    if (existing.rows.length > 0) {
      return { success: false, message: 'User already referred' };
    }
    
    // Find referrer by code
    const referrer = await db.query(
      'SELECT wallet_address FROM users WHERE referral_code = $1',
      [referralCode]
    );
    
    if (referrer.rows.length === 0) {
      return { success: false, message: 'Invalid referral code' };
    }
    
    const referrerWallet = referrer.rows[0].wallet_address;
    
    // Can't refer yourself
    if (referrerWallet === refereeWallet.toLowerCase()) {
      return { success: false, message: 'Cannot refer yourself' };
    }
    
    // Create referral record
    await db.query(`
      INSERT INTO referrals 
      (referrer_wallet, referee_wallet, referral_code, status) 
      VALUES ($1, $2, $3, 'active')
    `, [referrerWallet, refereeWallet.toLowerCase(), referralCode]);
    
    // Update users table
    await db.query(`
      UPDATE users 
      SET referred_by = $1,
          referral_bonus_active = true,
          referral_bonus_expires_at = NOW() + INTERVAL '30 days'
      WHERE wallet_address = $2
    `, [referrerWallet, refereeWallet.toLowerCase()]);
    
    // Increment referrer's count
    await db.query(`
      UPDATE users 
      SET referral_count = referral_count + 1 
      WHERE wallet_address = $1
    `, [referrerWallet]);
    
    return { 
      success: true, 
      referrer: referrerWallet,
      referee: refereeWallet 
    };
  }
  
  // Calculate referral bonus when referee earns points
  async applyReferralBonus(refereeWallet, pointsEarned) {
    // Check if referee has active referral bonus
    const referee = await db.query(`
      SELECT referred_by, referral_bonus_active, referral_bonus_expires_at
      FROM users 
      WHERE wallet_address = $1
    `, [refereeWallet.toLowerCase()]);
    
    if (referee.rows.length === 0) return;
    
    const { referred_by, referral_bonus_active, referral_bonus_expires_at } = referee.rows[0];
    
    if (!referred_by || !referral_bonus_active) return;
    
    // Check if bonus expired
    if (referral_bonus_expires_at && new Date() > new Date(referral_bonus_expires_at)) {
      await db.query(
        'UPDATE users SET referral_bonus_active = false WHERE wallet_address = $1',
        [refereeWallet.toLowerCase()]
      );
      return;
    }
    
    // Calculate bonuses (10% each)
    const bonusPoints = Math.floor(pointsEarned * 0.1);
    
    // Award bonus to referee
    await db.query(`
      UPDATE users 
      SET total_points = total_points + $1,
          weekly_points = weekly_points + $1,
          monthly_points = monthly_points + $1
      WHERE wallet_address = $2
    `, [bonusPoints, refereeWallet.toLowerCase()]);
    
    // Award bonus to referrer
    await db.query(`
      UPDATE users 
      SET total_points = total_points + $1,
          weekly_points = weekly_points + $1,
          monthly_points = monthly_points + $1,
          referral_points_earned = referral_points_earned + $1
      WHERE wallet_address = $2
    `, [bonusPoints, referred_by]);
    
    // Update referrals table
    await db.query(`
      UPDATE referrals 
      SET referee_total_points = referee_total_points + $1,
          referrer_bonus_points = referrer_bonus_points + $2
      WHERE referee_wallet = $3
    `, [pointsEarned, bonusPoints, refereeWallet.toLowerCase()]);
    
    return { 
      refereeBonus: bonusPoints, 
      referrerBonus: bonusPoints 
    };
  }
  
  // Get referral stats for user
  async getReferralStats(walletAddress) {
    const stats = await db.query(`
      SELECT 
        u.referral_code,
        u.referral_count,
        u.referral_points_earned,
        COUNT(r.id) as active_referrals,
        COALESCE(SUM(r.referee_total_points), 0) as total_referee_points
      FROM users u
      LEFT JOIN referrals r ON u.wallet_address = r.referrer_wallet
      WHERE u.wallet_address = $1
      GROUP BY u.wallet_address, u.referral_code, u.referral_count, u.referral_points_earned
    `, [walletAddress.toLowerCase()]);
    
    if (stats.rows.length === 0) return null;
    
    return stats.rows[0];
  }
  
  // Get top referrers for leaderboard
  async getTopReferrers(period = 'all', limit = 100) {
    let pointsColumn = 'total_points';
    if (period === 'weekly') pointsColumn = 'weekly_points';
    if (period === 'monthly') pointsColumn = 'monthly_points';
    
    const query = `
      SELECT 
        wallet_address,
        referral_code,
        referral_count,
        referral_points_earned,
        ${pointsColumn} as points,
        ROW_NUMBER() OVER (ORDER BY referral_count DESC, referral_points_earned DESC) as rank
      FROM users
      WHERE referral_count > 0
      ORDER BY referral_count DESC, referral_points_earned DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  }
  
}

module.exports = new ReferralService();
```

---

### 2. API Endpoints

**File:** `backend/src/routes/v1/referrals.js`

```javascript
const express = require('express');
const router = express.Router();
const referralService = require('../../services/referralService');

// Get user's referral code and stats
router.get('/user/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Get or create referral code
    const code = await referralService.getOrCreateReferralCode(walletAddress);
    
    // Get stats
    const stats = await referralService.getReferralStats(walletAddress);
    
    res.json({
      success: true,
      data: {
        referralCode: code,
        referralLink: `https://decaflow.xyz?ref=${code}`,
        stats: stats || {
          referral_count: 0,
          referral_points_earned: 0,
          active_referrals: 0,
          total_referee_points: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting referral data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record referral (called when new user connects with ref code)
router.post('/record', async (req, res) => {
  try {
    const { refereeWallet, referralCode } = req.body;
    
    if (!refereeWallet || !referralCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing refereeWallet or referralCode' 
      });
    }
    
    const result = await referralService.recordReferral(refereeWallet, referralCode);
    
    res.json(result);
  } catch (error) {
    console.error('Error recording referral:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get top referrers leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 100 } = req.query;
    
    const topReferrers = await referralService.getTopReferrers(period, parseInt(limit));
    
    res.json({
      success: true,
      data: topReferrers
    });
  } catch (error) {
    console.error('Error getting referral leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

**Add to server.js:**
```javascript
const referralRoutes = require('./routes/v1/referrals');
app.use('/v1/referrals', referralRoutes);
```

---

### 3. Update Points Service

**File:** `backend/src/services/pointsService.js`

**Add after awarding points:**

```javascript
// Inside recordTransaction function, after points are awarded:

// Apply referral bonuses
const referralService = require('./referralService');
await referralService.applyReferralBonus(walletAddress, pointsEarned);
```

---

## 🎨 FRONTEND IMPLEMENTATION

### 1. Detect Referral Code on Landing

**File:** `app/src/pages/Landing.tsx`

```typescript
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function Landing() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Store in localStorage for later
      localStorage.setItem('decaflow_ref_code', refCode);
      
      // Optional: Show welcome message
      console.log('Referred by code:', refCode);
    }
  }, [searchParams]);
  
  // ... rest of component
}
```

---

### 2. Record Referral on Wallet Connect

**File:** `app/src/wagmi.ts` or wherever wallet connect logic is

```typescript
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export function useReferralTracking() {
  const { address, isConnected } = useAccount();
  
  useEffect(() => {
    if (isConnected && address) {
      const refCode = localStorage.getItem('decaflow_ref_code');
      
      if (refCode) {
        // Check if already recorded
        const recorded = localStorage.getItem(`decaflow_ref_recorded_${address}`);
        
        if (!recorded) {
          // Record referral
          fetch(`${API_BASE_URL}/v1/referrals/record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              refereeWallet: address,
              referralCode: refCode
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              localStorage.setItem(`decaflow_ref_recorded_${address}`, 'true');
              localStorage.removeItem('decaflow_ref_code');
              
              // Show success message
              alert(`Welcome! You were referred by ${data.referrer}. You'll get 10% bonus points for 30 days!`);
            }
          })
          .catch(err => console.error('Error recording referral:', err));
        }
      }
    }
  }, [isConnected, address]);
}

// Use in App.tsx
function App() {
  useReferralTracking();
  // ... rest of app
}
```

---

### 3. Referral Dashboard Component

**File:** `app/src/components/ReferralDashboard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { API_BASE_URL } from '@/lib/constants';

export function ReferralDashboard() {
  const { address } = useAccount();
  const [referralData, setReferralData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (address) {
      fetch(`${API_BASE_URL}/v1/referrals/user/${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReferralData(data.data);
          }
        })
        .catch(err => console.error('Error fetching referral data:', err));
    }
  }, [address]);
  
  const copyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!referralData) return <div>Loading referral data...</div>;
  
  const { referralCode, referralLink, stats } = referralData;
  
  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold mb-4">🎁 Your Referral Link</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Referral Code</label>
            <div className="text-2xl font-mono font-bold text-purple-400">
              {referralCode}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Share This Link</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={referralLink}
                readOnly
                className="flex-1 bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-sm"
              />
              <button
                onClick={copyLink}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
          <div className="text-3xl font-bold text-blue-400">
            {stats.referral_count}
          </div>
          <div className="text-sm text-gray-400 mt-1">Total Referrals</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
          <div className="text-3xl font-bold text-green-400">
            {stats.active_referrals}
          </div>
          <div className="text-sm text-gray-400 mt-1">Active Referrals</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
          <div className="text-3xl font-bold text-yellow-400">
            {Math.floor(stats.referral_points_earned).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-1">Bonus Points Earned</div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-500/20">
          <div className="text-3xl font-bold text-pink-400">
            {Math.floor(stats.total_referee_points).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-1">Referees' Points</div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/20">
        <h3 className="text-xl font-bold mb-4">💎 How Referrals Work</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="text-2xl">1️⃣</div>
            <div>
              <div className="font-semibold text-white">Share Your Link</div>
              <div className="text-gray-400">Send your referral link to friends</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="text-2xl">2️⃣</div>
            <div>
              <div className="font-semibold text-white">They Get Bonus</div>
              <div className="text-gray-400">They earn 10% bonus points for 30 days</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="text-2xl">3️⃣</div>
            <div>
              <div className="font-semibold text-white">You Get Bonus</div>
              <div className="text-gray-400">You earn 10% of all their points forever</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="text-2xl">4️⃣</div>
            <div>
              <div className="font-semibold text-white">Win Prizes</div>
              <div className="text-gray-400">Top referrer gets 5% of weekly fees!</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Buttons */}
      <div className="flex gap-3">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `I'm earning rewards on @DecaFlowXYZ 🚀\n\nJoin me and get 10% bonus points:\n${referralLink}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg text-center transition"
        >
          Share on Twitter
        </a>
        
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
            'Join me on DecaFlow and earn rewards! 🚀'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg text-center transition"
        >
          Share on Telegram
        </a>
      </div>
    </div>
  );
}
```

---

### 4. Add to Points Dashboard

**File:** `app/src/components/PointsDashboard.tsx`

```typescript
import { ReferralDashboard } from './ReferralDashboard';

// Add a new tab for "Referrals"
<Tab>Referrals</Tab>

// Add the panel
<TabPanel>
  <ReferralDashboard />
</TabPanel>
```

---

### 5. Referral Leaderboard Section

**File:** `app/src/pages/Leaderboard.tsx`

Add a new tab for "Top Referrers":

```typescript
const [activeTab, setActiveTab] = useState<'points' | 'referrals'>('points');

// Fetch referral leaderboard
const [referralLeaderboard, setReferralLeaderboard] = useState([]);

useEffect(() => {
  if (activeTab === 'referrals') {
    fetch(`${API_BASE_URL}/v1/referrals/leaderboard?period=${period}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReferralLeaderboard(data.data);
        }
      });
  }
}, [activeTab, period]);

// UI
<div className="flex gap-4 mb-6">
  <button 
    onClick={() => setActiveTab('points')}
    className={activeTab === 'points' ? 'active' : ''}
  >
    Points Leaderboard
  </button>
  <button 
    onClick={() => setActiveTab('referrals')}
    className={activeTab === 'referrals' ? 'active' : ''}
  >
    Top Referrers 👥
  </button>
</div>

{activeTab === 'referrals' && (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
      <h3 className="text-2xl font-bold mb-2">🏆 Top Referrer Prize</h3>
      <div className="text-lg text-gray-300">
        This week: <span className="text-green-400 font-bold">5% of platform fees</span>
      </div>
      <div className="text-lg text-gray-300">
        This month: <span className="text-green-400 font-bold">10% of platform fees</span>
      </div>
    </div>
    
    {referralLeaderboard.map((user, index) => (
      <div key={user.wallet_address} className="...">
        <div>#{user.rank}</div>
        <div>{user.wallet_address}</div>
        <div>{user.referral_count} referrals</div>
        <div>{Math.floor(user.referral_points_earned)} bonus points</div>
      </div>
    ))}
  </div>
)}
```

---

## 📱 SOCIAL SHARING FEATURES

### After Every Swap Success

**Add popup:**

```typescript
// After successful swap
<Modal>
  <h3>🎉 Swap Successful!</h3>
  <p>You earned {points} points</p>
  
  <button onClick={() => shareOnTwitter()}>
    Share on Twitter for +50 bonus points!
  </button>
</Modal>

function shareOnTwitter() {
  const text = `Just earned ${points} points on @DecaFlowXYZ 🚀\n\nCurrent rank: #${rank}\n\nJoin me: ${referralLink}`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
  
  // Award bonus points
  awardBonusPoints(address, 50);
}
```

---

## 🏆 TOP REFERRER PRIZES

### Weekly Distribution

**Create:** `backend/src/scripts/distribute-referral-rewards.js`

```javascript
const db = require('../db/connection');

async function distributeWeeklyReferralRewards() {
  // Get top referrer of the week
  const topReferrer = await db.query(`
    SELECT 
      wallet_address,
      referral_code,
      referral_count,
      weekly_points as points
    FROM users
    WHERE referral_count > 0
    ORDER BY 
      (SELECT COUNT(*) FROM referrals WHERE referrer_wallet = users.wallet_address 
       AND created_at >= NOW() - INTERVAL '7 days') DESC
    LIMIT 1
  `);
  
  if (topReferrer.rows.length === 0) {
    console.log('No referrers this week');
    return;
  }
  
  const winner = topReferrer.rows[0];
  
  // Calculate 5% of weekly platform fees
  const fees = await db.query(`
    SELECT COALESCE(SUM(fee_amount_usd), 0) as total_fees
    FROM transactions
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `);
  
  const totalFees = parseFloat(fees.rows[0].total_fees);
  const rewardAmount = totalFees * 0.05; // 5%
  
  if (rewardAmount > 0) {
    // Record reward
    await db.query(`
      INSERT INTO rewards 
      (wallet_address, period_type, period_start, period_end, rank, points, reward_amount_usd, reward_status)
      VALUES ($1, 'weekly_referral', NOW() - INTERVAL '7 days', NOW(), 1, $2, $3, 'pending')
    `, [winner.wallet_address, winner.points, rewardAmount]);
    
    console.log(`Top Referrer: ${winner.wallet_address}`);
    console.log(`Referrals: ${winner.referral_count}`);
    console.log(`Reward: $${rewardAmount.toFixed(2)}`);
    
    // Tweet announcement
    console.log('\nTweet this:');
    console.log(`
🏆 WEEKLY TOP REFERRER WINNER!

Wallet: ${winner.wallet_address.slice(0, 6)}...${winner.wallet_address.slice(-4)}
Referrals: ${winner.referral_count}
Reward: $${rewardAmount.toFixed(2)} 💰

Think you can beat this? Get your referral link at decaflow.xyz

#DecaFlow #DeFi
    `);
  }
}

distributeWeeklyReferralRewards();
```

**Run weekly:** Add to cron jobs

---

## 📊 TRACKING & ANALYTICS

### Admin Dashboard - Referral Stats

**Add to:** `app/src/pages/Admin.tsx`

```typescript
// Fetch referral stats
const [referralStats, setReferralStats] = useState(null);

useEffect(() => {
  fetch(`${API_BASE_URL}/v1/admin/referral-stats`)
    .then(res => res.json())
    .then(data => setReferralStats(data));
}, []);

// Display
<div className="grid grid-cols-3 gap-4">
  <div className="stat-card">
    <h4>Total Referrals</h4>
    <div className="text-4xl">{referralStats?.totalReferrals}</div>
  </div>
  
  <div className="stat-card">
    <h4>Active Referrers</h4>
    <div className="text-4xl">{referralStats?.activeReferrers}</div>
  </div>
  
  <div className="stat-card">
    <h4>Referral Rate</h4>
    <div className="text-4xl">{referralStats?.referralRate}%</div>
  </div>
</div>
```

---

## 🎯 MARKETING MESSAGES

### Update All Templates

**Telegram:**
```
🚀 DecaFlow - Earn as You Trade

✅ Multi-chain DEX on Base
✅ Points system with cash prizes
✅ 10% bonus when you refer friends
✅ Top referrer gets 5% of weekly fees!

Get your referral link: decaflow.xyz
```

**Twitter:**
```
Just discovered @DecaFlowXYZ 👀

- Trade on 6 chains
- Earn points = cash prizes
- Refer friends = 10% bonus FOREVER
- Top referrer wins 5% of fees weekly

Got my referral link, LFG 🚀
decaflow.xyz?ref=DECA-XXXX
```

---

## 🚀 EXPECTED IMPACT

### Conservative Estimates

**Week 1:**
- You recruit: 50 users manually
- Referrals: 10 (20% referral rate)
- **Total: 60 users**

**Week 2:**
- You recruit: 50 more
- Week 1 users refer: 15
- Week 2 users refer: 10
- **Total: 135 users** (+75)

**Week 3:**
- You recruit: 50 more
- Previous users refer: 30
- **Total: 215 users** (+80)

**Week 4:**
- You recruit: 50 more
- Previous users refer: 50
- **Total: 315 users** (+100)

**Without referrals: 200 users**  
**With referrals: 315 users**  
**57% growth boost**

### Aggressive Estimates (50% referral rate)

**Week 4 total: 600+ users (3x without referrals)**

---

## ✅ IMPLEMENTATION CHECKLIST

### Day 1: Backend
- [ ] Create database migration
- [ ] Build referralService.js
- [ ] Create API endpoints
- [ ] Update pointsService to apply bonuses
- [ ] Test with Postman

### Day 2: Frontend
- [ ] Add ref code detection on landing
- [ ] Record referral on wallet connect
- [ ] Build ReferralDashboard component
- [ ] Add to PointsDashboard
- [ ] Add referral leaderboard tab
- [ ] Test end-to-end flow

### Day 3: Polish
- [ ] Add social sharing buttons
- [ ] Create share-to-earn feature
- [ ] Build admin referral stats
- [ ] Create weekly distribution script
- [ ] Update marketing materials
- [ ] Write announcement tweet
- [ ] Deploy to production

---

## 📣 LAUNCH ANNOUNCEMENT

**Twitter Thread:**

```
🎁 HUGE UPDATE: Referral System is LIVE!

Earn 10% of ALL your referrals' points. FOREVER.

Here's how it works 🧵👇

1/ Every DecaFlow user now gets a unique referral link

Visit decaflow.xyz → Connect wallet → Get your link

2/ When someone uses your link:
- They get 10% bonus points for 30 days
- You get 10% of their points FOREVER
- Both climb the leaderboard faster 📈

3/ But wait, there's more...

The TOP REFERRER each week gets 5% of ALL platform fees 💰

Last week that would've been $XXX

4/ Example:

You refer 10 friends
They each trade $1,000 (= 1,000 points)

They get: 1,000 + 100 bonus = 1,100 points
You get: 1,000 (your own) + 1,000 (10% from them) = 2,000 points

5/ This is CRAZY for leaderboard climbing

Instead of competing against friends, now you WIN TOGETHER

Refer 5 active traders = effectively 6x your own points 🤯

6/ Top Referrer Prizes:

🥇 Weekly: 5% of platform fees
🥇 Monthly: 10% of platform fees

Last month fees: $X,XXX
Top referrer would've earned: $XXX

7/ Get started:

1. Visit decaflow.xyz
2. Connect wallet
3. Click "Referrals" tab
4. Copy your link
5. Share everywhere

Let's gooo 🚀

#DecaFlow #DeFi #Base
```

---

**THIS IS YOUR GROWTH ENGINE. BUILD IT NOW.** 🚀
