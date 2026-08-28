-- DecaFlow KYC Tables - Fix Migration
-- Handles existing tables with incompatible schema

-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS kyc_liveness_checks CASCADE;
DROP TABLE IF EXISTS accreditation_claims CASCADE;
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS kyc_review_audit CASCADE;
DROP TABLE IF EXISTS kyc_applications CASCADE;

-- KYC Applications (individuals and businesses)
CREATE TABLE kyc_applications (
  id SERIAL PRIMARY KEY,
  application_id VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(64),
  application_type VARCHAR(20) DEFAULT 'individual',
  full_name VARCHAR(255),
  date_of_birth DATE,
  nationality VARCHAR(100),
  country VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending_documents',
  reviewer_email VARCHAR(255),
  review_notes TEXT,
  rejection_reason TEXT,
  additional_info_required TEXT,
  reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_applications_wallet ON kyc_applications(wallet_address);
CREATE INDEX idx_kyc_applications_email ON kyc_applications(email);
CREATE INDEX idx_kyc_applications_status ON kyc_applications(status);

-- KYC Documents
CREATE TABLE kyc_documents (
  id SERIAL PRIMARY KEY,
  document_id VARCHAR(64) UNIQUE NOT NULL,
  application_id VARCHAR(64) NOT NULL REFERENCES kyc_applications(application_id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  document_hash VARCHAR(128),
  expiry_date DATE,
  status VARCHAR(30) DEFAULT 'pending',
  verification_notes TEXT,
  verified_by VARCHAR(255),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_documents_application ON kyc_documents(application_id);
CREATE INDEX idx_kyc_documents_type ON kyc_documents(document_type);

-- Accreditation Claims
CREATE TABLE accreditation_claims (
  id SERIAL PRIMARY KEY,
  claim_id VARCHAR(64) UNIQUE NOT NULL,
  application_id VARCHAR(64) NOT NULL REFERENCES kyc_applications(application_id) ON DELETE CASCADE,
  accreditation_basis VARCHAR(50) NOT NULL,
  claimed_amount DECIMAL(20,2),
  verified_amount DECIMAL(20,2),
  supporting_document_ids JSONB DEFAULT '[]',
  certification_date DATE,
  status VARCHAR(30) DEFAULT 'pending',
  reviewer_email VARCHAR(255),
  review_notes TEXT,
  expires_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accreditation_claims_application ON accreditation_claims(application_id);
CREATE INDEX idx_accreditation_claims_status ON accreditation_claims(status);

-- KYC Review Audit Trail
CREATE TABLE kyc_review_audit (
  id SERIAL PRIMARY KEY,
  application_id VARCHAR(64) NOT NULL,
  reviewer_email VARCHAR(255) NOT NULL,
  decision VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_audit_application ON kyc_review_audit(application_id);

-- Liveness Check Records
CREATE TABLE kyc_liveness_checks (
  id SERIAL PRIMARY KEY,
  check_id VARCHAR(64) UNIQUE NOT NULL,
  application_id VARCHAR(64) NOT NULL REFERENCES kyc_applications(application_id) ON DELETE CASCADE,
  selfie_url TEXT,
  selfie_hash VARCHAR(128),
  reference_document_id VARCHAR(64),
  match_score DECIMAL(5,2),
  passed BOOLEAN DEFAULT FALSE,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_liveness_application ON kyc_liveness_checks(application_id);
