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
