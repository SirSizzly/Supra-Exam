/*
 * Item CRUD routes.
 *
 * Public (no auth required):
 *   GET    /api/items       — list every item, with owner username
 *   GET    /api/items/:id   — show one item
 *
 * Auth required:
 *   GET    /api/items/mine  — items owned by the caller
 *   POST   /api/items       — create an item
 *   PUT    /api/items/:id   — edit an item (owner only)
 *   DELETE /api/items/:id   — delete an item (owner only)
 */
const express = require('express');
const pool = require('../db/pool');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ---------- GET / — public, list all items ----------
// Joins users so each item card can show "by <username>".
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.name, i.description, i.quantity, i.created_at, i.updated_at,
              i.user_id, u.username AS owner_username
       FROM items i
       JOIN users u ON u.id = i.user_id
       ORDER BY i.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('List items error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- GET /mine — auth, only the caller's items ----------
// Must be declared BEFORE `/:id` or "mine" would be treated as an id param.
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, quantity, created_at, updated_at, user_id
       FROM items
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('My items error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- GET /:id — public, one item ----------
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.name, i.description, i.quantity, i.created_at, i.updated_at,
              i.user_id, u.username AS owner_username
       FROM items i
       JOIN users u ON u.id = i.user_id
       WHERE i.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- POST / — auth, create a new item under the caller ----------
router.post('/', requireAuth, async (req, res) => {
  const { name, description, quantity } = req.body || {};

  // Validate the required fields before hitting the DB.
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const qty = Number.isFinite(Number(quantity)) ? Number(quantity) : 0;
  if (qty < 0) {
    return res.status(400).json({ error: 'Quantity must be zero or greater' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO items (user_id, name, description, quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, quantity, user_id, created_at, updated_at`,
      [req.user.id, name.trim(), (description || '').trim(), qty]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- PUT /:id — auth + owner-only, update ----------
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  // Same shape as create — validate first.
  const { name, description, quantity } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const qty = Number.isFinite(Number(quantity)) ? Number(quantity) : 0;
  if (qty < 0) {
    return res.status(400).json({ error: 'Quantity must be zero or greater' });
  }

  try {
    // Ownership check — you can only edit items you own.
    const existing = await pool.query('SELECT user_id FROM items WHERE id = $1', [id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Item not found' });
    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this item' });
    }

    const { rows } = await pool.query(
      `UPDATE items
         SET name = $1, description = $2, quantity = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, description, quantity, user_id, created_at, updated_at`,
      [name.trim(), (description || '').trim(), qty, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- DELETE /:id — auth + owner-only, remove ----------
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }
  try {
    // Same ownership check as PUT.
    const existing = await pool.query('SELECT user_id FROM items WHERE id = $1', [id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Item not found' });
    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this item' });
    }

    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
