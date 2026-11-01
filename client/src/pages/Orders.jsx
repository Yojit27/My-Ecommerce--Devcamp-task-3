import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatPrice } from '../api';
import Loader from '../components/Loader';
import StatusTracker from '../components/StatusTracker';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="empty"><h3>{error}</h3></div>;

  if (orders.length === 0) {
    return (
      <div className="empty">
        <h3>No orders yet</h3>
        <p>When you place an order it will show up here.</p>
        <Link to="/" className="btn">Start shopping</Link>
      </div>
    );
  }

  return (
    <>
      <h1>My orders</h1>
      {orders.map((order) => (
        <div className="card order-card" key={order._id}>
          <div className="order-head">
            <div>
              <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
              <div className="muted">
                {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
            <strong>{formatPrice(order.totalPrice)}</strong>
          </div>

          <StatusTracker status={order.status} />

          <ul className="order-items">
            {order.items.map((it) => (
              <li key={it.product}>
                <img src={it.image} alt={it.name} />
                <span>{it.name} × {it.qty}</span>
                <span>{formatPrice(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>

          <p className="muted">
            Delivering to {order.shipping.fullName}, {order.shipping.address}, {order.shipping.city} - {order.shipping.postalCode}
          </p>
        </div>
      ))}
    </>
  );
}
