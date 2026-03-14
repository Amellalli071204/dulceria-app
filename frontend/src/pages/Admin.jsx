import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaPlusCircle, FaBoxOpen } from 'react-icons/fa';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Admin() {
    const [orders, setOrders] = useState([]);
    const [newProduct, setNewProduct] = useState({ 
        nombre: '', 
        descripcion: '', 
        precio: '', 
        imagen: '', 
        existencias: '' 
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

    const handleUpdateStatus = async (id, nuevoEstado) => {
        try {
            await axios.patch(`${apiUrl}/api/orders/${id}/status`, 
                { nuevoEstado }, 
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchOrders(); // Recarga la tabla para ver el cambio
        } catch (error) {
            alert("Error al actualizar el estado");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${apiUrl}/api/products`, newProduct, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert("¡Dulce agregado con éxito! 🍬");
            setNewProduct({ nombre: '', descripcion: '', precio: '', imagen: '', existencias: '' });
        } catch (error) {
            console.error(error);
            alert("Error al guardar el producto");
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#E91E63', textAlign: 'center' }}>Panel de Administración 🔐</h1>

            {/* --- FORMULARIO DE PRODUCTOS (DISEÑO RECUPERADO) --- */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#9C27B0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaPlusCircle /> Agregar Nuevo Dulce
                </h2>
                <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input 
                        style={inputStyle} 
                        placeholder="Nombre del dulce" 
                        value={newProduct.nombre} 
                        onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} 
                        required 
                    />
                    <input 
                        style={inputStyle} 
                        type="number" 
                        placeholder="Existencias iniciales" 
                        value={newProduct.existencias} 
                        onChange={e => setNewProduct({...newProduct, existencias: e.target.value})} 
                        required 
                    />
                    <input 
                        style={inputStyle} 
                        placeholder="Descripción" 
                        value={newProduct.descripcion} 
                        onChange={e => setNewProduct({...newProduct, descripcion: e.target.value})} 
                    />
                    <input 
                        style={inputStyle} 
                        type="number" 
                        placeholder="Precio" 
                        value={newProduct.precio} 
                        onChange={e => setNewProduct({...newProduct, precio: e.target.value})} 
                        required 
                    />
                    <input 
                        style={inputStyle} 
                        placeholder="URL de Imagen" 
                        value={newProduct.imagen} 
                        onChange={e => setNewProduct({...newProduct, imagen: e.target.value})} 
                    />
                    
                    <button type="submit" style={saveButtonStyle}>Guardar en Inventario</button>
                </form>
            </div>

            {/* --- TABLA DE PEDIDOS --- */}
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
                            <th>Productos / Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                <td style={{ padding: '12px' }}>{new Date(order.fecha).toLocaleDateString()}</td>
                                <td style={{ fontWeight: 'bold' }}>{order.usuario}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        {order.telefono ? (
                                            <>
                                                <span>{order.telefono}</span>
                                                <a 
                                                    href={`https://wa.me/52${order.telefono.replace(/\s+/g, '')}?text=Hola%20${order.usuario},%20soy%20de%20Dulce%20Mundo%20🍬.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#25D366', fontSize: '1.5rem' }}
                                                >
                                                    <FaWhatsapp />
                                                </a>
                                            </>
                                        ) : <span style={{ color: '#999' }}>Sin número</span>}
                                    </div>
                                </td>
                                <td>${order.total}</td>
                                <td style={{ padding: '10px' }}>
                                    {/* Lista de productos comprados */}
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px', textAlign: 'left', paddingLeft: '20px' }}>
                                        {order.productos?.map((p, i) => (
                                            <div key={i}>• {p.nombre} ({p.cantidad} pz)</div>
                                        ))}
                                    </div>
                                    {/* Botón de Estado */}
                                    <button 
                                        onClick={() => handleUpdateStatus(order._id, order.estado === 'pendiente' ? 'pagado' : 'entregado')}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            background: order.estado === 'pendiente' ? '#FFEB3B' : '#C8E6C9',
                                            color: '#333',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {order.estado.toUpperCase()}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' };
const saveButtonStyle = { gridColumn: 'span 2', background: '#9C27B0', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '10px' };