-- VDM Staking Investments Table
-- Used to track funds pooled from custodial wallet for high-return crypto investments

CREATE TABLE IF NOT EXISTS vdm_staking_investments (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(20, 2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  returns NUMERIC(20, 2) DEFAULT 0,
  invested_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT DEFAULT NULL,
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'closed'))
);

CREATE INDEX IF NOT EXISTS idx_vdm_investments_status ON vdm_staking_investments(status);
CREATE INDEX IF NOT EXISTS idx_vdm_investments_invested_at ON vdm_staking_investments(invested_at);
