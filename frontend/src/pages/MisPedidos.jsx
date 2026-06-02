import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const apiUrl = import.meta.env.VITE_API_URL;

const estadoBadge = (estado) => {
    const config = {
        pendiente:  { bg: '#FFF9C4', color: '#F57F17', icon: '⏳', label: 'Pendiente' },
        pagado:     { bg: '#E8EAF6', color: '#3949AB', icon: '💳', label: 'Pagado' },
        entregado:  { bg: '#E8F5E9', color: '#2E7D32', icon: '📦', label: 'Entregado' },
    };
    const c = config[estado] || { bg: '#eee', color: '#333', icon: '❓', label: estado };
    return (
        <span style={{ background: c.bg, color: c.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {c.icon} {c.label}
        </span>
    );
};

export default function MisPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandido, setExpandido] = useState(null);
    const navigate = useNavigate();

    const usuario = localStorage.getItem('userName');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetchPedidos();
    }, []);

    const fetchPedidos = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/orders/mis-pedidos?usuario=${encodeURIComponent(usuario)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPedidos(res.data);
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ textAlign: 'center', marginTop: '120px' }}>
            <p style={{ color: '#9C27B0', fontSize: '1.2rem' }}>Cargando tus pedidos... 🍭</p>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', marginTop: '70px' }}>
            <h1 style={{ color: '#E91E63', textAlign: 'center', fontFamily: "'Fredoka One', cursive", marginBottom: '10px' }}>
                Mis Pedidos 🛍️
            </h1>
            <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '30px' }}>
                Hola <b style={{ color: '#9C27B0' }}>{usuario}</b>, aquí puedes ver el historial de tus compras
            </p>

            {pedidos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '3rem' }}>🍬</p>
                    <h3 style={{ color: '#9C27B0' }}>Aún no tienes pedidos</h3>
                    <button onClick={() => navigate('/catalogo')} style={btnStyle}>
                        Ver catálogo
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {pedidos.map(pedido => (
                        <div key={pedido._id} style={{ background: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid #FCE4EC' }}>
                            {/* Cabecera del pedido */}
                            <div 
                                onClick={() => setExpandido(expandido === pedido._id ? null : pedido._id)}
                                style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandido === pedido._id ? '#FFF0F5' : 'white' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                        {new Date(pedido.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                    <span style={{ fontWeight: 'bold', color: '#4A148C' }}>
                                        {pedido.productos.length} producto{pedido.productos.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {estadoBadge(pedido.estado)}
                                    <span style={{ fontWeight: 'bold', color: '#E91E63', fontSize: '1.1rem' }}>${pedido.total}</span>
                                    <span style={{ color: '#ccc' }}>{expandido === pedido._id ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {/* Detalle expandible */}
                            {expandido === pedido._id && (
                                <div style={{ padding: '15px 20px', borderTop: '1px solid #FCE4EC' }}>
                                    {/* Productos */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                                        <thead>
                                            <tr style={{ background: '#F3E5F5' }}>
                                                <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.85rem', color: '#4A148C' }}>Producto</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.85rem', color: '#4A148C' }}>Cant.</th>
                                                <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.85rem', color: '#4A148C' }}>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pedido.productos.map((p, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                                    <td style={{ padding: '8px', fontSize: '0.9rem' }}>{p.nombre}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '0.9rem' }}>{p.cantidad}</td>
                                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 'bold', color: '#E91E63' }}>${(p.cantidad * p.precio).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Info y QR */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span>💳 Método: <b>{pedido.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Efectivo'}</b></span>
                                            <span>📋 ID: <code style={{ fontSize: '0.75rem', color: '#9C27B0' }}>{pedido._id}</code></span>
                                        </div>
                                        {pedido.estado !== 'entregado' && (
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '0 0 8px 0' }}>Tu QR de entrega</p>
                                                <QRCodeCanvas
                                                    value={pedido._id}
                                                    size={100}
                                                    bgColor="#ffffff"
                                                    fgColor="#4A148C"
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const btnStyle = { marginTop: '15px', padding: '10px 25px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' };