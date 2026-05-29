import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

export default function Ticket() {
  const { id } = useParams(); // Obtenemos el ID del pedido desde la URL
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={ticketStyle}>
        <h1 style={{ color: '#E91E63', margin: '0 0 10px 0' }}>¡Pedido Confirmado! 🎉</h1>
        <p style={{ color: '#757575', marginBottom: '20px' }}>
          Tu orden ha sido registrada con éxito.
        </p>
        
        {/* AQUÍ SE GENERA EL CÓDIGO QR MÁGICAMENTE */}
        <div style={qrContainerStyle}>
          <QRCodeCanvas 
            value={id} // El lector escaneará este ID exacto
            size={220} 
            bgColor={"#ffffff"} 
            fgColor={"#4A148C"} // Tu color morado
            level={"H"} 
          />
        </div>

        <div style={infoStyle}>
          <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#4A148C' }}>ID de Pedido:</p>
          <p style={{ margin: '0', fontSize: '0.9rem', wordBreak: 'break-all' }}>{id}</p>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#E91E63', fontWeight: 'bold' }}>
          Muestra este código al vendedor para recoger tus dulces 🍭
        </p>

        <button onClick={() => navigate('/catalogo')} style={btnStyle}>
          Volver al Catálogo
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS ---
const containerStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  minHeight: '80vh',
  padding: '20px',
  marginTop: '50px'
};

const ticketStyle = {
  background: '#FFF0F5',
  padding: '40px 30px',
  borderRadius: '20px',
  boxShadow: '0 10px 25px rgba(156, 39, 176, 0.15)',
  textAlign: 'center',
  maxWidth: '400px',
  width: '100%',
  border: '2px dashed #F8BBD0'
};

const qrContainerStyle = {
  background: 'white',
  padding: '20px',
  display: 'inline-block',
  borderRadius: '15px',
  marginBottom: '20px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

const infoStyle = {
  background: 'white',
  padding: '10px',
  borderRadius: '8px',
  marginBottom: '20px'
};

const btnStyle = {
  marginTop: '15px',
  padding: '12px 25px',
  background: '#9C27B0',
  color: 'white',
  border: 'none',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem',
  transition: '0.3s'
};