import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('shop_cart')) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i._id === product._id);
      if (found) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: Math.min(i.qty + qty, product.stock || 99) } : i
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          qty,
        },
      ];
    });
  };

  const changeQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, qty: Math.min(i.qty + delta, i.stock || 99) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const clearCart = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, changeQty, removeItem, clearCart, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
