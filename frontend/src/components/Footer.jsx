export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={contentStyle}>
        <p style={brandStyle}>Dulce Mundo 🍭</p>
        <div style={namesGridStyle}>
          <span style={teamTitleStyle}>Desarrollado por:</span>
          <span>Amellalli</span>
          <span>Juan Carlos</span>
          <span>José</span>
        </div>
        <p style={copyrightStyle}>© 2026 UMB Atenco</p>
      </div>
    </footer>
  );
}

// --- ESTILOS COMPACTOS ---
const footerStyle = {
  backgroundColor: '#4A148C',
  color: 'white',
  padding: '15px 20px', // Reducido de 40px a 15px
  marginTop: '30px',    // Menos espacio arriba
  textAlign: 'center',
  borderTop: '3px solid #E91E63' // Línea más delgada (de 5px a 3px)
};

const contentStyle = {
  maxWidth: '600px',
  margin: '0 auto'
};

const brandStyle = {
  fontSize: '1.1rem', // Reducido de 1.5rem a 1.1rem
  fontWeight: 'bold',
  marginBottom: '5px'
};

const teamTitleStyle = {
  fontSize: '0.75rem',
  opacity: '0.7',
  textTransform: 'uppercase',
  marginRight: '10px' // Espacio para que queden en la misma línea
};

const namesGridStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center', // Alineación central
  gap: '15px',
  flexWrap: 'wrap',
  fontSize: '0.85rem', // Fuente más pequeña y discreta
  fontWeight: '400',
  marginBottom: '10px'
};

const copyrightStyle = {
  fontSize: '0.7rem',
  opacity: '0.5',
  marginTop: '10px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  paddingTop: '8px'
};