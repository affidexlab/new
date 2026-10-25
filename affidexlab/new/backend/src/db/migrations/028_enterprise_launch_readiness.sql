CREATE TABLE IF NOT EXISTS compliance_case_comments (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES compliance_cases(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  visibility VARCHAR(40) DEFAULT 'internal',
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_compliance_case_comments_case ON compliance_case_comments(case_id, created_at DESC);

CREATE TABLE IF NOT EXISTS compliance_case_evidence (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES compliance_cases(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  evidence_type VARCHAR(80) NOT NULL DEFAULT 'document',
  title VARCHAR(255) NOT NULL,
  uri TEXT,
  content_hash VARCHAR(128),
  metadata JSONB DEFAULT '{}'::jsonb,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_compliance_case_evidence_case ON compliance_case_evidence(case_id, created_at DESC);

CREATE TABLE IF NOT EXISTS compliance_audit_events (
  id BIGSERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  actor_email VARCHAR(255),
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) NOT NULL,
  before_state JSONB,
  after_state JSONB,
  event_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_events_org ON compliance_audit_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_events_entity ON compliance_audit_events(entity_type, entity_id, created_at DESC);

CREATE TABLE IF NOT EXISTS compliance_report_templates (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  format VARCHAR(40) DEFAULT 'csv',
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_compliance_report_templates_org ON compliance_report_templates(organization_id, active);

ALTER TABLE compliance_cases ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;
ALTER TABLE compliance_cases ADD COLUMN IF NOT EXISTS sla_tier VARCHAR(40) DEFAULT 'standard';
ALTER TABLE compliance_cases ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS shield_monitor_runs (
  id BIGSERIAL PRIMARY KEY,
  source VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  contracts_checked INTEGER DEFAULT 0,
  alerts_created INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_shield_monitor_runs_started ON shield_monitor_runs(started_at DESC);

CREATE TABLE IF NOT EXISTS audit_delivery_templates (
  id SERIAL PRIMARY KEY,
  package_key VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  turnaround_days INTEGER NOT NULL,
  report_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  acceptance_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO audit_delivery_templates(package_key, name, turnaround_days, report_sections, acceptance_checklist) VALUES
('protocol-standard', 'Protocol Security Audit', 7,
 '["Executive summary","Scope and commit hash","Methodology","Findings by severity","Remediation guidance","Fix verification","Limitations"]'::jsonb,
 '["Signed scope captured","Repository commit frozen","Automated tests reviewed","Manual review complete","Draft report QA complete","Client fix window complete","Final PDF issued"]'::jsonb),
('rwa-institutional', 'Institutional/RWA Pre-Deployment Review', 14,
 '["Legal/technical scope","Identity and compliance controls","Transfer restriction review","Oracle and operator assumptions","Deployment checklist","Residual risk"]'::jsonb,
 '["Counsel-reviewed requirements attached","KYC/KYB process documented","Safe/multisig configured","Operator runbook approved","Final deployment sign-off complete"]'::jsonb)
ON CONFLICT(package_key) DO UPDATE SET name = EXCLUDED.name, turnaround_days = EXCLUDED.turnaround_days, report_sections = EXCLUDED.report_sections, acceptance_checklist = EXCLUDED.acceptance_checklist;
