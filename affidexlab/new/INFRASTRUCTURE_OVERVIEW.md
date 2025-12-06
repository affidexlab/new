# DecaFlow Infrastructure Overview

Complete infrastructure map for Tychi partnership integration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     TYCHI WALLET                            │
│  (Mobile/Web App - Integration via SDK or API or Embed)    │
└──────────────────┬──────────────────┬───────────────────────┘
                   │                  │
                   ├─ Option A: SDK  │
                   │                  │
                   ├─ Option B: API  │
                   │                  │
                   └─ Option C: Embed│
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        │                            │                            │
┌───────▼────────┐      ┌────────────▼──────────┐     ┌─────────▼───────┐
│  SDK (NPM)     │      │    REST API (Node)    │     │  Embed (React)  │
│ @decaflow/     │      │ api.decaflow.xyz/v1   │     │ partners.deca   │
│ partner-sdk    │      │                       │     │ flow.xyz/embed  │
│                │      │ - /swap/quote         │     │                 │
│ - React Hooks  │      │ - /swap/execute       │     │ - iframe safe   │
│ - Components   │      │ - /liquidity/*        │     │ - PostMessage   │
│                │      │ - /bridge/*           │     │ - Theme support │
└────────────────┘      │                       │     └─────────────────┘
                        │ Auth: X-Partner-ID    │
                        └───────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        │                            │                            │
┌───────▼──────────┐    ┌────────────▼───────────┐   ┌──────────▼────────┐
│ Smart Contracts  │    │  3rd Party APIs        │   │  Partner Store    │
│                  │    │                        │   │                   │
│ Base: 0x4b6D..  │    │ - Socket (Bridges)     │   │ - Tychi API Key   │
│ Arbitrum: 0xDE8.│    │ - 0x (Swaps)           │   │ - Rate Limits     │
│ Optimism: 0xA2f.│    │ - CoW (Swaps)          │   │ - Usage Stats     │
│ Polygon: 0xFd0. │    │ - Li.Fi (Bridges)      │   │                   │
└──────────────────┘    └────────────────────────┘   └───────────────────┘
```

## Component Breakdown

### 1. REST API Backend

**Location**: `/backend`  
**Deployment**: Render/Railway  
**Tech Stack**: Node.js, Express  

**Endpoints**:
- Production: `https://api.decaflow.xyz/v1`
- Sandbox: `https://sandbox.decaflow.xyz/v1`

**Features**:
- Partner authentication (X-Partner-ID header)
- Rate limiting (100 req/min production)
- Swap quote/execute endpoints
- Liquidity pool management
- Bridge quote/execute/status
- CORS protection
- Request validation

### 2. Partner SDK

**Location**: `/sdk`  
**Deployment**: NPM Registry  
**Package**: `@decaflow/partner-sdk`  
**Tech Stack**: TypeScript, React  

**Exports**:
- `<DecaFlowProvider>` - Context provider
- `useSwapQuote()` - Get swap quotes
- `useSwapExecute()` - Execute swaps
- `useBridgeQuote()` - Get bridge quotes
- `useBridgeExecute()` - Execute bridges
- `useBridgeStatus()` - Check bridge status
- `useLiquidityPools()` - Get available pools
- `useAddLiquidity()` - Add liquidity
- `useRemoveLiquidity()` - Remove liquidity
- `useUserPositions()` - Get user positions
- `<SwapWidget>` - Pre-built swap UI
- `<BridgeWidget>` - Pre-built bridge UI
- `<LiquidityWidget>` - Pre-built liquidity UI

### 3. Embedded Widget

**Location**: `/embed`  
**Deployment**: Vercel  
**URLs**:
- Production: `https://partners.decaflow.xyz/embed`
- Sandbox: `https://partners-sandbox.decaflow.xyz/embed`

**Query Parameters**:
- `partner` (required): Partner ID (e.g., `tychi`)
- `mode`: `swap`, `bridge`, or `liquidity` (default: `swap`)
- `theme`: `light` or `dark` (default: `light`)
- `accent`: Hex color for accent (e.g., `%234F46E5`)

**Features**:
- iframe-safe React app
- PostMessage API for parent communication
- Theme customization
- All three modes (swap/bridge/liquidity)

### 4. Partner Dashboard

**Location**: `/dashboard`  
**Deployment**: Vercel  
**URLs**:
- Production: `https://partners.decaflow.xyz/dashboard`
- Sandbox: `https://partners-sandbox.decaflow.xyz/dashboard`

**Pages**:
- Overview - Analytics and activity
- API Keys - Key management
- Usage - Detailed endpoint stats
- Documentation - Quick links
- Settings - Account configuration

### 5. Documentation

**Location**: `/docs`  
**Deployment**: GitHub Pages / Vercel  
**URL**: `https://docs.decaflow.xyz/api`

**Files**:
- `openapi.yaml` - OpenAPI 3.0 spec
- `api-viewer.html` - Swagger UI viewer
- Integration guides

### 6. Smart Contracts

**Location**: `/contracts`  
**Deployed**: Mainnet (Base, Arbitrum, Optimism, Polygon)

**Contracts**:
- `LiquidityRouter.sol` - Pool management
- `FeeRouter.sol` - Fee collection

**Addresses**:
- Base: `0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4`
- Arbitrum: `0xDE8700785C7512a8397683A9BE9717B0aFdB18F3`
- Optimism: `0xA2fdf81b7967e7FA7610DeBe1901A40686c48992`
- Polygon: `0xFd05977256E8D5753728C78A3003BC3B75Fef1DD`

### 7. Branding Assets

**Location**: `/brand`

**Contents**:
- Logo files (SVG, PNG)
- Color palettes (JSON, CSS)
- Brand guidelines
- "Powered by" badges
- Social media templates

## Integration Paths

### Path A: SDK Integration (Recommended)

```javascript
import { DecaFlowProvider, useSwapQuote } from '@decaflow/partner-sdk';

function App() {
  return (
    <DecaFlowProvider config={{ partnerId: 'tychi_prod_pk_live_...' }}>
      <TychiSwapInterface />
    </DecaFlowProvider>
  );
}
```

**Pros**:
- Full UI control
- TypeScript support
- React hooks API
- Easy to customize

### Path B: Direct API Integration

```javascript
const response = await fetch('https://api.decaflow.xyz/v1/swap/quote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Partner-ID': 'tychi_prod_pk_live_...'
  },
  body: JSON.stringify({ fromToken, toToken, amount, chainId, walletAddress })
});
```

**Pros**:
- Language agnostic
- Maximum flexibility
- Direct control

### Path C: Embedded Widget

```html
<iframe
  src="https://partners.decaflow.xyz/embed?partner=tychi&mode=swap&theme=dark"
  width="500"
  height="600"
  frameborder="0"
  allow="clipboard-write"
></iframe>
```

**Pros**:
- Fastest to implement
- No code required
- Automatic updates

## Data Flow

### Swap Flow

```
1. User initiates swap in Tychi Wallet
   ↓
2. Tychi calls DecaFlow (SDK/API/Embed)
   ↓
3. DecaFlow fetches quotes from:
   - 0x Protocol
   - CoW Protocol
   - Aerodrome (Base only)
   ↓
4. DecaFlow returns best quote to Tychi
   ↓
5. User approves swap
   ↓
6. Tychi calls execute endpoint
   ↓
7. DecaFlow returns transaction data
   ↓
8. Tychi sends transaction via user's wallet
   ↓
9. Transaction confirmed on-chain
```

### Bridge Flow

```
1. User initiates bridge in Tychi Wallet
   ↓
2. Tychi calls DecaFlow bridge quote
   ↓
3. DecaFlow fetches routes from:
   - Socket
   - Li.Fi
   ↓
4. DecaFlow returns best route to Tychi
   ↓
5. User approves bridge
   ↓
6. Tychi calls execute endpoint
   ↓
7. DecaFlow returns origin chain transaction
   ↓
8. Tychi sends transaction via user's wallet
   ↓
9. Bridge monitors with tracking ID
   ↓
10. Tychi polls /bridge/status/{trackingId}
   ↓
11. Bridge completes on destination chain
```

## Security Layers

1. **Partner Authentication**
   - X-Partner-ID header required
   - Keys stored in backend partner store
   - Keys can be rotated/revoked

2. **Rate Limiting**
   - Per-partner limits
   - 100 req/min production
   - 50 req/min sandbox

3. **CORS Protection**
   - Whitelist partner domains
   - Reject unknown origins

4. **Input Validation**
   - express-validator on all endpoints
   - Type checking
   - Range validation

5. **HTTPS Only**
   - All endpoints TLS encrypted
   - HSTS headers enabled

## Monitoring & Observability

### Metrics to Track

- API request volume (by endpoint, by partner)
- Response times (p50, p95, p99)
- Error rates (by type, by endpoint)
- Partner usage patterns
- Rate limit violations
- Bridge completion rates

### Logging

- Request/response logs (sanitized)
- Error logs with stack traces
- Partner activity logs
- Performance logs

### Alerts

- API downtime
- Error rate > 1%
- Response time > 1s
- Rate limit violations
- Unusual traffic patterns

## Scaling Considerations

### Current Setup
- Single backend instance per environment
- File-based partner store
- Stateless API design
- No caching layer

### Future Improvements
- Horizontal scaling (multiple instances)
- Redis for rate limiting & caching
- PostgreSQL for partner data
- CDN for static assets
- Load balancer
- Auto-scaling based on traffic

## Cost Estimate

### Monthly Costs

- **Render (2 instances)**: $50-100
- **Vercel (3 projects)**: Free tier
- **Domain & SSL**: $0 (Cloudflare)
- **NPM Registry**: Free
- **3rd Party APIs**:
  - Socket: Usage-based
  - 0x: Free tier
  - Li.Fi: Free tier

**Total**: ~$50-150/month (excluding API usage fees)

## Support & Maintenance

### Regular Tasks

- **Daily**: Monitor error logs, check uptime
- **Weekly**: Review usage stats, partner feedback
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Performance review, infrastructure optimization

### Escalation Path

1. Technical issues → techpartners@decaflow.xyz
2. Security concerns → security@decaflow.xyz
3. Partnership questions → partnerships@decaflow.xyz

## Next Steps for Tychi

1. Choose integration path (A, B, or C)
2. Receive API keys from DecaFlow
3. Set up sandbox environment
4. Implement integration
5. Test thoroughly in sandbox
6. Switch to production keys
7. Launch partnership
8. Monitor and optimize

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Maintained by**: DecaFlow Engineering Team
