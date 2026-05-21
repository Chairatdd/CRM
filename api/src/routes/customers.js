const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET /api/customers  (list with search, filter, pagination)
router.get('/', async (req, res) => {
  try {
    const { search = '', status = '', type = '', segment = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ['1=1'];
    const params = [];

    if (search) {
      where.push(`(c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.customer_code LIKE ?)`);
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status)  { where.push('c.status = ?');        params.push(status); }
    if (type)    { where.push('c.customer_type = ?'); params.push(type); }
    if (segment) { where.push('s.id = ?');            params.push(segment); }

    const whereClause = where.join(' AND ');

    const [[{ total }]] = await db.query(`
      SELECT COUNT(DISTINCT c.id) AS total
      FROM customers c
      LEFT JOIN segment_customers sc ON c.id = sc.customer_id
      LEFT JOIN segments s           ON sc.segment_id = s.id
      WHERE ${whereClause}
    `, params);

    const [rows] = await db.query(`
      SELECT c.id, c.customer_code, c.first_name, c.last_name, c.email,
             c.phone, c.city, c.province, c.customer_type, c.status,
             c.lifetime_value, c.rfm_score, c.avatar_color, c.created_at,
             GROUP_CONCAT(DISTINCT s.name ORDER BY s.id SEPARATOR ',')  AS segments,
             GROUP_CONCAT(DISTINCT s.color ORDER BY s.id SEPARATOR ',') AS segment_colors
      FROM customers c
      LEFT JOIN segment_customers sc ON c.id = sc.customer_id
      LEFT JOIN segments s           ON sc.segment_id = s.id
      WHERE ${whereClause}
      GROUP BY c.id
      ORDER BY c.lifetime_value DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const [[customer]] = await db.query(`
      SELECT c.*,
             GROUP_CONCAT(DISTINCT s.name  ORDER BY s.id SEPARATOR ',') AS segments,
             GROUP_CONCAT(DISTINCT s.color ORDER BY s.id SEPARATOR ',') AS segment_colors,
             GROUP_CONCAT(DISTINCT s.id    ORDER BY s.id SEPARATOR ',') AS segment_ids
      FROM customers c
      LEFT JOIN segment_customers sc ON c.id = sc.customer_id
      LEFT JOIN segments s           ON sc.segment_id = s.id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.id]);

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Aggregate stats
    const [[stats]] = await db.query(`
      SELECT
        COUNT(DISTINCT o.id)                  AS total_orders,
        COALESCE(SUM(o.total_amount),0)       AS total_spent,
        COUNT(DISTINCT i.id)                  AS total_interactions,
        MAX(o.order_date)                     AS last_order_date,
        MAX(i.interaction_date)               AS last_interaction_date
      FROM customers c
      LEFT JOIN orders       o ON c.id = o.customer_id AND o.status != 'Cancelled'
      LEFT JOIN interactions i ON c.id = i.customer_id
      WHERE c.id = ?
    `, [req.params.id]);

    res.json({ ...customer, stats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/customers/:id/orders
router.get('/:id/orders', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.id, o.order_number, o.status, o.total_amount, o.order_date,
             GROUP_CONCAT(CONCAT(p.name,' x',oi.quantity) SEPARATOR ' / ') AS items_summary
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p     ON oi.product_id = p.id
      WHERE o.customer_id = ?
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/customers/:id/interactions
router.get('/:id/interactions', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM interactions
      WHERE customer_id = ?
      ORDER BY interaction_date DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, gender, date_of_birth,
            address, city, province, postal_code, customer_type } = req.body;

    const [[{ maxCode }]] = await db.query(
      `SELECT MAX(CAST(SUBSTRING(customer_code, 5) AS UNSIGNED)) AS maxCode FROM customers`
    );
    const newCode = `CUS-${String((maxCode || 0) + 1).padStart(4, '0')}`;

    const [result] = await db.query(`
      INSERT INTO customers
        (customer_code, first_name, last_name, email, phone, gender,
         date_of_birth, address, city, province, postal_code, customer_type)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `, [newCode, first_name, last_name, email, phone, gender,
        date_of_birth, address, city, province, postal_code, customer_type || 'Individual']);

    res.status(201).json({ id: result.insertId, customer_code: newCode });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, gender, date_of_birth,
            address, city, province, postal_code, customer_type, status } = req.body;
    await db.query(`
      UPDATE customers SET
        first_name=?, last_name=?, email=?, phone=?, gender=?,
        date_of_birth=?, address=?, city=?, province=?, postal_code=?,
        customer_type=?, status=?
      WHERE id=?
    `, [first_name, last_name, email, phone, gender,
        date_of_birth, address, city, province, postal_code,
        customer_type, status, req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
