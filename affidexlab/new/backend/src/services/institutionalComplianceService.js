import crypto from 'crypto';
import pool from '../db/connection.js';
import { screenWalletInternal } from './internalRiskEngine.js';

function cleanAddress(address) {
  return String(address || '').trim().toLowerCase();
}

function cleanChain(chain) {
  return String(chain || 'ethereum').trim().toLowerCase();
}

export function computeEvidenceHash(evidence) {
  return `0x${crypto.createHash('sha256').update(JSON.stringify(evidence ?? {})).digest('hex')}`;
}

export async function upsertIdentityAttestation({
  chain,
  walletAddress,
  organizationId = null,
  kycStatus = 'approved',
  jurisdictionEligible = false,
  accreditedInvestor = false,
  jurisdiction = null,
  accreditationBasis = null,
  evidence = null,
  attestedBy,
  expiresAt = null,
  metadata = {},
}) {
  const evidenceHash = evidence ? computeEvidenceHash(evidence) : null;
  const { rows } = await pool.query(
    `INSERT INTO institutional_identity_attestations
       (chain, wallet_address, organization_id, kyc_status, jurisdiction_eligible, accredited_investor,
        jurisdiction, accreditation_basis, evidence_hash, attested_by, expires_at, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (chain, lower(wallet_address))
     DO UPDATE SET
       organization_id = COALESCE(EXCLUDED.organization_id, institutional_identity_attestations.organization_id),
       kyc_status = EXCLUDED.kyc_status,
       jurisdiction_eligible = EXCLUDED.jurisdiction_eligible,
       accredited_investor = EXCLUDED.accredited_investor,
       jurisdiction = COALESCE(EXCLUDED.jurisdiction, institutional_identity_attestations.jurisdiction),
       accreditation_basis = COALESCE(EXCLUDED.accreditation_basis, institutional_identity_attestations.accreditation_basis),
       evidence_hash = COALESCE(EXCLUDED.evidence_hash, institutional_identity_attestations.evidence_hash),
       attested_by = EXCLUDED.attested_by,
       expires_at = EXCLUDED.expires_at,
       revoked_at = NULL,
       metadata = EXCLUDED.metadata,
       updated_at = NOW()
     RETURNING *`,
    [
      cleanChain(chain), cleanAddress(walletAddress), organizationId, kycStatus,
      !!jurisdictionEligible, !!accreditedInvestor, jurisdiction, accreditationBasis,
      evidenceHash, attestedBy, expiresAt, metadata,
    ]
  );
  return rows[0];
}

export async function getIdentityAttestation({ chain, walletAddress }) {
  const { rows } = await pool.query(
    `SELECT * FROM institutional_identity_attestations
     WHERE chain = $1 AND lower(wallet_address) = $2`,
    [cleanChain(chain), cleanAddress(walletAddress)]
  );
  return rows[0] || null;
}

export async function revokeIdentityAttestation({ chain, walletAddress, revokedBy }) {
  const { rows } = await pool.query(
    `UPDATE institutional_identity_attestations
     SET revoked_at = NOW(), kyc_status = 'revoked',
         metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('revokedBy', $3::text),
         updated_at = NOW()
     WHERE chain = $1 AND lower(wallet_address) = $2
     RETURNING *`,
    [cleanChain(chain), cleanAddress(walletAddress), String(revokedBy || 'admin')]
  );
  return rows[0] || null;
}

export async function checkInvestorEligibility({ chain, walletAddress, organizationId = null, requireAccreditation = true, requestedBy = null }) {
  const network = cleanChain(chain);
  const wallet = cleanAddress(walletAddress);
  const reasons = [];

  const attestation = await getIdentityAttestation({ chain: network, walletAddress: wallet });
  if (!attestation) reasons.push('No DecaFlow identity attestation on record for this wallet.');
  else {
    if (attestation.revoked_at) reasons.push('Identity attestation has been revoked.');
    if (attestation.kyc_status !== 'approved') reasons.push(`KYC status is ${attestation.kyc_status}, not approved.`);
    if (!attestation.jurisdiction_eligible) reasons.push('Wallet is not marked jurisdiction-eligible.');
    if (requireAccreditation && !attestation.accredited_investor) reasons.push('Accredited-investor status is required but not attested.');
    if (attestation.expires_at && new Date(attestation.expires_at) <= new Date()) reasons.push('Identity attestation has expired.');
  }

  const risk = await screenWalletInternal({ address: wallet, chain: network });
  if (risk.sanctionsMatch) reasons.push('Wallet has direct or near-hop sanctions exposure.');
  if (risk.recommendation === 'REJECT') reasons.push(`DecaFlow risk engine recommendation is REJECT (score ${risk.riskScore}).`);

  let decision = 'APPROVE';
  if (reasons.length) decision = 'REJECT';
  else if (risk.recommendation === 'REVIEW') {
    decision = 'REVIEW';
    reasons.push(`DecaFlow risk engine recommendation is REVIEW (score ${risk.riskScore}).`);
  }

  const { rows } = await pool.query(
    `INSERT INTO institutional_investor_checks
       (chain, wallet_address, organization_id, decision, reasons, risk_score, risk_level, sanctions_match, attestation_id, requested_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [network, wallet, organizationId, decision, JSON.stringify(reasons), risk.riskScore, risk.riskLevel, risk.sanctionsMatch, attestation?.id || null, requestedBy]
  );

  return {
    check: rows[0],
    decision,
    reasons,
    attestation,
    risk: {
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      recommendation: risk.recommendation,
      sanctionsMatch: risk.sanctionsMatch,
      reportId: risk.reportId,
    },
  };
}

export async function listContractTemplates() {
  const { rows } = await pool.query(
    `SELECT template_key, name, description, solidity_path, audit_status, version, enabled, updated_at
     FROM institutional_contract_templates
     WHERE enabled = true
     ORDER BY id`
  );
  return rows;
}
