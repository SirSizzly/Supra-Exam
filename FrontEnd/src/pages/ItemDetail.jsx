import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { user, isAuthed } = useAuth();
  const navigate = useNavigate();

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

  async function handleDelete() {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.deleteItem(id);
      navigate('/inventory');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!item) return null;

  const isOwner = isAuthed && user?.id === item.user_id;

  return (
    <article className="item-detail">
      <Link to="/" className="back-link">← Back to all items</Link>

      <header className="detail-head">
        <h1>{item.name}</h1>
        <span className="qty-badge qty-badge-lg">Quantity: {item.quantity}</span>
      </header>

      <p className="item-owner">Added by {item.owner_username}</p>

      <div className="detail-body">
        <h2>Description</h2>
        <p className="detail-desc">{item.description || <em className="muted">No description provided.</em>}</p>
      </div>

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
