import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';

export default function Cart() {
  const { items, changeQty, removeItem, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="empty">
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn">Start shopping</Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Your cart</h1>
        <button className="link-danger" onClick={clearCart}>Clear cart</button>
      </div>
      <div className="two-col">
        <div className="card cart-list">
          {items.map((item) => (
            <CartItem key={item._id} item={item} onChangeQty={changeQty} onRemove={removeItem} />
          ))}
        </div>
        <OrderSummary items={items} subtotal={subtotal}>
          <button className="btn btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
        </OrderSummary>
      </div>
    </>
  );
}
