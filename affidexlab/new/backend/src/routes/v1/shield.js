import express from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import pool from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Fixed monthly prices in cents, standing in for the ranges shown on the pricing
// page ($500-1,500 and $3,000-8,000). Stripe checkout needs one exact number —
// change these two lines to adjust the self-serve price. Enterprise has no fixed
// price and isn't sold through this endpoint; it stays on the waitlist form below.
const PLAN_PRICES_CENTS = {
  Starter: 75000,   // $750/mo
  Growth: 500000,   // $5,000/mo
};

// Lazy + guarded: only constructs a Stripe client if a key is present, and only
// when a checkout request actually comes in. This means the rest of the backend
// (compliance/audit/verify forms, everything already live) keeps working exactly
// as before even before Stripe is configured — this route just returns a clean
// "not configured yet" error instead of the whole server failing to boot.
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// POST /v1/shield/waitlist — public early-access signup.
// Note: intentionally not persisted to Postgres yet (no shield_waitlist table exists).
// Add one (see shieldMonitor.js comments for a starting schema) before relying on this
// for anything beyond email notification.
router.post('/waitlist', async (req, res) => {
  try {
    const { companyName, contactName, email, chains, contractCount, message, source } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!contactName?.trim()) return res.status(400).json({ success: false, error: 'Contact name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });

    await sendEnquiryEmail({
      type: 'Shield',
      to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] New Shield Early Access Request — ${companyName}`,
      fields: {
        'Company': companyName,
        'Contact': contactName,
        'Email': email,
        'Chains': Array.isArray(chains) && chains.length ? chains.join(', ') : '—',
        'Contracts to monitor': contractCount || '—',
        'Message': message || '—',
        'Source': source || 'shield-page',
        'Submitted': new Date().toUTCString(),
      },
    });

    await sendEnquiryEmail({
      type: 'Shield Confirmation',
      to: email,
      subject: "You're on the list for DecaFlow Shield",
      fields: {
        'Dear': contactName,
        'What happens next': "We're onboarding Shield early-access clients in small batches. A member of the team will reach out to scope your contracts and set up monitoring.",
        'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com',
      },
      isConfirmation: true,
    });

    return res.status(201).json({ success: true, message: "You're on the Shield early-access list. We'll be in touch." });
  } catch (err) {
    console.error('❌ Shield waitlist error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit. Please try again or email us directly.' });
  }
});

// POST /v1/shield/checkout — Starter/Growth self-serve subscription checkout.
// Enterprise is "Custom" pricing and is NOT sold here — it stays on /waitlist above.
router.post('/checkout', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Payments are not live yet. Use the waitlist form for now, or contact us directly.' });
  }

  try {
    const { plan, companyName, contactName, email, chain, contractAddress, chains } = req.body;

    if (!PLAN_PRICES_CENTS[plan]) {
      return res.status(400).json({ success: false, error: 'Enterprise is custom pricing — please use the waitlist form instead of checkout.' });
    }
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!contractAddress?.trim()) return res.status(400).json({ success: false, error: 'A contract address is required so we know what to start monitoring.' });

    const frontendUrl = process.env.FRONTEND_URL || 'https://decaflow.xyz';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `DecaFlow Shield — ${plan}` },
          unit_amount: PLAN_PRICES_CENTS[plan],
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      // Everything the webhook needs to actually set up monitoring after payment —
      // Stripe hands this back verbatim in the checkout.session.completed event.
      metadata: {
        plan,
        companyName,
        contactName: contactName || '',
        chain: chain || (Array.isArray(chains) && chains[0]) || '',
        contractAddress,
      },
      success_url: `${frontendUrl}/shield?checkout=success`,
      cancel_url: `${frontendUrl}/shield?checkout=cancelled`,
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (err) {
    console.error('❌ Shield checkout error:', err);
    return res.status(500).json({ success: false, error: 'Could not start checkout. Please try again or email us directly.' });
  }
});

// POST /v1/shield/payment-request — crypto or bank transfer request (manual/semi-manual
// confirmation, not instant). Card is handled by /checkout above once Stripe is live.
router.post('/payment-request', async (req, res) => {
  try {
    const { plan, companyName, contactName, email, chain, contractAddress, paymentMethod } = req.body;

    if (!['crypto', 'bank'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, error: 'Unknown payment method.' });
    }
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!contractAddress?.trim()) return res.status(400).json({ success: false, error: 'A contract address is required so we know what to start monitoring.' });

    const basePrice = PLAN_PRICES_CENTS[plan] ? PLAN_PRICES_CENTS[plan] / 100 : null;
    let walletAddress = null;
    let exactAmount = null;

    if (paymentMethod === 'crypto') {
      // Deliberately NOT a hardcoded/placeholder address — a real address you control has
      // to be set per chain via env var (SHIELD_WALLET_ARBITRUM etc). Showing a fake or
      // example address on a payment page is how people lose real funds, so this fails
      // closed: no env var set = no address shown, ever.
      const envKey = `SHIELD_WALLET_${(chain || '').toUpperCase()}`;
      walletAddress = process.env[envKey] || null;
      if (!walletAddress) {
        return res.status(503).json({ success: false, error: `Crypto payment on ${chain || 'this chain'} isn't set up yet. Please use bank transfer, or contact us directly.` });
      }
      // Unique cents amount (e.g. $750.37) makes each customer's expected payment
      // distinguishable on-chain without needing a memo field, which EVM transfers don't have.
      const cents = Math.floor(Math.random() * 99) + 1;
      exactAmount = basePrice ? `${basePrice}.${String(cents).padStart(2, '0')}` : null;
    }

    const status = 'pending_payment';
    await sendEnquiryEmail({
      type: 'Shield',
      to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
      subject: `[DecaFlow] Shield ${paymentMethod} payment request — ${companyName}`,
      fields: {
        'Company': companyName, 'Contact': contactName || '—', 'Email': email, 'Plan': plan || '—',
        'Payment method': paymentMethod,
        'Expected amount': exactAmount ? `$${exactAmount} on ${chain}` : (basePrice ? `$${basePrice}/mo` : '—'),
        'Wallet to watch': walletAddress || '—',
        'Contract': `${chain || '—'}: ${contractAddress}`,
        'Status': status,
      },
    });

    await sendEnquiryEmail({
      type: 'Shield Confirmation',
      to: email,
      subject: paymentMethod === 'crypto' ? 'DecaFlow Shield — payment instructions' : 'DecaFlow Shield — bank transfer request received',
      fields: paymentMethod === 'crypto'
        ? { 'Dear': contactName || 'there', 'Send exactly': `$${exactAmount} equivalent in stablecoin on ${chain}`, 'To': walletAddress, 'Then': 'Reply to this email once sent — we verify on-chain and activate your account manually. This is not instant yet.' }
        : { 'Dear': contactName || 'there', 'What happens next': "Our team will email you bank transfer details within one business day. Your account activates once payment clears — bank transfers are not instant." },
      isConfirmation: true,
    });

    return res.status(200).json({ success: true, walletAddress, exactAmount, chain: chain || null });
  } catch (err) {
    console.error('❌ Shield payment-request error:', err);
    return res.status(500).json({ success: false, error: 'Could not submit request. Please try again or email us directly.' });
  }
});

// ============================================================
// NOWPayments — real crypto payment gateway integration.
// Flow: create-invoice (unique invoice_url + QR) -> customer pays -> NOWPayments detects
// it on-chain and POSTs our callback (signed) -> we verify + activate. Payout to your
// real wallet is configured once in your NOWPayments dashboard (Payment Settings ->
// wallet), not in this code — no wallet address needs to live here.
// Docs: https://documenter.getpostman.com/view/7907941/2s93JusNJt
// ============================================================

router.post('/nowpayments/create-invoice', async (req, res) => {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    return res.status(503).json({ success: false, error: 'Crypto payment is not configured yet. Use another payment method for now.' });
  }
  try {
    const { plan, companyName, contactName, email, chain, contractAddress } = req.body;

    if (!PLAN_PRICES_CENTS[plan]) return res.status(400).json({ success: false, error: 'Enterprise is custom pricing — please use the waitlist form.' });
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!contractAddress?.trim()) return res.status(400).json({ success: false, error: 'A contract address is required so we know what to start monitoring.' });

    const priceUsd = PLAN_PRICES_CENTS[plan] / 100;

    const insertResult = await pool.query(
      `INSERT INTO shield_customers (company_name, contact_name, email, plan, payment_gateway, status)
       VALUES ($1, $2, $3, $4, 'nowpayments', 'pending_payment') RETURNING id`,
      [companyName, contactName || null, email, plan]
    );
    const dbId = insertResult.rows[0].id;
    const orderId = `shield-${dbId}`;

    await pool.query(
      `INSERT INTO shield_contracts (customer_id, chain, address, label, status) VALUES ($1, $2, $3, $4, 'pending')`,
      [dbId, chain || 'unknown', contractAddress, `${companyName} — primary contract`]
    );

    // NOWPAYMENTS_ENV=sandbox -> sandbox API + sandbox key; unset/"live" -> production.
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
        order_description: `DecaFlow Shield — ${plan} — ${contractAddress} on ${chain || 'unspecified chain'}`,
        ipn_callback_url: `${backendUrl}/v1/shield/nowpayments/callback`,
        success_url: `${frontendUrl}/shield?checkout=success`,
        cancel_url: `${frontendUrl}/shield?checkout=cancelled`,
      }),
    });
    const npData = await npRes.json();
    const invoiceUrl = npData.invoice_url || npData.url; // defensive: field naming has varied across NOWPayments doc versions

    if (!npRes.ok || !invoiceUrl) {
      console.error('❌ NOWPayments invoice creation failed:', npRes.status, npData);
      return res.status(502).json({ success: false, error: 'Could not start crypto checkout. Please try again or use another payment method.' });
    }

    await pool.query(`UPDATE shield_customers SET coingate_order_id = $1 WHERE id = $2`, [String(npData.id || npData.invoice_id || ''), dbId]);

    return res.status(200).json({ success: true, url: invoiceUrl });
  } catch (err) {
    console.error('❌ Shield NOWPayments create-invoice error:', err);
    return res.status(500).json({ success: false, error: 'Could not start crypto checkout. Please try again.' });
  }
});

// Sorts an object's keys alphabetically (recursively) — required by NOWPayments' exact
// signature scheme: sort keys, JSON.stringify, HMAC-SHA512 with the IPN secret, compare
// hex digest to the x-nowpayments-sig header. This is their own documented algorithm.
function sortObjectKeys(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = (obj[key] && typeof obj[key] === 'object') ? sortObjectKeys(obj[key]) : obj[key];
    return result;
  }, {});
}

// NOWPayments IPN needs the parsed body (to re-sort + re-stringify), not raw bytes, so —
// unlike the Stripe webhook — this route does NOT need special raw-body middleware and can
// stay mounted normally, after the app-wide express.json() in server.js.
router.post('/nowpayments/callback', async (req, res) => {
  try {
    if (!process.env.NOWPAYMENTS_IPN_SECRET) {
      console.warn('⚠️  Shield NOWPayments callback hit but NOWPAYMENTS_IPN_SECRET is not set — ignoring.');
      return res.status(503).send('not configured');
    }

    const sig = req.headers['x-nowpayments-sig'];
    const expectedSig = crypto
      .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
      .update(JSON.stringify(sortObjectKeys(req.body)))
      .digest('hex');

    if (!sig || sig !== expectedSig) {
      console.error('❌ Shield NOWPayments callback signature mismatch');
      return res.status(403).send('invalid signature');
    }

    // Respond fast (NOWPayments expects a response within 3s) — do DB + email work,
    // but don't let slow email sending risk the response window.
    res.status(200).send('ok');

    const { order_id, payment_status, pay_currency, pay_amount, payment_id } = req.body;
    const match = /^shield-(\d+)$/.exec(order_id || '');
    if (!match) { console.warn('⚠️  Shield NOWPayments callback: unrecognized order_id', order_id); return; }
    const dbId = match[1];

    const { rows } = await pool.query(`SELECT * FROM shield_customers WHERE id = $1`, [dbId]);
    const customer = rows[0];
    if (!customer) { console.warn('⚠️  Shield NOWPayments callback: no matching customer for', order_id); return; }

    if (payment_status === 'finished' && customer.status !== 'active') {
      await pool.query(`UPDATE shield_customers SET status = 'active', coingate_order_id = $1, updated_at = NOW() WHERE id = $2`, [String(payment_id), dbId]);
      await pool.query(`UPDATE shield_contracts SET status = 'active' WHERE customer_id = $1`, [dbId]);

      sendEnquiryEmail({
        type: 'Shield',
        to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
        subject: `[DecaFlow] Shield paid via crypto — ${customer.company_name}`,
        fields: { Company: customer.company_name, Email: customer.email, Plan: customer.plan, Paid: `${pay_amount} ${pay_currency}`, 'NOWPayments ID': String(payment_id) },
      }).catch(err => console.error('Shield notify email failed:', err));

      sendEnquiryEmail({
        type: 'Shield Confirmation',
        to: customer.email,
        subject: "You're live on DecaFlow Shield",
        fields: {
          'Dear': customer.contact_name || 'there',
          'What just happened': `Payment confirmed (${pay_amount} ${pay_currency}). Your ${customer.plan} subscription is active and your contract is now in our monitoring system.`,
          'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com',
        },
        isConfirmation: true,
      }).catch(err => console.error('Shield confirmation email failed:', err));
    } else if (['failed', 'expired', 'refunded'].includes(payment_status)) {
      await pool.query(`UPDATE shield_customers SET status = $1, updated_at = NOW() WHERE id = $2`, [payment_status, dbId]);
    }
    // waiting / confirming / partially_paid / sending: no action yet, more callbacks follow.
  } catch (err) {
    console.error('❌ Shield NOWPayments callback error:', err);
  }
});

export default router;
