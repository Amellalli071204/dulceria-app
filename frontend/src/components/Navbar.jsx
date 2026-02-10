import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUserLock, FaStore } from 'react-icons/fa'; // Iconos bonitos

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem', 
      background: '#ff4757', // Un rojo tipo dulcería
      color: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      {/* Logo / Nombre */}
      <Link to="/" style={{ textDecoration: 'none', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
        🍬 Dulcería App
      </Link>

      {/* Enlaces */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        
        <Link to="/catalogo" style={linkStyle}><FaStore/> Catálogo</Link>
        
        <Link to="/admin" style={linkStyle}><FaUserLock/> Admin</Link>
        
        <Link to="/carrito" style={{ ...linkStyle, background: 'white', color: '#ff4757', padding: '5px 15px', borderRadius: '20px' }}>
           <FaShoppingCart/> Carrito <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>{totalItems}</span>
        </Link>
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

const handleLogout = () => {
  // 1. Borramos absolutamente todo lo guardado
  localStorage.clear(); 
  
  // 2. Avisamos al usuario
  alert("Sesión cerrada. ¡Vuelve pronto por más dulces! 🍬");
  
  // 3. Redirigimos al inicio o al login
  window.location.href = "/login";
};

// En tu parte de retorno (JSX)
<button 
  onClick={handleLogout} 
  style={{
    background: '#ff4757',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }}
>
  Cerrar Sesión 🚪
</button>