const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const mercadopago = require('mercadopago');
const fetch = require('node-fetch');

// Configuración SDK Mercado Pago
mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

// ─── HELPER: Notificar al admin por WhatsApp ───────────────────────────────
const notificarAdmin = async (mensaje) => {
    try {
        const phone = process.env.ADMIN_WHATSAPP;
        const apikey = process.env.CALLMEBOT_APIKEY;
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;
        await fetch(url);
        console.log("📱 WhatsApp enviado al admin");
    } catch (err) {
        console.error("❌ Error notificación WhatsApp:", err);
    }
};

// 1. Crear pedido (POST /api/orders)
router.post('/', async (req, res) => {
    try {
        const body = req.body;

        // ✅ FIX: Recalcular total en el backend para evitar strings del frontend
        const totalCalculado = (body.productos || []).reduce((acc, p) => {
            return acc + (Number(p.cantidad) * Number(p.precio));
        }, 0);

        const newOrder = new Order({
            ...body,
            total: totalCalculado // Siempre usamos el total recalculado
        });
        const savedOrder = await newOrder.save();

        // Descontar stock si es efectivo
        if (body.metodoPago === 'efectivo' && body.productos) {
            for (const item of body.productos) {
                if (item.productoId) {
                    await Product.findByIdAndUpdate(item.productoId, { $inc: { existencias: -Number(item.cantidad) } });
                }
            }
        }

        // Notificar al admin
        const productosTexto = savedOrder.productos
            .map(p => `  • ${p.nombre} x${p.cantidad}`)
            .join('\n');
        const msg = `🍭 *Nuevo Pedido - Dulce Mundo*\n\n👤 Cliente: ${savedOrder.usuario}\n📞 Tel: ${savedOrder.telefono || 'Sin número'}\n\n🛍️ Productos:\n${productosTexto}\n\n💰 Total: $${savedOrder.total.toFixed(2)}\n💳 Pago: ${savedOrder.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Efectivo'}\n🕐 ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`;
        await notificarAdmin(msg);

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error al crear orden:", error);
        res.status(500).json(error);
    }
});

// 2. Obtener todos los pedidos (GET /api/orders)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders);
    } catch (error) { res.status(500).json(error); }
});

// 3. Estadísticas de ventas por producto (GET /api/orders/stats)
router.get('/stats', async (req, res) => {
    try {
        const orders = await Order.find().lean();
        const sales = {};
        orders.forEach(order => {
            (order.productos || []).forEach(p => {
                sales[p.nombre] = (sales[p.nombre] || 0) + (parseInt(p.cantidad) || 0);
            });
        });
        const result = Object.keys(sales)
            .map(name => ({ name, ventas: sales[name] }))
            .sort((a, b) => b.ventas - a.ventas)
            .slice(0, 5);
        res.json(result);
    } catch (err) {
        console.error("Error stats:", err);
        res.json([]);
    }
});

// 4. Reporte financiero consolidado (GET /api/orders/reporte-financiero)
router.get('/reporte-financiero', async (req, res) => {
    try {
        const reporte = await Order.aggregate([
            { $match: { estado: 'entregado' } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
                totalDiario: { $sum: "$total" },
                cantidadPedidos: { $sum: 1 }
            }},
            { $sort: { _id: -1 } }
        ]);
        res.json(reporte);
    } catch (error) {
        console.error("Error en reporte financiero:", error);
        res.status(500).json({ error: "Error al generar reporte financiero" });
    }
});

// 5. Crear preferencia de MP (POST /api/orders/create_preference)
router.post('/create_preference', async (req, res) => {
    try {
        const { items, orderId } = req.body;
        const preference = {
            items: items.map(i => ({
                title: i.nombre,
                unit_price: Number(i.precio),
                quantity: Number(i.cantidad)
            })),
            external_reference: orderId,
            back_urls: {
                success: "https://humorous-nourishment-production.up.railway.app/catalogo?pago=exitoso",
                failure: "https://humorous-nourishment-production.up.railway.app/carrito",
                pending: "https://humorous-nourishment-production.up.railway.app/catalogo"
            },
            auto_return: "approved"
        };
        const response = await mercadopago.preferences.create(preference);
        res.json({ id: response.body.id });
    } catch (error) {
        console.error("Error MP:", error);
        res.status(500).json(error);
    }
});

// 6. WEBHOOK de Mercado Pago (POST /api/orders/webhook)
router.post('/webhook', async (req, res) => {
    const paymentId = req.query['data.id'];
    const topic = req.query.topic;

    if (topic === 'payment') {
        try {
            const payment = await mercadopago.payment.findById(paymentId);
            if (payment.body.status === 'approved') {
                const orderId = payment.body.external_reference;

                const session = await mongoose.startSession();
                session.startTransaction();

                try {
                    const order = await Order.findById(orderId).session(session);
                    if (order && order.estado === 'pendiente') {
                        order.estado = 'pagado';
                        order.payment_id = paymentId;
                        await order.save({ session });

                        for (let item of order.productos) {
                            await Product.findByIdAndUpdate(
                                item.productoId,
                                { $inc: { existencias: -item.cantidad } },
                                { session }
                            );
                        }
                        await session.commitTransaction();
                        console.log(`✅ Pedido ${orderId} procesado`);

                        const msg = `✅ *Pago Aprobado - Mercado Pago*\n\n👤 Cliente: ${order.usuario}\n💰 Total: $${order.total.toFixed(2)}\n🆔 Payment ID: ${paymentId}\n🕐 ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`;
                        await notificarAdmin(msg);
                    }
                } catch (e) {
                    await session.abortTransaction();
                    throw e;
                } finally { session.endSession(); }
            }
        } catch (error) { console.error("Error Webhook:", error); }
    }
    res.sendStatus(200);
});

// 7. Pedidos de un cliente (GET /api/orders/mis-pedidos?usuario=Nombre)
router.get('/mis-pedidos', async (req, res) => {
    try {
        const { usuario } = req.query;
        if (!usuario) return res.status(400).json({ error: 'Falta el usuario' });
        const pedidos = await Order.find({ usuario }).sort({ fecha: -1 });
        res.json(pedidos);
    } catch (error) {
        console.error("Error mis-pedidos:", error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// 8. Actualizar estado del pedido (PATCH /api/orders/:id/status)
router.patch('/:id/status', async (req, res) => {
    try {
        const { nuevoEstado } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { estado: nuevoEstado });

        const pedido = await Order.findById(req.params.id);
        const estadoEmoji = {
            pendiente: '⏳',
            pagado: '💳',
            entregado: '📦'
        };
        const emoji = estadoEmoji[nuevoEstado] || '🔄';
        const msg = `${emoji} *Pedido Actualizado - Dulce Mundo*\n\n👤 Cliente: ${pedido.usuario}\n📞 Tel: ${pedido.telefono || 'Sin número'}\n🔄 Estado: ${nuevoEstado.toUpperCase()}\n💰 Total: $${pedido.total.toFixed(2)}\n🕐 ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`;
        await notificarAdmin(msg);

        res.json({ message: "Estado actualizado" });
    } catch (error) { res.status(500).json(error); }
});

module.exports = router;