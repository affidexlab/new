CREATE TABLE IF NOT EXISTS institutional_customers (
  id                SERIAL PRIMARY KEY,
  company_name      VARCHAR(255),
  contact_name      VARCHAR(255),
  email             VARCHAR(255) NOT NULL,
  plan              VARCHAR(50)  NOT NULL,
  asset_type        VARCHAR(255),
  jurisdictions     TEXT,
  message           TEXT,
  payment_gateway   VARCHAR(50),
  gateway_order_id  VARCHAR(255),
  status            VARCHAR(50)  DEFAULT 'pending_payment',
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutional_customers_email ON institutional_customers (email);
