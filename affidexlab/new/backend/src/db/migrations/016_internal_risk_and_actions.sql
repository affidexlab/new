CREATE TABLE IF NOT EXISTS risk_category_weights (
  category      VARCHAR(80) PRIMARY KEY,
  weight        INTEGER NOT NULL DEFAULT 50,
  enabled       BOOLEAN DEFAULT true,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO risk_category_weights (category, weight) VALUES
  ('sanctions', 100),
  ('mixer', 85),
  ('darknet', 90),
  ('terrorism_financing', 100),
  ('stolen_funds', 90),
  ('scam', 75),
  ('ransomware', 95),
  ('high_risk_exchange', 65),
  ('bridge_exploit', 85),
  ('fraud', 75)
ON CONFLICT (category) DO NOTHING;

CREATE TABLE IF NOT EXISTS risk_address_labels (
  id              SERIAL PRIMARY KEY,
  chain           VARCHAR(50) NOT NULL,
  address         VARCHAR(255) NOT NULL,
  category        VARCHAR(80) NOT NULL,
  label           VARCHAR(255),
  severity        VARCHAR(30) DEFAULT 'high',
  confidence      NUMERIC DEFAULT 1,
  source          VARCHAR(120) DEFAULT 'decaflow',
  evidence        TEXT,
  metadata        JSONB,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_risk_address_labels_unique
  ON risk_address_labels (chain, lower(address), category, source);
CREATE INDEX IF NOT EXISTS idx_risk_address_labels_lookup
  ON risk_address_labels (chain, lower(address), active);

CREATE TABLE IF NOT EXISTS risk_graph_edges (
  id              SERIAL PRIMARY KEY,
  chain           VARCHAR(50) NOT NULL,
  from_address    VARCHAR(255) NOT NULL,
  to_address      VARCHAR(255) NOT NULL,
  tx_hash         VARCHAR(255),
  block_number    BIGINT,
  value_wei       NUMERIC,
  value_usd       NUMERIC,
  token_address   VARCHAR(255),
  observed_at     TIMESTAMPTZ DEFAULT NOW(),
  source          VARCHAR(120) DEFAULT 'decaflow-indexer',
  metadata        JSONB
);

CREATE INDEX IF NOT EXISTS idx_risk_graph_edges_from ON risk_graph_edges (chain, lower(from_address));
CREATE INDEX IF NOT EXISTS idx_risk_graph_edges_to ON risk_graph_edges (chain, lower(to_address));
CREATE INDEX IF NOT EXISTS idx_risk_graph_edges_tx ON risk_graph_edges (tx_hash);

CREATE TABLE IF NOT EXISTS shield_action_rules (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  event_type      VARCHAR(80) NOT NULL,
  min_severity    VARCHAR(30) DEFAULT 'medium',
  chain           VARCHAR(50),
  address         VARCHAR(255),
  action_type     VARCHAR(40) DEFAULT 'email',
  enabled         BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shield_action_rules_enabled ON shield_action_rules (enabled, event_type);

CREATE TABLE IF NOT EXISTS shield_action_runs (
  id              SERIAL PRIMARY KEY,
  rule_id         INTEGER REFERENCES shield_action_rules(id),
  alert_id        INTEGER REFERENCES shield_alerts(id),
  event_type      VARCHAR(80) NOT NULL,
  action_type     VARCHAR(40) NOT NULL,
  status          VARCHAR(40) DEFAULT 'completed',
  result          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shield_action_runs_alert ON shield_action_runs (alert_id);
