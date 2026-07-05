-- ============================================================
--  Database schema for the inventory app.
--  Loaded by `npm run db:init` (see db/init.js).
-- ============================================================

-- ---------- users: one row per registered inventory manager ----------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,   -- bcrypt hash — never store plain text
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- items: one row per inventory entry, owned by a user ----------
-- ON DELETE CASCADE means if a user is removed their items go with them.
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Speeds up "my inventory" queries that filter by owner.
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
