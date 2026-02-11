import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Catalogo() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Error al cargar productos", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Nuestro Catálogo de Dulces 🍭</h1>
      
      <div style={gridStyle}>
        {products.map(product => (
          <div key={product._id} style={cardStyle}>
            {/* Imagen Cuadrada con bordes redondeados arriba */}
            <div style={imageWrapperStyle}>
              <img 
                src={product.imagen || 'https://via.placeholder.com/400'} 
                alt={product.nombre} 
                style={imageStyle}
              />
              {product.existencias <= 0 && (
                <div style={badgeAgotado}>Agotado</div>
              )}
            </div>

            {/* Cuerpo de la tarjeta */}
            <div style={infoStyle}>
              <h3 style={nameStyle}>{product.nombre}</h3>
              
              {/* DESCRIPCIÓN REINCORPORADA */}
              <p style={descStyle}>{product.descripcion || "Dulce delicioso de Dulce Mundo"}</p>
              
              <p style={priceStyle}>${product.precio} <span style={unitStyle}>c/u</span></p>
              
              {/* Info de Stock */}
              <p style={stockStyle}>
                {product.existencias > 0 ? `Stock: ${product.existencias}` : "Sin existencias"}
              </p>

              <button 
                onClick={() => addToCart(product)}
                disabled={product.existencias <= 0}
                style={{
                  ...btnStyle,
                  backgroundColor: product.existencias > 0 ? '#E91E63' : '#BDBDBD',
                  cursor: product.existencias > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                {product.existencias > 0 ? "Agregar al Carrito" : "Agotado"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ESTILOS "INSTA-CARD" (Basados en Img 2) ---
const containerStyle = { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#fdfdfd' };
const titleStyle = { textAlign: 'center', color: '#E91E63', marginBottom: '40px', fontWeight: 'bold' };

const gridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
  gap: '30px' 
};

const cardStyle = { 
  backgroundColor: '#fff', 
  borderRadius: '20px', // Bordes más redondeados como en la imagen
  overflow: 'hidden', 
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)', // Sombra suave
  border: '1px solid #eee',
  transition: 'transform 0.3s ease'
};

const imageWrapperStyle = { width: '100%', paddingTop: '100%', position: 'relative' };

const imageStyle = { 
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
  objectFit: 'cover' 
};

const badgeAgotado = {
  position: 'absolute', bottom: '10px', right: '10px', backgroundColor: '#333',
  color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem'
};

const infoStyle = { padding: '20px', textAlign: 'left' };

const nameStyle = { margin: '0 0 8px 0', fontSize: '1.2rem', color: '#4A148C', fontWeight: 'bold' };

// Estilo para la descripción
const descStyle = { margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666', lineHeight: '1.4' };

const priceStyle = { margin: '0', fontSize: '1.3rem', color: '#E91E63', fontWeight: 'bold' };
const unitStyle = { fontSize: '0.8rem', color: '#999', fontWeight: 'normal' };

const stockStyle = { margin: '10px 0', fontSize: '0.85rem', color: '#9C27B0', fontWeight: '600' };

const btnStyle = { 
  width: '100%', padding: '12px', border: 'none', borderRadius: '12px', 
  color: 'white', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px',
  transition: '0.3s'
};