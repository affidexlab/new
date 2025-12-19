CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  total_points DECIMAL(20, 2) DEFAULT 0,
  weekly_points DECIMAL(20, 2) DEFAULT 0,
  monthly_points DECIMAL(20, 2) DEFAULT 0,
  total_volume_usd DECIMAL(20, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(42),
  airdrop_eligible BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_address ON users(wallet_address);
CREATE INDEX idx_total_points ON users(total_points DESC);
CREATE INDEX idx_weekly_points ON users(weekly_points DESC);
CREATE INDEX idx_monthly_points ON users(monthly_points DESC);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  from_chain_id INTEGER,
  to_chain_id INTEGER,
  from_token VARCHAR(42),
  to_token VARCHAR(42),
  amount_usd DECIMAL(20, 2) NOT NULL,
  points_earned DECIMAL(20, 2) NOT NULL,
  multiplier DECIMAL(5, 2) DEFAULT 1.0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
);

CREATE INDEX idx_tx_wallet ON transactions(wallet_address);
CREATE INDEX idx_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_tx_created_at ON transactions(created_at DESC);

CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  period_type VARCHAR(10) NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  rank INTEGER NOT NULL,
  points DECIMAL(20, 2) NOT NULL,
  reward_amount_usd DECIMAL(10, 2) NOT NULL,
  reward_status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP,
  payment_tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
);

CREATE INDEX idx_rewards_wallet ON rewards(wallet_address);
CREATE INDEX idx_rewards_period ON rewards(period_type, period_start, period_end);

CREATE TABLE IF NOT EXISTS point_multipliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  multiplier DECIMAL(5, 2) NOT NULL,
  transaction_type VARCHAR(20),
  min_amount_usd DECIMAL(20, 2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id SERIAL PRIMARY KEY,
  period_type VARCHAR(10) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  rank INTEGER NOT NULL,
  points DECIMAL(20, 2) NOT NULL,
  volume_usd DECIMAL(20, 2) NOT NULL,
  transaction_count INTEGER NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_type, wallet_address)
);

CREATE INDEX idx_leaderboard_period_rank ON leaderboard_cache(period_type, rank);

CREATE TABLE IF NOT EXISTS airdrop_snapshots (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  total_points DECIMAL(20, 2) NOT NULL,
  total_volume_usd DECIMAL(20, 2) NOT NULL,
  transaction_count INTEGER NOT NULL,
  eligible BOOLEAN DEFAULT TRUE,
  allocation_percentage DECIMAL(10, 6),
  snapshot_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
);

CREATE INDEX idx_snapshot_date ON airdrop_snapshots(snapshot_date DESC);
CREATE INDEX idx_snapshot_wallet ON airdrop_snapshots(wallet_address);

CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET 
    total_points = total_points + NEW.points_earned,
    weekly_points = weekly_points + NEW.points_earned,
    monthly_points = monthly_points + NEW.points_earned,
    total_volume_usd = total_volume_usd + NEW.amount_usd,
    transaction_count = transaction_count + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE wallet_address = NEW.wallet_address;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_points_trigger
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_user_stats();

CREATE OR REPLACE FUNCTION reset_weekly_points()
RETURNS void AS $$
BEGIN
  UPDATE users SET weekly_points = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reset_monthly_points()
RETURNS void AS $$
BEGIN
  UPDATE users SET monthly_points = 0;
END;
$$ LANGUAGE plpgsql;

-- Solana staking positions table
CREATE TABLE IF NOT EXISTS solana_staking_positions (
  id SERIAL PRIMARY KEY,
  wallet VARCHAR(255) NOT NULL,
  pool_id VARCHAR(100) NOT NULL,
  staked_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  lp_tokens DECIMAL(20, 8) NOT NULL DEFAULT 0,
  pending_rewards DECIMAL(20, 8) NOT NULL DEFAULT 0,
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

-- Solana staking transactions table
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

-- Off-chain staking claims table (records manual payouts from custody wallet)
CREATE TABLE IF NOT EXISTS solana_staking_claims (
  id SERIAL PRIMARY KEY,
  wallet VARCHAR(255) NOT NULL,
  pool_id VARCHAR(100) NOT NULL,
  position_id INTEGER NOT NULL,
  principal_amount DECIMAL(20, 8) NOT NULL,
  rewards_amount DECIMAL(20, 8) NOT NULL,
  payout_signature VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'requested',
  requested_at BIGINT NOT NULL,
  processed_at BIGINT,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solana_claims_wallet ON solana_staking_claims(wallet);
CREATE INDEX IF NOT EXISTS idx_solana_claims_pool ON solana_staking_claims(pool_id);
CREATE INDEX IF NOT EXISTS idx_solana_claims_status ON solana_staking_claims(status);

CREATE INDEX IF NOT EXISTS idx_solana_tx_wallet ON solana_staking_transactions(wallet);
CREATE INDEX IF NOT EXISTS idx_solana_tx_pool ON solana_staking_transactions(pool_id);
CREATE INDEX IF NOT EXISTS idx_solana_tx_signature ON solana_staking_transactions(signature);
CREATE INDEX IF NOT EXISTS idx_solana_tx_timestamp ON solana_staking_transactions(timestamp);

-- Solana pool statistics table
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

-- Solana staking fees table
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
CREATE INDEX IF NOT EXISTS idx_solana_fees_recipient ON solana_staking_fees(recipient);
CREATE INDEX IF NOT EXISTS idx_solana_fees_timestamp ON solana_staking_fees(timestamp);
