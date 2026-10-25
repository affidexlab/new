CREATE TABLE IF NOT EXISTS institutional_operator_runbooks (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  runbook_key VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  owner_role VARCHAR(120) NOT NULL DEFAULT 'DecaFlow Institutional Ops',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  escalation_contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, runbook_key)
);

CREATE TABLE IF NOT EXISTS institutional_safe_admins (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  chain VARCHAR(50) NOT NULL,
  safe_address VARCHAR(255) NOT NULL,
  threshold INTEGER NOT NULL,
  owners JSONB NOT NULL DEFAULT '[]'::jsonb,
  managed_by VARCHAR(120) DEFAULT 'DecaFlow',
  purpose VARCHAR(160) DEFAULT 'rwa-admin',
  status VARCHAR(40) DEFAULT 'pending-verification',
  evidence_hash VARCHAR(128),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, chain, lower(safe_address))
);

CREATE TABLE IF NOT EXISTS institutional_issuer_onboarding (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  issuer_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(120),
  jurisdiction VARCHAR(120),
  stage VARCHAR(80) DEFAULT 'intake',
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  counsel_signoff_hash VARCHAR(128),
  kyc_process_hash VARCHAR(128),
  operator_signoff_hash VARCHAR(128),
  deployment_signoff_hash VARCHAR(128),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institutional_evidence_retention (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  subject_type VARCHAR(80) NOT NULL,
  subject_id VARCHAR(120) NOT NULL,
  evidence_hash VARCHAR(128) NOT NULL,
  storage_uri TEXT,
  retention_until TIMESTAMPTZ NOT NULL,
  legal_basis VARCHAR(255),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inst_evidence_retention_org ON institutional_evidence_retention(organization_id, retention_until);

CREATE TABLE IF NOT EXISTS institutional_regulatory_reports (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  report_type VARCHAR(120) NOT NULL,
  period_start DATE,
  period_end DATE,
  status VARCHAR(60) DEFAULT 'draft',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_by VARCHAR(255),
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institutional_deployments (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  chain VARCHAR(50) NOT NULL,
  asset_symbol VARCHAR(40),
  identity_registry VARCHAR(255),
  compliance_rules VARCHAR(255),
  risk_oracle VARCHAR(255),
  rwa_token VARCHAR(255),
  admin_safe VARCHAR(255),
  status VARCHAR(60) DEFAULT 'planned',
  deployment_tx_hash VARCHAR(255),
  post_deploy_review_hash VARCHAR(128),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO institutional_operator_runbooks (organization_id, runbook_key, title, owner_role, steps, escalation_contacts, active, approved_by, approved_at) VALUES
(NULL, 'risk-oracle-update', 'Risk oracle update and rollback', 'DecaFlow Institutional Ops', '["Pull latest approved investor-risk export","Update oracle in batch within configured limits","Verify emitted update events","Run sample canTransfer checks","Rollback through Safe if verification fails"]'::jsonb, '["institutional-ops@decaflow.xyz","security@decaflow.xyz"]'::jsonb, true, 'DecaFlow', NOW()),
(NULL, 'identity-attestation-lifecycle', 'Identity attestation lifecycle', 'DecaFlow Compliance Ops', '["Verify KYC/KYB/accreditation evidence hash","Create or update off-chain attestation","Commit evidence hash to identity registry","Schedule expiry review","Revoke immediately on failed refresh or sanctions hit"]'::jsonb, '["compliance@decaflow.xyz"]'::jsonb, true, 'DecaFlow', NOW()),
(NULL, 'issuer-incident-response', 'Issuer incident response', 'DecaFlow Institutional Ops', '["Classify incident severity","Freeze or pause through approved Safe if required","Notify issuer and counsel","Preserve evidence package","Publish final disposition"]'::jsonb, '["institutional-ops@decaflow.xyz","legal@decaflow.xyz"]'::jsonb, true, 'DecaFlow', NOW())
ON CONFLICT(organization_id, runbook_key) DO NOTHING;
