CREATE TABLE IF NOT EXISTS admin_api_keys (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  key_hash      VARCHAR(64) NOT NULL UNIQUE,
  scopes        JSONB NOT NULL DEFAULT '["*"]'::jsonb,
  active        BOOLEAN DEFAULT true,
  expires_at    TIMESTAMPTZ,
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_api_keys_active ON admin_api_keys (active);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id            SERIAL PRIMARY KEY,
  admin_key_id  INTEGER REFERENCES admin_api_keys(id),
  principal     VARCHAR(255),
  scope         VARCHAR(120),
  method        VARCHAR(20),
  path          TEXT,
  ip            TEXT,
  allowed       BOOLEAN NOT NULL,
  reason        VARCHAR(120),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_key ON admin_audit_logs (admin_key_id, created_at DESC);

CREATE TABLE IF NOT EXISTS shield_scan_cursors (
  chain         VARCHAR(50) NOT NULL,
  address       VARCHAR(255) NOT NULL,
  scanner       VARCHAR(80) NOT NULL,
  last_block    BIGINT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shield_scan_cursors_unique
  ON shield_scan_cursors (chain, lower(address), scanner);

CREATE TABLE IF NOT EXISTS shield_contract_state (
  chain         VARCHAR(50) NOT NULL,
  address       VARCHAR(255) NOT NULL,
  code_hash     VARCHAR(80),
  block_number  BIGINT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shield_contract_state_unique
  ON shield_contract_state (chain, lower(address));
