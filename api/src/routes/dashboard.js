const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [[totals]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM customers)                                  AS total_customers,
        (SELECT COUNT(*) FROM customers WHERE status = 'Active')         AS active_customers,
        (SELECT COUNT(*) FROM customers
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))           AS new_customers_month,
        (SELECT COUNT(*) FROM interactions
         WHERE interaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY))     AS interactions_month,
        (SELECT COALESCE(SUM(total_amount),0) FROM orders
         WHERE status = 'Delivered'
           AND order_date >= DATE_FORMAT(NOW(),'%Y-%m-01'))              AS revenue_month,
        (SELECT COALESCE(SUM(total_amount),0) FROM orders
         WHERE status = 'Delivered'
           AND order_date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH),'%Y-%m-01')
           AND order_date <  DATE_FORMAT(NOW(),'%Y-%m-01'))              AS revenue_last_month,
        (SELECT COALESCE(SUM(total_amount),0) FROM orders
         WHERE status = 'Delivered')                                      AS total_revenue
    `);
    res.json(totals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/dashboard/revenue-trend  (last 6 months)
router.get('/revenue-trend', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(order_date, '%Y-%m') AS month,
        SUM(total_amount)                AS revenue,
        COUNT(*)                         AS order_count
      FROM orders
      WHERE status = 'Delivered'
        AND order_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(order_date, '%Y-%m')
      ORDER BY month
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/dashboard/segment-distribution
router.get('/segment-distribution', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.name, s.color, COUNT(sc.customer_id) AS count
      FROM segments s
      LEFT JOIN segment_customers sc ON s.id = sc.segment_id
      GROUP BY s.id
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/dashboard/recent-interactions
router.get('/recent-interactions', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.id, i.type, i.subject, i.outcome, i.agent_name,
             i.interaction_date,
             CONCAT(c.first_name,' ',c.last_name) AS customer_name,
             c.avatar_color
      FROM interactions i
      JOIN customers c ON i.customer_id = c.id
      ORDER BY i.interaction_date DESC
      LIMIT 8
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/dashboard/top-customers
router.get('/top-customers', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.customer_code, c.first_name, c.last_name,
             c.status, c.lifetime_value, c.rfm_score, c.avatar_color,
             GROUP_CONCAT(s.name ORDER BY s.id SEPARATOR ',') AS segments
      FROM customers c
      LEFT JOIN segment_customers sc ON c.id = sc.customer_id
      LEFT JOIN segments s           ON sc.segment_id = s.id
      GROUP BY c.id
      ORDER BY c.lifetime_value DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
