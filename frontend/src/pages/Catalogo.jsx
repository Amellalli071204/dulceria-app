import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Catalogo() {
  const [products, setProducts] = useState([]);
  const [busqueda, setBusqueda] = useState(""); // Estado para el buscador
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

  // Filtrado dinámico en tiempo real
  const productosFiltrados = products.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem', marginTop: '70px' }}>
      <h1 style={{ textAlign: 'center', color: '#E91E63', fontSize: '1.8rem', marginBottom: '15px' }}>
        Nuestros Dulces 🍭
      </h1>

      {/* Barra de Búsqueda */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre (ej. Picafresa)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {productosFiltrados.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#757575', marginTop: '20px' }}>
          No encontramos dulces con ese nombre 😥
        </p>
      ) : (
        <div style={gridStyle}>
          {productosFiltrados.map(p => (
            <div key={p._id} style={cardStyle}>
              
              {/* IMAGEN RESTAURADA CON TUS ESTILOS */}
              <div style={imgContainer}>
                <img src={p.imagen || '/placeholder.jpg'} alt={p.nombre} style={imgStyle} />
              </div>
              
              <h4 style={titleStyle}>{p.nombre}</h4>
              <p style={priceStyle}>${p.precio || p.price}</p>
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
      )}
    </div>
  );
}

// --- ESTILOS COMPACTOS (Catálogo + Buscador) ---

const searchContainerStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  marginBottom: '25px' 
};

const searchInputStyle = { 
  width: '100%', 
  maxWidth: '400px', 
  padding: '12px 20px', 
  fontSize: '1rem', 
  borderRadius: '25px', 
  border: '2px solid #9C27B0', 
  outline: 'none',
  boxShadow: '0 4px 6px rgba(156, 39, 176, 0.1)'
};

const gridStyle = { 
  display: 'grid', 
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
  height: '110px', 
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
  fontSize: '0.95rem', 
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