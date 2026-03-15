import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaPlusCircle, FaBoxOpen, FaFileInvoiceDollar } from 'react-icons/fa';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    // --- FUNCIÓN HELPER PARA CARGAR LOGO DESDE /PUBLIC ---
    const getLogoBase64 = () => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = '/logo.jpg'; // <-- Aquí busca tu archivo en public
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
            // Cargar el logo
            const imgData = await getLogoBase64();
            
            // Posicionar Logo (centrado)
            doc.addImage(imgData, 'JPEG', 82, 10, 45, 45);

            // Texto de Encabezado
            doc.setFontSize(22);
            doc.setTextColor(233, 30, 99);
            doc.text("Dulce Mundo", 105, 60, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Santa Isabel Ixtapan, Atenco, Edo. Mex.", 105, 68, { align: 'center' });

            // Datos del Cliente
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
            Swal.fire('Error', 'No se pudo cargar el logo del ticket', 'error');
        }
    };

    // ... (Mantén aquí tus funciones handleUpdateStatus y handleAddProduct de la versión anterior)

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            {/* ... (Mantén aquí el resto del JSX: Formulario y Tabla) */}
        </div>
    );
}

// ... Estilos finales (inputStyle y saveButtonStyle)