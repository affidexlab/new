CREATE TABLE IF NOT EXISTS solana_staking_positions (
  id SERIAL PRIMARY KEY,
  wallet VARCHAR(255) NOT NULL,
  pool_id VARCHAR(100) NOT NULL,
  staked_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  lp_tokens DECIMAL(20, 8) NOT NULL DEFAULT 0,
  pending_rewards DECIMAL(20, 8) NOT NULL DEFAULT 0,
  vdm_price_usdt_snapshot DECIMAL(20, 8) NOT NULL DEFAULT 0,
  staked_value_usdt_snapshot DECIMAL(20, 8) NOT NULL DEFAULT 0,
  staked_at BIGINT NOT NULL,
  last_claim_at BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  lock_period VARCHAR(32) NOT NULL DEFAULT 'TwelveMonths',
  unlock_timestamp BIGINT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE(wallet, pool_id, status)
);

CREATE INDEX IF NOT EXISTS idx_solana_positions_wallet ON solana_staking_positions(wallet);
CREATE INDEX IF NOT EXISTS idx_solana_positions_pool ON solana_staking_positions(pool_id);
CREATE INDEX IF NOT EXISTS idx_solana_positions_status ON solana_staking_positions(status);

CREATE TABLE IF NOT EXISTS solana_staking_transactions (
  id SERIAL PRIMARY KEY,
  wallet VARCHAR(255) NOT NULL,
  pool_id VARCHAR(100) NOT NULL,
  tx_type VARCHAR(50) NOT NULL,
  signature VARCHAR(255) NOT NULL UNIQUE,
  vdm_amount DECIMAL(20, 8) NOT NULL,
  pair_token_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  lp_tokens DECIMAL(20, 8) NOT NULL DEFAULT 0,
  fee_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  timestamp BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solana_tx_wallet ON solana_staking_transactions(wallet);
CREATE INDEX IF NOT EXISTS idx_solana_tx_pool ON solana_staking_transactions(pool_id);
CREATE INDEX IF NOT EXISTS idx_solana_tx_signature ON solana_staking_transactions(signature);
CREATE INDEX IF NOT EXISTS idx_solana_tx_timestamp ON solana_staking_transactions(timestamp);

CREATE TABLE IF NOT EXISTS solana_staking_claims (
  id SERIAL PRIMARY KEY,
  wallet VARCHAR(255) NOT NULL,
  pool_id VARCHAR(100) NOT NULL,
  position_id INTEGER NOT NULL,
  principal_amount DECIMAL(20, 8) NOT NULL,
  principal_value_usdt_snapshot DECIMAL(20, 8) NOT NULL DEFAULT 0,
  rewards_amount DECIMAL(20, 8) NOT NULL,
  vdm_price_usdt_snapshot DECIMAL(20, 8) NOT NULL DEFAULT 0,
  payout_signature VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'requested',
  requested_at BIGINT NOT NULL,
  processed_at BIGINT,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solana_claims_wallet ON solana_staking_claims(wallet);
CREATE INDEX IF NOT EXISTS idx_solana_claims_pool ON solana_staking_claims(pool_id);
CREATE INDEX IF NOT EXISTS idx_solana_claims_status ON solana_staking_claims(status);

CREATE TABLE IF NOT EXISTS solana_pool_stats (
  id SERIAL PRIMARY KEY,
  pool_id VARCHAR(100) NOT NULL UNIQUE,
  tvl DECIMAL(20, 2) NOT NULL DEFAULT 0,
  total_stakers INTEGER NOT NULL DEFAULT 0,
  total_staked DECIMAL(20, 8) NOT NULL DEFAULT 0,
  total_rewards_distributed DECIMAL(20, 8) NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solana_pool_id ON solana_pool_stats(pool_id);

CREATE TABLE IF NOT EXISTS solana_staking_fees (
  id SERIAL PRIMARY KEY,
  pool_id VARCHAR(100) NOT NULL,
  fee_type VARCHAR(50) NOT NULL,
  recipient VARCHAR(100) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  percentage DECIMAL(10, 2) NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solana_fees_pool ON solana_staking_fees(pool_id);
CREATE INDEX IF NOT EXISTS idx_solana_fees_type ON solana_staking_fees(fee_type);

CREATE TABLE IF NOT EXISTS vdm_staking_investments (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(20, 2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  returns NUMERIC(20, 2) DEFAULT 0,
  invested_at BIGINT,
  created_at BIGINT,
  updated_at BIGINT
);
