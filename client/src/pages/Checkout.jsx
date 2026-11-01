import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import OrderSummary from '../components/OrderSummary';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (items.length === 0) {
    return (
      <div className="empty">
        <h3>Nothing to check out</h3>
        <p>Add something to your cart first.</p>
        <Link to="/" className="btn">Browse products</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      return setError('Enter a 10 digit phone number');
    }
    if (!/^\d{6}$/.test(form.postalCode)) {
      return setError('Postal code should be 6 digits');
    }

    setBusy(true);
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ product: i._id, qty: i.qty })),
        shipping: form,
      });
      clearCart();
      notify('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Checkout</h1>
      <div className="two-col">
        <form className="card form-card" id="checkout-form" onSubmit={handleSubmit}>
          <h3>Delivery details</h3>
          {error && <div className="alert">{error}</div>}
          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>
          <label>
            Phone number
            <input name="phone" inputMode="numeric" value={form.phone} onChange={handleChange} required />
          </label>
          <label>
            Address
            <textarea name="address" rows="3" value={form.address} onChange={handleChange} required />
          </label>
          <div className="row">
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} required />
            </label>
            <label>
              Postal code
              <input name="postalCode" inputMode="numeric" value={form.postalCode} onChange={handleChange} required />
            </label>
          </div>
          <p className="muted">Payment is cash on delivery.</p>
        </form>

        <OrderSummary items={items} subtotal={subtotal}>
          <button className="btn btn-block" form="checkout-form" disabled={busy}>
            {busy ? 'Placing order...' : 'Place order'}
          </button>
        </OrderSummary>
      </div>
    </>
  );
}
