import express from 'express';
import pool from '../../db/connection.js';
import { sendEnquiryEmail } from '../../utils/mailer.js';

const router = express.Router();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

router.post('/', async (req, res) => {
  try {
    const { name, email, company, subject, message, source } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'Name is required.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, error: 'Valid email is required.' });
    if (!message?.trim()) return res.status(400).json({ success: false, error: 'Message is required.' });

    await sendEnquiryEmail({
      type: 'Contact',
      to: 'contact@decaflow.xyz',
      subject: `[DecaFlow Contact] ${subject || 'General Enquiry'} — ${name}`,
      fields: {
        'Name': name, 'Email': email, 'Company': company || '—',
        'Subject': subject || '—', 'Message': message,
        'Source': source || 'contact-page',
        'Submitted': new Date().toUTCString(),
      },
    });

    await sendEnquiryEmail({
      type: 'Contact Confirmation', to: email,
      subject: 'We received your message — DecaFlow',
      fields: {
        'Dear': name,
        'Message received': subject || 'Your enquiry',
        'Next step': 'Our team will get back to you within 24 hours.',
        'Contact': 'contact@decaflow.xyz',
      },
      isConfirmation: true,
    });

    return res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('❌ Contact error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

export default router;
