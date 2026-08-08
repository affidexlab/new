import express from 'express';
import { partnerStore } from '../../utils/partnerStore.js';

const router = express.Router();

function requirePartner(req, res) {
  const partnerId = req.headers['x-partner-id'];
  if (!partnerId) {
    res.status(401).json({ error: 'Unauthorized', message: 'X-Partner-ID header is required' });
    return null;
  }

  const partner = partnerStore.getPartner(partnerId);
  if (!partner) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid partner ID' });
    return null;
  }

  if (!partner.active) {
    res.status(403).json({ error: 'Forbidden', message: 'Partner account is inactive' });
    return null;
  }

  return { partnerId, partner };
}

function buildLast30Days(stats) {
  const daily = stats.daily || {};
  const days = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    const date = d.toISOString().split('T')[0];
    days.push({ date, requests: daily[date] || 0 });
  }

  return days;
}

router.get('/me', (req, res) => {
  const auth = requirePartner(req, res);
  if (!auth) return;

  const stats = partnerStore.getPartnerStats(auth.partnerId);
  const today = new Date().toISOString().split('T')[0];

  return res.json({
    partner: {
      ...auth.partner,
      stats: {
        totalRequests: stats.totalRequests || 0,
        todayRequests: stats.daily?.[today] || 0,
      },
    },
  });
});

router.get('/stats', (req, res) => {
  const auth = requirePartner(req, res);
  if (!auth) return;

  const stats = partnerStore.getPartnerStats(auth.partnerId);
  const today = new Date().toISOString().split('T')[0];

  return res.json({
    stats: {
      totalRequests: stats.totalRequests || 0,
      todayRequests: stats.daily?.[today] || 0,
      last30Days: buildLast30Days(stats),
    },
  });
});

export default router;
