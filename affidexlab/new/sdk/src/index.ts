// Privacy SDK exports
export { PrivacyClient, createPrivacyClient } from './privacy/PrivacyClient';
export type { PrivacyConfig, SwapParams, SwapQuote, SwapExecution } from './privacy/PrivacyClient';

// Institutional (RWA) SDK exports — see /contracts/rwa-institutional/README.md
// for the unaudited-contracts caveat that applies to everything here.
export { InstitutionalClient, createInstitutionalClient } from './institutional/InstitutionalClient';
export type { InstitutionalConfig, EligibilityResult, IdentityProof, AssetLocation } from './institutional/InstitutionalClient';
export { useEligibility } from './hooks/useEligibility';

// Widget & Hook exports
export { useSwapQuote } from './hooks/useSwapQuote';
export { useBridgeQuote } from './hooks/useBridgeQuote';
export { useLiquidityPools } from './hooks/useLiquidityPools';
export { usePartnerStats } from './hooks/usePartnerStats';
export { DecaFlowProvider } from './components/DecaFlowProvider';
export { SwapWidget } from './components/SwapWidget';
export { BridgeWidget } from './components/BridgeWidget';
export * from './types';
