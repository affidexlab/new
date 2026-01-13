import { partnerStore } from '../utils/partnerStore.js';

export const authenticatePartner = (req, res, next) => {
  const partnerId = req.headers['x-partner-id'];

  if (!partnerId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'X-Partner-ID header is required'
    });
  }

  const partner = partnerStore.getPartner(partnerId);

  if (!partner) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid partner ID'
    });
  }

  if (!partner.active) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Partner account is inactive'
    });
  }

  req.partner = partner;
  partnerStore.recordRequest(partnerId);

  next();
};

export const optionalAuth = (req, res, next) => {
  const partnerId = req.headers['x-partner-id'];

  if (partnerId) {
    const partner = partnerStore.getPartner(partnerId);
    if (partner && partner.active) {
      req.partner = partner;
      partnerStore.recordRequest(partnerId);
    }
  }

  next();
};
