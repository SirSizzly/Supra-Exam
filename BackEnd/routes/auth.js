/*
 * Auth routes.
 *   POST /api/auth/signup — create a new account
 *   POST /api/auth/login  — log in with an existing account
 *
 * Both endpoints return { token, user } on success. The token is a JWT the
 * client stores in localStorage and sends back as "Authorization: Bearer <token>".
 */
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

// bcrypt work factor — 10 is the common default (~100ms per hash).
const SALT_ROUNDS = 10;

// ---------- Helper: sign a JWT for the given user ----------
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ---------- POST /signup: create an account ----------
router.post('/signup', async (req, res) => {
  const { username, password } = req.body || {};

  // Basic input validation before we hit the DB.
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: 'Username must be 3–50 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Hash the password so we never store the plain-text version.
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert the new user, get the row back (minus the hash).
    const { rows } = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hash]
    );
    const user = rows[0];

    // Sign the user in immediately by handing back a token.
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    // 23505 = Postgres unique_violation — the username is already taken.
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- POST /login: check credentials, hand back a token ----------
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Look up the user (including the stored hash for comparison).
    const { rows } = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );
    const user = rows[0];

    // Return the same message for "no such user" and "wrong password"
    // so we don't leak which usernames exist.
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
