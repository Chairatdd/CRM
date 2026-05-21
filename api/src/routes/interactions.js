const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET /api/interactions
router.get('/', async (req, res) => {
  try {
    const { type = '', outcome = '', page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where  = ['1=1'];
    const params = [];
    if (type)    { where.push('i.type = ?');    params.push(type); }
    if (outcome) { where.push('i.outcome = ?'); params.push(outcome); }
    const whereClause = where.join(' AND ');

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM interactions i WHERE ${whereClause}`, params
    );

    const [rows] = await db.query(`
      SELECT i.*,
             CONCAT(c.first_name,' ',c.last_name) AS customer_name,
             c.customer_code, c.avatar_color
      FROM interactions i
      JOIN customers c ON i.customer_id = c.id
      WHERE ${whereClause}
      ORDER BY i.interaction_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/interactions
router.post('/', async (req, res) => {
  try {
    const { customer_id, type, subject, notes, outcome, agent_name } = req.body;
    const [result] = await db.query(`
      INSERT INTO interactions (customer_id, type, subject, notes, outcome, agent_name)
      VALUES (?,?,?,?,?,?)
    `, [customer_id, type, subject, notes, outcome || 'Neutral', agent_name]);
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
