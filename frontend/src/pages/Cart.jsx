import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// Inicialización de Mercado Pago con tu llave de producción
initMercadoPago('APP_USR-bfd0d103-7998-40b5-b85f-2afe0c5a2123', { locale: 'es-MX' });

export default function Cart() {
  // Extraemos las funciones del context, incluyendo clearCart para vaciarlo al final
  const { cart, updateQty, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const [preferenceId, setPreferenceId] = useState(null);
  
  // ESTADO DE SEGURIDAD: Bloquea el botón para evitar duplicados
  const [isProcessing, setIsProcessing] = useState(false);

  // Lógica para Mercado Pago
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
      console.error("Error MP:", error);
      alert("Error al conectar con Mercado Pago");
    }
  };

  // Lógica para Pago en Efectivo (One Push) PROTEGIDA
  const handleCashPayment = async () => {
    // 1. Candado inmediato contra clics repetidos
    if (isProcessing) return;

    const token = localStorage.getItem('token');
    if (!token) return alert("Inicia sesión para pedir.");

    // 2. Validación de Stock antes de enviar la petición
    const sinStock = cart.find(item => item.qty > (item.existencias || 0));
    if (sinStock) {
      return alert(`❌ Stock insuficiente: Solo tenemos ${sinStock.existencias} de ${sinStock.nombre}.`);
    }

    setIsProcessing(true); // Bloqueamos el flujo

    try {
      // 3. Petición al servidor esperando respuesta confirmada
      const res = await axios.post(`${apiUrl}/api/orders`, {
        usuario: localStorage.getItem('userName') || "Cliente",
        telefono: localStorage.getItem('userPhone') || "Sin teléfono",
        productos: cart.map(i => ({ 
          productoId: i._id, 
          nombre: i.nombre, 
          cantidad: i.qty, 
          precio: i.precio 
        })),
        total: totalPrice,
        metodoPago: 'efectivo'
      });
      
      // 4. Si el servidor responde con éxito (200 o 201)
      if (res.status === 200 || res.status === 201) {
        alert("✅ ¡Pedido registrado! Tu carrito se limpiará ahora.");
        
        // Verificamos que clearCart sea una función antes de llamarla
        if (typeof clearCart === 'function') {
          clearCart();
        }

        // Redirección forzada para limpiar el estado visual
        setTimeout(() => {
          window.location.href = "/catalogo";
        }, 500);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Hubo un error al procesar tu pedido. Intenta de nuevo.");
    } finally {
      setIsProcessing(false); // Liberamos el botón si hubo error
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
          {isProcessing ? "⏳ Procesando..." : "💵 Pagar en Efectivo (One Push)"}
        </button>
      </div>
    </div>
  );
}

const btnMPStyle = { padding: '15px', background: '#009ee3', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer' };
const btnCashStyle = { padding: '15px', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', transition: '0.3s' };