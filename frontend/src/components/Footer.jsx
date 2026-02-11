export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={contentStyle}>
        <p style={brandStyle}>Dulce Mundo 🍭</p>
        <p style={teamTitleStyle}>Desarrollado por:</p>
        <div style={namesGridStyle}>
          <span>Amellalli</span>
          <span>Juan Carlos</span>
          <span>José</span>
        </div>
        <p style={copyrightStyle}>© 2026 UMB Atenco - Todos los derechos reservados</p>
      </div>
    </footer>
  );
}

// --- ESTILOS ---
const footerStyle = {
  backgroundColor: '#4A148C', // Morado oscuro para que contraste con el rosa
  color: 'white',
  padding: '40px 20px',
  marginTop: '50px',
  textAlign: 'center',
  borderTop: '5px solid #E91E63' // Línea rosa mexicano arriba
};

const contentStyle = {
  maxWidth: '800px',
  margin: '0 auto'
};

const brandStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '10px',
  letterSpacing: '1px'
};

const teamTitleStyle = {
  fontSize: '0.9rem',
  opacity: '0.8',
  marginBottom: '15px',
  textTransform: 'uppercase'
};

const namesGridStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  fontSize: '1.1rem',
  fontWeight: '500',
  marginBottom: '20px'
};

const copyrightStyle = {
  fontSize: '0.8rem',
  opacity: '0.6',
  marginTop: '20px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  paddingTop: '15px'
};