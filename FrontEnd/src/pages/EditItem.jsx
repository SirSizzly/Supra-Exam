import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function EditItem() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const item = await api.getItem(id);
        if (cancelled) return;
        setName(item.name);
        setDescription(item.description);
        setQuantity(item.quantity);
        setOwnerId(item.user_id);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.updateItem(id, {
        name,
        description,
        quantity: Number(quantity),
      });
      navigate(`/items/${id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error && !ownerId) return <p className="form-error">{error}</p>;

  const isOwner = user?.id === ownerId;
  if (!isOwner) {
    return <p className="form-error">You do not have permission to edit this item.</p>;
  }

  return (
    <section className="form-page">
      <div className="page-head page-head-row">
        <h1>Item</h1>
        {!editMode && (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Toggle edit mode
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="item-form">
        <label>
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={255}
            readOnly={!editMode}
          />
        </label>
        <label>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            readOnly={!editMode}
          />
        </label>
        <label>
          <span>Quantity</span>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={0}
            required
            readOnly={!editMode}
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        {editMode && (
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(`/items/${id}`)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
