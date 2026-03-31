import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUserLock, FaStore, FaSignOutAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "¡Esperamos verte pronto de nuevo en Dulce Mundo! 🍬",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E91E63',
      cancelButtonColor: '#4A148C',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          title: '¡Sesión cerrada!',
          text: 'Vuelve pronto.',
          icon: 'success',
          confirmButtonColor: '#E91E63',
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          navigate('/login');
          window.location.reload();
        }, 1500);
      }
    });
  };

  return (
    <nav style={navContainerStyle}>
      {/* Logo y Nombre con Efecto CANDY */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textDecoration: 'none' }}>
        <img 
          src="/logo.jpg" 
          alt="Logo Dulce Mundo" 
          style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} 
        />
        <span style={candyTitleStyle}>
          Dulce Mundo 🍭
        </span>
      </Link>

      {/* Enlaces Condicionados */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {token && (
          <Link to="/catalogo" style={linkStyle}><FaStore/> Catálogo</Link>
        )}
        
        {isAdmin && (
          <Link to="/admin" style={{ ...linkStyle, color: '#FFEB3B' }}><FaUserLock/> Admin</Link>
        )}
        
        {token && (
          <Link to="/carrito" style={cartButtonStyle}>
             <FaShoppingCart/> 
             <span>Carrito</span>
             <span style={badgeStyle}>{totalItems}</span>
          </Link>
        )}

        {token && (
          <button onClick={handleLogout} style={logoutButtonStyle}>
            <FaSignOutAlt/> Salir
          </button>
        )}
      </div>
    </nav>
  );
}

// --- NUEVO ESTILO CANDY 3D ---
const candyTitleStyle = {
  fontSize: '1.8rem',
  fontFamily: "'Fredoka One', cursive", // Asegúrate de tenerla en index.html
  color: '#FFFFFF',
  letterSpacing: '1px',
  // Este es el truco para el efecto de la imagen (borde y profundidad)
  textShadow: `
    2px 2px 0px #C2185B, 
    -1px -1px 0px #C2185B, 
    1px -1px 0px #C2185B, 
    -1px 1px 0px #C2185B,
    3px 4px 5px rgba(0,0,0,0.3)
  `
};

// --- ESTILOS ORIGINALES PRESERVADOS ---
const navContainerStyle = {
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  padding: '0.8rem 2rem', 
  background: '#E91E63', 
  color: 'white',
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1000,
  boxSizing: 'border-box'
};

const linkStyle = {
  textDecoration: 'none',
  color: 'white',
  fontSize: '1.05rem',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: '0.3s',
  fontFamily: 'Arial, sans-serif'
};

const cartButtonStyle = {
  ...linkStyle,
  background: '#9C27B0', 
  padding: '6px 15px',
  borderRadius: '25px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
};

const badgeStyle = {
  background: 'white',
  color: '#9C27B0',
  borderRadius: '50%',
  padding: '2px 7px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  marginLeft: '5px'
};

const logoutButtonStyle = {
  background: 'transparent',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.5)',
  padding: '5px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.9rem',
  transition: '0.3s'
};