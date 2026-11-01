import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          Shop<span>Easy</span>
        </Link>

        <button
          className="menu-btn"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          {user && <NavLink to="/wishlist" onClick={close}>Wishlist</NavLink>}
          {user && <NavLink to="/orders" onClick={close}>My Orders</NavLink>}
          {user && user.role === 'admin' && (
            <>
              <NavLink to="/admin/products" onClick={close}>Manage Products</NavLink>
              <NavLink to="/admin/orders" onClick={close}>All Orders</NavLink>
            </>
          )}
          <NavLink to="/cart" onClick={close} className="cart-link">
            Cart {count > 0 && <span className="badge">{count}</span>}
          </NavLink>
          {user ? (
            <div className="nav-user">
              <span>Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-small btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <Link to="/login" className="btn btn-small btn-outline" onClick={close}>Login</Link>
              <Link to="/register" className="btn btn-small" onClick={close}>Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
