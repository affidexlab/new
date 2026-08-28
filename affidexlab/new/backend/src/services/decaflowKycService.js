/**
 * DecaFlow Native KYC/KYB/Accreditation Provider
 * 
 * DecaFlow IS the KYC provider — no third-party dependency.
 * Handles: document verification, liveness checks, accredited investor verification,
 * KYB for businesses, and issues on-chain identity attestations.
 */

import crypto from 'crypto';
import pool from '../db/connection.js';
import { sendEnquiryEmail } from '../utils/mailer.js';

// ── KYC Application Statuses ──
export const KYC_STATUS = {
  PENDING_DOCUMENTS: 'pending_documents',
  DOCUMENTS_SUBMITTED: 'documents_submitted',
  UNDER_REVIEW: 'under_review',
  ADDITIONAL_INFO_REQUIRED: 'additional_info_required',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

// ── Document Types ──
export const DOCUMENT_TYPES = {
  // Individual KYC
  GOVERNMENT_ID: 'government_id',
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  SELFIE: 'selfie',
  PROOF_OF_ADDRESS: 'proof_of_address',
  // Accreditation
  INCOME_VERIFICATION: 'income_verification',
  NET_WORTH_STATEMENT: 'net_worth_statement',
  CPA_LETTER: 'cpa_letter',
  BROKER_LETTER: 'broker_letter',
  PROFESSIONAL_LICENSE: 'professional_license',
  // KYB Business
  CERTIFICATE_OF_INCORPORATION: 'certificate_of_incorporation',
  ARTICLES_OF_ASSOCIATION: 'articles_of_association',
  BENEFICIAL_OWNERSHIP: 'beneficial_ownership',
  BUSINESS_LICENSE: 'business_license',
  DIRECTOR_ID: 'director_id',
  UBO_DECLARATION: 'ubo_declaration',
};

// ── Accreditation Basis Types ──
export const ACCREDITATION_BASIS = {
  INCOME: 'income_over_200k',
  JOINT_INCOME: 'joint_income_over_300k',
  NET_WORTH: 'net_worth_over_1m',
  PROFESSIONAL: 'licensed_professional',
  ENTITY: 'qualified_entity',
  KNOWLEDGEABLE_EMPLOYEE: 'knowledgeable_employee',
};

// ── Create KYC Application ──
export async function createKycApplication({
  email,
  walletAddress,
  applicationType = 'individual', // individual | business
  fullName,
  dateOfBirth,
  nationality,
  country,
  metadata = {},
}) {
  const applicationId = `kyc_${crypto.randomBytes(16).toString('hex')}`;
  
  const result = await pool.query(`
    INSERT INTO kyc_applications (
      application_id, email, wallet_address, application_type, 
      full_name, date_of_birth, nationality, country,
      status, metadata, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING *
  `, [
    applicationId, email, walletAddress?.toLowerCase(), applicationType,
    fullName, dateOfBirth, nationality, country,
    KYC_STATUS.PENDING_DOCUMENTS, JSON.stringify(metadata)
  ]);

  return result.rows[0];
}

// ── Submit KYC Document ──
export async function submitKycDocument({
  applicationId,
  documentType,
  documentUrl, // S3/storage URL
  documentHash, // SHA256 of document for integrity
  expiryDate = null,
  metadata = {},
}) {
  const documentId = `doc_${crypto.randomBytes(12).toString('hex')}`;
  
  const result = await pool.query(`
    INSERT INTO kyc_documents (
      document_id, application_id, document_type, document_url,
      document_hash, expiry_date, status, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())
    RETURNING *
  `, [documentId, applicationId, documentType, documentUrl, documentHash, expiryDate, JSON.stringify(metadata)]);

  // Update application status if all required docs submitted
  await updateApplicationStatusIfReady(applicationId);

  return result.rows[0];
}

// ── Check Required Documents ──
async function updateApplicationStatusIfReady(applicationId) {
  const app = await pool.query(`SELECT * FROM kyc_applications WHERE application_id = $1`, [applicationId]);
  if (!app.rows[0]) return;

  const docs = await pool.query(`SELECT document_type FROM kyc_documents WHERE application_id = $1`, [applicationId]);
  const submittedTypes = new Set(docs.rows.map(d => d.document_type));

  const requiredIndividual = [DOCUMENT_TYPES.GOVERNMENT_ID, DOCUMENT_TYPES.SELFIE];
  const requiredBusiness = [DOCUMENT_TYPES.CERTIFICATE_OF_INCORPORATION, DOCUMENT_TYPES.BENEFICIAL_OWNERSHIP];

  const required = app.rows[0].application_type === 'business' ? requiredBusiness : requiredIndividual;
  const allSubmitted = required.every(t => submittedTypes.has(t));

  if (allSubmitted && app.rows[0].status === KYC_STATUS.PENDING_DOCUMENTS) {
    await pool.query(`UPDATE kyc_applications SET status = $1, updated_at = NOW() WHERE application_id = $2`,
      [KYC_STATUS.DOCUMENTS_SUBMITTED, applicationId]);
  }
}

// ── Analyst Review Queue ──
export async function getKycReviewQueue({ status = 'documents_submitted', limit = 50, offset = 0 }) {
  const result = await pool.query(`
    SELECT a.*, 
      (SELECT COUNT(*) FROM kyc_documents WHERE application_id = a.application_id) as document_count,
      (SELECT json_agg(json_build_object('type', document_type, 'status', status)) 
       FROM kyc_documents WHERE application_id = a.application_id) as documents
    FROM kyc_applications a
    WHERE a.status = $1
    ORDER BY a.created_at ASC
    LIMIT $2 OFFSET $3
  `, [status, limit, offset]);
  return result.rows;
}

// ── Analyst Review Decision ──
export async function reviewKycApplication({
  applicationId,
  decision, // 'approved' | 'rejected' | 'additional_info_required'
  reviewerEmail,
  reviewNotes,
  rejectionReason = null,
  additionalInfoRequired = null,
}) {
  const statusMap = {
    approved: KYC_STATUS.APPROVED,
    rejected: KYC_STATUS.REJECTED,
    additional_info_required: KYC_STATUS.ADDITIONAL_INFO_REQUIRED,
  };

  const result = await pool.query(`
    UPDATE kyc_applications SET 
      status = $1,
      reviewer_email = $2,
      review_notes = $3,
      rejection_reason = $4,
      additional_info_required = $5,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE application_id = $6
    RETURNING *
  `, [statusMap[decision], reviewerEmail, reviewNotes, rejectionReason, additionalInfoRequired, applicationId]);

  const app = result.rows[0];
  if (!app) throw new Error('Application not found');

  // Log review in audit trail
  await pool.query(`
    INSERT INTO kyc_review_audit (application_id, reviewer_email, decision, notes, created_at)
    VALUES ($1, $2, $3, $4, NOW())
  `, [applicationId, reviewerEmail, decision, reviewNotes]);

  // Send notification email
  if (app.email) {
    const subject = decision === 'approved' 
      ? 'DecaFlow KYC Approved' 
      : decision === 'rejected'
      ? 'DecaFlow KYC Application Update'
      : 'DecaFlow KYC - Additional Information Required';
    
    await sendEnquiryEmail({
      to: app.email,
      subject,
      template: 'kyc-decision',
      data: { decision, applicationId, notes: decision === 'additional_info_required' ? additionalInfoRequired : null }
    }).catch(err => console.error('KYC notification email failed:', err));
  }

  return app;
}

// ── Accreditation Verification ──
export async function submitAccreditationClaim({
  applicationId,
  accreditationBasis, // from ACCREDITATION_BASIS
  claimedAmount = null, // for income/net worth claims
  supportingDocumentIds = [],
  certificationDate = null,
  metadata = {},
}) {
  const claimId = `accred_${crypto.randomBytes(12).toString('hex')}`;

  const result = await pool.query(`
    INSERT INTO accreditation_claims (
      claim_id, application_id, accreditation_basis, claimed_amount,
      supporting_document_ids, certification_date, status, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())
    RETURNING *
  `, [claimId, applicationId, accreditationBasis, claimedAmount, 
      JSON.stringify(supportingDocumentIds), certificationDate, JSON.stringify(metadata)]);

  return result.rows[0];
}

// ── Review Accreditation Claim ──
export async function reviewAccreditationClaim({
  claimId,
  decision, // 'approved' | 'rejected'
  reviewerEmail,
  reviewNotes,
  verifiedAmount = null,
  expiresAt = null, // accreditation expiry (typically 90 days for 506c)
}) {
  // Default expiry 90 days from now for approved claims
  const expiry = expiresAt || (decision === 'approved' ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() : null);

  const result = await pool.query(`
    UPDATE accreditation_claims SET
      status = $1,
      reviewer_email = $2,
      review_notes = $3,
      verified_amount = $4,
      expires_at = $5,
      reviewed_at = NOW()
    WHERE claim_id = $6
    RETURNING *
  `, [decision, reviewerEmail, reviewNotes, verifiedAmount, expiry, claimId]);

  return result.rows[0];
}

// ── Get Application with Full Details ──
export async function getKycApplication(applicationId) {
  const app = await pool.query(`SELECT * FROM kyc_applications WHERE application_id = $1`, [applicationId]);
  if (!app.rows[0]) return null;

  const docs = await pool.query(`SELECT * FROM kyc_documents WHERE application_id = $1 ORDER BY created_at`, [applicationId]);
  const claims = await pool.query(`SELECT * FROM accreditation_claims WHERE application_id = $1`, [applicationId]);
  const audits = await pool.query(`SELECT * FROM kyc_review_audit WHERE application_id = $1 ORDER BY created_at DESC`, [applicationId]);

  return {
    ...app.rows[0],
    documents: docs.rows,
    accreditationClaims: claims.rows,
    reviewHistory: audits.rows,
  };
}

// ── Get Application by Wallet ──
export async function getKycApplicationByWallet(walletAddress) {
  const result = await pool.query(`
    SELECT * FROM kyc_applications 
    WHERE wallet_address = $1 
    ORDER BY created_at DESC 
    LIMIT 1
  `, [walletAddress?.toLowerCase()]);
  
  if (!result.rows[0]) return null;
  return getKycApplication(result.rows[0].application_id);
}

// ── Check if Wallet is KYC Approved ──
export async function isWalletKycApproved(walletAddress) {
  const result = await pool.query(`
    SELECT status FROM kyc_applications 
    WHERE wallet_address = $1 AND status = 'approved'
    LIMIT 1
  `, [walletAddress?.toLowerCase()]);
  return result.rows.length > 0;
}

// ── Check if Wallet is Accredited ──
export async function isWalletAccredited(walletAddress) {
  const result = await pool.query(`
    SELECT ac.* FROM accreditation_claims ac
    JOIN kyc_applications ka ON ac.application_id = ka.application_id
    WHERE ka.wallet_address = $1 
      AND ac.status = 'approved'
      AND (ac.expires_at IS NULL OR ac.expires_at > NOW())
    LIMIT 1
  `, [walletAddress?.toLowerCase()]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

// ── KYB (Know Your Business) ──
export async function createKybApplication({
  email,
  walletAddress,
  companyName,
  registrationNumber,
  incorporationCountry,
  companyType, // llc, corporation, partnership, etc.
  registeredAddress,
  beneficialOwners = [], // array of { name, ownership_percentage, nationality }
  directors = [],
  metadata = {},
}) {
  const applicationId = `kyb_${crypto.randomBytes(16).toString('hex')}`;

  const result = await pool.query(`
    INSERT INTO kyc_applications (
      application_id, email, wallet_address, application_type,
      full_name, country, status, metadata, created_at, updated_at
    ) VALUES ($1, $2, $3, 'business', $4, $5, $6, $7, NOW(), NOW())
    RETURNING *
  `, [
    applicationId, email, walletAddress?.toLowerCase(),
    companyName, incorporationCountry, KYC_STATUS.PENDING_DOCUMENTS,
    JSON.stringify({ 
      registrationNumber, companyType, registeredAddress, 
      beneficialOwners, directors, ...metadata 
    })
  ]);

  return result.rows[0];
}

// ── Statistics for Admin Dashboard ──
export async function getKycStats() {
  const stats = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'pending_documents') as pending_documents,
      COUNT(*) FILTER (WHERE status = 'documents_submitted') as awaiting_review,
      COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
      COUNT(*) FILTER (WHERE status = 'additional_info_required') as needs_info,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) as total
    FROM kyc_applications
  `);

  const accredStats = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected
    FROM accreditation_claims
  `);

  return {
    kyc: stats.rows[0],
    accreditation: accredStats.rows[0],
  };
}
