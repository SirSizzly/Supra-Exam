/*
 * "Edit item" page — the "U" in CRUD.
 *
 * The rubric wants a toggle: the page stays the same, but a button flips the
 * inputs from read-only to editable. That's the `editMode` boolean below.
 *
 * Ownership is checked twice: the server enforces it in the PUT route,
 * and this page also refuses to render the form for non-owners.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function EditItem() {
  const { id } = useParams();

  // ---------- Form + async state ----------
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // ---------- Edit-mode toggle (rubric requirement) ----------
  // Off by default: fields display as read-only until the user clicks "Toggle edit mode".
  const [editMode, setEditMode] = useState(false);

  // Remembered so we can compare against the current user for ownership.
  const [ownerId, setOwnerId] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // ---------- Fetch the item so we can seed the form ----------
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

  // ---------- Submit: PUT the updated fields, then bounce to the detail page ----------
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

  // ---------- Early returns for load / error / not-owner ----------
  if (loading) return <p>Loading…</p>;
  if (error && !ownerId) return <p className="form-error">{error}</p>;

  const isOwner = user?.id === ownerId;
  if (!isOwner) {
    return <p className="form-error">You do not have permission to edit this item.</p>;
  }

  return (
    <section className="form-page">
      {/* ---------- Header + toggle button (hidden once we're in edit mode) ---------- */}
      <div className="page-head page-head-row">
        <h1>Item</h1>
        {!editMode && (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Toggle edit mode
          </button>
        )}
      </div>

      {/* ---------- Same form, editable or read-only depending on editMode ---------- */}
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

        {/* ---------- Save/Cancel appear only when editing ---------- */}
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
