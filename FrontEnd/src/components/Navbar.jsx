import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from './AuthModal.jsx';

export default function Navbar() {
  const { user, isAuthed, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('login');
  const navigate = useNavigate();

  function openLogin() {
    setModalTab('login');
    setModalOpen(true);
  }

  function openSignup() {
    setModalTab('signup');
    setModalOpen(true);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            <Link to="/" className="brand">Inventory Manager</Link>
            <nav className="nav-links">
              <Link to="/">Browse</Link>
              {isAuthed && <Link to="/inventory">My Inventory</Link>}
            </nav>
          </div>
          <div className="navbar-right">
            {isAuthed ? (
              <>
                <span className="hello">Hi, {user?.username}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={openSignup}>Sign up</button>
                <button className="btn btn-primary" onClick={openLogin}>Log in</button>
              </>
            )}
          </div>
        </div>
      </header>

      {modalOpen && (
        <AuthModal
          initialTab={modalTab}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
