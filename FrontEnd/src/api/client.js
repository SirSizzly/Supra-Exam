const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

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

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  signup: (username, password) =>
    request('/auth/signup', { method: 'POST', body: { username, password } }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),

  listItems: () => request('/items'),
  listMyItems: () => request('/items/mine', { auth: true }),
  getItem: (id) => request(`/items/${id}`),
  createItem: (payload) => request('/items', { method: 'POST', body: payload, auth: true }),
  updateItem: (id, payload) =>
    request(`/items/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE', auth: true }),
};
