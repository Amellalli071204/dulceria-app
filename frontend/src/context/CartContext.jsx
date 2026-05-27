import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Inicialización: Recupera el carrito de localStorage si existe
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persistencia: Cada vez que 'cart' cambie, se actualiza en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.map(item => 
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // Se inicializa con qty: 1
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

  // Vaciar carrito (esencial para finalizar procesos de pago)
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
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
      clearCart, 
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};