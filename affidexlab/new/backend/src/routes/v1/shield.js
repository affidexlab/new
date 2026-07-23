import express from 'express';
import Stripe from 'stripe';
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

export default router;
