# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-12

### Added
- Initial release of DecaFlow Privacy SDK
- Privacy-protected swap functionality
- MEV risk scoring
- CoW Protocol integration
- Multi-chain support (Arbitrum, Ethereum, Base, Optimism, Polygon, Avalanche)
- React hooks for easy integration
- TypeScript SDK with full type definitions
- Transaction status tracking
- Real-time MEV protection

### Features
- `PrivacyClient` - Core SDK client for privacy swaps
- `getSwapQuote()` - Get privacy-protected swap quotes
- `executeSwap()` - Execute MEV-protected swaps
- `getMEVRiskScore()` - Analyze MEV risk before trading
- `getTransactionStatus()` - Track swap execution and MEV savings
- React hooks: `useSwapQuote`, `useBridgeQuote`, `useLiquidityPools`
- React components: `SwapWidget`, `BridgeWidget`, `DecaFlowProvider`

### Documentation
- Complete API reference
- Quick start guide
- Integration examples
- Best practices guide

## [Unreleased]

### Planned
- Python SDK
- Solidity contracts
- Batch swap support
- Custom routing strategies
- Advanced analytics
- WebSocket support for real-time updates
- Mobile SDK (iOS/Android)
