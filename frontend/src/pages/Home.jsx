import { useNavigate } from 'react-router-dom';
import { FaStore, FaUserPlus, FaHeart } from 'react-icons/fa';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={homeContainerStyle}>
      {/* Fondo decorativo con dulces (opcional, si tienes la imagen) */}
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        <img 
          src="/logo.jpg" 
          alt="Logo Dulce Mundo" 
          style={logoStyle} 
        />
        <h1 style={titleStyle}>¡Bienvenidos a Dulce Mundo! 🍭✨</h1>
        <p style={subtitleStyle}>
          Donde cada bocado es un viaje a la felicidad. Somos tu tienda de dulces favorita en Santa Isabel Ixtapan, Atenco.
        </p>
        
        <div style={infoCardStyle}>
          <h3 style={{color: '#9C27B0'}}><FaHeart /> Nuestra Misión</h3>
          <p>Endulzar tus momentos especiales con la mejor variedad de dulces, botanas y postres en el Estado de México.</p>
        </div>

        <div style={buttonContainerStyle}>
          <button onClick={() => navigate('/login')} style={btnSecondary}>
            <FaUserPlus /> Iniciar Sesión / Registrarme
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ESTILOS DULCES ---
const homeContainerStyle = { 
  height: '100vh', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  textAlign: 'center', 
  background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)', // Fondo rosa-morado pastel
  position: 'relative',
  color: '#333',
  padding: '20px'
};

const overlayStyle = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  backgroundImage: 'url("https://www.transparenttextures.com/patterns/candy.png")', // Textura de dulces sutil
  opacity: 0.3, zIndex: 1
};

const contentStyle = { zIndex: 2, maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const logoStyle = { width: '120px', height: '120px', borderRadius: '50%', border: '5px solid #E91E63', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const titleStyle = { fontSize: '2.8rem', color: '#E91E63', marginBottom: '10px', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' };
const subtitleStyle = { fontSize: '1.2rem', color: '#666', marginBottom: '30px', lineHeight: '1.6' };
const infoCardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' };
const buttonContainerStyle = { display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' };
const btnPrimary = { background: '#E91E63', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(233, 30, 99, 0.2)' };
const btnSecondary = { ...btnPrimary, background: 'white', color: '#E91E63', border: '2px solid #E91E63', boxShadow: 'none' };