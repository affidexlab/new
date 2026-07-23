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
// CoinGate — real crypto payment gateway integration.
// Flow: create-order (unique invoice) -> customer pays -> CoinGate detects it on-chain
// and POSTs our callback -> we verify + activate. Auto-forwarding paid crypto to your
// real wallet is a CoinGate ACCOUNT setting (Payout settings in their dashboard) —
// not something in this code, so no wallet address needs to live here at all.
// Based on CoinGate API v2: https://developer.coingate.com/reference
// ============================================================

router.post('/coingate/create-order', async (req, res) => {
  if (!process.env.COINGATE_API_TOKEN) {
    return res.status(503).json({ success: false, error: 'Crypto payment is not configured yet. Use another payment method for now.' });
  }
  try {
    const { plan, companyName, contactName, email, chain, contractAddress } = req.body;

    if (!PLAN_PRICES_CENTS[plan]) return res.status(400).json({ success: false, error: 'Enterprise is custom pricing — please use the waitlist form.' });
    if (!companyName?.trim()) return res.status(400).json({ success: false, error: 'Company name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (!contractAddress?.trim()) return res.status(400).json({ success: false, error: 'A contract address is required so we know what to start monitoring.' });

    const priceUsd = PLAN_PRICES_CENTS[plan] / 100;
    const pendingToken = crypto.randomBytes(24).toString('hex');

    const insertResult = await pool.query(
      `INSERT INTO shield_customers (company_name, contact_name, email, plan, payment_gateway, pending_token, status)
       VALUES ($1, $2, $3, $4, 'coingate', $5, 'pending_payment') RETURNING id`,
      [companyName, contactName || null, email, plan, pendingToken]
    );
    const dbId = insertResult.rows[0].id;
    const coingateOrderId = `shield-${dbId}`;

    await pool.query(
      `INSERT INTO shield_contracts (customer_id, chain, address, label, status) VALUES ($1, $2, $3, $4, 'pending')`,
      [dbId, chain || 'unknown', contractAddress, `${companyName} — primary contract`]
    );

    // COINGATE_ENV unset/"live" -> production API; "sandbox" -> sandbox API + sandbox token required.
    const apiBase = process.env.COINGATE_ENV === 'sandbox' ? 'https://api-sandbox.coingate.com' : 'https://api.coingate.com';
    const frontendUrl = process.env.FRONTEND_URL || 'https://decaflow.xyz';
    const backendUrl = process.env.BACKEND_URL || 'https://decaflow-backend.onrender.com';

    const cgRes = await fetch(`${apiBase}/api/v2/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${process.env.COINGATE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: coingateOrderId,
        price_amount: priceUsd,
        price_currency: 'USD',
        receive_currency: process.env.COINGATE_RECEIVE_CURRENCY || 'DO_NOT_CONVERT',
        title: `DecaFlow Shield — ${plan}`,
        description: `${plan} plan monitoring — ${contractAddress} on ${chain || 'unspecified chain'}`,
        callback_url: `${backendUrl}/v1/shield/coingate/callback`,
        success_url: `${frontendUrl}/shield?checkout=success`,
        cancel_url: `${frontendUrl}/shield?checkout=cancelled`,
        token: pendingToken,
      }),
    });
    const cgData = await cgRes.json();

    if (!cgRes.ok || !cgData.payment_url) {
      console.error('❌ CoinGate order creation failed:', cgRes.status, cgData);
      return res.status(502).json({ success: false, error: 'Could not start crypto checkout. Please try again or use another payment method.' });
    }

    await pool.query(`UPDATE shield_customers SET coingate_order_id = $1 WHERE id = $2`, [String(cgData.id), dbId]);

    return res.status(200).json({ success: true, url: cgData.payment_url });
  } catch (err) {
    console.error('❌ Shield CoinGate create-order error:', err);
    return res.status(500).json({ success: false, error: 'Could not start crypto checkout. Please try again.' });
  }
});

// CoinGate POSTs here when order status changes (pending/confirming/paid/invalid/expired/etc).
// Verified via the per-order `token` we generated and stored above, not a raw-body signature —
// regular express.json() parsing (mounted normally in server.js) is fine for this one.
router.post('/coingate/callback', async (req, res) => {
  try {
    const { order_id, status, token, pay_currency, pay_amount, id: cgOrderId } = req.body;
    const match = /^shield-(\d+)$/.exec(order_id || '');
    if (!match) {
      console.warn('⚠️  Shield CoinGate callback: unrecognized order_id', order_id);
      return res.status(200).send('ignored');
    }
    const dbId = match[1];

    const { rows } = await pool.query(`SELECT * FROM shield_customers WHERE id = $1`, [dbId]);
    const customer = rows[0];
    if (!customer) {
      console.warn('⚠️  Shield CoinGate callback: no matching customer for', order_id);
      return res.status(200).send('ignored');
    }
    if (customer.pending_token !== token) {
      console.error('❌ Shield CoinGate callback token mismatch for order', order_id);
      return res.status(403).send('token mismatch');
    }

    if (status === 'paid' && customer.status !== 'active') {
      await pool.query(`UPDATE shield_customers SET status = 'active', coingate_order_id = $1, updated_at = NOW() WHERE id = $2`, [String(cgOrderId), dbId]);
      await pool.query(`UPDATE shield_contracts SET status = 'active' WHERE customer_id = $1`, [dbId]);

      await sendEnquiryEmail({
        type: 'Shield',
        to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
        subject: `[DecaFlow] Shield paid via crypto — ${customer.company_name}`,
        fields: { Company: customer.company_name, Email: customer.email, Plan: customer.plan, Paid: `${pay_amount} ${pay_currency}`, 'CoinGate order': String(cgOrderId) },
      });

      await sendEnquiryEmail({
        type: 'Shield Confirmation',
        to: customer.email,
        subject: "You're live on DecaFlow Shield",
        fields: {
          'Dear': customer.contact_name || 'there',
          'What just happened': `Payment confirmed (${pay_amount} ${pay_currency}). Your ${customer.plan} subscription is active and your contract is now in our monitoring system.`,
          'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com',
        },
        isConfirmation: true,
      });
    } else if (['invalid', 'canceled', 'expired'].includes(status)) {
      await pool.query(`UPDATE shield_customers SET status = $1, updated_at = NOW() WHERE id = $2`, [status, dbId]);
    }
    // pending / confirming: no action yet, CoinGate will call again as it progresses.

    return res.status(200).send('ok');
  } catch (err) {
    console.error('❌ Shield CoinGate callback error:', err);
    return res.status(500).send('error');
  }
});

export default router;
