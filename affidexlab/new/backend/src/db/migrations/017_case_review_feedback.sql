CREATE TABLE IF NOT EXISTS risk_case_reviews (
  id              SERIAL PRIMARY KEY,
  screening_id    INTEGER REFERENCES risk_screenings(id),
  wallet_address  VARCHAR(255) NOT NULL,
  chain           VARCHAR(50) NOT NULL,
  analyst         VARCHAR(255) NOT NULL,
  decision        VARCHAR(50) NOT NULL,
  category        VARCHAR(80),
  severity        VARCHAR(30),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_case_reviews_wallet ON risk_case_reviews (chain, lower(wallet_address));
