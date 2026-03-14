import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaPlusCircle, FaBoxOpen, FaFileInvoiceDollar } from 'react-icons/fa'; // Añadimos FaFileInvoiceDollar
import Swal from 'sweetalert2';
import jsPDF from 'jspdf'; // Importamos jsPDF
import 'jspdf-autotable'; // Importamos el plugin de tablas

const apiUrl = import.meta.env.VITE_API_URL;

export default function Admin() {
    const [orders, setOrders] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [newProduct, setNewProduct] = useState({ 
        nombre: '', descripcion: '', precio: '', imagen: '', existencias: '' 
    });

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

    // --- FUNCIÓN PARA GENERAR TICKET ---
    const generarTicket = (order) => {
        const doc = new jsPDF();

        // Encabezado
        doc.setFontSize(22);
        doc.setTextColor(233, 30, 99);
        doc.text("Dulce Mundo 🍭", 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Santa Isabel Ixtapan, Atenco, Edo. Mex.", 105, 28, { align: 'center' });

        // Datos del Cliente
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Cliente: ${order.usuario}`, 20, 45);
        doc.text(`WhatsApp: ${order.telefono}`, 20, 52);
        doc.text(`Fecha: ${new Date(order.fecha).toLocaleString()}`, 20, 59);
        doc.text(`Método: ${order.metodoPago.toUpperCase()}`, 20, 66);

        // Tabla de Productos
        const body = order.productos.map(p => [
            p.nombre, 
            p.cantidad, 
            `$${p.precio}`, 
            `$${(p.cantidad * p.precio).toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 75,
            head: [['Producto', 'Cant.', 'Precio U.', 'Subtotal']],
            body: body,
            headStyles: { fillStyle: [156, 39, 176] },
            theme: 'striped'
        });

        // Total
        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL A PAGAR: $${order.total}`, 140, finalY + 15);

        // Pie de página
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("¡Gracias por endulzar tu día con nosotros!", 105, finalY + 30, { align: 'center' });

        // Guardar PDF
        doc.save(`Ticket_${order.usuario}_${Date.now()}.pdf`);

        // Abrir WhatsApp con mensaje
        const mensaje = `Hola ${order.usuario}, ¡gracias por tu compra en Dulce Mundo! 🍭 Aquí tienes el detalle de tu pedido por $${order.total}. En un momento te envío tu ticket en PDF.`;
        window.open(`https://wa.me/52${order.telefono.replace(/\s+/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    const handleUpdateStatus = async (id, nuevoEstado) => {
        setLoadingId(id);
        try {
            await axios.patch(`${apiUrl}/api/orders/${id}/status`, { nuevoEstado });
            Swal.fire({ title: 'Estado Actualizado', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
            fetchOrders();
        } catch (error) { Swal.fire('Error', 'No se pudo actualizar', 'error'); }
        finally { setLoadingId(null); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${apiUrl}/api/products`, newProduct);
            Swal.fire('¡Éxito!', 'Dulce agregado', 'success');
            setNewProduct({ nombre: '', descripcion: '', precio: '', imagen: '', existencias: '' });
        } catch (error) { Swal.fire('Error', 'No se guardó', 'error'); }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ color: '#E91E63', textAlign: 'center' }}>Panel de Administración 🔐</h1>

            {/* --- FORMULARIO --- */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#9C27B0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaPlusCircle /> Agregar Nuevo Dulce
                </h2>
                <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input style={inputStyle} placeholder="Nombre del dulce" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} required />
                    <input style={inputStyle} type="number" placeholder="Existencias" value={newProduct.existencias} onChange={e => setNewProduct({...newProduct, existencias: e.target.value})} required />
                    <input style={inputStyle} placeholder="Descripción" value={newProduct.descripcion} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value})} />
                    <input style={inputStyle} type="number" placeholder="Precio" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: e.target.value})} required />
                    <input style={inputStyle} placeholder="URL de Imagen" value={newProduct.imagen} onChange={e => setNewProduct({...newProduct, imagen: e.target.value})} />
                    <button type="submit" style={saveButtonStyle}>Guardar en Inventario</button>
                </form>
            </div>

            {/* --- TABLA --- */}
            <h2 style={{ color: '#E91E63', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBoxOpen /> Pedidos Recientes
            </h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ background: '#E91E63', color: 'white' }}>
                            <th style={{ padding: '15px' }}>Fecha</th>
                            <th>Cliente</th>
                            <th>WhatsApp / Ticket</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                <td style={{ padding: '12px' }}>{new Date(order.fecha).toLocaleDateString()}</td>
                                <td style={{ fontWeight: 'bold' }}>{order.usuario}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                        <span>{order.telefono}</span>
                                        {/* BOTÓN TICKET */}
                                        <button 
                                            onClick={() => generarTicket(order)}
                                            title="Generar Ticket PDF"
                                            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1.4rem' }}
                                        >
                                            <FaFileInvoiceDollar />
                                        </button>
                                    </div>
                                </td>
                                <td>${order.total}</td>
                                <td style={{ padding: '10px' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>
                                        {order.productos?.map((p, i) => <div key={i}>{p.nombre} ({p.cantidad})</div>)}
                                    </div>
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

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const saveButtonStyle = { gridColumn: 'span 2', background: '#9C27B0', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };