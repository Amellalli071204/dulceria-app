import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaPlusCircle, FaBoxOpen } from 'react-icons/fa'; 

const apiUrl = import.meta.env.VITE_API_URL;

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ 
    nombre: '', 
    descripcion: '', 
    precio: 0, 
    imagen: '',
    existencias: 0 
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      alert("No tienes permiso para estar aquí");
      window.location.href = "/";
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/api/products`, newProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("¡Dulce agregado con éxito! 🍬");
      setNewProduct({ nombre: '', descripcion: '', precio: 0, imagen: '', existencias: 0 });
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#E91E63', textAlign: 'center' }}>Panel de Administración 🔐</h1>

      {/* --- FORMULARIO DE PRODUCTOS --- */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#9C27B0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaPlusCircle /> Agregar Nuevo Dulce
        </h2>
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input 
  type="number" 
  placeholder="Cantidad inicial (Existencias)" 
  value={newProduct.existencias}
  onChange={(e) => setNewProduct({...newProduct, existencias: e.target.value})}
  style={inputStyle} // Usa el estilo que ya tienes para los otros inputs
/>
          <input style={inputStyle} placeholder="Nombre del dulce" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} required />
          <input style={inputStyle} placeholder="Descripción" value={newProduct.descripcion} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value})} />
          <input style={inputStyle} type="number" placeholder="Precio" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: e.target.value})} required />
          <input style={inputStyle} placeholder="URL de Imagen" value={newProduct.imagen} onChange={e => setNewProduct({...newProduct, imagen: e.target.value})} />
          <input style={inputStyle} type="number" placeholder="Existencias iniciales" value={newProduct.existencias} onChange={e => setNewProduct({...newProduct, existencias: e.target.value})} required />
          <button type="submit" style={saveButtonStyle}>Guardar en Inventario</button>
        </form>
      </div>

      {/* --- TABLA DE PEDIDOS CON WHATSAPP --- */}
      <h2 style={{ color: '#E91E63', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaBoxOpen /> Pedidos Recientes
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#E91E63', color: 'white' }}>
              <th style={{ padding: '15px' }}>Fecha</th>
              <th>Cliente</th>
              <th>WhatsApp</th>
              <th>Total</th>
              <th>Método</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <td style={{ padding: '12px' }}>{new Date(order.fecha).toLocaleDateString()}</td>
                <td style={{ fontWeight: 'bold' }}>{order.usuario}</td>
                
                {/* BOTÓN DE WHATSAPP CONFIGURADO */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {order.telefono ? (
                      <>
                        <span>{order.telefono}</span>
                        <a 
                          href={`https://wa.me/52${order.telefono.replace(/\s+/g, '')}?text=Hola%20${order.usuario},%20soy%20de%20Dulce%20Mundo%20🍬.%20Tu%20pedido%20por%20$${order.total}%20está%20listo.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#25D366', fontSize: '1.5rem', display: 'flex' }}
                        >
                          <FaWhatsapp />
                        </a>
                      </>
                    ) : (
                      <span style={{ color: '#999' }}>Sin número</span>
                    )}
                  </div>
                </td>

                <td>${order.total}</td>
                <td style={{ fontWeight: 'bold', color: order.metodoPago === 'efectivo' ? '#2ecc71' : '#009ee3' }}>
                  {(order.metodoPago || 'N/A').toUpperCase()}
                </td>
                <td style={{ color: '#9C27B0' }}>{order.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' };
const saveButtonStyle = { gridColumn: 'span 2', background: '#9C27B0', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' };