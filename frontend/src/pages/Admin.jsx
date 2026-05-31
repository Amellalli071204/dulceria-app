import { useState, useEffect } from 'react'; 
import axios from 'axios';
import { FaWhatsapp, FaPlusCircle, FaBoxOpen, FaFileInvoiceDollar, FaUserLock, FaQrcode } from 'react-icons/fa'; 
import Swal from 'sweetalert2'; 
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';
import VentasChart from '../components/VentasChart';

const apiUrl = import.meta.env.VITE_API_URL; 

export default function Admin() { 
    const [orders, setOrders] = useState([]); 
    const [users, setUsers] = useState([]);
    const [loadingId, setLoadingId] = useState(null); 

    const [newProduct, setNewProduct] = useState({
        nombre: '', descripcion: '', precio: '', imagen: '', existencias: ''
    });

    useEffect(() => { 
        const isAdmin = localStorage.getItem('isAdmin') === 'true'; 
        if (!isAdmin) { 
            window.location.href = "/"; 
        } 
        fetchOrders(); 
        fetchUsers();
    }, []);

    const fetchOrders = async () => { 
        try { 
            const res = await axios.get(`${apiUrl}/api/orders`, { 
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
            });
            setOrders(res.data); 
        } catch (error) { console.error(error); } 
    };

    const fetchUsers = async () => { 
        try { 
            const res = await axios.get(`${apiUrl}/api/users`, { 
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
            });
            setUsers(res.data); 
        } catch (error) { console.error("Error usuarios:", error); } 
    };

    const handleToggleAdmin = async (id, currentStatus, nombre) => { 
        const confirm = await Swal.fire({ 
            title: `¿${!currentStatus ? 'Hacer' : 'Quitar'} Admin a ${nombre}?`, 
            text: "¡Asegúrate de confiar en este usuario! 🍭⚙️", 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#E91E63', 
            cancelButtonColor: '#4A148C', 
            confirmButtonText: 'Sí, cambiar', 
            cancelButtonText: 'Cancelar' 
        });
        if (confirm.isConfirmed) { 
            try { 
                await axios.put(`${apiUrl}/api/users/${id}/role`, { isAdmin: !currentStatus }, { 
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
                });
                Swal.fire('¡Éxito!', `${nombre} ha cambiado de rango.`, 'success'); 
                fetchUsers(); 
            } catch (e) { 
                Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
            } 
        } 
    };

    const getLogoBase64 = () => { 
        return new Promise((resolve, reject) => {
            const img = new Image(); 
            img.src = '/logo.jpg'; 
            img.crossOrigin = 'Anonymous'; 
            img.onload = () => { 
                const canvas = document.createElement('canvas'); 
                canvas.width = img.width; 
                canvas.height = img.height; 
                const ctx = canvas.getContext('2d'); 
                ctx.drawImage(img, 0, 0); 
                resolve(canvas.toDataURL('image/jpeg')); 
            }; 
            img.onerror = (err) => reject(err); 
        });
    };

    const generarTicket = async (order) => { 
        const doc = new jsPDF();
        try { 
            const imgData = await getLogoBase64(); 
            doc.addImage(imgData, 'JPEG', 82, 10, 45, 45); 
            doc.setFontSize(22);
            doc.setTextColor(233, 30, 99); 
            doc.text("Dulce Mundo", 105, 60, { align: 'center' }); 
            doc.setFontSize(10); 
            doc.setTextColor(100);
            doc.text("Santa Isabel Ixtapan, Atenco, Edo. Mex.", 105, 68, { align: 'center' }); 
            doc.setFontSize(12); 
            doc.setTextColor(0); 
            doc.text(`Cliente: ${order.usuario}`, 20, 80); 
            doc.text(`WhatsApp: ${order.telefono}`, 20, 87);
            doc.text(`Fecha: ${new Date(order.fecha).toLocaleString()}`, 20, 94); 
            doc.text(`Método: ${order.metodoPago.toUpperCase()}`, 20, 101);
            const body = order.productos.map(p => [ 
                p.nombre, p.cantidad, `$${p.precio}`, `$${(p.cantidad * p.precio).toFixed(2)}` 
            ]);
            autoTable(doc, { 
                startY: 110, 
                head: [['Producto', 'Cant.', 'Precio U.', 'Subtotal']], 
                body: body, 
                headStyles: { fillStyle: [233, 30, 99] }, 
                theme: 'striped' 
            });
            const finalY = doc.lastAutoTable.finalY; 
            doc.setFontSize(14); 
            doc.setFont("helvetica", "bold"); 
            doc.text(`TOTAL A PAGAR: $${order.total}`, 140, finalY + 15); 
            doc.setFontSize(10); 
            doc.setFont("helvetica", "italic");
            doc.text("¡Gracias por endulzar tu día!", 105, finalY + 30, { align: 'center' }); 
            doc.save(`Ticket_${order.usuario}.pdf`);
            const mensaje = `Hola ${order.usuario}, ¡gracias por tu compra en Dulce Mundo! 🍭 Aquí tienes tu ticket por $${order.total}.`; 
            window.open(`https://wa.me/52${order.telefono.replace(/\s+/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
        } catch (error) { 
            console.error("Error logo:", error); 
            Swal.fire('Error', 'No se pudo generar el ticket', 'error');
        } 
    }; 
    
    const handleUpdateStatus = async (id, nuevoEstado) => { 
        setLoadingId(id);
        try { 
            await axios.patch(`${apiUrl}/api/orders/${id}/status`, { nuevoEstado }, { 
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
            });
            Swal.fire({ title: 'Actualizado', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false }); 
            fetchOrders();
        } catch (error) { 
            Swal.fire('Error', 'No se pudo actualizar', 'error'); 
        } finally { 
            setLoadingId(null); 
        } 
    };

    const handleAddProduct = async (e) => { 
        e.preventDefault();
        try { 
            await axios.post(`${apiUrl}/api/products`, newProduct, { 
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
            });
            Swal.fire('¡Éxito!', 'Dulce agregado al inventario', 'success'); 
            setNewProduct({ nombre: '', descripcion: '', precio: '', imagen: '', existencias: '' });
        } catch (error) { 
            Swal.fire('Error', 'No se pudo guardar el producto', 'error'); 
        } 
    };

    // --- LÓGICA DEL REPORTE FINANCIERO ---
    const totalPedidos = orders.length;
    const pedidosCompletados = orders.filter(o => o.estado === 'pagado' || o.estado === 'entregado');
    const ingresosTotales = pedidosCompletados.reduce((sum, o) => sum + (o.total || 0), 0);
    const ticketPromedio = pedidosCompletados.length > 0 ? (ingresosTotales / pedidosCompletados.length).toFixed(2) : "0.00";
    const pedidosPendientes = orders.filter(o => o.estado === 'pendiente').length;
    const pedidosPagados = orders.filter(o => o.estado === 'pagado').length;
    const pedidosEntregados = orders.filter(o => o.estado === 'entregado').length;

    const resumenMetodo = { efectivo: { cantidad: 0, total: 0 }, mercadopago: { cantidad: 0, total: 0 } };
    orders.forEach(o => {
        const metodo = o.metodoPago === 'mercadopago' ? 'mercadopago' : 'efectivo';
        resumenMetodo[metodo].cantidad += 1;
        if (o.estado === 'pagado' || o.estado === 'entregado') {
            resumenMetodo[metodo].total += (o.total || 0);
        }
    });

    return ( 
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}> 
            <h1 style={{ color: '#E91E63', textAlign: 'center', marginBottom: '10px', fontFamily: "'Fredoka One', cursive" }}> 
                Panel de Administración 🔐 
            </h1> 
            
            {/* Gráfica de Ventas */}
            <div style={{ marginBottom: '40px' }}> 
                <VentasChart />
            </div>

            {/* --- REPORTE FINANCIERO --- */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#4A148C', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <FaFileInvoiceDollar /> Reporte Financiero 📊
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Total Ingresos</h3>
                        <p style={cardValueStyle}>${ingresosTotales.toFixed(2)}</p>
                    </div>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Total Pedidos</h3>
                        <p style={cardValueStyle}>{totalPedidos}</p>
                    </div>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Ticket Promedio</h3>
                        <p style={cardValueStyle}>${ticketPromedio}</p>
                    </div>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Estados</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontWeight: 'bold', fontSize: '0.95rem' }}>
                            <span style={{ color: '#FFB300' }}>⏳ {pedidosPendientes}</span> |
                            <span style={{ color: '#9C27B0' }}>💳 {pedidosPagados}</span> |
                            <span style={{ color: '#4CAF50' }}>📦 {pedidosEntregados}</span>
                        </div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #eee' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                            <tr style={{ background: '#9C27B0', color: 'white' }}>
                                <th style={{ padding: '12px' }}>Método de Pago</th>
                                <th style={{ padding: '12px' }}>Cantidad de Pedidos</th>
                                <th style={{ padding: '12px' }}>Ingresos Reales</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#E91E63' }}>💵 Efectivo</td>
                                <td style={{ padding: '12px', color: '#555' }}>{resumenMetodo.efectivo.cantidad}</td>
                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#4A148C' }}>${resumenMetodo.efectivo.total.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#E91E63' }}>💳 Mercado Pago</td>
                                <td style={{ padding: '12px', color: '#555' }}>{resumenMetodo.mercadopago.cantidad}</td>
                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#4A148C' }}>${resumenMetodo.mercadopago.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ESCÁNER QR (temporalmente deshabilitado) --- */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h2 style={{ color: '#E91E63', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <FaQrcode /> Escáner QR de Entregas
                </h2>
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Funcionalidad en mantenimiento 🔧</p>
            </div>

            {/* --- AGREGAR PRODUCTO --- */} 
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}> 
                <h2 style={{ color: '#9C27B0', display: 'flex', alignItems: 'center', gap: '10px' }}> 
                    <FaPlusCircle /> Agregar Nuevo Dulce 
                </h2> 
                <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}> 
                    <input style={inputStyle} placeholder="Nombre del dulce" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} required /> 
                    <input style={inputStyle} type="number" placeholder="Existencias iniciales" value={newProduct.existencias} onChange={e => setNewProduct({...newProduct, existencias: e.target.value})} required /> 
                    <input style={inputStyle} placeholder="Descripción" value={newProduct.descripcion} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value})} /> 
                    <input style={inputStyle} type="number" placeholder="Precio" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: e.target.value})} required /> 
                    <input style={{...inputStyle, gridColumn: 'span 2'}} placeholder="URL de Imagen" value={newProduct.imagen} onChange={e => setNewProduct({...newProduct, imagen: e.target.value})} /> 
                    <button type="submit" style={saveButtonStyle}>Guardar en Inventario</button>
                </form>
            </div>

            {/* --- GESTIONAR ADMINS --- */} 
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}> 
                <h2 style={{ color: '#4A148C', display: 'flex', alignItems: 'center', gap: '10px' }}> 
                    <FaUserLock /> Gestionar Admins 
                </h2> 
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px', marginTop: '15px' }}> 
                    {users.map(u => ( 
                        <div key={u._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px', textAlign: 'center', background: u.isAdmin ? '#fce4ec' : '#f8f9fa' }}> 
                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{u.nombre}</p> 
                            <button 
                                onClick={() => handleToggleAdmin(u._id, u.isAdmin, u.nombre)} 
                                style={{ background: u.isAdmin ? '#4A148C' : '#E91E63', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' }} 
                            > 
                                {u.isAdmin ? 'Quitar Admin' : 'Hacer Admin'} 
                            </button> 
                        </div> 
                    ))}
                </div>
            </div>

            {/* --- PEDIDOS RECIENTES --- */} 
            <h2 style={{ color: '#E91E63', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}> 
                <FaBoxOpen /> Pedidos Recientes 
            </h2> 
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}> 
                <table style={{ width: '100%', borderCollapse: 'collapse' }}> 
                    <thead>
                        <tr style={{ background: '#E91E63', color: 'white' }}> 
                            <th style={{ padding: '15px' }}>Fecha</th> 
                            <th style={{ padding: '15px' }}>Cliente</th> 
                            <th style={{ padding: '15px' }}>WhatsApp / Ticket</th> 
                            <th style={{ padding: '15px' }}>Total</th> 
                            <th style={{ padding: '15px' }}>Acciones</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => ( 
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}> 
                                <td style={{ padding: '12px' }}>{new Date(order.fecha).toLocaleDateString()}</td> 
                                <td style={{ fontWeight: 'bold' }}>{order.usuario}</td> 
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}> 
                                        {order.telefono} 
                                        <button onClick={() => generarTicket(order)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1.4rem' }}>
                                            <FaWhatsapp />
                                        </button>
                                    </div>
                                </td>
                                <td>${order.total}</td> 
                                <td style={{ padding: '10px' }}> 
                                    <button 
                                        onClick={() => handleUpdateStatus(order._id, order.estado === 'pendiente' ? 'pagado' : 'entregado')} 
                                        disabled={loadingId === order._id} 
                                        style={{ 
                                            padding: '5px 12px', borderRadius: '20px', border: 'none', 
                                            background: loadingId === order._id ? '#ccc' : (order.estado === 'pendiente' ? '#FFEB3B' : '#C8E6C9'), 
                                            cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' 
                                        }} 
                                    > 
                                        {loadingId === order._id ? "..." : order.estado.toUpperCase()} 
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
const cardStyle = { background: '#FFF0F5', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #FCE4EC' };
const cardTitleStyle = { color: '#9C27B0', fontSize: '0.9rem', textTransform: 'uppercase', margin: '0 0 10px 0' };
const cardValueStyle = { color: '#E91E63', fontSize: '1.8rem', fontWeight: 'bold', margin: '0' };