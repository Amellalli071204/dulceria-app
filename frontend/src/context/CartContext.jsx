import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Aquí guardamos los productos del carrito
  const [cart, setCart] = useState([]);

  // Función para agregar producto
  const addToCart = (product) => {
    setCart(prev => {
      // ¿El producto ya está en el carrito?
      const existing = prev.find(p => p._id === product._id);
      if (existing) {
        // Si sí, solo aumentamos la cantidad
        return prev.map(p => p._id === product._id ? { ...p, qty: p.qty + 1 } : p);
      }
      // Si no, lo agregamos con cantidad 1
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Función para quitar producto del carrito
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p._id !== id));
  };

  // Función para subir o bajar cantidad
  const updateQty = (id, amount) => {
    setCart(prev => prev.map(p => {
      if (p._id === id) {
        const newQty = p.qty + amount;
        return newQty > 0 ? { ...p, qty: newQty } : p;
      }
      return p;
    }));
  };

  // Calcular totales automáticamente
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.qty), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

// Un pequeño atajo para usar el contexto más fácil
export const useCart = () => useContext(CartContext);