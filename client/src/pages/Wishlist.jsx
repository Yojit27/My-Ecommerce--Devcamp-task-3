import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useWishlist } from '../context/WishlistContext';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // refetch when the saved ids change so removed items disappear
  useEffect(() => {
    api
      .get('/wishlist')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids]);

  if (loading) return <Loader />;

  if (products.length === 0) {
    return (
      <div className="empty">
        <h3>Your wishlist is empty</h3>
        <p>Tap the heart on any product to save it for later.</p>
        <Link to="/" className="btn">Find something you like</Link>
      </div>
    );
  }

  return (
    <>
      <h1>My wishlist</h1>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </>
  );
}
