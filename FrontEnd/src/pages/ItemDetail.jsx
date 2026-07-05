/*
 * Single-item detail page — the "R" (read one) route.
 *
 * Public — any visitor can view. The Edit / Delete controls only render
 * when the current user is the item's owner.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ItemDetail() {
  const { id } = useParams();

  // ---------- State ----------
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { user, isAuthed } = useAuth();
  const navigate = useNavigate();

  // ---------- Load the item whenever the URL id changes ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getItem(id);
        if (!cancelled) setItem(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // ---------- Delete handler ----------
  // Confirms first so an accidental click doesn't wipe an item.
  async function handleDelete() {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.deleteItem(id);
      navigate('/inventory'); // user story: redirect back to inventory
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  // ---------- Early returns for load / error states ----------
  if (loading) return <p>Loading…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!item) return null;

  // Only the owner can edit or delete.
  const isOwner = isAuthed && user?.id === item.user_id;

  return (
    <article className="item-detail">
      <Link to="/" className="back-link">← Back to all items</Link>

      {/* ---------- Header: name + quantity ---------- */}
      <header className="detail-head">
        <h1>{item.name}</h1>
        <span className="qty-badge qty-badge-lg">Quantity: {item.quantity}</span>
      </header>

      <p className="item-owner">Added by {item.owner_username}</p>

      {/* ---------- Full description ---------- */}
      <div className="detail-body">
        <h2>Description</h2>
        <p className="detail-desc">
          {item.description || <em className="muted">No description provided.</em>}
        </p>
      </div>

      {/* ---------- Owner-only actions ---------- */}
      {isOwner && (
        <div className="detail-actions">
          <Link to={`/inventory/${item.id}/edit`} className="btn btn-primary">Edit</Link>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </article>
  );
}
