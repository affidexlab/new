import express from 'express';
import Stripe from 'stripe';
import pool from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';

const router = express.Router();

// This route is mounted in server.js with express.raw({type:'application/json'})
// applied BEFORE the app-wide express.json() middleware — Stripe signature
// verification needs the exact raw request bytes, not a parsed object. Do not
// move this route to be mounted after app.use(express.json()); the signature
// check will fail if req.body isn't the raw Buffer.
router.post('/', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️  Shield webhook hit but Stripe env vars are not set — ignoring.');
    return res.status(503).send('Stripe not configured');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Shield webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { plan, companyName, contactName, chain, contractAddress } = session.metadata || {};
    const email = session.customer_email || session.customer_details?.email;

    try {
      const customerResult = await pool.query(
        `INSERT INTO shield_customers (company_name, contact_name, email, plan, stripe_customer_id, stripe_subscription_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         RETURNING id`,
        [companyName || null, contactName || null, email, plan, session.customer, session.subscription]
      );
      const customerId = customerResult.rows[0].id;

      if (contractAddress) {
        await pool.query(
          `INSERT INTO shield_contracts (customer_id, chain, address, label, status)
           VALUES ($1, $2, $3, $4, 'active')`,
          [customerId, chain || 'unknown', contractAddress, `${companyName || 'Customer'} — primary contract`]
        );
      }

      console.log(`✅ Shield customer ${customerId} (${email}) provisioned on plan ${plan}`);

      await sendEnquiryEmail({
        type: 'Shield',
        to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
        subject: `[DecaFlow] New Shield subscriber — ${companyName || email} (${plan})`,
        fields: {
          'Company': companyName || '—',
          'Contact': contactName || '—',
          'Email': email,
          'Plan': plan,
          'Contract': `${chain || '—'}: ${contractAddress || '—'}`,
          'Stripe subscription': session.subscription,
        },
      });

      await sendEnquiryEmail({
        type: 'Shield Confirmation',
        to: email,
        subject: "You're live on DecaFlow Shield",
        fields: {
          'Dear': contactName || 'there',
          'What just happened': `Your ${plan} subscription is active and your contract (${contractAddress}) has been added to monitoring.`,
          'Note': 'Alerts depend on our monitoring service actively running — if you don\u2019t receive a confirmation alert within 24 hours, reply to this email.',
          'Questions?': 'Reply to this email or contact decaflowsolutions@gmail.com',
        },
        isConfirmation: true,
      });
    } catch (dbErr) {
      console.error('❌ Failed to provision Shield customer after payment:', dbErr);
      // Payment already succeeded at this point — do not fail the webhook response
      // (Stripe will retry and could double-charge context aside, retries won't help
      // a DB error). Log loudly so this gets caught and fixed manually instead.
      await sendEnquiryEmail({
        type: 'Shield',
        to: process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
        subject: `[URGENT] Shield payment succeeded but provisioning failed — ${email}`,
        fields: { Email: email, Plan: plan, Error: dbErr.message, 'Stripe session': session.id },
      }).catch(() => {});
    }
  }

  res.status(200).json({ received: true });
});

export default router;
