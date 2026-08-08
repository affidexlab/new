import express from 'express';
import pool from '../../db/connection.js';
import { addRiskEdge, addRiskLabel, screenWalletInternal } from '../../services/internalRiskEngine.js';

const router = express.Router();
const requireAdmin = (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    res.status(401).json({ success: false, error: 'Unauthorized.' });
    return false;
  }
  return true;
};

router.post('/labels', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const label = await addRiskLabel(req.body);
    return res.status(201).json({ success: true, label });
  } catch (err) {
    console.error('❌ Risk label create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create risk label.' });
  }
});

router.get('/labels', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
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
    if (!requireAdmin(req, res)) return;
    const edge = await addRiskEdge(req.body);
    return res.status(201).json({ success: true, edge });
  } catch (err) {
    console.error('❌ Risk edge create error:', err);
    return res.status(500).json({ success: false, error: 'Could not create graph edge.' });
  }
});

router.post('/screen', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
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
    if (!requireAdmin(req, res)) return;
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

export default router;
