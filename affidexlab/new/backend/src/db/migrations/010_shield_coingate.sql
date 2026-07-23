ALTER TABLE shield_customers ADD COLUMN IF NOT EXISTS payment_gateway   VARCHAR(50);
ALTER TABLE shield_customers ADD COLUMN IF NOT EXISTS coingate_order_id VARCHAR(255);
ALTER TABLE shield_customers ADD COLUMN IF NOT EXISTS pending_token     VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_shield_customers_coingate_order ON shield_customers (coingate_order_id);
