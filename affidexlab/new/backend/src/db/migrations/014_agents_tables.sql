CREATE TABLE IF NOT EXISTS agents_customers (
  id                SERIAL PRIMARY KEY,
  company_name      VARCHAR(255),
  contact_name      VARCHAR(255),
  email             VARCHAR(255) NOT NULL,
  plan              VARCHAR(50)  NOT NULL,
  payment_gateway   VARCHAR(50),
  gateway_order_id  VARCHAR(255),
  status            VARCHAR(50)  DEFAULT 'pending_payment',
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_customers_gateway_order ON agents_customers (gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_agents_customers_email ON agents_customers (email);
