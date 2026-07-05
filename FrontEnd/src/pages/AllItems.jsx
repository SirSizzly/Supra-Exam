/*
 * "Browse all items" — the public landing page.
 * Anyone (logged in or not) can see every item any inventory manager has added.
 */
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ItemCard from '../components/ItemCard.jsx';

export default function AllItems() {
  // ---------- Local state: items + async status flags ----------
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ---------- Fetch the item list once on mount ----------
  // The `cancelled` flag prevents state updates if the component unmounts
  // while the fetch is still in flight (avoids the React warning).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.listItems();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section>
      {/* ---------- Page header ---------- */}
      <div className="page-head">
        <h1>Browse all items</h1>
        <p className="muted">Every item added by every inventory manager.</p>
      </div>

      {/* ---------- Loading / error / empty states ---------- */}
      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="muted">No items yet. Log in to be the first to add one.</p>
      )}

      {/* ---------- Item grid ---------- */}
      <div className="grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} showOwner />
        ))}
      </div>
    </section>
  );
}
