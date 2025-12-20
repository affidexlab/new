-- Liquidity positions tracking table
CREATE TABLE IF NOT EXISTS liquidity_positions (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  chain_id INTEGER NOT NULL,
  pool_address VARCHAR(42) NOT NULL,
  token_id VARCHAR(100),
  token0_address VARCHAR(42) NOT NULL,
  token1_address VARCHAR(42) NOT NULL,
  token0_symbol VARCHAR(20) NOT NULL,
  token1_symbol VARCHAR(20) NOT NULL,
  token0_amount DECIMAL(36, 18) NOT NULL,
  token1_amount DECIMAL(36, 18) NOT NULL,
  token0_amount_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  token1_amount_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  total_value_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  fee_tier INTEGER NOT NULL,
  tick_lower INTEGER,
  tick_upper INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  tx_hash VARCHAR(66),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  removed_at TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
);

CREATE INDEX idx_lp_wallet ON liquidity_positions(wallet_address);
CREATE INDEX idx_lp_chain ON liquidity_positions(chain_id);
CREATE INDEX idx_lp_pool ON liquidity_positions(pool_address);
CREATE INDEX idx_lp_status ON liquidity_positions(status);
CREATE INDEX idx_lp_added_at ON liquidity_positions(added_at DESC);

-- Protocol revenue tracking table
CREATE TABLE IF NOT EXISTS protocol_revenue (
  id SERIAL PRIMARY KEY,
  revenue_type VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL,
  chain_id INTEGER,
  amount_usd DECIMAL(20, 2) NOT NULL,
  tx_hash VARCHAR(66),
  wallet_address VARCHAR(42),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revenue_type ON protocol_revenue(revenue_type);
CREATE INDEX idx_revenue_source ON protocol_revenue(source);
CREATE INDEX idx_revenue_created_at ON protocol_revenue(created_at DESC);

-- Daily metrics aggregation table
CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  total_volume_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  unique_wallets INTEGER NOT NULL DEFAULT 0,
  tvl_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  protocol_revenue_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  swap_volume_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  bridge_volume_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  liquidity_volume_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_metrics_date ON daily_metrics(metric_date DESC);
