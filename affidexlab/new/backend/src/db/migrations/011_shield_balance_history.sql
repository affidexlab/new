CREATE TABLE IF NOT EXISTS shield_last_balance (
  chain        VARCHAR(50)  NOT NULL,
  address      VARCHAR(255) NOT NULL,
  balance_wei  VARCHAR(78)  NOT NULL,
  checked_at   TIMESTAMPTZ  DEFAULT NOW(),
  PRIMARY KEY (chain, address)
);
