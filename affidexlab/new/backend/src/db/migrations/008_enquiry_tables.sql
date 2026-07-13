-- ============================================================
-- DecaFlow Migration 008 — Enquiry Tables
-- compliance_enquiries, audit_enquiries, verify_enquiries
-- ============================================================

CREATE TABLE IF NOT EXISTS compliance_enquiries (
  id                SERIAL PRIMARY KEY,
  company_name      VARCHAR(255) NOT NULL,
  contact_name      VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  telegram          VARCHAR(255),
  business_type     VARCHAR(100),
  chains            TEXT[],
  monthly_tx_volume VARCHAR(100),
  plan              VARCHAR(50)  DEFAULT 'Business',
  message           TEXT,
  source            VARCHAR(100) DEFAULT 'compliance-page',
  status            VARCHAR(50)  DEFAULT 'new',
  notes             TEXT,
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_enquiries (
  id                SERIAL PRIMARY KEY,
  project_name      VARCHAR(255) NOT NULL,
  contact_name      VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  telegram          VARCHAR(255),
  project_url       VARCHAR(500),
  github_repo       VARCHAR(500),
  blockchain        VARCHAR(100),
  language          VARCHAR(100),
  lines_of_code     VARCHAR(100),
  audit_package     VARCHAR(100) DEFAULT 'Protocol Audit',
  timeline          VARCHAR(100),
  description       TEXT,
  source            VARCHAR(100) DEFAULT 'audit-page',
  status            VARCHAR(50)  DEFAULT 'new',
  notes             TEXT,
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verify_enquiries (
  id                SERIAL PRIMARY KEY,
  company_name      VARCHAR(255) NOT NULL,
  contact_name      VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  telegram          VARCHAR(255),
  use_case          VARCHAR(100),
  chains            TEXT[],
  monthly_checks    VARCHAR(100),
  plan              VARCHAR(50)  DEFAULT 'Developer',
  message           TEXT,
  source            VARCHAR(100) DEFAULT 'verify-page',
  status            VARCHAR(50)  DEFAULT 'new',
  api_key_issued    BOOLEAN      DEFAULT FALSE,
  api_key           VARCHAR(255),
  notes             TEXT,
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_enquiries_email   ON compliance_enquiries (email);
CREATE INDEX IF NOT EXISTS idx_compliance_enquiries_status  ON compliance_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_audit_enquiries_email        ON audit_enquiries (email);
CREATE INDEX IF NOT EXISTS idx_audit_enquiries_status       ON audit_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_verify_enquiries_email       ON verify_enquiries (email);
CREATE INDEX IF NOT EXISTS idx_verify_enquiries_status      ON verify_enquiries (status);
