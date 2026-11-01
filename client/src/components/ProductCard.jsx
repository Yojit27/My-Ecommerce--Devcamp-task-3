import { Link } from 'react-router-dom';
import { formatPrice } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import Stars from './Stars';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { notify } = useToast();
  const { ids, toggle } = useWishlist();
  const saved = ids.includes(product._id);
  const soldOut = product.stock === 0;

  const handleAdd = () => {
    addToCart(product);
    notify(`${product.name} added to cart`);
  };

  return (
    <div className="card product-card">
      <button
        className={`heart ${saved ? 'saved' : ''}`}
        onClick={() => toggle(product._id)}
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {saved ? '♥' : '♡'}
      </button>
      <Link to={`/product/${product._id}`} className="card-img">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="card-body">
        <span className="tag">{product.category}</span>
        <h3>
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        <Stars value={product.rating} count={product.numReviews} />
        <p className="desc">{product.description}</p>
        <div className="card-foot">
          <strong className="price">{formatPrice(product.price)}</strong>
          <button className="btn btn-small" onClick={handleAdd} disabled={soldOut}>
            {soldOut ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
