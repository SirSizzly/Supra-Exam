import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ItemCard from '../components/ItemCard.jsx';

export default function AllItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div className="page-head">
        <h1>Browse all items</h1>
        <p className="muted">Every item added by every inventory manager.</p>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="muted">No items yet. Log in to be the first to add one.</p>
      )}

      <div className="grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} showOwner />
        ))}
      </div>
    </section>
  );
}
