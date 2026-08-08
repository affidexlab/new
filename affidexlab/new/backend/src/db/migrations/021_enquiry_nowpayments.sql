ALTER TABLE compliance_enquiries ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50);
ALTER TABLE compliance_enquiries ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(255);
ALTER TABLE compliance_enquiries ADD COLUMN IF NOT EXISTS payment_status VARCHAR(80);

ALTER TABLE verify_enquiries ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50);
ALTER TABLE verify_enquiries ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(255);
ALTER TABLE verify_enquiries ADD COLUMN IF NOT EXISTS payment_status VARCHAR(80);

ALTER TABLE audit_enquiries ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50);
ALTER TABLE audit_enquiries ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(255);
ALTER TABLE audit_enquiries ADD COLUMN IF NOT EXISTS payment_status VARCHAR(80);

CREATE INDEX IF NOT EXISTS idx_compliance_enquiries_gateway_order ON compliance_enquiries (gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_verify_enquiries_gateway_order ON verify_enquiries (gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_audit_enquiries_gateway_order ON audit_enquiries (gateway_order_id);
