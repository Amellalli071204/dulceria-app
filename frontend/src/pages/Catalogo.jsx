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
        console.error("Error al cargar dulces", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Nuestros Dulces 🍭</h1>
      
      <div style={gridStyle}>
        {products.map(product => (
          <div key={product._id} style={instaCardStyle}>
            {/* Contenedor Cuadrado tipo Instagram */}
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

            {/* Pie de foto / Info del producto */}
            <div style={infoSectionStyle}>
              <h3 style={productNameStyle}>{product.nombre}</h3>
              <p style={priceStyle}>${product.precio} <span style={unitStyle}>c/u</span></p>
              
              {/* Candado de existencias visual */}
              <p style={stockTextStyle}>
                {product.existencias > 0 ? `Quedan: ${product.existencias}` : "Sin stock disponible"}
              </p>
              
              <button 
                onClick={() => addToCart(product)}
                disabled={product.existencias <= 0}
                style={{
                  ...btnStyle,
                  background: product.existencias > 0 ? '#E91E63' : '#BDBDBD'
                }}
              >
                {product.existencias > 0 ? "Añadir al Carrito" : "Agotado"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ESTILOS "INSTA-STYLE" 📸 ---
const containerStyle = { padding: '20px', maxWidth: '1100px', margin: '0 auto', backgroundColor: '#fafafa' };
const titleStyle = { textAlign: 'center', color: '#4A148C', marginBottom: '30px' };

const gridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
  gap: '20px' 
};

const instaCardStyle = { 
  backgroundColor: '#fff', 
  border: '1px solid #dbdbdb', 
  borderRadius: '8px', 
  overflow: 'hidden' 
};

// Este div asegura el formato 1:1 (cuadrado)
const imageWrapperStyle = { 
  width: '100%', 
  paddingTop: '100%', 
  position: 'relative', 
  backgroundColor: '#efefef' 
};

const imageStyle = { 
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%', 
  objectFit: 'cover' 
};

const badgeAgotado = {
  position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)',
  color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem'
};

const infoSectionStyle = { padding: '12px' };
const productNameStyle = { margin: '0 0 5px 0', fontSize: '1rem', fontWeight: '600' };
const priceStyle = { margin: '0', fontSize: '1.1rem', color: '#E91E63', fontWeight: 'bold' };
const unitStyle = { fontSize: '0.75rem', color: '#8e8e8e', fontWeight: 'normal' };
const stockTextStyle = { margin: '5px 0 12px 0', fontSize: '0.8rem', color: '#9C27B0' };

const btnStyle = { 
  width: '100%', padding: '10px', border: 'none', borderRadius: '4px', 
  color: 'white', fontWeight: 'bold', cursor: 'pointer' 
};