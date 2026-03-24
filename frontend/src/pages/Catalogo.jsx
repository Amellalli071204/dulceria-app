import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Catalogo() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get(`${apiUrl}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleAdd = (product) => {
    addToCart(product);
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
    Toast.fire({
      icon: 'success',
      title: `${product.nombre} al carrito 🍬`
    });
  };

  return (
    <div style={{ padding: '1rem', marginTop: '70px' }}>
      <h1 style={{ textAlign: 'center', color: '#E91E63', fontSize: '1.8rem', marginBottom: '20px' }}>
        Nuestros Dulces 🍭
      </h1>
      
      {/* Grid ajustado para tarjetas más pequeñas */}
      <div style={gridStyle}>
        {products.map(p => (
          <div key={p._id} style={cardStyle}>
            <div style={imgContainer}>
              <img src={p.imagen || '/placeholder.jpg'} alt={p.nombre} style={imgStyle} />
            </div>
            <h4 style={titleStyle}>{p.nombre}</h4>
            <p style={priceStyle}>${p.price || p.precio}</p>
            <p style={stockStyle}>Stock: {p.existencias}</p>
            
            <button 
              onClick={() => handleAdd(p)} 
              disabled={p.existencias <= 0}
              style={{ 
                ...btnStyle, 
                background: p.existencias > 0 ? '#9C27B0' : '#ccc' 
              }}
            >
              {p.existencias > 0 ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ESTILOS COMPACTOS ---

const gridStyle = { 
  display: 'grid', 
  // Ahora el mínimo es 160px para que quepan más por fila
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
  gap: '15px', 
  maxWidth: '1000px', 
  margin: '0 auto' 
};

const cardStyle = { 
  background: 'white', 
  padding: '10px', 
  borderRadius: '12px', 
  textAlign: 'center', 
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
  border: '1px solid #FCE4EC',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const imgContainer = {
  width: '100%',
  height: '110px', // Altura reducida
  overflow: 'hidden',
  borderRadius: '8px',
  marginBottom: '8px'
};

const imgStyle = { 
  width: '100%', 
  height: '100%', 
  objectFit: 'cover' 
};

const titleStyle = { 
  color: '#4A148C', 
  fontSize: '0.95rem', // Letra más pequeña
  margin: '5px 0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis' 
};

const priceStyle = { 
  fontWeight: 'bold', 
  fontSize: '1.1rem', 
  color: '#E91E63', 
  margin: '2px 0' 
};

const stockStyle = { 
  fontSize: '0.75rem', 
  color: '#666', 
  marginBottom: '8px' 
};

const btnStyle = { 
  width: '100%', 
  padding: '8px', 
  color: 'white', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: 'bold', 
  fontSize: '0.85rem',
  transition: '0.2s' 
};