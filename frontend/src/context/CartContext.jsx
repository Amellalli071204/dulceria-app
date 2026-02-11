import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- ESTA ES LA FUNCIÓN QUE NOS FALTA ---
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) return prev.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => item._id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.qty * item.precio), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQty, 
      removeFromCart, 
      clearCart, // <-- MUY IMPORTANTE: Debe exportarse aquí
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};