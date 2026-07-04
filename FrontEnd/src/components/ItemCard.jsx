import { Link } from 'react-router-dom';

function truncate(text, max = 100) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function ItemCard({ item, showOwner = false }) {
  return (
    <Link to={`/items/${item.id}`} className="card item-card">
      <div className="item-card-head">
        <h3 className="item-name">{item.name}</h3>
        <span className="qty-badge">Qty: {item.quantity}</span>
      </div>
      <p className="item-desc">{truncate(item.description, 100)}</p>
      {showOwner && item.owner_username && (
        <p className="item-owner">by {item.owner_username}</p>
      )}
    </Link>
  );
}
