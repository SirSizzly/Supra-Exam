/*
 * Item card — a single clickable summary tile used on the grid views.
 * Clicking anywhere on it navigates to the item's detail page.
 * `showOwner` is true on the public browse page (so we display "by <user>")
 * and false on My Inventory (where every card is yours already).
 */
import { Link } from 'react-router-dom';

// ---------- Description truncation ----------
// The rubric asks for the first 100 chars followed by "..." on list views.
function truncate(text, max = 100) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function ItemCard({ item, showOwner = false }) {
  return (
    <Link to={`/items/${item.id}`} className="card item-card">
      {/* ---------- Header row: name + quantity badge ---------- */}
      <div className="item-card-head">
        <h3 className="item-name">{item.name}</h3>
        <span className="qty-badge">Qty: {item.quantity}</span>
      </div>

      {/* ---------- Truncated description ---------- */}
      <p className="item-desc">{truncate(item.description, 100)}</p>

      {/* ---------- Owner attribution (browse view only) ---------- */}
      {showOwner && item.owner_username && (
        <p className="item-owner">by {item.owner_username}</p>
      )}
    </Link>
  );
}
