import express from 'express';
import { body, validationResult } from 'express-validator';
import { partnerStore } from '../../utils/partnerStore.js';
import { authenticatePartner } from '../../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticatePartner, (req, res) => {
  const stats = partnerStore.getPartnerStats(req.partner.id);
  
  res.json({
    success: true,
    partner: {
      ...req.partner,
      stats: {
        totalRequests: stats.totalRequests,
        todayRequests: stats.daily[new Date().toISOString().split('T')[0]] || 0
      }
    }
  });
});

router.get('/stats', authenticatePartner, (req, res) => {
  const stats = partnerStore.getPartnerStats(req.partner.id);
  
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      requests: stats.daily[dateStr] || 0
    };
  }).reverse();

  res.json({
    success: true,
    stats: {
      totalRequests: stats.totalRequests,
      last30Days
    }
  });
});

router.post('/create',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('environment').isIn(['production', 'sandbox']).withMessage('Environment must be production or sandbox')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, environment } = req.body;
    
    try {
      const partner = partnerStore.createPartner(name, email, environment);
      
      res.json({
        success: true,
        partner,
        message: 'Partner created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

router.put('/update', authenticatePartner,
  [
    body('domains').optional().isArray().withMessage('Domains must be an array'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Must be a valid email')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { domains, name, email } = req.body;
    const updates = {};
    
    if (domains) updates.domains = domains;
    if (name) updates.name = name;
    if (email) updates.email = email;

    try {
      const updatedPartner = partnerStore.updatePartner(req.partner.id, updates);
      
      res.json({
        success: true,
        partner: updatedPartner,
        message: 'Partner updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

export default router;
