import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';

// Extraemos la URL de nuestra variable de entorno
const apiUrl = import.meta.env.VITE_API_URL;

// ⚠️ Usando tu Public Key de producción configurada
initMercadoPago('APP_USR-bfd0d103-7998-40b5-b85f-2afe0c5a2123', { locale: 'es-MX' });

export default function Cart() {
  const { cart, updateQty, removeFromCart, totalPrice, totalItems } = useCart();
  const [preferenceId, setPreferenceId] = useState(null);

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

  // Lógica para Pago en Efectivo (One Push) CORREGIDA
  const handleCashPayment = async () => {
    const token = localStorage.getItem('token');
    
    // --- RECUPERAMOS DATOS REALES DEL USUARIO ---
    const nombreCliente = localStorage.getItem('userName') || "Cliente Desconocido";
    const telefonoCliente = localStorage.getItem('userPhone') || "Sin teléfono";

    if (!token) return alert("Inicia sesión para pedir.");

    try {
      await axios.post(`${apiUrl}/api/orders`, {
        usuario: nombreCliente, // Ahora envía el nombre real
        telefono: telefonoCliente, // Ahora envía el teléfono real
        productos: cart.map(i => ({ 
          productoId: i._id, 
          nombre: i.nombre, 
          cantidad: i.qty, 
          precio: i.precio 
        })),
        total: totalPrice,
        metodoPago: 'efectivo'
      });
      
      alert(`¡Pedido registrado! Gracias ${nombreCliente}, prepararemos tus dulces. Te contactaremos al ${telefonoCliente}.`);
    } catch (error) {
      console.error(error);
      alert("Error al registrar pedido");
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
            <p>${item.precio} c/u</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => updateQty(item._id, -1)}>-</button>
            <span>{item.qty}</span>
            <button onClick={() => updateQty(item._id, 1)}>+</button>
            <button onClick={() => removeFromCart(item._id)} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>X</button>
          </div>
        </div>
      ))}

      <h2 style={{ textAlign: 'right' }}>Total: ${totalPrice}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {preferenceId ? (
          <Wallet initialization={{ preferenceId }} customization={{ texts:{ valueProp: 'smart_option'}}} />
        ) : (
          <button onClick={handleMercadoPago} style={{ padding: '15px', background: '#009ee3', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer' }}>
            Pagar con Mercado Pago
          </button>
        )}

        <button onClick={handleCashPayment} style={{ padding: '15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer' }}>
          💵 Pagar en Efectivo (One Push)
        </button>
      </div>
    </div>
  );
}