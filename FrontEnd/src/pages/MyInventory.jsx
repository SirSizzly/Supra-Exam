import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import ItemCard from '../components/ItemCard.jsx';

export default function MyInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.listMyItems();
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
      <div className="page-head page-head-row">
        <div>
          <h1>My inventory</h1>
          <p className="muted">Items you have added.</p>
        </div>
        <Link to="/inventory/new" className="btn btn-primary">+ New item</Link>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <p>You haven't added any items yet.</p>
          <Link to="/inventory/new" className="btn btn-primary">Add your first item</Link>
        </div>
      )}

      <div className="grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
