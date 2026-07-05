/*
 * One-off schema loader.
 * Runs schema.sql against the configured database to create the
 * users and items tables. Idempotent — safe to run more than once.
 * Invoke with: `npm run db:init`.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function init() {
  // ---------- Read the SQL file next to this script ----------
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // ---------- Execute it, then close the pool so the script can exit ----------
  try {
    await pool.query(sql);
    console.log('Database schema initialized.');
  } catch (err) {
    console.error('Failed to initialize schema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
