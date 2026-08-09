CREATE TABLE IF NOT EXISTS shield_contract_abis (
  id          SERIAL PRIMARY KEY,
  chain       VARCHAR(50) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  abi         JSONB NOT NULL,
  source      VARCHAR(120) DEFAULT 'customer-provided',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shield_contract_abis_unique
  ON shield_contract_abis (chain, lower(address));

CREATE TABLE IF NOT EXISTS shield_vulnerability_findings (
  id          SERIAL PRIMARY KEY,
  chain       VARCHAR(50) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  label       VARCHAR(255),
  severity    VARCHAR(30) NOT NULL,
  finding_type VARCHAR(100) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  evidence    JSONB DEFAULT '{}'::jsonb,
  status      VARCHAR(50) DEFAULT 'open',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shield_vuln_findings_contract
  ON shield_vulnerability_findings (chain, lower(address), status);

CREATE TABLE IF NOT EXISTS shield_anomaly_thresholds (
  id          SERIAL PRIMARY KEY,
  alert_type  VARCHAR(100) NOT NULL,
  chain       VARCHAR(50),
  address     VARCHAR(255),
  threshold   INTEGER NOT NULL,
  window_blocks INTEGER NOT NULL DEFAULT 10,
  severity    VARCHAR(30) DEFAULT 'high',
  enabled     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shield_anomaly_thresholds_lookup
  ON shield_anomaly_thresholds (enabled, alert_type, chain, lower(address));

INSERT INTO shield_anomaly_thresholds (alert_type, threshold, window_blocks, severity) VALUES
  ('asset_transfer', 25, 10, 'high'),
  ('approval_spike', 10, 10, 'high'),
  ('approval_for_all', 3, 10, 'critical'),
  ('role_granted', 1, 10, 'high'),
  ('proxy_upgraded', 1, 10, 'critical'),
  ('proxy_admin_changed', 1, 10, 'critical')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS shield_incident_playbooks (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  alert_type  VARCHAR(100) NOT NULL,
  severity    VARCHAR(30) DEFAULT 'high',
  steps       JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled     BOOLEAN DEFAULT true,
  customer_id INTEGER REFERENCES shield_customers(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shield_incident_playbooks_lookup
  ON shield_incident_playbooks (enabled, alert_type, severity);

INSERT INTO shield_incident_playbooks (name, alert_type, severity, steps) VALUES
  ('Proxy/Admin Emergency Playbook', 'proxy_upgraded', 'critical', '["Confirm change with deployer/multisig owner", "Compare new implementation address against approved release", "Pause dependent frontend flows if unauthorized", "Notify customer incident contact", "Record final authorized/unauthorized decision"]'::jsonb),
  ('Ownership Change Playbook', 'ownership_change', 'critical', '["Verify new owner against approved Safe/multisig", "Check transaction initiator and governance record", "Escalate if owner is EOA or unknown", "Update monitored admin inventory", "Close only after customer approval"]'::jsonb),
  ('Approval Spike Playbook', 'approval_spike', 'high', '["Identify token/spender involved", "Check whether spender is an approved integration", "Review recent user complaints or abnormal transfers", "Recommend revoke/allowlist changes if suspicious", "Record analyst disposition"]'::jsonb),
  ('Privileged Function Exposure Playbook', 'privileged_function_exposed', 'high', '["Review ABI function and access-control assumptions", "Confirm owner/admin role assignment", "Request source verification or audit artifact", "Open remediation task for unsafe callable function", "Re-scan after fix"]'::jsonb)
ON CONFLICT DO NOTHING;
