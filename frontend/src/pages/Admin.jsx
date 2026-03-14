import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaPlusCircle, FaBoxOpen } from 'react-icons/fa';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Admin() {
    const [orders, setOrders] = useState([]);
    const [newProduct, setNewProduct] = useState({ nombre: '', descripcion: '', precio: 0, imagen: '', existencias: 0 });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/orders`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setOrders(res.data);
        } catch (error) { console.error(error); }
    };

    const handleUpdateStatus = async (id, nuevoEstado) => {
        try {
            await axios.patch(`${apiUrl}/api/orders/${id}/status`, { nuevoEstado });
            fetchOrders();
        } catch (error) { alert("Error al actualizar"); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${apiUrl}/api/products`, newProduct);
            alert("¡Dulce agregado!");
            setNewProduct({ nombre: '', descripcion: '', precio: 0, imagen: '', existencias: 0 });
        } catch (error) { alert("Error al guardar"); }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#E91E63', textAlign: 'center' }}>Panel Admin 🔐</h1>
            
            {/* Formulario simplificado para el ejemplo */}
            <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' }}>
                <input style={inputStyle} placeholder="Nombre" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} required />
                <input style={inputStyle} type="number" placeholder="Existencias" value={newProduct.existencias} onChange={e => setNewProduct({...newProduct, existencias: e.target.value})} required />
                <button type="submit" style={saveButtonStyle}>Guardar Dulce</button>
            </form>

            <h2 style={{ color: '#E91E63' }}><FaBoxOpen /> Pedidos Recientes</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                <thead>
                    <tr style={{ background: '#E91E63', color: 'white' }}>
                        <th style={{ padding: '10px' }}>Cliente</th>
                        <th>WhatsApp</th>
                        <th>Total</th>
                        <th>Productos / Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                            <td>{order.usuario}</td>
                            <td>
                                <a href={`https://wa.me/52${order.telefono}`} target="_blank" style={{ color: '#25D366' }}><FaWhatsapp /> {order.telefono}</a>
                            </td>
                            <td>${order.total}</td>
                            <td style={{ padding: '10px' }}>
                                <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
                                    {order.productos?.map((p, i) => (
                                        <div key={i}>{p.nombre} ({p.cantidad})</div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => handleUpdateStatus(order._id, order.estado === 'pendiente' ? 'pagado' : 'entregado')}
                                    style={{ background: order.estado === 'pendiente' ? '#FFEB3B' : '#C8E6C9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    {order.estado.toUpperCase()}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd' };
const saveButtonStyle = { gridColumn: 'span 2', background: '#9C27B0', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer' };