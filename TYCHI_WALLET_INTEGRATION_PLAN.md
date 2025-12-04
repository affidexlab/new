# 🤝 DECAFLOW x TYCHI WALLET INTEGRATION PLAN
## Strategic Partnership Integration Document

**Date:** December 3, 2025  
**Partnership:** DecaFlow Protocol ↔ Tychi Wallet  
**Status:** Planning Phase  

---

## 📊 EXECUTIVE SUMMARY

This partnership brings together:
- **DecaFlow:** Leading multi-chain DEX aggregator with deep liquidity routing
- **Tychi Wallet:** Advanced multi-chain wallet with 100+ blockchain support and UGF (Universal Gas Framework)

**Combined Value Proposition:**
- Tychi users get best-in-class swap execution via DecaFlow's smart routing
- DecaFlow gains access to Tychi's growing user base across 100+ chains
- Seamless UX with native wallet integration

---

## 🎯 INTEGRATION OVERVIEW

### Integration Type: **Native DApp Integration**

Tychi Wallet will integrate DecaFlow as:
1. **Primary Swap Provider** for in-wallet token swaps
2. **Featured DApp** in Tychi's Integrated DApp Hub
3. **Deep Link Partner** for seamless transaction flows

DecaFlow will integrate Tychi as:
1. **Supported Wallet** alongside MetaMask, WalletConnect, etc.
2. **Featured Partner** on website and marketing materials
3. **Co-marketing Partner** for user acquisition

---

## 🔧 WHAT DECAFLOW NEEDS TO INTEGRATE (Our Side)

### 1. Frontend Wallet Integration

#### A. Add Tychi Wallet Connector
**File:** `affidexlab/new/app/src/wagmi.ts`

```typescript
import { tychiwallet } from '@tychiwallet/wagmi-connector'

// Add to connectors array
connectors: [
  injected({ shimDisconnect: true }),
  walletConnect({ projectId }),
  tychiwallet(), // NEW: Add Tychi connector
  coinbaseWallet({ appName: 'DecaFlow' }),
]
```

**What you'll need from Tychi:**
- Official Tychi Wallet connector package (`@tychiwallet/wagmi-connector`)
- Documentation on connector configuration
- Test wallet instances for development

#### B. Update Wallet Selection UI
**File:** `affidexlab/new/app/src/components/WalletConnect.tsx` (if exists) or create new

Add Tychi Wallet to wallet selection modal:
```typescript
<WalletOption
  name="Tychi Wallet"
  icon="/images/wallets/tychi-icon.svg"
  connector={tychiwallet}
  description="Multi-chain wallet with universal gas fees"
/>
```

**Assets needed:**
- Tychi Wallet logo (SVG, PNG)
- Tychi brand colors for theming
- Connection flow screenshots for docs

#### C. Deep Linking Support
**File:** `affidexlab/new/app/src/lib/deeplinks.ts` (create new)

Implement deep linking for mobile Tychi app:
```typescript
// Deep link format: tychiwallet://dapp?url=https://decaflow.app&action=swap
export function openInTychiWallet(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
}) {
  const deepLink = `tychiwallet://decaflow?` + new URLSearchParams({
    action: 'swap',
    fromToken: params.fromToken,
    toToken: params.toToken,
    amount: params.amount,
    chainId: params.chainId.toString(),
  });
  
  window.location.href = deepLink;
}
```

**What you'll need from Tychi:**
- Deep link URL scheme (`tychiwallet://`)
- Supported action parameters
- Fallback behavior documentation

### 2. API Integration for Tychi-Specific Features

#### A. Universal Gas Fee (UGF) Support
**File:** `affidexlab/new/app/src/lib/ugf-integration.ts` (create new)

If Tychi users can pay DecaFlow fees in TYI token:
```typescript
export async function checkUGFSupport(walletAddress: string): Promise<boolean> {
  // Check if wallet is Tychi and has UGF enabled
  const response = await fetch('https://api.tychiwallet.com/v1/ugf/check', {
    method: 'POST',
    body: JSON.stringify({ address: walletAddress })
  });
  return response.json();
}

export async function calculateUGFFee(
  standardFeeUSD: number
): Promise<{ tyiAmount: string; bnbAmount: string }> {
  // Convert platform fee to TYI or BNB
  const response = await fetch('https://api.tychiwallet.com/v1/ugf/convert', {
    method: 'POST',
    body: JSON.stringify({ usdAmount: standardFeeUSD })
  });
  return response.json();
}
```

**What you'll need from Tychi:**
- UGF API endpoint documentation
- Authentication method (API key or public)
- Rate limits and caching recommendations

#### B. Multi-Chain Balance Integration
**File:** `affidexlab/new/app/src/hooks/useTychiBalances.ts` (create new)

Optional: Display Tychi portfolio data in DecaFlow:
```typescript
export function useTychiBalances(address: string) {
  // Fetch user's multi-chain balances from Tychi
  // Show total portfolio value across 100+ chains
  return useQuery({
    queryKey: ['tychi-balances', address],
    queryFn: () => fetch(`https://api.tychiwallet.com/v1/portfolio/${address}`)
  });
}
```

### 3. Smart Contract Integrations

#### A. TYI Token Support
**File:** `affidexlab/new/app/src/lib/constants.ts`

Add TYI token to supported tokens list:
```typescript
export const TYI_TOKEN = {
  symbol: "TYI",
  name: "Tychi Token",
  addresses: {
    1: "0x...", // Ethereum
    56: "0x...", // BSC (where TYI likely deployed)
    8453: "0x...", // Base
    42161: "0x...", // Arbitrum
    // etc.
  },
  decimals: 18,
  logo: "/images/tokens/tyi.svg"
};
```

**What you'll need from Tychi:**
- TYI token contract addresses on all chains
- Token decimals
- Official logo assets
- Whether to feature TYI prominently in UI

#### B. Optional: TYI Fee Payment Integration
**File:** `affidexlab/new/contracts/TYIFeeRouter.sol` (create new)

If you want to accept TYI for DecaFlow platform fees:
```solidity
// Smart contract that accepts TYI token for platform fees
contract TYIFeeRouter {
    address public tyiToken;
    address public treasury;
    uint256 public feeInTYI; // Updated via oracle
    
    function swapWithTYIFee(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 tyiFeeAmount
    ) external {
        // Collect TYI fee
        IERC20(tyiToken).transferFrom(msg.sender, treasury, tyiFeeAmount);
        // Execute swap...
    }
}
```

**Decision needed:**
- Do you want to accept TYI for platform fees?
- If yes, need TYI/USD price oracle integration

### 4. Analytics & Tracking

#### A. Partnership Attribution
**File:** `affidexlab/new/app/src/lib/analytics.ts`

Track Tychi-originated transactions:
```typescript
export function trackTychiTransaction(params: {
  txHash: string;
  volume: string;
  user: string;
}) {
  // Track for partnership metrics
  mixpanel.track('Partnership Transaction', {
    partner: 'Tychi Wallet',
    ...params
  });
}
```

#### B. Revenue Sharing Logic (if applicable)
**File:** `affidexlab/new/app/src/lib/revenue-sharing.ts` (create new)

If you're sharing fees with Tychi:
```typescript
export function calculateTychiRevShare(
  totalFees: bigint,
  revSharePercentage: number = 20 // 20% to Tychi
): bigint {
  return (totalFees * BigInt(revSharePercentage)) / 100n;
}
```

**Decision needed:**
- Revenue sharing model (if any)
- Payment frequency and method
- Tracking mechanism

### 5. Documentation & Developer Resources

**Create:**
1. **Integration Guide:** `docs/TYCHI_WALLET_INTEGRATION.md`
   - How Tychi users can connect
   - Special features available to Tychi users
   - Troubleshooting common issues

2. **Marketing Assets:** `public/partners/tychi/`
   - Co-branded banners
   - "Swap with Tychi" badges
   - Partnership announcement graphics

### 6. Testing & QA

**Test Suite:** `affidexlab/new/app/tests/tychi-integration.test.ts`
```typescript
describe('Tychi Wallet Integration', () => {
  it('connects Tychi wallet successfully', async () => {
    // Test wallet connection
  });
  
  it('handles UGF fee calculations', async () => {
    // Test UGF integration
  });
  
  it('processes swaps from Tychi users', async () => {
    // End-to-end swap test
  });
});
```

---

## 🔧 WHAT TYCHI NEEDS TO INTEGRATE (Their Side)

### 1. DApp Integration in Tychi Wallet

#### A. Add DecaFlow to Integrated DApp Hub
**Location:** Tychi App → DApp Hub → Featured/Swap Category

**Required:**
- DecaFlow logo (512x512px SVG/PNG)
- App name: "DecaFlow"
- Description: "Multi-chain DEX aggregator with smart liquidity routing"
- Category: Swap/DeFi
- URL: `https://app.decaflow.com` or `https://decaflow.app`
- Deep link: `decaflow://swap`
- Supported chains: Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche

**Display Priority:** Featured/Recommended (if partnership tier includes this)

#### B. Native Swap Integration (Option 1: Embedded)
**Implementation:** Embedded iframe in Tychi's swap interface

```typescript
// In Tychi Wallet's swap page
<iframe
  src="https://app.decaflow.com/embed?wallet=tychi"
  sandbox="allow-scripts allow-same-origin allow-popups"
  referrerPolicy="origin"
/>
```

**DecaFlow provides:**
- `/embed` route with minimal UI
- Query parameters for pre-filling swap details
- PostMessage API for communication:
  ```typescript
  // Tychi → DecaFlow
  iframe.postMessage({
    type: 'SET_TOKENS',
    fromToken: '0x...',
    toToken: '0x...',
    amount: '1000000'
  }, 'https://app.decaflow.com');
  
  // DecaFlow → Tychi
  window.parent.postMessage({
    type: 'SWAP_SUCCESS',
    txHash: '0x...',
    amountOut: '999000'
  }, 'tychiwallet://');
  ```

#### C. Native Swap Integration (Option 2: API)
**Implementation:** Tychi directly calls DecaFlow API

**Tychi integrates:**
1. **Quote API:**
```typescript
// GET https://api.decaflow.com/v1/quote
const quote = await fetch('https://api.decaflow.com/v1/quote', {
  method: 'POST',
  body: JSON.stringify({
    fromToken: '0x...',
    toToken: '0x...',
    amount: '1000000',
    chainId: 8453,
    slippage: 0.5,
    walletAddress: userAddress
  }),
  headers: {
    'X-Partner-ID': 'tychi-wallet',
    'Content-Type': 'application/json'
  }
});

// Response:
{
  provider: "uniswap_v3",
  estimatedOutput: "999000",
  route: "Uniswap V3 (0.05%)",
  fee: 500,
  priceImpact: 0.1,
  minimumOutput: "994000",
  calldata: "0x...", // For transaction
  to: "0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4" // Router address
}
```

2. **Transaction Execution:**
```typescript
// Tychi constructs and signs transaction using returned calldata
const tx = {
  to: quote.to,
  data: quote.calldata,
  value: 0,
  chainId: 8453
};

const signedTx = await tychiWallet.signTransaction(tx);
const receipt = await tychiWallet.sendTransaction(signedTx);
```

**DecaFlow provides:**
- REST API endpoint documentation
- Partner API key (`X-Partner-ID: tychi-wallet`)
- Rate limits (e.g., 100 requests/min)
- Webhook for transaction status updates

#### D. WalletConnect Integration
**Tychi Already Has:** WalletConnect v2 support  
**DecaFlow Already Has:** WalletConnect support via Wagmi

**Works out of the box!** No additional integration needed.

When Tychi users click "Connect Wallet" on DecaFlow:
1. Select WalletConnect
2. Scan QR code with Tychi mobile app
3. Approve connection
4. Start swapping

### 2. Universal Gas Fee (UGF) Integration

#### A. Allow DecaFlow Fee Payment in TYI/BNB
**Tychi implements:**

When user swaps on DecaFlow via Tychi:
1. Tychi detects 0.8% platform fee requirement
2. Offers user option: "Pay fee in ETH or TYI?"
3. If TYI selected:
   - Calculate TYI equivalent of USD fee
   - Deduct TYI from user's Tychi balance
   - Forward equivalent value to DecaFlow treasury
4. User only signs one transaction (the swap)

**Technical implementation:**
- Tychi's backend handles TYI → Native token conversion
- Sends native token to DecaFlow treasury
- User experience: gasless swap payment

**DecaFlow treasury receives:** Native tokens as usual  
**User pays:** TYI tokens via Tychi's UGF system

### 3. Branding & Marketing Integration

#### A. Co-Branded Marketing
**Tychi includes:**
- "Powered by DecaFlow" badge on swap interface
- DecaFlow logo in partner section
- Link to DecaFlow website/docs
- Partnership announcement on Tychi blog/social

**DecaFlow includes:**
- "Swap with Tychi Wallet" CTA on homepage
- Tychi logo in "Supported Wallets" section
- Partnership announcement on DecaFlow blog/social
- Tychi featured in tutorials/guides

#### B. User Acquisition Campaign
**Joint initiatives:**
- Cross-promotion on Twitter/X, Telegram, Discord
- Joint AMAs/Twitter Spaces
- Incentive programs (swap-to-earn campaigns)
- Educational content collaboration

### 4. Developer Documentation

**Tychi provides DecaFlow:**
1. **Tychi Wallet Connector Documentation**
   - NPM package installation
   - Configuration examples
   - Event handling
   - Mobile deep linking

2. **UGF API Documentation**
   - Endpoint specifications
   - Authentication
   - Error handling
   - Rate limits

3. **Testing Resources**
   - Test wallet credentials
   - Testnet token faucets
   - Sandbox environment access

### 5. Analytics & Reporting

**Tychi tracks:**
- Number of DecaFlow swaps initiated from Tychi
- Volume transacted via DecaFlow integration
- User engagement metrics
- Revenue generated (if revenue sharing)

**Tychi provides DecaFlow:**
- Monthly partnership metrics dashboard
- User feedback compilation
- Feature request insights

---

## 📊 INTEGRATION PHASES

### Phase 1: Foundation (Week 1-2)
**DecaFlow:**
- [ ] Add Tychi Wallet connector to frontend
- [ ] Update wallet selection UI
- [ ] Test WalletConnect functionality
- [ ] Add TYI token to supported tokens list

**Tychi:**
- [ ] Add DecaFlow to DApp Hub
- [ ] Provide connector package to DecaFlow
- [ ] Share brand assets and documentation
- [ ] Set up testing environment

**Joint:**
- [ ] Kick-off meeting with technical teams
- [ ] Align on API specifications
- [ ] Establish communication channels (Slack/Telegram)

### Phase 2: Core Integration (Week 3-4)
**DecaFlow:**
- [ ] Implement deep linking support
- [ ] Add Tychi-specific analytics tracking
- [ ] Create partnership documentation
- [ ] Set up test cases

**Tychi:**
- [ ] Integrate DecaFlow API for quotes
- [ ] Implement swap interface (embedded or native)
- [ ] Configure UGF for DecaFlow fees
- [ ] QA testing on testnet

**Joint:**
- [ ] End-to-end testing (testnet)
- [ ] UX review and optimization
- [ ] Performance testing
- [ ] Security review

### Phase 3: Advanced Features (Week 5-6)
**DecaFlow:**
- [ ] TYI fee payment option (if applicable)
- [ ] Portfolio view integration
- [ ] Revenue sharing automation
- [ ] Advanced analytics dashboard

**Tychi:**
- [ ] Deep link optimization
- [ ] Push notification support
- [ ] In-app swap analytics
- [ ] User education content

**Joint:**
- [ ] Beta testing with select users
- [ ] Bug fixes and refinements
- [ ] Marketing materials creation
- [ ] Launch planning

### Phase 4: Launch (Week 7-8)
**DecaFlow:**
- [ ] Deploy to production
- [ ] Update documentation
- [ ] Publish blog post
- [ ] Social media announcements

**Tychi:**
- [ ] Deploy integration to production app
- [ ] Push app update to stores
- [ ] Publish partnership announcement
- [ ] Social media campaign

**Joint:**
- [ ] Coordinated launch event
- [ ] Joint AMA/Twitter Space
- [ ] Press release distribution
- [ ] Monitor launch metrics

### Phase 5: Post-Launch (Ongoing)
- [ ] Weekly sync meetings
- [ ] Monthly metrics review
- [ ] User feedback analysis
- [ ] Continuous optimization
- [ ] New feature exploration

---

## 🔌 API SPECIFICATIONS

### DecaFlow API Endpoints for Tychi

#### 1. Get Quote
```
POST https://api.decaflow.com/v1/quote
Headers:
  X-Partner-ID: tychi-wallet
  Content-Type: application/json

Body:
{
  "fromToken": "0x...",
  "toToken": "0x...",
  "amount": "1000000",
  "chainId": 8453,
  "slippage": 0.5,
  "walletAddress": "0x..."
}

Response:
{
  "provider": "uniswap_v3",
  "estimatedOutput": "999000",
  "route": "Uniswap V3 (0.05%)",
  "fee": 500,
  "priceImpact": 0.1,
  "minimumOutput": "994000",
  "calldata": "0x...",
  "to": "0x4b6D...",
  "gasEstimate": "150000",
  "expiresAt": 1701648000
}
```

#### 2. Get Supported Tokens
```
GET https://api.decaflow.com/v1/tokens?chainId=8453
Headers:
  X-Partner-ID: tychi-wallet

Response:
{
  "tokens": [
    {
      "address": "0x...",
      "symbol": "USDC",
      "name": "USD Coin",
      "decimals": 6,
      "logo": "https://..."
    },
    ...
  ]
}
```

#### 3. Get Transaction Status
```
GET https://api.decaflow.com/v1/tx/{txHash}
Headers:
  X-Partner-ID: tychi-wallet

Response:
{
  "status": "confirmed",
  "blockNumber": 12345678,
  "timestamp": 1701648000,
  "amountIn": "1000000",
  "amountOut": "999500",
  "fee": "8000"
}
```

### Tychi API Endpoints for DecaFlow

#### 1. Check UGF Support
```
POST https://api.tychiwallet.com/v1/ugf/check
Headers:
  X-API-Key: decaflow-api-key
  Content-Type: application/json

Body:
{
  "address": "0x..."
}

Response:
{
  "supported": true,
  "tyiBalance": "1000.5",
  "bnbBalance": "0.5"
}
```

#### 2. Convert Fee to TYI/BNB
```
POST https://api.tychiwallet.com/v1/ugf/convert
Headers:
  X-API-Key: decaflow-api-key
  Content-Type: application/json

Body:
{
  "usdAmount": "8.00"
}

Response:
{
  "tyiAmount": "160.5",
  "bnbAmount": "0.015",
  "rates": {
    "TYI_USD": 0.05,
    "BNB_USD": 533.33
  },
  "expiresAt": 1701648000
}
```

---

## 💰 BUSINESS TERMS (To Be Discussed)

### Revenue Sharing Options

**Option 1: No Revenue Sharing**
- Tychi promotes DecaFlow as featured partner
- DecaFlow benefits from Tychi user base
- Both parties benefit from enhanced UX
- Standard partnership with co-marketing

**Option 2: Revenue Sharing**
- DecaFlow shares 10-20% of fee revenue from Tychi users
- Calculated based on wallet address attribution
- Monthly payout in stablecoins
- Minimum threshold: $1,000/month

**Option 3: Token Swap**
- DecaFlow holds TYI tokens for strategic partnership
- Tychi holds DECA tokens (if/when launched)
- Mutual staking/incentive programs
- Long-term ecosystem alignment

### Marketing Commitment

**Tychi:**
- Feature DecaFlow in DApp Hub (Prominent placement)
- 2x Twitter/X posts per month
- 1x Partnership mention in newsletter
- Co-host 1 AMA per quarter

**DecaFlow:**
- Feature Tychi in "Supported Wallets" section
- 2x Twitter/X posts per month
- Partnership blog post
- Tutorial content featuring Tychi

---

## 📏 SUCCESS METRICS

### Month 1 Targets
- [ ] 100+ Tychi users try DecaFlow
- [ ] $50k+ volume from Tychi integration
- [ ] <1% integration error rate
- [ ] 4.0+ user satisfaction rating

### Month 3 Targets
- [ ] 1,000+ Tychi users use DecaFlow
- [ ] $500k+ volume from Tychi integration
- [ ] 15%+ of DecaFlow volume from Tychi
- [ ] 2+ new feature collaborations

### Month 6 Targets
- [ ] 5,000+ Tychi users use DecaFlow
- [ ] $2M+ volume from Tychi integration
- [ ] Top 3 wallet by usage on DecaFlow
- [ ] Expanded to 10+ chains together

---

## 🚀 TECHNICAL REQUIREMENTS SUMMARY

### DecaFlow Team Needs
1. ✅ Tychi Wallet connector package
2. ✅ Tychi brand assets (logo, colors)
3. ✅ TYI token contract addresses
4. ✅ UGF API documentation
5. ✅ Deep linking specifications
6. ✅ Test wallet credentials
7. ✅ Technical contact for integration support

### Tychi Team Needs
1. ✅ DecaFlow API documentation
2. ✅ Partner API key
3. ✅ DecaFlow brand assets
4. ✅ Smart contract ABIs
5. ✅ Supported chains and tokens list
6. ✅ Embed URL and iframe specifications
7. ✅ Technical contact for integration support

---

## 📞 NEXT STEPS

### Immediate Actions (This Week)
1. **Schedule Technical Kickoff Call**
   - DecaFlow: [Your CTO/Tech Lead]
   - Tychi: [Their CTO/Tech Lead]
   - Agenda: Review integration plan, align on Phase 1 tasks

2. **Exchange Technical Documentation**
   - Tychi sends: Connector docs, UGF API specs
   - DecaFlow sends: API docs, contract ABIs, brand assets

3. **Set Up Communication Channels**
   - Shared Slack/Telegram group
   - GitHub repo access (if needed)
   - Establish points of contact

4. **Define Success Criteria**
   - Finalize business terms
   - Set launch date target
   - Agree on metrics tracking

### Week 1 Deliverables
- [ ] Technical design document approved by both teams
- [ ] Development environments set up
- [ ] Test accounts created
- [ ] Phase 1 development started

---

## 📋 APPENDIX

### A. Integration Checklist

**Frontend:**
- [ ] Wallet connector integration
- [ ] UI updates for Tychi branding
- [ ] Deep linking implementation
- [ ] Mobile responsiveness testing

**Backend:**
- [ ] API endpoint setup (if needed)
- [ ] Analytics tracking
- [ ] Revenue attribution logic
- [ ] Error logging and monitoring

**Smart Contracts:**
- [ ] TYI token support
- [ ] Fee payment options
- [ ] Testing on testnets
- [ ] Mainnet deployment

**Documentation:**
- [ ] Integration guide
- [ ] API documentation
- [ ] Troubleshooting guide
- [ ] User tutorials

**Marketing:**
- [ ] Partnership announcement
- [ ] Blog posts (both sides)
- [ ] Social media content
- [ ] Educational videos

**Legal:**
- [ ] Partnership agreement
- [ ] Terms of service updates
- [ ] Privacy policy updates
- [ ] Compliance review

### B. Contact Information

**DecaFlow:**
- Business Development: Pool Mbang
- Technical Lead: [TBD]
- Marketing: [TBD]

**Tychi:**
- Business Development: [From group chat]
- Technical Lead: [From group chat]
- Marketing: [From group chat]

### C. Resources

**DecaFlow:**
- Website: https://decaflow.app
- GitHub: https://github.com/affidexlab/new
- Documentation: [TBD]
- Testnet: [TBD]

**Tychi:**
- Website: https://tychiwallet.com
- Whitepaper: https://tychi.gitbook.io
- App Store: [iOS Link]
- Play Store: https://play.google.com/store/apps/details?id=com.tychiwallet2

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Next Review:** After technical kickoff call

---

## 🎉 CONCLUSION

This integration brings together DecaFlow's superior liquidity routing with Tychi's innovative multi-chain wallet experience. Together, we'll provide users with:

✅ **Best Execution** - DecaFlow's smart routing finds optimal prices  
✅ **Universal Gas** - Tychi's UGF simplifies fee payments  
✅ **Seamless UX** - Native integration feels built-in  
✅ **Multi-Chain** - Combined coverage of 100+ blockchains  
✅ **Innovation** - Two cutting-edge protocols working together  

**Let's build the future of DeFi together!** 🚀
