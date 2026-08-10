ALTER TABLE risk_screenings ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_risk_screenings_org_created ON risk_screenings (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_screenings_product_created ON risk_screenings (product, created_at DESC);

CREATE TABLE IF NOT EXISTS compliance_policies (
  id              SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  auto_review_score INTEGER DEFAULT 70,
  auto_reject_score INTEGER DEFAULT 90,
  escalation_email VARCHAR(255),
  regulator_export_format VARCHAR(50) DEFAULT 'csv',
  active          BOOLEAN DEFAULT true,
  created_by      VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_policies_org ON compliance_policies (organization_id, active);

CREATE TABLE IF NOT EXISTS compliance_cases (
  id              SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  wallet_address  VARCHAR(255) NOT NULL,
  chain           VARCHAR(50) DEFAULT 'ethereum',
  risk_score      INTEGER,
  risk_level      VARCHAR(40),
  status          VARCHAR(50) DEFAULT 'open',
  priority        VARCHAR(40) DEFAULT 'normal',
  assigned_to     VARCHAR(255),
  escalation_state VARCHAR(50) DEFAULT 'none',
  decision        VARCHAR(50),
  notes           TEXT,
  source          VARCHAR(80) DEFAULT 'customer-dashboard',
  created_by      VARCHAR(255),
  decided_by      VARCHAR(255),
  decided_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_cases_org_status ON compliance_cases (organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_cases_org_assignee ON compliance_cases (organization_id, assigned_to, status);

CREATE TABLE IF NOT EXISTS compliance_escalations (
  id              SERIAL PRIMARY KEY,
  case_id         INTEGER REFERENCES compliance_cases(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  escalated_to    VARCHAR(255),
  reason          TEXT,
  status          VARCHAR(50) DEFAULT 'open',
  created_by      VARCHAR(255),
  resolved_by     VARCHAR(255),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_escalations_org ON compliance_escalations (organization_id, status, created_at DESC);
