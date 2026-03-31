import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCode, FaServer, FaDatabase } from 'react-icons/fa';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={homeContainerStyle}>
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        <img 
          src="/logo.jpg" 
          alt="Logo Dulce Mundo" 
          style={logoStyle} 
        />
        
        {/* TÍTULO CON ESTILO CANDY 3D Y DEGRADADO */}
        <h1 style={candyTitleStyle}>Dulce Mundo 🍭✨</h1>
        
        <p style={subtitleStyle}>
          Plataforma E-commerce desarrollada por estudiantes de <b>Ingeniería en TICs</b> de la <b>UES Atenco (UMB)</b>.
        </p>
        
        <div style={techCardStyle}>
          <h3 style={{color: '#E91E63', marginBottom: '15px'}}><FaCode /> Sobre el Proyecto</h3>
          <p style={{textAlign: 'justify', fontSize: '1rem', lineHeight: '1.5'}}>
            Esta aplicación web integra un ecosistema completo para la gestión de ventas. 
            Permite a los usuarios registrados explorar un <b>catálogo dinámico</b>, gestionar un <b>carrito de compras</b> en tiempo real 
            y realizar pedidos con múltiples métodos de pago, garantizando la persistencia de datos y seguridad.
          </p>
          <hr style={{margin: '15px 0', opacity: 0.2}} />
          <div style={stackGrid}>
            <span><FaServer /> Node.js & Express</span>
            <span><FaDatabase /> MongoDB Atlas</span>
            <span><FaCode /> React & Vite</span>
          </div>
        </div>

        <div style={buttonContainerStyle}>
          <button onClick={() => navigate('/login')} style={btnPrimary}>
            <FaUserPlus /> Acceder al Sistema
          </button>
        </div>

        <p style={{marginTop: '30px', fontSize: '0.8rem', color: '#888'}}>
          © 2026 - Proyecto de Estructura de Datos y Desarrollo Web | UMB Atenco
        </p>
      </div>
    </div>
  );
}

// --- ESTILOS CANDY PARA EL TÍTULO ---
const candyTitleStyle = {
  fontSize: '4.5rem', // Grande para que luzca
  fontFamily: "'Fredoka One', cursive",
  letterSpacing: '-1px',
  marginBottom: '20px',
  textAlign: 'center',
  // Degradado rosa a amarillo (como tu imagen)
  background: 'linear-gradient(to bottom, #FF80AB 20%, #FFF9C4 80%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  // Sombreado 3D por capas
  filter: 'drop-shadow(3px 3px 0px #E91E63) drop-shadow(6px 6px 10px rgba(0,0,0,0.2))',
  display: 'inline-block'
};

// --- ESTILOS DE ESTRUCTURA ---
const homeContainerStyle = { 
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
  textAlign: 'center', background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)', 
  position: 'relative', color: '#333', padding: '80px 20px' 
};

const overlayStyle = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  backgroundImage: 'url("https://www.transparenttextures.com/patterns/candy.png")', 
  opacity: 0.2, zIndex: 1
};

const contentStyle = { zIndex: 2, maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const logoStyle = { width: '110px', height: '110px', borderRadius: '50%', border: '4px solid #E91E63', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const subtitleStyle = { fontSize: '1.3rem', color: '#4A148C', marginBottom: '25px', fontWeight: '500' };

const techCardStyle = { 
  background: 'white', padding: '25px', borderRadius: '20px', 
  boxShadow: '0 10px 25px rgba(0,0,0,0.08)', marginBottom: '30px',
  border: '1px solid rgba(233, 30, 99, 0.1)'
};

const stackGrid = { 
  display: 'flex', justifyContent: 'space-around', fontSize: '0.9rem', 
  color: '#666', fontWeight: 'bold', gap: '10px', flexWrap: 'wrap' 
};

const buttonContainerStyle = { display: 'flex', justifyContent: 'center' };
const btnPrimary = { 
  background: '#E91E63', color: 'white', border: 'none', padding: '16px 40px', 
  borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', 
  transition: '0.3s', display: 'flex', alignItems: 'center', gap: '10px', 
  boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)' 
};