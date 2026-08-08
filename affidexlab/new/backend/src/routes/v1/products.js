import express from 'express';
import pool from '../../db/connection.js';

const router = express.Router();

function publicFields(row) {
  return {
    productKey: row.product_key,
    productName: row.product_name,
    publicStatus: row.public_status,
    acceptingCustomers: row.accepting_customers,
    priority: row.priority,
    publicMessage: row.public_message,
    updatedAt: row.updated_at
  };
}

router.get('/status', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT product_key, product_name, public_status, accepting_customers, priority, public_message, updated_at
       FROM product_control_settings ORDER BY product_name ASC`
    );
    return res.json({ success: true, products: rows.map(publicFields) });
  } catch (err) {
    console.error('❌ Product status list error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch product status.' });
  }
});

router.get('/status/:productKey', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT product_key, product_name, public_status, accepting_customers, priority, public_message, updated_at
       FROM product_control_settings WHERE product_key = $1 LIMIT 1`,
      [req.params.productKey]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Product not found.' });
    return res.json({ success: true, product: publicFields(rows[0]) });
  } catch (err) {
    console.error('❌ Product status fetch error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch product status.' });
  }
});

export default router;
