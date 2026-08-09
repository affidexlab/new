INSERT INTO risk_category_weights (category, weight) VALUES
  ('phishing', 75),
  ('drainer', 85),
  ('malware', 85),
  ('darknet_market', 95),
  ('child_exploitation', 100),
  ('terrorist_entity', 100),
  ('cex_hot_wallet', 15),
  ('trusted_counterparty', 0)
ON CONFLICT (category) DO UPDATE SET weight = EXCLUDED.weight, updated_at = NOW();

ALTER TABLE compliance_workflow_rules ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE compliance_workflow_rules ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE compliance_workflow_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE compliance_review_queue ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE compliance_review_queue ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_workflow_rules_org ON compliance_workflow_rules (organization_id, enabled);
CREATE INDEX IF NOT EXISTS idx_review_queue_org ON compliance_review_queue (organization_id, status);

CREATE TABLE IF NOT EXISTS risk_ingestion_runs (
  id              SERIAL PRIMARY KEY,
  source          VARCHAR(120) NOT NULL,
  status          VARCHAR(40) NOT NULL,
  labels_count    INTEGER DEFAULT 0,
  edges_count     INTEGER DEFAULT 0,
  fetched_bytes   BIGINT DEFAULT 0,
  error           TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  finished_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_ingestion_runs_source ON risk_ingestion_runs (source, started_at DESC);
