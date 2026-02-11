import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;
initMercadoPago('APP_USR-bfd0d103-7998-40b5-b85f-2afe0c5a2123', { locale: 'es-MX' });

export default function Cart() {
  const { cart, updateQty, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const [preferenceId, setPreferenceId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleMercadoPago = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/orders/create_preference`, {
        items: cart.map(item => ({
          nombre: item.nombre,
          cantidad: item.qty,
          precio: item.precio
        }))
      });
      setPreferenceId(res.data.id);
    } catch (error) {
      console.error(error);
      alert("Error al conectar con Mercado Pago");
    }
  };

  const handleCashPayment = async () => {
    if (isProcessing) return;

    const token = localStorage.getItem('token');
    if (!token) return alert("Inicia sesión para pedir.");

    const sinStock = cart.find(item => item.qty > (item.existencias || 0));
    if (sinStock) return alert(`❌ ¡Stock insuficiente para ${sinStock.nombre}!`);

    setIsProcessing(true);

    try {
      const res = await axios.post(`${apiUrl}/api/orders`, {
        usuario: localStorage.getItem('userName') || "Cliente",
        telefono: localStorage.getItem('userPhone') || "",
        productos: cart.map(i => ({ 
          productoId: i._id, 
          nombre: i.nombre, 
          cantidad: i.qty, 
          precio: i.precio 
        })),
        total: totalPrice,
        metodoPago: 'efectivo'
      });
      
      if (res.status === 200 || res.status === 201) {
        alert(`✅ ¡Pedido registrado! Gracias por comprar en Dulce Mundo.`);
        if (typeof clearCart === 'function') clearCart();
        navigate('/catalogo'); 
      }
    } catch (error) {
      alert("Error al registrar pedido");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ color: '#E91E63' }}>Tu carrito está vacío 🍬</h2>
      <button onClick={() => navigate('/catalogo')} style={btnCatalogStyle}>Ir a comprar</button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Tu Carrito ({totalItems})</h1>
      
      <div style={cartListStyle}>
        {cart.map(item => (
          <div key={item._id} style={cardStyle}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0', color: '#4A148C' }}>{item.nombre}</h3>
              <p style={{ margin: '5px 0', color: '#757575' }}>${item.precio} c/u</p>
              <span style={stockLabelStyle}>Stock: {item.existencias}</span>
            </div>
            
            <div style={controlsStyle}>
              <button style={qtyBtnStyle} onClick={() => updateQty(item._id, -1)}>-</button>
              <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
              <button 
                style={qtyBtnStyle} 
                onClick={() => updateQty(item._id, 1)} 
                disabled={item.qty >= item.existencias}
              >+</button>
              <button onClick={() => removeFromCart(item._id)} style={deleteBtnStyle}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <div style={summaryStyle}>
        <h2 style={{ margin: '0', color: '#E91E63' }}>Total: ${totalPrice}</h2>
      </div>

      <div style={actionsStyle}>
        {preferenceId ? (
          <Wallet initialization={{ preferenceId }} customization={{ texts:{ valueProp: 'smart_option'}}} />
        ) : (
          <button onClick={handleMercadoPago} disabled={isProcessing} style={btnMPStyle}>
            💳 Pagar con Mercado Pago
          </button>
        )}

        <button 
          onClick={handleCashPayment} 
          disabled={isProcessing} 
          style={{ 
            ...btnCashStyle, 
            background: isProcessing ? '#BDBDBD' : '#9C27B0' 
          }}
        >
          {isProcessing ? "⏳ Procesando..." : "💵 Pago en Efectivo"}
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS (Inspirados en Dulce Mundo 🍭) ---
const containerStyle = { padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
const titleStyle = { textAlign: 'center', color: '#E91E63', marginBottom: '2rem' };
const cartListStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '15px', 
  background: '#FFF0F5', 
  borderRadius: '12px', 
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
};
const stockLabelStyle = { fontSize: '0.8rem', color: '#9C27B0', fontWeight: 'bold' };
const controlsStyle = { display: 'flex', alignItems: 'center', gap: '12px' };
const qtyBtnStyle = { 
  width: '30px', height: '30px', borderRadius: '50%', border: 'none', 
  background: '#E91E63', color: 'white', cursor: 'pointer', fontWeight: 'bold' 
};
const deleteBtnStyle = { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginLeft: '10px' };
const summaryStyle = { textAlign: 'right', marginTop: '20px', padding: '10px' };
const actionsStyle = { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' };
const btnCatalogStyle = { padding: '10px 20px', background: '#9C27B0', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', marginTop: '15px' };
const btnMPStyle = { padding: '15px', background: '#009ee3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' };
const btnCashStyle = { padding: '15px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };