/*
 * Tiny fetch wrapper around the backend API.
 *
 * Every UI component talks to the backend through the `api` object exported
 * at the bottom of this file — that keeps the URL paths, auth header, and
 * error handling in one place instead of scattered across pages.
 *
 * All paths hit `/api/*`. Vite's dev server proxies that to the Express
 * server on http://localhost:3001 (see vite.config.js).
 */

const BASE = '/api';

// ---------- Auth helpers ----------
// Token is stored in localStorage by AuthContext after a successful login/signup.
function getToken() {
  return localStorage.getItem('token');
}

// ---------- Core request function ----------
// Handles JSON encoding, the auth header, non-JSON responses, and error mapping.
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content (e.g. after a successful DELETE) has no body to parse.
  if (res.status === 204) return null;

  // Try to parse JSON, but fall back gracefully if the server sent plain text.
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  // Non-2xx responses become thrown errors so callers can `try/catch`.
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

// ---------- Public API surface ----------
// One method per backend route. `auth: true` means "send the JWT with this call."
export const api = {
  // Auth
  signup: (username, password) =>
    request('/auth/signup', { method: 'POST', body: { username, password } }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),

  // Items
  listItems: () => request('/items'),
  listMyItems: () => request('/items/mine', { auth: true }),
  getItem: (id) => request(`/items/${id}`),
  createItem: (payload) => request('/items', { method: 'POST', body: payload, auth: true }),
  updateItem: (id, payload) =>
    request(`/items/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE', auth: true }),
};
