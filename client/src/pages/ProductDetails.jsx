import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatPrice } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import Loader from '../components/Loader';
import Stars from '../components/Stars';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { notify } = useToast();
  const { ids, toggle } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get(`/products/${id}`)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error || !product) {
    return (
      <div className="empty">
        <h3>{error || 'Product not found'}</h3>
        <Link to="/" className="btn">Back to shop</Link>
      </div>
    );
  }

  const saved = ids.includes(product._id);
  const soldOut = product.stock === 0;
  const alreadyReviewed = user && product.reviews.some((r) => r.user === user._id);

  const handleAdd = () => {
    addToCart(product, qty);
    notify(`${qty} × ${product.name} added to cart`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const updated = await api.post(`/products/${id}/reviews`, { rating, comment });
      setProduct(updated);
      setComment('');
      notify('Thanks for your review!');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <Link to="/" className="back-link">← Back to products</Link>
      <div className="details">
        <div className="details-img">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="details-info">
          <span className="tag">{product.category}</span>
          <h1>{product.name}</h1>
          <Stars value={product.rating} count={product.numReviews} />
          <p className="details-price">{formatPrice(product.price)}</p>
          <p>{product.description}</p>
          <p className={soldOut ? 'stock out' : 'stock'}>
            {soldOut ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
          </p>

          {!soldOut && (
            <div className="details-actions">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn" onClick={handleAdd}>Add to cart</button>
              <button className="btn btn-outline" onClick={() => toggle(product._id)}>
                {saved ? '♥ Saved' : '♡ Wishlist'}
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="reviews">
        <h2>Customer reviews</h2>
        {product.reviews.length === 0 && <p className="muted">No reviews yet. Be the first one!</p>}
        {product.reviews.map((r) => (
          <div key={r._id} className="review">
            <div className="review-head">
              <strong>{r.name}</strong>
              <Stars value={r.rating} />
              <small className="muted">{new Date(r.createdAt).toLocaleDateString('en-IN')}</small>
            </div>
            <p>{r.comment}</p>
          </div>
        ))}

        {user ? (
          alreadyReviewed ? (
            <p className="muted">You have already reviewed this product.</p>
          ) : (
            <form className="review-form card" onSubmit={submitReview}>
              <h3>Write a review</h3>
              <label>
                Rating
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} - {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][n]}</option>
                  ))}
                </select>
              </label>
              <label>
                Comment
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </label>
              <button className="btn" disabled={posting}>{posting ? 'Posting...' : 'Submit review'}</button>
            </form>
          )
        ) : (
          <p className="muted"><Link to="/login">Log in</Link> to write a review.</p>
        )}
      </section>
    </>
  );
}
