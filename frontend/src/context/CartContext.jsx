import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Inicialización: Recupera el carrito de localStorage si existe
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persistencia: Cada vez que 'cart' cambie, se actualiza en localStorage de manera automática
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Vaciar carrito (Esencial para finalizar procesos de pago exitosos)
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.map(item => 
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Actualizar cantidad (incremento o decremento)
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => 
      item._id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  // Eliminar producto del carrito
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  // Cálculos derivados
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.qty * item.precio), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQty, 
      removeFromCart, 
      clearCart, // <-- Exportación correcta de la función para usarla en Cart.jsx
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};