/*
 * JWT auth middleware.
 * requireAuth  — 401s the request if a valid token isn't present.
 * optionalAuth — attaches req.user when a token is present, but still lets
 *                unauthenticated requests through.
 */
const jwt = require('jsonwebtoken');

// ---------- requireAuth: enforce a logged-in user ----------
// Used on routes that must have a signed-in caller (create/edit/delete items,
// my inventory listing).
function requireAuth(req, res, next) {
  // Pull the token off the Authorization header (expected: "Bearer <token>").
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' });
  }

  // Verify the token, then stash the caller's identity on the request
  // so downstream handlers can read req.user.
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------- optionalAuth: attach the user if one is present, otherwise skip ----------
// Handy for public routes that still care about "is this the owner?"
// without requiring anyone to be logged in.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
  } catch (_) {
    // Token was bad — quietly treat this request as unauthenticated.
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
