import { useState, useEffect } from 'react';
import axios from 'axios';

// Declaramos la URL fuera para que todas las funciones puedan usarla
const apiUrl = import.meta.env.VITE_API_URL;

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ nombre: '', descripcion: '', precio: 0, imagen: '' });

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
      // Agregamos la petición GET que faltaba
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
      // Ahora apiUrl está correctamente definida para esta función
      await axios.post(`${apiUrl}/api/products`, newProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("¡Dulce agregado con éxito! 🍬");
      // Limpiamos el formulario
      setNewProduct({ nombre: '', descripcion: '', precio: 0, imagen: '' });
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panel de Administración 🔐</h1>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '40px' }}>
        <h2>➕ Agregar Nuevo Dulce</h2>
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
          <input placeholder="Nombre del dulce" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} required />
          <input placeholder="Descripción" value={newProduct.descripcion} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value})} />
          <input type="number" placeholder="Precio" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: e.target.value})} required />
          <input placeholder="URL de Imagen" value={newProduct.imagen} onChange={e => setNewProduct({...newProduct, imagen: e.target.value})} />
          <button type="submit" style={{ background: '#333', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>Guardar Producto</button>
        </form>
      </div>

      <h2>📦 Pedidos Recientes</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#ff4757', color: 'white' }}>
            <th style={{ padding: '10px' }}>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Método</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
              <td style={{ padding: '10px' }}>{new Date(order.fecha).toLocaleDateString()}</td>
              <td>{order.usuario}</td>
              <td>${order.total}</td>
              <td style={{ fontWeight: 'bold', color: order.metodoPago === 'efectivo' ? 'green' : 'blue' }}>
                {(order.metodoPago || 'N/A').toUpperCase()}
              </td>
              <td>{order.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}