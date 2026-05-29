import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState(""); // Estado para el buscador
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/products`);
        setProductos(res.data);
      } catch (error) {
        console.error("Error al cargar productos", error);
      }
    };
    fetchProductos();
  }, []);

  // Lógica que filtra en tiempo real
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Catálogo de Dulces 🍬</h1>

      {/* Barra de Búsqueda Dinámica */}
      <div style={searchContainerStyle}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre (ej. Picafresa)..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Mensaje si no hay resultados o la cuadrícula de productos */}
      {productosFiltrados.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#757575', marginTop: '20px' }}>
          No encontramos dulces con ese nombre 😥
        </p>
      ) : (
        <div style={gridStyle}>
          {productosFiltrados.map((producto) => (
            <div key={producto._id} style={cardStyle}>
              {/* Si tus productos tienen imagen, descomenta la siguiente línea */}
              {/* <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', borderRadius: '8px' }} /> */}
              
              <h3 style={{ margin: '10px 0', color: '#4A148C' }}>{producto.nombre}</h3>
              <p style={{ color: '#E91E63', fontWeight: 'bold', fontSize: '1.2rem' }}>${producto.precio} MXN</p>
              <p style={{ fontSize: '0.9rem', color: '#757575' }}>Disponibles: {producto.existencias}</p>
              
              <button 
                onClick={() => {
                  addToCart(producto);
                  Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `${producto.nombre} agregado al carrito`,
                    showConfirmButton: false,
                    timer: 1500
                  });
                }} 
                style={producto.existencias > 0 ? btnStyle : btnDisabledStyle}
                disabled={producto.existencias <= 0}
              >
                {producto.existencias > 0 ? '🛒 Agregar' : 'Agotado'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- ESTILOS VISUALES ---
const containerStyle = { 
  padding: '2rem', 
  maxWidth: '1200px', 
  margin: '0 auto', 
  marginTop: '60px',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const titleStyle = { 
  textAlign: 'center', 
  color: '#E91E63', 
  marginBottom: '1rem',
  fontSize: '2.5rem'
};

// Estilos específicos para la barra de búsqueda
const searchContainerStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  marginBottom: '2rem' 
};

const searchInputStyle = { 
  width: '100%', 
  maxWidth: '500px', 
  padding: '15px 25px', 
  fontSize: '1.1rem', 
  borderRadius: '30px', 
  border: '2px solid #9C27B0', 
  outline: 'none',
  boxShadow: '0 4px 6px rgba(156, 39, 176, 0.1)',
  transition: 'all 0.3s ease'
};

const gridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
  gap: '25px' 
};

const cardStyle = { 
  background: '#FFF0F5', 
  padding: '20px', 
  borderRadius: '15px', 
  textAlign: 'center', 
  boxShadow: '0 4px 8px rgba(0,0,0,0.08)', 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'space-between',
  transition: 'transform 0.2s'
};

const btnStyle = { 
  padding: '12px', 
  background: '#9C27B0', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: 'bold', 
  marginTop: '15px',
  fontSize: '1rem',
  transition: 'background 0.3s'
};

const btnDisabledStyle = { 
  ...btnStyle, 
  background: '#BDBDBD', 
  cursor: 'not-allowed' 
};