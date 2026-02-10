import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  // Cargar productos al iniciar la página
  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Nuestro Catálogo de Dulces</h1>
      
      {products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Cargando dulces o no hay productos...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {products.map(p => (
            <div key={p._id} style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {/* Imagen del producto (usamos una por defecto si no tiene) */}
              <img 
                src={p.imagen || 'https://via.placeholder.com/300x200?text=Dulce'} 
                alt={p.nombre} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
              />
              
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{p.nombre}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{p.descripcion}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2ecc71' }}>${p.precio}</span>
                  <button 
                    onClick={() => addToCart(p)}
                    style={{ background: '#ff4757', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Agregar +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}