import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUserLock, FaStore, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  // Verificamos si hay sesión activa y si es admin
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.clear(); // Borra token, nombre, teléfono e isAdmin
    alert("Sesión cerrada. ¡Vuelve pronto! 🍬");
    navigate('/login');
    window.location.reload(); // Recarga para limpiar estados globales
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem', 
      background: '#ff4757', 
      color: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
        🍬 Dulce Mundo 
      </Link>

      {/* Enlaces */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        
        <Link to="/catalogo" style={linkStyle}><FaStore/> Catálogo</Link>
        
        {/* Solo mostramos Admin si el usuario es administrador */}
        {isAdmin && (
          <Link to="/admin" style={linkStyle}><FaUserLock/> Admin</Link>
        )}
        
        <Link to="/carrito" style={{ ...linkStyle, background: 'white', color: '#ff4757', padding: '5px 15px', borderRadius: '20px' }}>
           <FaShoppingCart/> Carrito <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>{totalItems}</span>
        </Link>

        {/* Botón de Logout: solo aparece si hay un token activo */}
        {token && (
          <button onClick={handleLogout} style={logoutButtonStyle}>
            <FaSignOutAlt/> Salir
          </button>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  textDecoration: 'none',
  color: 'white',
  fontSize: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '5px'
};

const logoutButtonStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  border: '1px solid white',
  padding: '5px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '1rem'
};