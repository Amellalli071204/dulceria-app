import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUserLock, FaStore, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.clear();
    alert("¡Vuelve pronto a Dulce Mundo! 🍬");
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '0.8rem 2rem', 
      background: '#E91E63', // Rosa vibrante del logo
      color: 'white',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
    }}>
      {/* Logo e Imagen */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' }}>
        <img 
          src="/logo.jpg" 
          alt="Logo Dulce Mundo" 
          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }} 
        />
        <span style={{ fontSize: '1.6rem', fontWeight: 'bold', letterSpacing: '1px' }}>
          Dulce Mundo 🍭
        </span>
      </Link>

      {/* Enlaces */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        
        <Link to="/catalogo" style={linkStyle}><FaStore/> Catálogo</Link>
        
        {isAdmin && (
          <Link to="/admin" style={{ ...linkStyle, color: '#FFEB3B' }}><FaUserLock/> Admin</Link>
        )}
        
        <Link to="/carrito" style={cartButtonStyle}>
           <FaShoppingCart/> 
           <span>Carrito</span>
           <span style={badgeStyle}>{totalItems}</span>
        </Link>

        {token && (
          <button onClick={handleLogout} style={logoutButtonStyle}>
            <FaSignOutAlt/> Salir
          </button>
        )}
      </div>
    </nav>
  );
}

// --- ESTILOS PERSONALIZADOS CON LA PALETA DEL LOGO ---
const linkStyle = {
  textDecoration: 'none',
  color: 'white',
  fontSize: '1.05rem',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: '0.3s'
};

const cartButtonStyle = {
  ...linkStyle,
  background: '#9C27B0', // Púrpura del logo
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