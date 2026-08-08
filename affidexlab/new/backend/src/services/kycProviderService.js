const KYC_TIMEOUT_MS = Number(process.env.KYC_PROVIDER_TIMEOUT_MS || 12000);

export async function createKycApplicant({ email, wallet, externalUserId, metadata = {} }) {
  const providerUrl = process.env.KYC_PROVIDER_URL;
  const apiKey = process.env.KYC_PROVIDER_API_KEY;
  const provider = process.env.KYC_PROVIDER || 'custom';

  if (!providerUrl || !apiKey) {
    throw new Error('KYC provider is not configured. Set KYC_PROVIDER_URL and KYC_PROVIDER_API_KEY.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), KYC_TIMEOUT_MS);

  try {
    const response = await fetch(providerUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ email, wallet, externalUserId, metadata }),
    });

    const raw = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(raw?.error || raw?.message || `KYC provider returned ${response.status}`);

    return {
      provider,
      applicantId: raw?.applicantId || raw?.id || raw?.applicant_id || raw?.data?.id,
      status: raw?.status || raw?.data?.status || 'created',
      reviewUrl: raw?.reviewUrl || raw?.url || raw?.data?.url || null,
      raw,
    };
  } finally {
    clearTimeout(timeout);
  }
}
