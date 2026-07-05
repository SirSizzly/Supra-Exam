/*
 * Login / Create-account modal.
 *
 * A single form with two tabs — the active tab decides which endpoint we hit
 * on submit. On success we stash the token via the auth context and send the
 * user straight to their inventory.
 *
 * Closes on: the × button, the Esc key, or a click on the backdrop.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ initialTab = 'login', onClose }) {
  // ---------- Form state ----------
  const [tab, setTab] = useState(initialTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ---------- Reset fields whenever the user flips tabs ----------
  useEffect(() => {
    setError('');
    setUsername('');
    setPassword('');
  }, [tab]);

  // ---------- Close on Esc so keyboard users aren't trapped ----------
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ---------- Submit: pick signup vs login based on the active tab ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result =
        tab === 'login'
          ? await api.login(username, password)
          : await api.signup(username, password);
      login(result);          // save token + user in the auth context
      onClose();
      navigate('/inventory'); // per the user story: redirect after login
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    // Clicking the dimmed backdrop closes the modal…
    <div className="modal-backdrop" onMouseDown={onClose}>
      {/* …but clicks inside the modal itself shouldn't bubble up and close it. */}
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {/* ---------- Tabs: Log in / Create account ---------- */}
        <div className="tabs">
          <button
            className={`tab ${tab === 'login' ? 'tab-active' : ''}`}
            onClick={() => setTab('login')}
          >
            Log in
          </button>
          <button
            className={`tab ${tab === 'signup' ? 'tab-active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Create account
          </button>
        </div>

        {/* ---------- Shared form ---------- */}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={50}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
