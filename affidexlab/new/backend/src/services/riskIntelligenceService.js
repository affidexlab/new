import crypto from 'crypto';

const PROVIDER_TIMEOUT_MS = Number(process.env.RISK_PROVIDER_TIMEOUT_MS || 12000);

function normalizeChain(chain = 'ethereum') {
  return String(chain || 'ethereum').toLowerCase();
}

function recommendationFromScore(score) {
  if (score < 25) return 'APPROVE';
  if (score < 70) return 'REVIEW';
  return 'REJECT';
}

function levelFromScore(score) {
  if (score < 25) return 'LOW';
  if (score < 60) return 'MEDIUM';
  if (score < 85) return 'HIGH';
  return 'CRITICAL';
}

function normalizeProviderResponse(provider, address, chain, raw) {
  const score = Number(
    raw?.riskScore ?? raw?.risk_score ?? raw?.score ?? raw?.risk?.score ?? raw?.data?.riskScore ?? 0
  );
  const riskScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
  const riskLevel = String(raw?.riskLevel ?? raw?.risk_level ?? raw?.risk?.level ?? levelFromScore(riskScore)).toUpperCase();
  const flags = raw?.flags ?? raw?.riskIndicators ?? raw?.indicators ?? raw?.data?.flags ?? [];

  return {
    address,
    chain,
    provider,
    riskScore,
    riskLevel,
    sanctionsMatch: Boolean(raw?.sanctionsMatch ?? raw?.sanctions_match ?? raw?.sanctions?.match ?? false),
    sanctionsDetails: raw?.sanctionsDetails ?? raw?.sanctions_details ?? raw?.sanctions ?? null,
    mixerExposure: Number(raw?.mixerExposure ?? raw?.mixer_exposure ?? raw?.exposures?.mixer ?? 0),
    darknetExposure: Number(raw?.darknetExposure ?? raw?.darknet_exposure ?? raw?.exposures?.darknet ?? 0),
    jurisdictionRisk: String(raw?.jurisdictionRisk ?? raw?.jurisdiction_risk ?? raw?.jurisdiction?.risk ?? riskLevel),
    hopsAnalysed: Number(raw?.hopsAnalysed ?? raw?.hops_analysed ?? raw?.graph?.hops ?? 0),
    recommendation: raw?.recommendation ?? recommendationFromScore(riskScore),
    flags: Array.isArray(flags) ? flags.map(String) : [],
    reportId: raw?.reportId ?? raw?.report_id ?? `rpt_${crypto.randomBytes(8).toString('hex')}`,
    checkedAt: new Date().toISOString(),
    raw,
  };
}

function demoRisk(address, chain) {
  const clean = String(address || '').replace('0x', '').toLowerCase();
  const seed = (clean.charCodeAt(0) || 65) + (clean.charCodeAt(1) || 66);
  const riskScore = seed % 3 === 0 ? 8 : seed % 3 === 1 ? 54 : 89;
  const riskLevel = levelFromScore(riskScore);
  const flags = riskScore < 25 ? [] : riskScore < 60
    ? ['Interaction with flagged exchange', 'Moderate transaction velocity']
    : riskScore < 85
      ? ['Mixer exposure indicator', 'High-risk jurisdiction activity']
      : ['Sanctions proximity indicator', 'Mixer exposure detected', 'Darknet market interaction'];

  return {
    address,
    chain,
    provider: 'demo',
    riskScore,
    riskLevel,
    sanctionsMatch: riskScore > 85,
    sanctionsDetails: riskScore > 85 ? { programme: 'Demo sanctions list', entity: 'Demo Entity' } : null,
    mixerExposure: riskScore > 60 ? 0.34 : riskScore > 30 ? 0.08 : 0,
    darknetExposure: riskScore > 75 ? 0.12 : 0,
    jurisdictionRisk: riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW',
    hopsAnalysed: 5,
    recommendation: recommendationFromScore(riskScore),
    flags,
    reportId: `demo_${crypto.randomBytes(8).toString('hex')}`,
    checkedAt: new Date().toISOString(),
    note: 'Demo output only. Configure RISK_PROVIDER_URL and RISK_PROVIDER_API_KEY for live intelligence.',
  };
}

export async function screenWallet({ address, chain = 'ethereum', customerId = null, purpose = 'screening', allowDemo = false }) {
  const provider = (process.env.RISK_PROVIDER || '').trim().toLowerCase();
  const providerUrl = process.env.RISK_PROVIDER_URL;
  const apiKey = process.env.RISK_PROVIDER_API_KEY;
  const normalizedChain = normalizeChain(chain);

  if (!providerUrl || !apiKey) {
    if (allowDemo || process.env.ALLOW_DEMO_RISK === 'true') return demoRisk(address, normalizedChain);
    throw new Error('Risk intelligence provider is not configured. Set RISK_PROVIDER_URL and RISK_PROVIDER_API_KEY.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(providerUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ address, chain: normalizedChain, customerId, purpose }),
    });

    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(raw?.error || raw?.message || `Risk provider returned ${response.status}`);
    }

    return normalizeProviderResponse(provider || 'custom', address, normalizedChain, raw);
  } finally {
    clearTimeout(timeout);
  }
}
