/*
 * Shared PostgreSQL connection pool.
 * Every module that talks to the DB should import this file instead of
 * creating its own pg client — that way we open a single pool per process
 * and reuse connections between requests.
 */
require('dotenv').config();
const { Pool } = require('pg');

// ---------- Connection settings pulled from .env ----------
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// ---------- Catch pool-level errors ----------
// Without this, a single idle client failing would crash the whole process.
pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err);
});

module.exports = pool;
