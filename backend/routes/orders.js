const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const mercadopago = require('mercadopago');

// Configuración SDK Mercado Pago
mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

// 1. Crear pedido (POST /api/orders)
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
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

// 3. Reporte Financiero Consolidado (GET /api/orders/reporte-financiero)
// Este endpoint agrupa las ventas por día y suma los ingresos
router.get('/reporte-financiero', async (req, res) => {
    try {
        const reporte = await Order.aggregate([
            { $match: { estado: 'entregado' } }, // Consideramos ingresos de pedidos entregados
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
                totalDiario: { $sum: "$total" },
                cantidadPedidos: { $sum: 1 }
            }},
            { $sort: { _id: -1 } } // Ordenado de más reciente a más antiguo
        ]);
        res.json(reporte);
    } catch (error) { 
        console.error("Error en reporte financiero:", error);
        res.status(500).json({ error: "Error al generar reporte financiero" }); 
    }
});

// 4. Crear preferencia (POST /api/orders/create_preference)
router.post('/create_preference', async (req, res) => {
    try {
        const { items, orderId } = req.body;
        const preference = {
            items: items.map(i => ({ 
                title: i.nombre, 
                unit_price: Number(i.precio), 
                quantity: Number(i.cantidad) 
            })),
            external_reference: orderId, // Clave para el webhook
           back_urls: {
    success: "https://humorous-nourishment-production.up.railway.app/catalogo?pago=exitoso",
    failure: "https://humorous-nourishment-production.up.railway.app/carrito",
    pending: "https://humorous-nourishment-production.up.railway.app/catalogo"
},
        };
        const response = await mercadopago.preferences.create(preference);
        res.json({ id: response.body.id });
    } catch (error) { 
        console.error("Error MP:", error);
        res.status(500).json(error); 
    }
});

// 5. WEBHOOK de Mercado Pago (POST /api/orders/webhook)
router.post('/webhook', async (req, res) => {
    const paymentId = req.query['data.id'];
    const topic = req.query.topic;

    if (topic === 'payment') {
        try {
            const payment = await mercadopago.payment.findById(paymentId);
            if (payment.body.status === 'approved') {
                const orderId = payment.body.external_reference;
                
                // Transacción para garantizar consistencia (Stock y Estado)
                const session = await mongoose.startSession();
                session.startTransaction();
                
                try {
                    const order = await Order.findById(orderId).session(session);
                    if (order && order.estado === 'pendiente') {
                        order.estado = 'pagado';
                        order.payment_id = paymentId;
                        await order.save({ session });
                        
                        // Descuento de stock
                        for (let item of order.productos) {
                            await Product.findByIdAndUpdate(
                                item.productoId, 
                                { $inc: { existencias: -item.cantidad } }, 
                                { session }
                            );
                        }
                        await session.commitTransaction();
                    }
                } catch (e) {
                    await session.abortTransaction();
                    throw e;
                } finally { session.endSession(); }
            }
        } catch (error) { console.error("Error Webhook:", error); }
    }
    res.sendStatus(200); // Siempre responder 200
});

// 6. Actualizar estado del pedido (PATCH /api/orders/:id/status)
router.patch('/:id/status', async (req, res) => {
    try {
        const { nuevoEstado } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { estado: nuevoEstado });
        res.json({ message: "Estado actualizado" });
    } catch (error) { res.status(500).json(error); }
});

module.exports = router;