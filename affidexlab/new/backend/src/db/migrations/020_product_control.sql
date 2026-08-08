CREATE TABLE IF NOT EXISTS product_control_settings (
  product_key         VARCHAR(80) PRIMARY KEY,
  product_name        VARCHAR(160) NOT NULL,
  public_status       VARCHAR(40) NOT NULL DEFAULT 'beta',
  accepting_customers BOOLEAN DEFAULT true,
  priority            VARCHAR(40) DEFAULT 'normal',
  owner               VARCHAR(160),
  ops_notes           TEXT,
  public_message      TEXT,
  updated_by          VARCHAR(160),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO product_control_settings (product_key, product_name, public_status, accepting_customers, priority, owner, public_message) VALUES
  ('verify', 'Verify API', 'beta', true, 'high', 'Founder', 'Authenticated checks use DecaFlow internal risk intelligence.'),
  ('compliance', 'Compliance Workflows', 'beta', true, 'high', 'Founder', 'Compliance workflows support screening, review, and evidence trails.'),
  ('shield', 'Shield Monitoring', 'beta', true, 'high', 'Founder', 'Shield monitors watched contracts and opens alerts/incidents.'),
  ('agents', 'Agents', 'beta', true, 'normal', 'Founder', 'Agents automate compliance workflows with human approval.'),
  ('institutional', 'Institutional / RWA', 'pre-production', false, 'high', 'Founder', 'RWA requires counsel, KYC, Safe setup, and final deployment review.'),
  ('audit', 'Security Audit Services', 'active', true, 'normal', 'Founder', 'Audit services are available for scoped customer engagements.'),
  ('swap_bridge', 'Swap / Bridge', 'active', true, 'normal', 'Founder', 'Swap and bridge infrastructure is live with conservative claims.'),
  ('analytics', 'Analytics / MEV', 'beta', true, 'normal', 'Founder', 'Analytics and MEV surfaces are available as product modules.'),
  ('staking', 'Staking', 'active', true, 'normal', 'Founder', 'Staking and rewards operations are available where deployed.')
ON CONFLICT (product_key) DO NOTHING;
