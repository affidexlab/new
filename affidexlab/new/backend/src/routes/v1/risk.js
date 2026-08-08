import crypto from 'crypto';
import express from 'express';
import pool from '../../db/connection.js';
import { authorizeAdmin } from '../../services/adminAuth.js';
import { addRiskEdge, addRiskLabel, screenWalletInternal } from '../../services/internalRiskEngine.js';
import { ingestAlchemyTransfers, ingestAlchemyWebhookActivity } from '../../services/alchemyGraphIngestionService.js';

const router = express.Router();
function safeEqualHex(left, right) {
  const a = Buffer.from(String(left || ''), 'hex');
  const b = Buffer.from(String(right || '').replace(/^sha256=/i, ''), 'hex');
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

function configuredAlchemySigningKeys() {
  return [
    process.env.ALCHEMY_WEBHOOK_SIGNING_KEY,
    ...(process.env.ALCHEMY_WEBHOOK_SIGNING_KEYS || '').split(',')
  ].map(key => key?.trim()).filter(Boolean);
}

function verifyAlchemyWebhook(req) {
  const signingKeys = configuredAlchemySigningKeys();
  if (signingKeys.length) {
    const signature = req.headers['x-alchemy-signature'];
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    return signingKeys.some((signingKey) => {
      const digest = crypto.createHmac('sha256', signingKey).update(rawBody).digest('hex');
      return safeEqualHex(digest, signature);
    });
  }

  const sharedSecret = process.env.ALCHEMY_WEBHOOK_SECRET;
  if (sharedSecret) return req.headers['x-alchemy-webhook-secret'] === sharedSecret;
  return true;
}

const requireAdmin = (req, res) => authorizeAdmin(req, res, 'risk:admin');

router.post('/labels', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const label = await addRiskLabel(req.body);
    return res.status(201).json({ success: true, label });
  } catch (err) {
    console.error('❌ Risk label create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create risk label.' });
  }
});

router.get('/labels', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { chain, address, category, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = ['active = true'];
    if (chain) { params.push(String(chain).toLowerCase()); where.push(`chain = $${params.length}`); }
    if (address) { params.push(String(address).toLowerCase()); where.push(`lower(address) = $${params.length}`); }
    if (category) { params.push(category); where.push(`category = $${params.length}`); }
    params.push(Number(limit), Number(offset));
    const { rows } = await pool.query(
      `SELECT * FROM risk_address_labels WHERE ${where.join(' AND ')} ORDER BY updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return res.json({ success: true, labels: rows });
  } catch (err) {
    console.error('❌ Risk labels list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch labels.' });
  }
});

router.post('/edges', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const edge = await addRiskEdge(req.body);
    return res.status(201).json({ success: true, edge });
  } catch (err) {
    console.error('❌ Risk edge create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create graph edge.' });
  }
});

router.post('/screen', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { address, chain, maxHops } = req.body;
    if (!address) return res.status(400).json({ success: false, error: 'address is required.' });
    const data = await screenWalletInternal({ address, chain, maxHops });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('❌ Internal risk screen error:', err);
    return res.status(500).json({ success: false, error: 'Could not screen wallet.' });
  }
});

router.patch('/weights/:category', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { weight, enabled } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO risk_category_weights (category, weight, enabled)
       VALUES ($1, COALESCE($2, 50), COALESCE($3, true))
       ON CONFLICT (category) DO UPDATE SET weight = COALESCE($2, risk_category_weights.weight),
                                          enabled = COALESCE($3, risk_category_weights.enabled),
                                          updated_at = NOW()
       RETURNING *`,
      [req.params.category, weight ?? null, enabled ?? null]
    );
    return res.json({ success: true, weight: rows[0] });
  } catch (err) {
    console.error('❌ Risk weight update error:', err);
    return res.status(500).json({ success: false, error: 'Could not update category weight.' });
  }
});

router.post('/ingest/alchemy-transfers', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const result = await ingestAlchemyTransfers(req.body);
    return res.status(202).json({ success: true, result });
  } catch (err) {
    console.error('❌ Alchemy transfer ingestion error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Could not ingest Alchemy transfers.' });
  }
});

router.get('/webhooks/alchemy', (_req, res) => res.status(200).send('ok'));

router.post('/webhooks/alchemy', async (req, res) => {
  try {
    if (!verifyAlchemyWebhook(req)) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const activity = req.body?.event?.activity || req.body?.activity || [];
    const chain = req.body?.event?.network || req.body?.network || req.body?.chain || 'ethereum';
    const result = await ingestAlchemyWebhookActivity({ chain, activity });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('❌ Alchemy webhook ingestion error:', err);
    return res.status(500).json({ success: false, error: 'Could not ingest webhook activity.' });
  }
});

router.post('/case-reviews', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const { screeningId = null, walletAddress, chain = 'ethereum', analyst, decision, category = null, severity = 'high', notes = null } = req.body;
    if (!walletAddress) return res.status(400).json({ success: false, error: 'walletAddress is required.' });
    if (!analyst?.trim()) return res.status(400).json({ success: false, error: 'analyst is required.' });
    if (!['confirmed_risk', 'false_positive', 'needs_more_data', 'trusted'].includes(decision)) return res.status(400).json({ success: false, error: 'Invalid decision.' });

    const { rows } = await pool.query(
      `INSERT INTO risk_case_reviews (screening_id, wallet_address, chain, analyst, decision, category, severity, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [screeningId, walletAddress.toLowerCase(), String(chain).toLowerCase(), analyst, decision, category, severity, notes]
    );

    let label = null;
    let feedbackApplied = null;
    if (decision === 'confirmed_risk' && category) {
      label = await addRiskLabel({
        chain,
        address: walletAddress,
        category,
        label: `Analyst-confirmed ${category}`,
        severity,
        confidence: 0.9,
        source: 'decaflow-analyst-review',
        evidence: notes,
        metadata: { screeningId, analyst, reviewId: rows[0].id }
      });
      feedbackApplied = 'created_confirmed_risk_label';
    } else if (decision === 'false_positive') {
      const params = [String(chain).toLowerCase(), walletAddress.toLowerCase()];
      let categoryFilter = '';
      if (category) {
        params.push(category);
        categoryFilter = ` AND category = $${params.length}`;
      }
      const update = await pool.query(
        `UPDATE risk_address_labels
         SET active = false, updated_at = NOW(), metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('deactivatedByReviewId', $${params.length + 1}, 'deactivationDecision', 'false_positive')
         WHERE chain = $1 AND lower(address) = $2${categoryFilter} AND source != 'ofac-sdn' AND active = true`,
        [...params, rows[0].id]
      );
      feedbackApplied = `deactivated_${update.rowCount}_labels`;
    } else if (decision === 'trusted') {
      const update = await pool.query(
        `UPDATE risk_address_labels
         SET active = false, updated_at = NOW(), metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('deactivatedByReviewId', $3, 'deactivationDecision', 'trusted')
         WHERE chain = $1 AND lower(address) = $2 AND source NOT IN ('ofac-sdn', 'un-consolidated', 'eu-consolidated', 'uk-hmt-consolidated') AND active = true`,
        [String(chain).toLowerCase(), walletAddress.toLowerCase(), rows[0].id]
      );
      feedbackApplied = `deactivated_${update.rowCount}_labels`;
    }

    return res.status(201).json({ success: true, review: rows[0], label, feedbackApplied });
  } catch (err) {
    console.error('❌ Risk case review error:', err);
    return res.status(500).json({ success: false, error: 'Could not record case review.' });
  }
});

export default router;
