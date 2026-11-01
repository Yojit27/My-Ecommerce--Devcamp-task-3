import { Link } from 'react-router-dom';
import { formatPrice } from '../api';

export default function CartItem({ item, onChangeQty, onRemove }) {
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div className="cart-info">
        <Link to={`/product/${item._id}`}>{item.name}</Link>
        <span className="muted">{formatPrice(item.price)} each</span>
      </div>
      <div className="qty">
        <button onClick={() => onChangeQty(item._id, -1)} aria-label="Decrease quantity">−</button>
        <span>{item.qty}</span>
        <button
          onClick={() => onChangeQty(item._id, 1)}
          disabled={item.qty >= item.stock}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <strong className="line-total">{formatPrice(item.price * item.qty)}</strong>
      <button className="link-danger" onClick={() => onRemove(item._id)}>Remove</button>
    </div>
  );
}
