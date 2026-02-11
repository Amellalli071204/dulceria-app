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
  
  // CANDADO DE SEGURIDAD: Evita pedidos múltiples
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
    // 1. BLOQUEO INMEDIATO: Si ya se está procesando, ignora clics extra
    if (isProcessing) return;

    const token = localStorage.getItem('token');
    if (!token) return alert("Inicia sesión para pedir.");

    // 2. VALIDACIÓN DE STOCK: Verifica existencias antes de enviar
    const sinStock = cart.find(item => item.qty > (item.existencias || 0));
    if (sinStock) {
      return alert(`❌ ¡Uy! Solo tenemos ${sinStock.existencias} piezas de ${sinStock.nombre}.`);
    }

    setIsProcessing(true); // Activamos el estado de carga

    const nombreCliente = localStorage.getItem('userName') || "Cliente Desconocido";
    const telefonoCliente = localStorage.getItem('userPhone') || "Sin teléfono";

    try {
      // 3. ENVIAR PEDIDO: Esperamos la respuesta del servidor
      const res = await axios.post(`${apiUrl}/api/orders`, {
        usuario: nombreCliente,
        telefono: telefonoCliente,
        productos: cart.map(i => ({ 
          productoId: i._id, 
          nombre: i.nombre, 
          cantidad: i.qty, 
          precio: i.precio 
        })),
        total: totalPrice,
        metodoPago: 'efectivo'
      });
      
      // Solo si el servidor responde con éxito, procedemos
      if (res.status === 200 || res.status === 201) {
        alert(`✅ ¡Pedido registrado! Gracias ${nombreCliente}.`);
        clearCart(); // 4. LIMPIEZA: Vaciamos el carrito
        navigate('/catalogo'); 
      }
    } catch (error) {
      // Si hay un error, lo atrapamos aquí sin registrar el éxito
      console.error("Error al registrar:", error);
      alert("Hubo un error al registrar tu pedido. Por favor, intenta de nuevo.");
    } finally {
      setIsProcessing(false); // Liberamos el botón al final
    }
  };

  if (cart.length === 0) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Tu carrito está vacío 🍬</h2>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Tu Carrito ({totalItems} productos)</h1>
      
      {cart.map(item => (
        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '10px 0' }}>
          <div>
            <h3>{item.nombre}</h3>
            <p>${item.precio} c/u | <span style={{ color: '#E91E63' }}>Disponibles: {item.existencias}</span></p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => updateQty(item._id, -1)}>-</button>
            <span style={{ fontWeight: item.qty > item.existencias ? 'bold' : 'normal', color: item.qty > item.existencias ? 'red' : 'black' }}>
              {item.qty}
            </span>
            <button onClick={() => updateQty(item._id, 1)} disabled={item.qty >= item.existencias}>+</button>
            <button onClick={() => removeFromCart(item._id)} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>X</button>
          </div>
        </div>
      ))}

      <h2 style={{ textAlign: 'right', color: '#9C27B0' }}>Total: ${totalPrice}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {preferenceId ? (
          <Wallet initialization={{ preferenceId }} customization={{ texts:{ valueProp: 'smart_option'}}} />
        ) : (
          <button onClick={handleMercadoPago} disabled={isProcessing} style={btnMPStyle}>
            Pagar con Mercado Pago
          </button>
        )}

        <button 
          onClick={handleCashPayment} 
          disabled={isProcessing} 
          style={{ 
            ...btnCashStyle, 
            background: isProcessing ? '#95a5a6' : '#2ecc71',
            cursor: isProcessing ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? "⏳ Procesando pedido..." : "💵 Pagar en Efectivo (One Push)"}
        </button>
      </div>
    </div>
  );
}

const btnMPStyle = { padding: '15px', background: '#009ee3', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer' };
const btnCashStyle = { padding: '15px', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', transition: '0.3s' };