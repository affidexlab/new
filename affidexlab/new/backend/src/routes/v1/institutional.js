import express from 'express';
import crypto from 'crypto';
import { ethers } from 'ethers';
import pool from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';
import { safeCompare } from '../../utils/security.js';
import { createKycApplicant } from '../../services/kycProviderService.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const RPC_URLS = {
  arbitrum: process.env.RPC_ARBITRUM,
  base: process.env.RPC_BASE,
  polygon: process.env.RPC_POLYGON,
  avalanche: process.env.RPC_AVALANCHE,
};

const IDENTITY_ABI = [
  'function isVerified(address wallet) view returns (bool)',
  'function getIdentity(address wallet) view returns (tuple(bool verified, bool jurisdictionEligible, bool accreditedInvestor, bytes32 evidenceHash, uint40 verifiedAt))',
];

// Guardian audit HIGH "Arbitrary Contract Address Trust in Identity API": /eligibility
// and /identity-proof used to blindly instantiate whatever identityRegistry address
// the caller passed in as a query param, so anyone could deploy a contract whose
// isVerified() always returns true and get a fraudulent "eligible" response back
// through this API. Both endpoints now check the address against an allowlist first.
//
// APPROVED_IDENTITY_REGISTRIES: comma-separated "chain:address" pairs, e.g.
//   APPROVED_IDENTITY_REGISTRIES=arbitrum:0xAbC...,base:0xDeF...
// Deliberately fails closed: unset/empty means NO registry is trusted, which matches
// where this actually is today — per the comment below, no real IdentityRegistry has
// been deployed for any live asset yet. Set this once real registries exist.
function parseApprovedRegistries() {
  const raw = process.env.APPROVED_IDENTITY_REGISTRIES || '';
  const byChain = {};
  for (const entry of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    const [chain, address] = entry.split(':').map((s) => (s || '').trim());
    if (!chain || !address || !ethers.isAddress(address)) {
      console.warn(`⚠️  Ignoring malformed APPROVED_IDENTITY_REGISTRIES entry: "${entry}"`);
      continue;
    }
    const key = chain.toLowerCase();
    if (!byChain[key]) byChain[key] = new Set();
    byChain[key].add(address.toLowerCase());
  }
  return byChain;
}

const APPROVED_REGISTRIES = parseApprovedRegistries();

function isApprovedRegistry(chain, address) {
  const set = APPROVED_REGISTRIES[(chain || '').toLowerCase()];
  return !!set && !!address && set.has(address.toLowerCase());
}

// Fixed prices in cents for the two self-serve tiers. Enterprise is custom, not sold here.
const PLAN_PRICES_CENTS = {
  Issuer: 250000,   // $2,500/mo
  Scale: 1000000,   // $10,000/mo
};

function getFields(body) {
  const { companyName, contactName, email, assetType, jurisdictions, message } = body;
  return {
    companyName, contactName, email, assetType,
    jurisdictions: Array.isArray(jurisdictions) ? jurisdictions.join(', ') : (jurisdictions || ''),
    message,
  };
}

// POST /v1/institutional/waitlist — Enterprise / general interest, no payment involved.
router.post('/waitlist', async (req, res) => {
  try {
    const f = getFields(req.body);
    if (!f.companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!f.email || !isValidEmail(f.email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    await pool.query(
      `INSERT INTO institutional_customers (company_name, contact_name, email, plan, asset_type, jurisdictions, message, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'waitlist')`,
      [f.companyName, f.contactName || null, f.email, req.body.plan || 'Enterprise', f.assetType || null, f.jurisdictions, f.message || null]
    );

    await sendEnquiryEmail({
      type: 'Institutional', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] Institutional interest — ${f.companyName}`,
      fields: { Company: f.companyName, Contact: f.contactName || '—', Email: f.email, 'Asset type': f.assetType || '—', Jurisdictions: f.jurisdictions || '—', Message: f.message || '—' },
    });
    await sendEnquiryEmail({
      type: 'Institutional Confirmation', to: f.email, subject: "We've got your DecaFlow Institutional request",
      fields: { 'Dear': f.contactName || 'there', 'What happens next': "A member of our team will reach out to talk through your asset and compliance requirements. This is a guided conversation, not automated onboarding — the underlying platform is still in active development." },
      isConfirmation: true,
    });

    return res.status(200).json({ success: true, message: "Thanks — we'll be in touch." });
  } catch (err) {
    console.error('❌ Institutional waitlist error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit request. Please try again or email us directly.' });
  }
});

// POST /v1/institutional/payment-request — bank transfer, manual follow-up.
router.post('/payment-request', async (req, res) => {
  try {
    const { paymentMethod, plan } = req.body;
    const f = getFields(req.body);
    if (paymentMethod !== 'bank') return res.status(400).json({ success: false, error: 'Unsupported payment method for this endpoint.' });
    if (!f.companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!f.email || !isValidEmail(f.email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    await pool.query(
      `INSERT INTO institutional_customers (company_name, contact_name, email, plan, asset_type, jurisdictions, message, payment_gateway, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'bank','pending_payment')`,
      [f.companyName, f.contactName || null, f.email, plan, f.assetType || null, f.jurisdictions, f.message || null]
    );

    await sendEnquiryEmail({
      type: 'Institutional', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] Institutional bank transfer request — ${f.companyName}`,
      fields: { Company: f.companyName, Contact: f.contactName || '—', Email: f.email, Plan: plan, 'Asset type': f.assetType || '—' },
    });
    await sendEnquiryEmail({
      type: 'Institutional Confirmation', to: f.email, subject: 'DecaFlow Institutional — bank transfer request received',
      fields: { 'Dear': f.contactName || 'there', 'What happens next': 'Our team will email transfer details within one business day, then follow up separately to scope your compliance requirements.' },
      isConfirmation: true,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Institutional payment-request error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit request. Please try again.' });
  }
});

// ============================================================
// NOWPayments — same gateway and pattern as Shield. Key difference from Shield:
// on confirmed payment, this does NOT grant any system access — there is no
// system to grant access to yet. It just moves the customer to a "paid, queue
// for outreach" state, matching the honest scope of where Institutional is.
// ============================================================

router.post('/nowpayments/create-invoice', async (req, res) => {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    return res.status(503).json({ success: false, error: 'Crypto payment is not configured yet. Use another payment method for now.' });
  }
  try {
    const { plan } = req.body;
    const f = getFields(req.body);

    if (!PLAN_PRICES_CENTS[plan]) return res.status(400).json({ success: false, error: 'Enterprise is custom — please use the waitlist form.' });
    if (!f.companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!f.email || !isValidEmail(f.email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    const priceUsd = PLAN_PRICES_CENTS[plan] / 100;

    const insertResult = await pool.query(
      `INSERT INTO institutional_customers (company_name, contact_name, email, plan, asset_type, jurisdictions, message, payment_gateway, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'nowpayments','pending_payment') RETURNING id`,
      [f.companyName, f.contactName || null, f.email, plan, f.assetType || null, f.jurisdictions, f.message || null]
    );
    const dbId = insertResult.rows[0].id;
    const orderId = `institutional-${dbId}`;

    const apiBase = process.env.NOWPAYMENTS_ENV === 'sandbox' ? 'https://api-sandbox.nowpayments.io' : 'https://api.nowpayments.io';
    const frontendUrl = process.env.FRONTEND_URL || 'https://decaflow.xyz';
    const backendUrl = process.env.BACKEND_URL || 'https://decaflow-backend.onrender.com';

    const npRes = await fetch(`${apiBase}/v1/invoice`, {
      method: 'POST',
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: priceUsd,
        price_currency: 'usd',
        order_id: orderId,
        order_description: `DecaFlow Institutional — ${plan} — queue placement for ${f.companyName}`,
        ipn_callback_url: `${backendUrl}/v1/institutional/nowpayments/callback`,
        success_url: `${frontendUrl}/institutional?checkout=success`,
        cancel_url: `${frontendUrl}/institutional?checkout=cancelled`,
      }),
    });
    const npData = await npRes.json();
    const invoiceUrl = npData.invoice_url || npData.url;

    if (!npRes.ok || !invoiceUrl) {
      console.error('❌ Institutional NOWPayments invoice creation failed:', npRes.status, npData);
      return res.status(502).json({ success: false, error: 'Could not start crypto checkout. Please try another payment method.' });
    }

    await pool.query(`UPDATE institutional_customers SET gateway_order_id = $1 WHERE id = $2`, [String(npData.id || npData.invoice_id || ''), dbId]);

    return res.status(200).json({ success: true, url: invoiceUrl });
  } catch (err) {
    console.error('❌ Institutional NOWPayments create-invoice error:', err);
    return res.status(500).json({ success: false, error: 'Could not start crypto checkout. Please try again.' });
  }
});

function sortObjectKeys(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = (obj[key] && typeof obj[key] === 'object') ? sortObjectKeys(obj[key]) : obj[key];
    return result;
  }, {});
}

router.post('/nowpayments/callback', async (req, res) => {
  try {
    if (!process.env.NOWPAYMENTS_IPN_SECRET) {
      console.warn('⚠️  Institutional NOWPayments callback hit but NOWPAYMENTS_IPN_SECRET is not set — ignoring.');
      return res.status(503).send('not configured');
    }

    const sig = req.headers['x-nowpayments-sig'];
    const expectedSig = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET).update(JSON.stringify(sortObjectKeys(req.body))).digest('hex');
    if (!sig || !safeCompare(sig, expectedSig)) {
      console.error('❌ Institutional NOWPayments callback signature mismatch');
      return res.status(403).send('invalid signature');
    }

    const { order_id, payment_status, pay_currency, pay_amount, payment_id } = req.body;
    const match = /^institutional-(\d+)$/.exec(order_id || '');
    if (!match) { console.warn('⚠️  Institutional callback: unrecognized order_id', order_id); return res.status(200).send('ok'); }
    const dbId = match[1];

    const { rows } = await pool.query(`SELECT * FROM institutional_customers WHERE id = $1`, [dbId]);
    const customer = rows[0];
    if (!customer) return res.status(200).send('ok');

    if (payment_status === 'finished' && customer.status !== 'paid_queued') {
      // Deliberately "paid_queued", not "active" — payment secures a place in line
      // for a guided onboarding conversation, not access to any system.
      await pool.query(`UPDATE institutional_customers SET status = 'paid_queued', gateway_order_id = $1, updated_at = NOW() WHERE id = $2`, [String(payment_id), dbId]);

      res.status(200).send('ok');

      sendEnquiryEmail({
        type: 'Institutional', to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
        subject: `[DecaFlow] Institutional paid via crypto — ${customer.company_name}`,
        fields: { Company: customer.company_name, Email: customer.email, Plan: customer.plan, Paid: `${pay_amount} ${pay_currency}` },
      }).catch(err => console.error('Institutional notify email failed:', err));

      sendEnquiryEmail({
        type: 'Institutional Confirmation', to: customer.email, subject: "Payment received — DecaFlow Institutional",
        fields: {
          'Dear': customer.contact_name || 'there',
          'What just happened': `Payment confirmed (${pay_amount} ${pay_currency}). You're now queued for onboarding.`,
          'Important': "This secures your place in line, not system access. Our compliance/engineering team will reach out to scope your specific asset and jurisdiction before any integration work begins.",
        },
        isConfirmation: true,
      }).catch(err => console.error('Institutional confirmation email failed:', err));
    } else if (['failed', 'expired', 'refunded'].includes(payment_status)) {
      await pool.query(`UPDATE institutional_customers SET status = $1, updated_at = NOW() WHERE id = $2`, [payment_status, dbId]);
      res.status(200).send('ok');
    } else {
      res.status(200).send('ok');
    }
  } catch (err) {
    console.error('❌ Institutional NOWPayments callback error:', err);
    if (!res.headersSent) return res.status(500).send('callback processing failed');
  }
});

export default router;

// ============================================================
// SDK-facing endpoints — what @decaflow/partner-sdk's checkEligibility()
// and getIdentityProof() actually call. Reuses the same RPC env vars
// (RPC_ARBITRUM etc.) already set up for Shield — same infra, new purpose.
//
// "assetId" from the roadmap doesn't have a real registry behind it yet
// (no assets are deployed), so for now callers pass the identity registry
// contract address + chain directly. A real assetId -> {chain, address}
// lookup table is a natural next step once real assets exist — flagging
// explicitly rather than faking a registry that doesn't exist.
// ============================================================

router.get('/eligibility', async (req, res) => {
  try {
    const { wallet, chain, identityRegistry } = req.query;
    if (!wallet || !ethers.isAddress(wallet)) return res.status(400).json({ success: false, error: 'A valid wallet address is required.' });
    if (!identityRegistry || !ethers.isAddress(identityRegistry)) return res.status(400).json({ success: false, error: 'identityRegistry contract address is required (no asset registry exists yet — see code comments).' });
    if (!isApprovedRegistry(chain, identityRegistry)) {
      console.warn(`⚠️  Rejected /eligibility call for un-allowlisted identityRegistry ${identityRegistry} on chain "${chain}"`);
      return res.status(403).json({ success: false, error: 'This identityRegistry contract address is not on the approved allowlist. Contact DecaFlow to have your deployment approved.' });
    }
    const rpcUrl = RPC_URLS[chain];
    if (!rpcUrl) return res.status(400).json({ success: false, error: `No RPC configured for chain "${chain}".` });

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const registry = new ethers.Contract(identityRegistry, IDENTITY_ABI, provider);
    const verified = await registry.isVerified(wallet);

    return res.status(200).json({ success: true, wallet, eligible: verified });
  } catch (err) {
    console.error('❌ Institutional eligibility check error:', err);
    return res.status(500).json({ success: false, error: 'Could not check eligibility.' });
  }
});

router.get('/identity-proof', async (req, res) => {
  try {
    const { wallet, chain, identityRegistry } = req.query;
    if (!wallet || !ethers.isAddress(wallet)) return res.status(400).json({ success: false, error: 'A valid wallet address is required.' });
    if (!identityRegistry || !ethers.isAddress(identityRegistry)) return res.status(400).json({ success: false, error: 'identityRegistry contract address is required.' });
    if (!isApprovedRegistry(chain, identityRegistry)) {
      console.warn(`⚠️  Rejected /identity-proof call for un-allowlisted identityRegistry ${identityRegistry} on chain "${chain}"`);
      return res.status(403).json({ success: false, error: 'This identityRegistry contract address is not on the approved allowlist. Contact DecaFlow to have your deployment approved.' });
    }
    const rpcUrl = RPC_URLS[chain];
    if (!rpcUrl) return res.status(400).json({ success: false, error: `No RPC configured for chain "${chain}".` });

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const registry = new ethers.Contract(identityRegistry, IDENTITY_ABI, provider);
    const identity = await registry.getIdentity(wallet);

    // NOTE: this is the plain on-chain identity record, not a zero-knowledge proof.
    // ZK-KYC is the roadmap's own "mid-term goal" (Phase 2) — not built yet. Calling
    // this a "proof" in the ZK sense before that exists would misrepresent what it does.
    // Also note: as of the identity-registry redesign, no raw jurisdiction/country data
    // is stored on-chain at all (see IdentityRegistry.sol) — jurisdictionEligible is an
    // off-chain-computed yes/no conclusion, and evidenceHash is a commitment to the real
    // record, not the record itself. Neither can be reverse-engineered into a country.
    return res.status(200).json({
      success: true,
      wallet,
      verified: identity.verified,
      jurisdictionEligible: identity.jurisdictionEligible,
      accreditedInvestor: identity.accreditedInvestor,
      evidenceHash: identity.evidenceHash,
      verifiedAt: Number(identity.verifiedAt),
      note: 'Plain identity record from IdentityRegistry.sol — not a zero-knowledge proof. ZK-KYC is roadmap Phase 2, not yet implemented.',
    });
  } catch (err) {
    console.error('❌ Institutional identity-proof error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch identity record.' });
  }
});

router.post('/kyc/applicants', async (req, res) => {
  try {
    const { email, wallet, externalUserId, metadata } = req.body;
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email is required.' });
    if (wallet && !ethers.isAddress(wallet)) return res.status(400).json({ success: false, error: 'wallet must be a valid address when provided.' });

    const result = await createKycApplicant({ email, wallet, externalUserId, metadata });

    await pool.query(
      `INSERT INTO kyc_applications (email, wallet_address, provider, provider_applicant_id, status, review_url, raw_response)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [email, wallet || null, result.provider, result.applicantId || null, result.status, result.reviewUrl, result.raw]
    );

    return res.status(201).json({ success: true, applicant: result });
  } catch (err) {
    console.error('❌ Institutional KYC applicant error:', err);
    return res.status(503).json({ success: false, error: err.message || 'Could not create KYC applicant.' });
  }
});
