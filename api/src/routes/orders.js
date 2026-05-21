const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { status = '', page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where  = ['1=1'];
    const params = [];
    if (status) { where.push('o.status = ?'); params.push(status); }
    const whereClause = where.join(' AND ');

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM orders o WHERE ${whereClause}`, params
    );

    const [rows] = await db.query(`
      SELECT o.id, o.order_number, o.status, o.total_amount, o.order_date,
             CONCAT(c.first_name,' ',c.last_name) AS customer_name,
             c.customer_code, c.avatar_color
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE ${whereClause}
      ORDER BY o.order_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
