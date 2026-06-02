import { useState, useEffect } from 'react'; 
import axios from 'axios';
import { FaWhatsapp, FaPlusCircle, FaBoxOpen, FaFileInvoiceDollar, FaUserLock, FaQrcode, FaEdit } from 'react-icons/fa'; 
import Swal from 'sweetalert2'; 
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';
import VentasChart from '../components/VentasChart';
import { Scanner } from '@yudiel/react-qr-scanner';

const apiUrl = import.meta.env.VITE_API_URL; 

export default function Admin() { 
    const [orders, setOrders] = useState([]); 
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [editProduct, setEditProduct] = useState(null); // producto siendo editado

    const [newProduct, setNewProduct] = useState({
        nombre: '', descripcion: '', precio: '', imagen: '', existencias: ''
    });

    useEffect(() => { 
        const isAdmin = localStorage.getItem('isAdmin') === 'true'; 
        if (!isAdmin) window.location.href = "/"; 
        fetchOrders(); 
        fetchUsers();
        fetchProducts();
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

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/products`);
            setProducts(res.data);
        } catch (error) { console.error("Error productos:", error); }
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
            fetchProducts();
        } catch (error) { 
            Swal.fire('Error', 'No se pudo guardar el producto', 'error'); 
        } 
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${apiUrl}/api/products/${editProduct._id}`, editProduct, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            Swal.fire({ title: '¡Actualizado!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
            setEditProduct(null);
            fetchProducts();
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
        }
    };

    const handleDeleteProduct = async (id, nombre) => {
        const confirm = await Swal.fire({
            title: `¿Eliminar "${nombre}"?`,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E91E63',
            cancelButtonColor: '#4A148C',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (confirm.isConfirmed) {
            try {
                await axios.delete(`${apiUrl}/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                Swal.fire({ title: 'Eliminado', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                fetchProducts();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
            }
        }
    };

    const handleScan = (scannedId) => {
        if (!scannedId) return;
        setShowScanner(false);
        Swal.fire({
            title: 'Código QR Detectado',
            text: `¿Marcar el pedido como entregado?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#E91E63',
            confirmButtonText: 'Sí, entregar',
            cancelButtonText: 'Cancelar'
        }).then((res) => {
            if (res.isConfirmed) handleUpdateStatus(scannedId, 'entregado');
        });
    };

    // --- REPORTE FINANCIERO ---
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
        if (o.estado === 'pagado' || o.estado === 'entregado') resumenMetodo[metodo].total += (o.total || 0);
    });

    return ( 
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}> 
            <h1 style={{ color: '#E91E63', textAlign: 'center', marginBottom: '10px', fontFamily: "'Fredoka One', cursive" }}> 
                Panel de Administración 🔐 
            </h1> 
            
            <div style={{ marginBottom: '40px' }}><VentasChart /></div>

            {/* --- REPORTE FINANCIERO --- */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#4A148C', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <FaFileInvoiceDollar /> Reporte Financiero 📊
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                    <div style={cardStyle}><h3 style={cardTitleStyle}>Total Ingresos</h3><p style={cardValueStyle}>${ingresosTotales.toFixed(2)}</p></div>
                    <div style={cardStyle}><h3 style={cardTitleStyle}>Total Pedidos</h3><p style={cardValueStyle}>{totalPedidos}</p></div>
                    <div style={cardStyle}><h3 style={cardTitleStyle}>Ticket Promedio</h3><p style={cardValueStyle}>${ticketPromedio}</p></div>
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

            {/* --- ESCÁNER QR --- */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h2 style={{ color: '#E91E63', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <FaQrcode /> Escáner QR de Entregas
                </h2>
                <button onClick={() => setShowScanner(!showScanner)} style={{ background: showScanner ? '#E91E63' : '#4A148C', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' }}>
                    {showScanner ? 'Cerrar Escáner' : 'Abrir Escáner de Pedidos'}
                </button>
                {showScanner && (
                    <div style={{ maxWidth: '350px', margin: '0 auto', border: '3px solid #9C27B0', borderRadius: '10px', overflow: 'hidden' }}>
                        <Scanner
                            onScan={(results) => { if (results && results.length > 0) handleScan(results[0].rawValue); }}
                            onError={(error) => console.warn('QR error:', error)}
                            constraints={{ facingMode: 'environment' }}
                        />
                    </div>
                )}
            </div>

            {/* --- INVENTARIO DE PRODUCTOS --- */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#9C27B0', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <FaPlusCircle /> Inventario de Dulces
                </h2>

                {/* Formulario agregar */}
                <h3 style={{ color: '#4A148C', marginBottom: '10px' }}>Agregar nuevo dulce</h3>
                <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}> 
                    <input style={inputStyle} placeholder="Nombre del dulce" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} required /> 
                    <input style={inputStyle} type="number" placeholder="Existencias iniciales" value={newProduct.existencias} onChange={e => setNewProduct({...newProduct, existencias: e.target.value})} required /> 
                    <input style={inputStyle} placeholder="Descripción" value={newProduct.descripcion} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value})} /> 
                    <input style={inputStyle} type="number" placeholder="Precio" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: e.target.value})} required /> 
                    <input style={{...inputStyle, gridColumn: 'span 2'}} placeholder="URL de Imagen" value={newProduct.imagen} onChange={e => setNewProduct({...newProduct, imagen: e.target.value})} /> 
                    <button type="submit" style={saveButtonStyle}>Guardar en Inventario</button>
                </form>

                {/* Modal edición inline */}
                {editProduct && (
                    <div style={{ background: '#FFF0F5', border: '2px solid #E91E63', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                        <h3 style={{ color: '#E91E63', marginBottom: '15px' }}>✏️ Editando: {editProduct.nombre}</h3>
                        <form onSubmit={handleEditProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <input style={inputStyle} placeholder="Nombre" value={editProduct.nombre} onChange={e => setEditProduct({...editProduct, nombre: e.target.value})} required />
                            <input style={inputStyle} type="number" placeholder="Existencias" value={editProduct.existencias} onChange={e => setEditProduct({...editProduct, existencias: e.target.value})} required />
                            <input style={inputStyle} placeholder="Descripción" value={editProduct.descripcion} onChange={e => setEditProduct({...editProduct, descripcion: e.target.value})} />
                            <input style={inputStyle} type="number" placeholder="Precio" value={editProduct.precio} onChange={e => setEditProduct({...editProduct, precio: e.target.value})} required />
                            <input style={{...inputStyle, gridColumn: 'span 2'}} placeholder="URL de Imagen" value={editProduct.imagen} onChange={e => setEditProduct({...editProduct, imagen: e.target.value})} />
                            <button type="submit" style={saveButtonStyle}>Guardar Cambios</button>
                            <button type="button" onClick={() => setEditProduct(null)} style={{ ...saveButtonStyle, background: '#aaa' }}>Cancelar</button>
                        </form>
                    </div>
                )}

                {/* Tabla de productos */}
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #eee' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#E91E63', color: 'white' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Producto</th>
                                <th style={{ padding: '12px' }}>Precio</th>
                                <th style={{ padding: '12px' }}>Stock</th>
                                <th style={{ padding: '12px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                    <td style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#4A148C' }}>{p.nombre}</td>
                                    <td style={{ padding: '12px', color: '#E91E63', fontWeight: 'bold' }}>${p.precio}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ background: p.existencias > 0 ? '#C8E6C9' : '#FFCDD2', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: p.existencias > 0 ? '#2E7D32' : '#C62828' }}>
                                            {p.existencias}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button onClick={() => setEditProduct(p)} style={{ background: '#9C27B0', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                            <FaEdit /> Editar
                                        </button>
                                        <button onClick={() => handleDeleteProduct(p._id, p.nombre)} style={{ background: '#E91E63', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                            <button onClick={() => handleToggleAdmin(u._id, u.isAdmin, u.nombre)} style={{ background: u.isAdmin ? '#4A148C' : '#E91E63', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' }}> 
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
                                        style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', background: loadingId === order._id ? '#ccc' : (order.estado === 'pendiente' ? '#FFEB3B' : '#C8E6C9'), cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }} 
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