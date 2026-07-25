import { useState, useEffect } from 'react';
import { InstitutionalClient, InstitutionalConfig, AssetLocation, EligibilityResult } from '../institutional/InstitutionalClient';

/**
 * useEligibility — React hook wrapper around InstitutionalClient.checkEligibility.
 * Pass null for `wallet` or `asset` to skip the check (e.g. wallet not connected yet).
 */
export function useEligibility(
  wallet: string | null,
  asset: AssetLocation | null,
  config: InstitutionalConfig = {}
) {
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet || !asset) {
      setResult(null);
      return;
    }

    let cancelled = false;
    const client = new InstitutionalClient(config);

    setLoading(true);
    setError(null);
    client
      .checkEligibility(wallet, asset)
      .then((r) => { if (!cancelled) setResult(r); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, asset?.chain, asset?.identityRegistry]);

  return { result, loading, error };
}
