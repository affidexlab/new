/**
 * DecaFlow Native KYC/KYB/Accreditation Routes
 * 
 * DecaFlow IS the KYC provider. Customers submit documents here,
 * DecaFlow analysts review and approve, and attestations are issued.
 */

import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { ethers } from 'ethers';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { findOrgApiKey } from '../../services/orgApiKeyAuth.js';
import { upsertIdentityAttestation } from '../../services/institutionalComplianceService.js';
import {
  createKycApplication,
  createKybApplication,
  submitKycDocument,
  submitAccreditationClaim,
  getKycApplication,
  getKycApplicationByWallet,
  getKycReviewQueue,
  reviewKycApplication,
  reviewAccreditationClaim,
  isWalletKycApproved,
  isWalletAccredited,
  getKycStats,
  KYC_STATUS,
  DOCUMENT_TYPES,
  ACCREDITATION_BASIS,
} from '../../services/decaflowKycService.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';

const router = express.Router();

// File upload config - in production, use S3/cloud storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ── Public: Start KYC Application ──
router.post('/applications', async (req, res) => {
  try {
    const { 
      email, walletAddress, applicationType = 'individual',
      fullName, dateOfBirth, nationality, country, metadata = {}
    } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email required.' });
    }
    if (walletAddress && !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address.' });
    }
    if (!fullName) {
      return res.status(400).json({ success: false, error: 'Full name required.' });
    }

    const application = await createKycApplication({
      email, walletAddress, applicationType, fullName, dateOfBirth, nationality, country, metadata
    });

    // Send confirmation email
    await sendEnquiryEmail({
      to: email,
      subject: 'DecaFlow KYC Application Started',
      template: 'kyc-started',
      data: { applicationId: application.application_id, fullName }
    }).catch(err => console.error('KYC start email failed:', err));

    return res.status(201).json({
      success: true,
      applicationId: application.application_id,
      status: application.status,
      nextStep: 'Upload required documents: government ID and selfie for individuals, or incorporation documents for businesses.',
      requiredDocuments: applicationType === 'business' 
        ? ['certificate_of_incorporation', 'beneficial_ownership', 'director_id']
        : ['government_id', 'selfie', 'proof_of_address'],
    });
  } catch (err) {
    console.error('❌ KYC application error:', err);
    return res.status(500).json({ success: false, error: 'Could not create KYC application.' });
  }
});

// ── Public: Start KYB Application ──
router.post('/applications/business', async (req, res) => {
  try {
    const {
      email, walletAddress, companyName, registrationNumber,
      incorporationCountry, companyType, registeredAddress,
      beneficialOwners = [], directors = [], metadata = {}
    } = req.body || {};

    if (!email || !companyName || !incorporationCountry) {
      return res.status(400).json({ success: false, error: 'Email, company name, and incorporation country required.' });
    }

    const application = await createKybApplication({
      email, walletAddress, companyName, registrationNumber,
      incorporationCountry, companyType, registeredAddress,
      beneficialOwners, directors, metadata
    });

    return res.status(201).json({
      success: true,
      applicationId: application.application_id,
      status: application.status,
      nextStep: 'Upload required business documents.',
      requiredDocuments: ['certificate_of_incorporation', 'beneficial_ownership', 'director_id', 'business_license'],
    });
  } catch (err) {
    console.error('❌ KYB application error:', err);
    return res.status(500).json({ success: false, error: 'Could not create KYB application.' });
  }
});

// ── Public: Upload Document ──
router.post('/applications/:applicationId/documents', upload.single('document'), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { documentType, expiryDate } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Document file required.' });
    }
    if (!documentType || !Object.values(DOCUMENT_TYPES).includes(documentType)) {
      return res.status(400).json({ success: false, error: 'Valid document type required.', validTypes: Object.values(DOCUMENT_TYPES) });
    }

    // In production: upload to S3/cloud storage
    // For now: store base64 or reference (this should be replaced with real storage)
    const documentHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const documentUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const doc = await submitKycDocument({
      applicationId,
      documentType,
      documentUrl,
      documentHash,
      expiryDate,
      metadata: { originalName: req.file.originalname, size: req.file.size, mimeType: req.file.mimetype }
    });

    return res.status(201).json({
      success: true,
      documentId: doc.document_id,
      documentType: doc.document_type,
      status: doc.status,
    });
  } catch (err) {
    console.error('❌ KYC document upload error:', err);
    return res.status(500).json({ success: false, error: 'Could not upload document.' });
  }
});

// ── Public: Submit Accreditation Claim ──
router.post('/applications/:applicationId/accreditation', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { accreditationBasis, claimedAmount, supportingDocumentIds = [], certificationDate } = req.body;

    if (!accreditationBasis || !Object.values(ACCREDITATION_BASIS).includes(accreditationBasis)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid accreditation basis required.',
        validBases: Object.entries(ACCREDITATION_BASIS).map(([k, v]) => ({ key: k, value: v }))
      });
    }

    const claim = await submitAccreditationClaim({
      applicationId, accreditationBasis, claimedAmount, supportingDocumentIds, certificationDate
    });

    return res.status(201).json({
      success: true,
      claimId: claim.claim_id,
      accreditationBasis: claim.accreditation_basis,
      status: claim.status,
      note: 'Your accreditation claim is under review. You will be notified once verified.',
    });
  } catch (err) {
    console.error('❌ Accreditation claim error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit accreditation claim.' });
  }
});

// ── Public: Check Application Status ──
router.get('/applications/:applicationId', async (req, res) => {
  try {
    const application = await getKycApplication(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    // Don't expose full document URLs to public endpoint
    const sanitized = {
      ...application,
      documents: application.documents?.map(d => ({
        documentId: d.document_id,
        documentType: d.document_type,
        status: d.status,
        createdAt: d.created_at,
      })),
    };

    return res.json({ success: true, application: sanitized });
  } catch (err) {
    console.error('❌ KYC status check error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch application.' });
  }
});

// ── Public: Check Wallet KYC Status ──
router.get('/wallet/:walletAddress/status', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address.' });
    }

    const isKycApproved = await isWalletKycApproved(walletAddress);
    const accreditation = await isWalletAccredited(walletAddress);

    return res.json({
      success: true,
      walletAddress,
      kycApproved: isKycApproved,
      accredited: !!accreditation,
      accreditationBasis: accreditation?.accreditation_basis || null,
      accreditationExpires: accreditation?.expires_at || null,
    });
  } catch (err) {
    console.error('❌ Wallet KYC check error:', err);
    return res.status(500).json({ success: false, error: 'Could not check wallet status.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ADMIN / ANALYST ENDPOINTS (require authentication)
// ══════════════════════════════════════════════════════════════════════════

async function authorizeKycAdmin(req, res) {
  const token = req.headers['x-api-key'] || req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
  const orgKey = await findOrgApiKey(token, 'kyc:review');
  if (orgKey) {
    req.reviewer = { email: orgKey.organization_name, principal: `org-key:${orgKey.name}` };
    return true;
  }
  if (await authorizeAdmin(req, res, 'kyc:review')) {
    req.reviewer = { email: req.admin?.name || 'admin', principal: req.admin?.name || 'admin' };
    return true;
  }
  return false;
}

// ── Admin: Get Review Queue ──
router.get('/admin/queue', async (req, res) => {
  try {
    if (!(await authorizeKycAdmin(req, res))) return;
    const { status = 'documents_submitted', limit = 50, offset = 0 } = req.query;
    const queue = await getKycReviewQueue({ status, limit: Number(limit), offset: Number(offset) });
    return res.json({ success: true, queue, count: queue.length });
  } catch (err) {
    console.error('❌ KYC queue error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch review queue.' });
  }
});

// ── Admin: Get Full Application (with documents) ──
router.get('/admin/applications/:applicationId', async (req, res) => {
  try {
    if (!(await authorizeKycAdmin(req, res))) return;
    const application = await getKycApplication(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }
    return res.json({ success: true, application });
  } catch (err) {
    console.error('❌ KYC admin fetch error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch application.' });
  }
});

// ── Admin: Review KYC Application ──
router.post('/admin/applications/:applicationId/review', async (req, res) => {
  try {
    if (!(await authorizeKycAdmin(req, res))) return;

    const { applicationId } = req.params;
    const { decision, reviewNotes, rejectionReason, additionalInfoRequired } = req.body;

    if (!['approved', 'rejected', 'additional_info_required'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Decision must be approved, rejected, or additional_info_required.' });
    }

    const application = await reviewKycApplication({
      applicationId,
      decision,
      reviewerEmail: req.reviewer.email,
      reviewNotes,
      rejectionReason,
      additionalInfoRequired,
    });

    // If approved, auto-create identity attestation
    if (decision === 'approved' && application.wallet_address) {
      try {
        await upsertIdentityAttestation({
          chain: 'ethereum',
          walletAddress: application.wallet_address,
          organizationId: null,
          kycStatus: 'approved',
          jurisdictionEligible: true,
          accreditedInvestor: false, // separate accreditation flow
          jurisdiction: application.country,
          attestedBy: `decaflow-kyc:${req.reviewer.email}`,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          metadata: { kycApplicationId: applicationId },
        });
      } catch (attestErr) {
        console.error('Auto-attestation failed:', attestErr);
      }
    }

    return res.json({
      success: true,
      application,
      attestationCreated: decision === 'approved' && !!application.wallet_address,
    });
  } catch (err) {
    console.error('❌ KYC review error:', err);
    return res.status(500).json({ success: false, error: 'Could not review application.' });
  }
});

// ── Admin: Review Accreditation Claim ──
router.post('/admin/accreditation/:claimId/review', async (req, res) => {
  try {
    if (!(await authorizeKycAdmin(req, res))) return;

    const { claimId } = req.params;
    const { decision, reviewNotes, verifiedAmount, expiresAt } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Decision must be approved or rejected.' });
    }

    const claim = await reviewAccreditationClaim({
      claimId,
      decision,
      reviewerEmail: req.reviewer.email,
      reviewNotes,
      verifiedAmount,
      expiresAt,
    });

    // If approved, update identity attestation with accreditation
    if (decision === 'approved') {
      try {
        const app = await pool.query(
          `SELECT wallet_address, country FROM kyc_applications WHERE application_id = $1`,
          [claim.application_id]
        );
        if (app.rows[0]?.wallet_address) {
          await upsertIdentityAttestation({
            chain: 'ethereum',
            walletAddress: app.rows[0].wallet_address,
            organizationId: null,
            kycStatus: 'approved',
            jurisdictionEligible: true,
            accreditedInvestor: true,
            accreditationBasis: claim.accreditation_basis,
            jurisdiction: app.rows[0].country,
            attestedBy: `decaflow-accred:${req.reviewer.email}`,
            expiresAt: claim.expires_at,
            metadata: { accreditationClaimId: claimId },
          });
        }
      } catch (attestErr) {
        console.error('Accreditation attestation failed:', attestErr);
      }
    }

    return res.json({ success: true, claim });
  } catch (err) {
    console.error('❌ Accreditation review error:', err);
    return res.status(500).json({ success: false, error: 'Could not review accreditation claim.' });
  }
});

// ── Admin: KYC Statistics ──
router.get('/admin/stats', async (req, res) => {
  try {
    if (!(await authorizeKycAdmin(req, res))) return;
    const stats = await getKycStats();
    return res.json({ success: true, stats });
  } catch (err) {
    console.error('❌ KYC stats error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch stats.' });
  }
});

// ── Reference: Document Types ──
router.get('/reference/document-types', (_req, res) => {
  res.json({ success: true, documentTypes: DOCUMENT_TYPES });
});

// ── Reference: Accreditation Bases ──
router.get('/reference/accreditation-bases', (_req, res) => {
  res.json({ 
    success: true, 
    accreditationBases: ACCREDITATION_BASIS,
    descriptions: {
      income_over_200k: 'Individual income exceeding $200,000 in each of the two most recent years',
      joint_income_over_300k: 'Joint income with spouse exceeding $300,000 in each of the two most recent years',
      net_worth_over_1m: 'Net worth exceeding $1,000,000, excluding primary residence',
      licensed_professional: 'Licensed broker, investment adviser, or Series 7/65/82 holder',
      qualified_entity: 'Entity with assets exceeding $5,000,000 not formed for the specific purpose of investing',
      knowledgeable_employee: 'Knowledgeable employee of a private fund',
    }
  });
});

export default router;
