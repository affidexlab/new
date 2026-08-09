CREATE TABLE IF NOT EXISTS shield_waitlist (
  id              SERIAL PRIMARY KEY,
  company_name    VARCHAR(255) NOT NULL,
  contact_name    VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  chains          JSONB DEFAULT '[]'::jsonb,
  contract_count  VARCHAR(80),
  message         TEXT,
  source          VARCHAR(120) DEFAULT 'shield-page',
  status          VARCHAR(50) DEFAULT 'new',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shield_waitlist_email ON shield_waitlist (lower(email));
CREATE INDEX IF NOT EXISTS idx_shield_waitlist_status ON shield_waitlist (status, created_at DESC);
