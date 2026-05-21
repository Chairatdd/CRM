const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET /api/segments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, COUNT(sc.customer_id) AS customer_count
      FROM segments s
      LEFT JOIN segment_customers sc ON s.id = sc.segment_id
      GROUP BY s.id
      ORDER BY customer_count DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/segments/:id/customers
router.get('/:id/customers', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.customer_code, c.first_name, c.last_name,
             c.email, c.phone, c.status, c.lifetime_value,
             c.rfm_score, c.avatar_color, c.city, c.province
      FROM customers c
      JOIN segment_customers sc ON c.id = sc.customer_id
      WHERE sc.segment_id = ?
      ORDER BY c.lifetime_value DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
