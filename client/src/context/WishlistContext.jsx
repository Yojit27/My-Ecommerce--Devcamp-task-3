import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [ids, setIds] = useState([]);

  // reload saved ids whenever someone logs in or out
  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    api
      .get('/wishlist/ids')
      .then((data) => setIds(data.ids))
      .catch(() => setIds([]));
  }, [user]);

  const toggle = async (productId) => {
    if (!user) {
      notify('Log in to save items to your wishlist', 'error');
      return false;
    }
    try {
      const data = await api.post(`/wishlist/${productId}`);
      const wasSaved = ids.includes(productId);
      setIds(data.ids);
      notify(wasSaved ? 'Removed from wishlist' : 'Saved to wishlist');
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  };

  return (
    <WishlistContext.Provider value={{ ids, toggle }}>{children}</WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
