-- ============================================================
-- DecaFlow Migration 009 — Shield Tables
-- shield_customers, shield_contracts
-- ============================================================

CREATE TABLE IF NOT EXISTS shield_customers (
  id                      SERIAL PRIMARY KEY,
  company_name            VARCHAR(255),
  contact_name            VARCHAR(255),
  email                   VARCHAR(255) NOT NULL,
  plan                    VARCHAR(50)  NOT NULL,
  stripe_customer_id      VARCHAR(255),
  stripe_subscription_id  VARCHAR(255),
  status                  VARCHAR(50)  DEFAULT 'active',
  created_at              TIMESTAMPTZ  DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shield_contracts (
  id            SERIAL PRIMARY KEY,
  customer_id   INTEGER REFERENCES shield_customers(id),
  chain         VARCHAR(50)  NOT NULL,
  address       VARCHAR(255) NOT NULL,
  label         VARCHAR(255),
  status        VARCHAR(50)  DEFAULT 'active',
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shield_customers_email      ON shield_customers (email);
CREATE INDEX IF NOT EXISTS idx_shield_customers_stripe_sub ON shield_customers (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_shield_contracts_customer   ON shield_contracts (customer_id);
