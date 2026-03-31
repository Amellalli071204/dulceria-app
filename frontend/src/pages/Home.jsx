import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCode, FaServer, FaDatabase } from 'react-icons/fa';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={homeContainerStyle}>
      {/* Textura de fondo sutil */}
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        <img 
          src="/logo.jpg" 
          alt="Logo Dulce Mundo" 
          style={logoStyle} 
        />
        
        {/* TÍTULO ESTILO STICKER (Blanco con borde rosa) */}
        <h1 style={candyTitleStyle}>Dulce Mundo</h1>
        
        <p style={subtitleStyle}>
          Plataforma E-commerce desarrollada por alumnos de <b>Ingeniería en TICs</b> de la <b>UES Atenco (UMB)</b>.
        </p>
        
        {/* TARJETA TÉCNICA */}
        <div style={techCardStyle}>
          <h3 style={{color: '#E91E63', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
            <FaCode /> Sobre el Proyecto
          </h3>
          <p style={{textAlign: 'justify', fontSize: '1.05rem', lineHeight: '1.6', color: '#444'}}>
            Esta aplicación web es un desarrollo integral que gestiona el ciclo de venta de productos de confitería. 
            Implementa un <b>catálogo dinámico</b>, un <b>carrito de compras</b> con persistencia de datos y un 
            <b> panel administrativo</b> robusto para el control de inventarios y usuarios.
          </p>
          <hr style={{margin: '20px 0', opacity: 0.1}} />
          <div style={stackGrid}>
            <span><FaServer /> Node.js & Express</span>
            <span><FaDatabase /> MongoDB Atlas</span>
            <span><FaCode /> React & Vite</span>
          </div>
        </div>

        {/* BOTÓN DE ACCESO */}
        <div style={buttonContainerStyle}>
          <button onClick={() => navigate('/login')} style={btnPrimary}>
            <FaUserPlus /> Acceder al Sistema
          </button>
        </div>

        <p style={{marginTop: '40px', fontSize: '0.85rem', color: '#888', fontWeight: '500'}}>
          © 2026 - Proyecto de Ingeniería | UMB Atenco
        </p>
      </div>
    </div>
  );
}

// --- ESTILOS REFINADOS ---
const homeContainerStyle = { 
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
  textAlign: 'center', background: 'linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%)', 
  position: 'relative', color: '#333', padding: '60px 20px', overflowX: 'hidden'
};

const overlayStyle = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  backgroundImage: 'url("https://www.transparenttextures.com/patterns/candy.png")', 
  opacity: 0.15, zIndex: 1
};

const contentStyle = { zIndex: 2, maxWidth: '750px', display: 'flex', flexDirection: 'column', alignItems: 'center' };

const logoStyle = { 
  width: '120px', height: '120px', borderRadius: '50%', 
  border: '5px solid #E91E63', marginBottom: '25px', 
  boxShadow: '0 8px 20px rgba(233, 30, 99, 0.2)' 
};

const candyTitleStyle = {
  fontSize: '4.8rem',
  fontFamily: "'Fredoka One', cursive",
  color: '#FFFFFF',
  letterSpacing: '1px',
  marginBottom: '15px',
  display: 'inline-block',
  // Efecto de borde rosa fuerte y sombra de profundidad
  textShadow: `
    3px 3px 0px #E91E63, 
    -1px -1px 0px #E91E63, 
    1px -1px 0px #E91E63, 
    -1px 1px 0px #E91E63,
    0px 10px 25px rgba(233, 30, 99, 0.25)
  `
};

const subtitleStyle = { 
  fontSize: '1.25rem', color: '#4A148C', marginBottom: '35px', 
  lineHeight: '1.4', maxWidth: '600px' 
};

const techCardStyle = { 
  background: 'rgba(255, 255, 255, 0.9)', padding: '30px', borderRadius: '24px', 
  boxShadow: '0 12px 30px rgba(0,0,0,0.06)', marginBottom: '35px',
  border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(5px)'
};

const stackGrid = { 
  display: 'flex', justifyContent: 'space-around', fontSize: '0.95rem', 
  color: '#666', fontWeight: 'bold', gap: '15px', flexWrap: 'wrap' 
};

const buttonContainerStyle = { display: 'flex', justifyContent: 'center' };

const btnPrimary = { 
  background: '#E91E63', color: 'white', border: 'none', padding: '18px 45px', 
  borderRadius: '35px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', 
  transition: '0.3s', display: 'flex', alignItems: 'center', gap: '12px', 
  boxShadow: '0 6px 15px rgba(233, 30, 99, 0.3)' 
};