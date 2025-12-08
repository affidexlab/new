import express from 'express';
import { body, validationResult } from 'express-validator';
import { partnerStore } from '../../utils/partnerStore.js';

const router = express.Router();

router.get('/me', async (req, res) => {
  try {
    if (!req.partner) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid partner authentication required'
      });
    }

    const stats = partnerStore.getPartnerStats(req.partner.id);
    const today = new Date().toISOString().split('T')[0];
    
    res.json({
      success: true,
      partner: {
        ...req.partner,
        stats: {
          totalRequests: stats.totalRequests || 0,
          todayRequests: stats.daily?.[today] || 0
        }
      }
    });
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({
      error: 'Failed to get partner details',
      message: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    if (!req.partner) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid partner authentication required'
      });
    }

    const stats = partnerStore.getPartnerStats(req.partner.id);
    
    const last30Days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      last30Days.push({
        date: dateStr,
        requests: stats.daily?.[dateStr] || 0
      });
    }

    res.json({
      success: true,
      stats: {
        totalRequests: stats.totalRequests || 0,
        last30Days
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get partner stats',
      message: error.message
    });
  }
});

router.post('/create', [
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('environment').optional().isIn(['production', 'sandbox'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const { name, email, environment = 'sandbox' } = req.body;
    
    const partner = partnerStore.createPartner(name, email, environment);
    
    res.status(201).json({
      success: true,
      partner
    });
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({
      error: 'Failed to create partner',
      message: error.message
    });
  }
});

router.get('/list', async (req, res) => {
  try {
    const partners = partnerStore.getAllPartners();
    
    res.json({
      success: true,
      partners: partners.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        environment: p.environment,
        active: p.active,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error('List partners error:', error);
    res.status(500).json({
      error: 'Failed to list partners',
      message: error.message
    });
  }
});

export default router;
