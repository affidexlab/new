CREATE TABLE IF NOT EXISTS compliance_workflow_rules (
  id                 SERIAL PRIMARY KEY,
  account_email      VARCHAR(255) NOT NULL,
  name               VARCHAR(255) NOT NULL,
  condition_field    VARCHAR(50)  NOT NULL DEFAULT 'riskScore',
  operator           VARCHAR(10)  NOT NULL,   -- '>', '>=', '<', '<=', '=='
  threshold          INTEGER      NOT NULL,
  action             VARCHAR(50)  NOT NULL,   -- 'flag_for_review' | 'notify_only'
  enabled            BOOLEAN      DEFAULT true,
  created_at         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_review_queue (
  id                 SERIAL PRIMARY KEY,
  account_email      VARCHAR(255) NOT NULL,
  rule_id            INTEGER REFERENCES compliance_workflow_rules(id),
  wallet_address      VARCHAR(255),
  chain              VARCHAR(50),
  risk_score         INTEGER,
  risk_level         VARCHAR(20),
  status             VARCHAR(50)  DEFAULT 'pending',  -- pending | approved | rejected
  reviewed_by        VARCHAR(255),
  reviewed_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_rules_account ON compliance_workflow_rules (account_email);
CREATE INDEX IF NOT EXISTS idx_review_queue_account   ON compliance_review_queue (account_email, status);
