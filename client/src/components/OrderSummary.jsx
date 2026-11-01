import { formatPrice } from '../api';

// shows each line, the subtotal and the total. children is used for the action button.
export default function OrderSummary({ items, subtotal, children }) {
  const count = items.reduce((s, i) => s + i.qty, 0);
  return (
    <aside className="summary card">
      <h3>Order summary</h3>
      <ul>
        {items.map((i) => (
          <li key={i._id}>
            <span>
              {i.name} × {i.qty}
            </span>
            <span>{formatPrice(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="summary-row">
        <span>Items ({count})</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Delivery</span>
        <span className="free">Free</span>
      </div>
      <div className="summary-row total">
        <span>Total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {children}
    </aside>
  );
}
