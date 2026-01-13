ALTER TABLE IF EXISTS solana_staking_positions
  ADD COLUMN IF NOT EXISTS vdm_price_usdt_snapshot DECIMAL(20, 8) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS staked_value_usdt_snapshot DECIMAL(20, 8) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS solana_staking_claims
  ADD COLUMN IF NOT EXISTS principal_value_usdt_snapshot DECIMAL(20, 8) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vdm_price_usdt_snapshot DECIMAL(20, 8) NOT NULL DEFAULT 0;
