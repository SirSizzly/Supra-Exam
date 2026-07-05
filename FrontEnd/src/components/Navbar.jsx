/*
 * Top navigation bar.
 *
 * Left side  — brand + primary nav links.
 * Right side — either "Log in" (opens the auth modal) or a greeting + Log out.
 *
 * The AuthModal itself lives here so the login button and the modal share
 * open/close state without a global store.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from './AuthModal.jsx';

export default function Navbar() {
  const { user, isAuthed, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('login');
  const navigate = useNavigate();

  // ---------- Open the auth modal on the "Log in" tab ----------
  // (The modal still lets the user switch to the "Create account" tab from inside.)
  function openLogin() {
    setModalTab('login');
    setModalOpen(true);
  }

  // ---------- Log out and bounce back to the browse page ----------
  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">

          {/* ---------- Left: brand + nav links ---------- */}
          <div className="navbar-left">
            <Link to="/" className="brand">Inventory Manager</Link>
            <nav className="nav-links">
              <Link to="/">Browse</Link>
              {isAuthed && <Link to="/inventory">My Inventory</Link>}
            </nav>
          </div>

          {/* ---------- Right: auth controls ---------- */}
          <div className="navbar-right">
            {isAuthed ? (
              <>
                <span className="hello">Hi, {user?.username}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={openLogin}>Log in</button>
            )}
          </div>
        </div>
      </header>

      {/* Only render the modal when it's open — keeps its state fresh each time. */}
      {modalOpen && (
        <AuthModal
          initialTab={modalTab}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
