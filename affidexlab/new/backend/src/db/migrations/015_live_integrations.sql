CREATE TABLE IF NOT EXISTS risk_screenings (
  id                  SERIAL PRIMARY KEY,
  product             VARCHAR(50) NOT NULL,
  api_key             VARCHAR(255),
  wallet_address      VARCHAR(255) NOT NULL,
  chain               VARCHAR(50) NOT NULL,
  provider            VARCHAR(80),
  risk_score          INTEGER,
  risk_level          VARCHAR(40),
  recommendation      VARCHAR(40),
  sanctions_match     BOOLEAN DEFAULT false,
  mixer_exposure      NUMERIC,
  darknet_exposure    NUMERIC,
  report_id           VARCHAR(255),
  raw_response        JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_screenings_wallet ON risk_screenings (wallet_address, chain);
CREATE INDEX IF NOT EXISTS idx_risk_screenings_api_key ON risk_screenings (api_key);

CREATE TABLE IF NOT EXISTS kyc_applications (
  id                  SERIAL PRIMARY KEY,
  email               VARCHAR(255) NOT NULL,
  wallet_address      VARCHAR(255),
  provider            VARCHAR(80),
  provider_applicant_id VARCHAR(255),
  status              VARCHAR(80) DEFAULT 'created',
  review_url          TEXT,
  raw_response        JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_applications_email ON kyc_applications (email);
CREATE INDEX IF NOT EXISTS idx_kyc_applications_wallet ON kyc_applications (wallet_address);

CREATE TABLE IF NOT EXISTS shield_alerts (
  id                  SERIAL PRIMARY KEY,
  chain               VARCHAR(50) NOT NULL,
  address             VARCHAR(255) NOT NULL,
  label               VARCHAR(255),
  severity            VARCHAR(40) NOT NULL,
  alert_type          VARCHAR(80) NOT NULL,
  message             TEXT NOT NULL,
  tx_hash             VARCHAR(255),
  metadata            JSONB,
  status              VARCHAR(40) DEFAULT 'open',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shield_alerts_status ON shield_alerts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shield_alerts_contract ON shield_alerts (chain, address);

CREATE TABLE IF NOT EXISTS shield_incidents (
  id                  SERIAL PRIMARY KEY,
  alert_id            INTEGER REFERENCES shield_alerts(id),
  title               VARCHAR(255) NOT NULL,
  severity            VARCHAR(40) NOT NULL,
  status              VARCHAR(40) DEFAULT 'triage',
  assigned_to         VARCHAR(255),
  summary             TEXT,
  next_steps          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  closed_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shield_incidents_status ON shield_incidents (status, created_at DESC);
