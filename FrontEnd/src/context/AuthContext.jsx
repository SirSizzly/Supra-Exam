/*
 * Auth context — global "am I logged in?" state.
 *
 * Persists the JWT and the user record in localStorage so a page refresh
 * doesn't sign the user out. Any component can call `useAuth()` to read
 * the current user or trigger login/logout.
 */
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

// ---------- Provider ----------
// Mounted once, near the root of the app (see main.jsx).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Seed the token from localStorage synchronously so isAuthed is correct
  // on the very first render (no login-flash while we rehydrate).
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // ---------- Rehydrate the user object on mount ----------
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        // Corrupt data — throw it away rather than crashing the app.
        localStorage.removeItem('user');
      }
    }
  }, []);

  // ---------- Login: called after a successful auth API call ----------
  function login({ token, user }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  // ---------- Logout: wipe both memory and localStorage ----------
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------- Hook: components call this instead of using the raw context ----------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
