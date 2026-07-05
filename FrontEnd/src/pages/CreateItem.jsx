/*
 * "Create item" form — the "C" in CRUD.
 * On success, the user story says to redirect back to My Inventory.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function CreateItem() {
  // ---------- Form state ----------
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // ---------- Submit handler ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.createItem({
        name,
        description,
        quantity: Number(quantity),
      });
      navigate('/inventory'); // per the user story
    } catch (err) {
      setError(err.message);
      setBusy(false); // stay on the page so the user can fix and retry
    }
  }

  return (
    <section className="form-page">
      <h1>Create a new item</h1>

      <form onSubmit={handleSubmit} className="item-form">
        {/* ---------- Name ---------- */}
        <label>
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={255}
          />
        </label>

        {/* ---------- Description ---------- */}
        <label>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </label>

        {/* ---------- Quantity ---------- */}
        <label>
          <span>Quantity</span>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={0}
            required
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        {/* ---------- Actions ---------- */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/inventory')}
          >
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create item'}
          </button>
        </div>
      </form>
    </section>
  );
}
