/*
 * Express entry point.
 * Loads env vars, wires up global middleware, mounts the auth + items routers,
 * catches unknown routes with a 404, then starts listening.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();

// ---------- Global middleware ----------
// CORS lets the Vite dev server on port 5173 talk to us on 3001.
// express.json() parses JSON request bodies into req.body.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// ---------- Health check ----------
// Handy for smoke tests and uptime probes.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---------- Feature routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// ---------- 404 fallback ----------
// Anything that didn't match a route above lands here.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------- Start server ----------
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
