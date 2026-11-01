import { useEffect, useState } from 'react';
import { api, formatPrice } from '../api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { notify } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders')
      .then(setOrders)
      .catch((err) => notify(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      const updated = await api.put(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: updated.status } : o)));
      notify(`Order marked as ${status}`);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <h1>All orders</h1>
      {orders.length === 0 ? (
        <div className="empty"><h3>No orders yet</h3></div>
      ) : (
        orders.map((o) => (
          <div className="card order-card" key={o._id}>
            <div className="order-head">
              <div>
                <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                <div className="muted">
                  {o.user ? `${o.user.name} (${o.user.email})` : 'Deleted user'} &middot;{' '}
                  {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <strong>{formatPrice(o.totalPrice)}</strong>
            </div>
            <ul className="order-items">
              {o.items.map((it) => (
                <li key={it.product}>
                  <img src={it.image} alt={it.name} />
                  <span>{it.name} × {it.qty}</span>
                  <span>{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="muted">
              {o.shipping.fullName}, {o.shipping.phone} - {o.shipping.address}, {o.shipping.city} {o.shipping.postalCode}
            </p>
            <label className="status-select">
              Status
              <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        ))
      )}
    </>
  );
}
