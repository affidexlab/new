/**
 * DecaFlow Institutional SDK — Identity & Eligibility Client
 *
 * Wraps the two functions named in the RWA roadmap: checkEligibility() and
 * getIdentityProof(). Both call DecaFlow's backend, which reads the on-chain
 * IdentityRegistry contract for you — you don't need your own RPC connection.
 *
 * IMPORTANT: this talks to unaudited reference contracts (see
 * /contracts/rwa-institutional/README.md). Treat results accordingly until
 * that changes.
 */

export interface InstitutionalConfig {
  apiUrl?: string;
  apiKey?: string;
}

export interface EligibilityResult {
  wallet: string;
  eligible: boolean;
}

export interface IdentityProof {
  wallet: string;
  verified: boolean;
  countryCode: string;
  accreditedInvestor: boolean;
  verifiedAt: number;
  /** Plain on-chain identity record, NOT a zero-knowledge proof — ZK-KYC is
   *  roadmap Phase 2 and isn't implemented yet. */
  note: string;
}

/** Where to find a given asset's contracts. No real asset registry exists yet
 *  (nothing's deployed), so callers supply this directly for now — see the
 *  backend route comments for the planned upgrade to a real assetId lookup. */
export interface AssetLocation {
  chain: 'arbitrum' | 'base' | 'polygon' | 'avalanche';
  identityRegistry: string;
}

const DEFAULT_API_URL = 'https://decaflow-backend.onrender.com';

export class InstitutionalClient {
  private apiUrl: string;
  private apiKey?: string;

  constructor(config: InstitutionalConfig = {}) {
    this.apiUrl = config.apiUrl || DEFAULT_API_URL;
    this.apiKey = config.apiKey;
  }

  private async request<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${this.apiUrl}${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), {
      headers: this.apiKey ? { 'x-api-key': this.apiKey } : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Request to ${path} failed (${res.status})`);
    }
    return data as T;
  }

  /**
   * checkEligibility — from the roadmap: "checkEligibility(address wallet, assetId)".
   * `asset` here is the AssetLocation (chain + identity registry address) since no
   * real assetId registry exists yet.
   */
  async checkEligibility(wallet: string, asset: AssetLocation): Promise<EligibilityResult> {
    return this.request<EligibilityResult>('/v1/institutional/eligibility', {
      wallet,
      chain: asset.chain,
      identityRegistry: asset.identityRegistry,
    });
  }

  /**
   * getIdentityProof — from the roadmap: "getIdentityProof(wallet)".
   * Returns the plain on-chain identity record today, clearly flagged as such.
   * Will return an actual zero-knowledge proof once Phase 2 (ZK-KYC) ships —
   * the return shape is expected to change at that point, not just gain a field.
   */
  async getIdentityProof(wallet: string, asset: AssetLocation): Promise<IdentityProof> {
    return this.request<IdentityProof>('/v1/institutional/identity-proof', {
      wallet,
      chain: asset.chain,
      identityRegistry: asset.identityRegistry,
    });
  }
}

export function createInstitutionalClient(config: InstitutionalConfig = {}): InstitutionalClient {
  return new InstitutionalClient(config);
}
