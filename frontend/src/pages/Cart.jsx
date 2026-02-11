import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para redirigir tras la compra

// Extraemos la URL de nuestra variable de entorno
const apiUrl = import.meta.env.VITE_API_URL;

// ⚠️ Usando tu Public Key de producción configurada
initMercadoPago('APP_USR-bfd0d103-7998-40b5-b85f-2afe0c5a2123', { locale: 'es-MX' });

export default function Cart() {
  // Traemos 'clearCart' para vaciar el carrito después de pagar
  const { cart, updateQty, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const [preferenceId, setPreferenceId] = useState(null);
  
  // ESTADO PARA EL CANDADO: Evita pedidos duplicados
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

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
      console.error(error);
      alert("Error al conectar con Mercado Pago");
    }
  };

  // Lógica para Pago en Efectivo (One Push) CORREGIDA Y REFORZADA
  const handleCashPayment = async () => {
    // CANDADO 1: Si ya se está procesando, bloqueamos clics extra
    if (isProcessing) return;

    const token = localStorage.getItem('token');
    if (!token) return alert("Inicia sesión para pedir.");

    // CANDADO 2: Validación de existencias antes de enviar
    const productoSinStock = cart.find(item => item.qty > (item.existencias || 0));
    if (productoSinStock) {
      return alert(`¡Lo sentimos! Solo tenemos ${productoSinStock.existencias} piezas de ${productoSinStock.nombre}. Ajusta tu cantidad.`);
    }

    setIsProcessing(true); // Activamos el bloqueo visual y lógico

    const nombreCliente = localStorage.getItem('userName') || "Cliente Desconocido";
    const telefonoCliente = localStorage.getItem('userPhone') || "Sin teléfono";

    try {
      await axios.post(`${apiUrl}/api/orders`, {
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
      
      alert(`✅ ¡Pedido registrado! Gracias ${nombreCliente}. Tu pedido está en camino.`);
      
      // LIMPIEZA DEL CARRITO tras éxito
      clearCart(); 
      navigate('/catalogo'); // Redirigimos para evitar que el usuario intente comprar lo mismo
    } catch (error) {
      console.error(error);
      alert("Error al registrar pedido");
    } finally {
      setIsProcessing(false); // Liberamos el botón si hubo un error para que pueda reintentar
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
            <p>${item.precio} c/u | <span style={{color: '#E91E63'}}>Stock: {item.existencias}</span></p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => updateQty(item._id, -1)}>-</button>
            <span>{item.qty}</span>
            <button 
              onClick={() => updateQty(item._id, 1)} 
              disabled={item.qty >= item.existencias} // Bloquea el botón '+' si llega al límite de stock
            >+</button>
            <button onClick={() => removeFromCart(item._id)} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>X</button>
          </div>
        </div>
      ))}

      <h2 style={{ textAlign: 'right', color: '#9C27B0' }}>Total: ${totalPrice}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {preferenceId ? (
          <Wallet initialization={{ preferenceId }} customization={{ texts:{ valueProp: 'smart_option'}}} />
        ) : (
          <button 
            onClick={handleMercadoPago} 
            disabled={isProcessing}
            style={{ padding: '15px', background: '#009ee3', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.6 : 1 }}
          >
            Pagar con Mercado Pago
          </button>
        )}

        <button 
          onClick={handleCashPayment} 
          disabled={isProcessing} // Desactiva el botón al primer clic
          style={{ 
            padding: '15px', 
            background: isProcessing ? '#95a5a6' : '#2ecc71', // Se pone gris mientras procesa
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            fontSize: '1.1rem', 
            cursor: isProcessing ? 'not-allowed' : 'pointer' 
          }}
        >
          {isProcessing ? "⏳ Procesando pedido..." : "💵 Pagar en Efectivo (One Push)"}
        </button>
      </div>
    </div>
  );
}