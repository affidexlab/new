# DecaFlow ▸ Tychi Wallet Partner Integration Kit
*Prepared for Tychi Wallet technical team — December 2025*

---

## 1. Partnership Scope
DecaFlow will operate as Tychi Wallet's primary DeFi execution layer across three pillars:
1. **Multi-chain swaps** (smart routing via Uniswap V3 + Aerodrome)
2. **Liquidity pool management** (add/remove liquidity, position analytics)
3. **Cross-chain bridges** (quote + execution orchestration)

Tychi controls the end-user experience while DecaFlow supplies the routing logic, smart-contract layer, and infrastructure. This document contains the technical assets you need to begin integration.

---

## 2. Integration Options (Choose One)
| Option | Description | Time-to-market | Notes |
|--------|-------------|----------------|-------|
| **A. Full API Integration** | Tychi consumes DecaFlow REST APIs for swaps, liquidity, bridges. | ~3–4 weeks | Maximum UI control. Recommended for primary integration. |
| **B. SDK Integration** | Drop-in React/JS SDK that exposes pre-built hooks + components. | ~2 weeks | Uses the same APIs under the hood; customizable styling. |
| **C. Embedded Suite** | Secure iframe/WebView with white-label UI. | < 1 week | Fastest route; ideal for pilot/beta. |

---

## 3. REST API Summary
Base URL (Production): `https://api.decaflow.com/v1`
Base URL (Sandbox): `https://sandbox.decaflow.com/v1`
Authentication: `X-Partner-ID` header (Tychi wallet partner key, issued after NDA/licence execution).

### 3.1 Swap Endpoints
| Method | Endpoint | Purpose | Required Params |
|--------|----------|---------|-----------------|
| `POST` | `/swap/quote` | Returns best route + price impact. | `fromToken`, `toToken`, `amount`, `chainId`, `slippage`, `walletAddress` |
| `POST` | `/swap/execute` | Generates calldata + tx metadata. | `quoteId`, `walletAddress` |

**Sample Request:**
```json
POST /swap/quote
{
  "fromToken": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "toToken": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "amount": "1000000",
  "chainId": 8453,
  "slippage": 0.5,
  "walletAddress": "0xTychiUser..."
}
```

### 3.2 Liquidity Endpoints
| Method | Endpoint | Notes |
|--------|----------|-------|
| `GET` | `/liquidity/pools?chainId=` | Returns supported pools + metadata. |
| `POST` | `/liquidity/add` | Accepts pool ID, token amounts, deadlines. |
| `POST` | `/liquidity/remove` | Burns LP position, returns tokens. |
| `GET` | `/liquidity/positions?wallet=` | Lists user positions + APY. |

### 3.3 Bridge Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/bridge/quote` | Available routes, arrival estimates, fees. |
| `POST` | `/bridge/execute` | Returns tx data for origin chain. |
| `GET` | `/bridge/status/{trackingId}` | Poll bridge state. |

Full OpenAPI/Swagger spec is included in the partner package (JSON + HTML viewer).

---

## 4. SDK & Embedded Assets
- **SDK Package:** `@decaflow/partner-sdk` (npm) — provides React hooks (`useSwapQuote`, `useBridgeQuote`, etc.) and UI components.
- **Embedded URL:** `https://partners.decaflow.com/embed?partner=tychi`
  - Sandbox version: `https://partners-sandbox.decaflow.com/embed?partner=tychi`
  - Supports theme overrides via query params (`theme=dark`, `accent=%23AA33FF`).
- **PostMessage Events:** `SWAP_SUBMITTED`, `SWAP_CONFIRMED`, `BRIDGE_REQUESTED`, `ERROR` (payload documented in SDK guide).

Documentation PDF + code samples are bundled under `/docs/partner-sdk/` in the attachment.

---

## 5. Smart Contract Addresses (Mainnet)
| Chain | LiquidityRouter | Notes |
|-------|-----------------|-------|
| Base (8453) | `0x4b6D747Bc35CF3856e99C1C7B2e73C2687AB7DB4` | Supports Uniswap V3 + Aerodrome |
| Arbitrum (42161) | `0xDE8700785C7512a8397683A9BE9717B0aFdB18F3` | Uniswap V3 |
| Optimism (10) | `0xA2fdf81b7967e7FA7610DeBe1901A40686c48992` | Uniswap V3 |
| Polygon (137) | `0xFd05977256E8D5753728C78A3003BC3B75Fef1DD` | Deployed Dec 2025 |
| Avalanche (43114) | Pending (scheduled) | Endpoint ready once deployment confirmed |
| Ethereum (1) | Pending (scheduled) | Endpoint ready once deployment confirmed |

ABI files (`LiquidityRouter.json`, `FeeRouter.json`) are included in `/abis/`.

---

## 6. Sandbox / Test Environment
| Component | URL / Details |
|-----------|---------------|
| API Base | `https://sandbox.decaflow.com/v1` |
| Partner Dashboard | `https://partners-sandbox.decaflow.com/dashboard` |
| API Key Issuance | Provided once NDA/licence executed |
| Test Tokens | Faucet links provided for Base Goerli, Arbitrum Sepolia, Optimism Sepolia, Polygon Amoy |
| Monitoring | Grafana dashboards shared on request |

**Test Wallets:** We can pre-fund Tychi-owned addresses with test assets for QA upon request.

---

## 7. Branding & Co-Marketing Guidelines
Only include assets needed on your side:
- DecaFlow logomark (SVG + PNG, light/dark) — `/brand/decaflow-logo.zip`
- Color palette + typography suggestions
- "Powered by DecaFlow" badge (optional for swap UI)

Usage: Maintain 24px minimum clear space around logo; do not alter colors. Co-branded materials require mutual approval.

---

## 8. Support & Escalation
| Purpose | Contact |
|---------|---------|
| Technical (API/SDK) | techpartners@decaflow.com |
| Smart Contract / Security | security@decaflow.com |
| Partnership / BD | partnerships@decaflow.com |
| 24/7 Incident Hotline | +1-628-XXX-XXXX |

Slack/Telegram shared channel will be created once integration agreement is signed. Response SLA: <4 business hours (critical), <1 business day (routine).

---

## 9. Licensing & Compliance
- **Mutual NDA:** Required before we issue production API keys or share non-public repos. We can sign Tychi's standard NDA or provide ours.
- **Integration Licence:** Grants Tychi the right to embed DecaFlow services inside Tychi Wallet. Includes:
  - API usage terms
  - Security requirements
  - Branding/co-marketing rights
  - Revenue sharing (if applicable)
- **KYC/AML:** DecaFlow operates as non-custodial middleware; no user KYC required. Tychi remains responsible for end-user compliance per your jurisdiction.

Please provide your preferred legal contact so we can circulate the licence packet for signature.

---

## 10. Next Steps Checklist
1. ✅ Confirm preferred integration option (API / SDK / Embedded).
2. ✅ Execute NDA + integration license (DecaFlow Legal ↔ Tychi Legal).
3. 🔒 Receive partner API key + sandbox credentials.
4. 🛠️ Begin integration (joint Slack channel + weekly standups).
5. 🧪 Complete sandbox QA → production cutover.
6. 📣 Coordinate co-marketing launch.

We’re ready to move as soon as you select the integration path and legal paperwork is complete. Reach out anytime if you need additional assets.

— DecaFlow Partnerships Team