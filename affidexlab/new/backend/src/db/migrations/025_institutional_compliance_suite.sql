CREATE TABLE IF NOT EXISTS institutional_identity_attestations (
  id                    SERIAL PRIMARY KEY,
  chain                 VARCHAR(50) NOT NULL DEFAULT 'ethereum',
  wallet_address        VARCHAR(255) NOT NULL,
  organization_id       INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  kyc_status            VARCHAR(40) NOT NULL DEFAULT 'pending',
  jurisdiction_eligible BOOLEAN DEFAULT false,
  accredited_investor   BOOLEAN DEFAULT false,
  jurisdiction          VARCHAR(120),
  accreditation_basis   VARCHAR(255),
  evidence_hash         VARCHAR(80),
  attested_by           VARCHAR(255) NOT NULL,
  expires_at            TIMESTAMPTZ,
  revoked_at            TIMESTAMPTZ,
  metadata              JSONB DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inst_attestations_wallet
  ON institutional_identity_attestations (chain, lower(wallet_address));
CREATE INDEX IF NOT EXISTS idx_inst_attestations_org
  ON institutional_identity_attestations (organization_id, kyc_status);

CREATE TABLE IF NOT EXISTS institutional_investor_checks (
  id                SERIAL PRIMARY KEY,
  chain             VARCHAR(50) NOT NULL,
  wallet_address    VARCHAR(255) NOT NULL,
  organization_id   INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  decision          VARCHAR(30) NOT NULL,
  reasons           JSONB DEFAULT '[]'::jsonb,
  risk_score        INTEGER,
  risk_level        VARCHAR(30),
  sanctions_match   BOOLEAN DEFAULT false,
  attestation_id    INTEGER REFERENCES institutional_identity_attestations(id) ON DELETE SET NULL,
  requested_by      VARCHAR(255),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inst_investor_checks_wallet
  ON institutional_investor_checks (chain, lower(wallet_address), created_at DESC);

CREATE TABLE IF NOT EXISTS institutional_contract_templates (
  id             SERIAL PRIMARY KEY,
  template_key   VARCHAR(100) UNIQUE NOT NULL,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  solidity_path  VARCHAR(255) NOT NULL,
  audit_status   VARCHAR(255),
  version        VARCHAR(40) DEFAULT '1.0.0',
  enabled        BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO institutional_contract_templates (template_key, name, description, solidity_path, audit_status) VALUES
  ('identity-registry', 'Identity Registry', 'Per-wallet verification, jurisdiction eligibility, accreditation status, and evidence hash commitments for tokenized securities.', 'contracts/rwa-institutional/IdentityRegistry.sol', 'Guardian audit findings addressed; 53-test regression suite passing; final pre-deployment re-review required per engagement.'),
  ('compliance-rules', 'Compliance Rules', 'canTransfer gating with identity checks, jurisdiction eligibility, holder caps, accreditation enforcement, and risk-oracle gating.', 'contracts/rwa-institutional/ComplianceRules.sol', 'Guardian audit findings addressed; 53-test regression suite passing; final pre-deployment re-review required per engagement.'),
  ('risk-oracle', 'Risk Oracle', 'On-chain wallet risk scores with access control, batch limits, and circuit breaker fed by DecaFlow internal risk intelligence.', 'contracts/rwa-institutional/RiskOracle.sol', 'Guardian audit findings addressed; 53-test regression suite passing; final pre-deployment re-review required per engagement.'),
  ('rwa-token', 'RWA Security Token', 'Compliance-enforced ERC-20 for tokenized securities with pause controls and emergency-council escrow recovery.', 'contracts/rwa-institutional/RWAToken.sol', 'Guardian audit findings addressed; 53-test regression suite passing; final pre-deployment re-review required per engagement.'),
  ('zk-identity-gate', 'ZK Identity Gate', 'Zero-knowledge KYC group membership verification with proof-to-wallet binding for privacy-preserving investor gating.', 'contracts/rwa-institutional/ZKIdentityGate.sol', 'Guardian audit findings addressed; 53-test regression suite passing; final pre-deployment re-review required per engagement.')
ON CONFLICT (template_key) DO UPDATE SET
  description = EXCLUDED.description,
  audit_status = EXCLUDED.audit_status,
  updated_at = NOW();
