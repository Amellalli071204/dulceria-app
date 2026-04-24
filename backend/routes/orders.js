const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); 
const Product = require('../models/Product'); 
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 1. MERCADO PAGO: Crear preferencia con vinculación de ID de pedido
router.post('/create_preference', async (req, res) => {
    try {
        const { items, orderId } = req.body; // Recibimos el ID del pedido generado en el frontend
        const body = {
            items: items.map(item => ({
                title: item.nombre,
                quantity: Number(item.cantidad),
                unit_price: Number(item.precio),
                currency_id: 'MXN',
            })),
            external_reference: orderId, // Vincula el ID de MongoDB con Mercado Pago
            notification_url: "https://humorous-nourishment-production.up.railway.app/api/orders/webhook",
            back_urls: {
                success: "https://humorous-nourishment-production.up.railway.app/catalogo",
                failure: "https://humorous-nourishment-production.up.railway.app/carrito",
                pending: "https://humorous-nourishment-production.up.railway.app/catalogo"
            },
            auto_return: "approved",
        };
        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({ id: result.id });
    } catch (error) { 
        console.error("Error al crear preferencia:", error);
        res.status(500).json({ error: 'Error MP' }); 
    }
});

// 2. WEBHOOK: Recibir notificaciones de Mercado Pago (Automatización)
router.post('/webhook', async (req, res) => {
    const { query } = req;
    const topic = query.topic || query.type;

    try {
        if (topic === 'payment') {
            const paymentId = query.id || query['data.id'];
            
            // Consultar el estado real del pago en la API de Mercado Pago
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
            });
            const paymentData = await response.json();

            // Si el pago está aprobado, actualizamos el estado e inventario
            if (paymentData.status === 'approved') {
                const orderId = paymentData.external_reference; 
                
                await Order.findByIdAndUpdate(orderId, { estado: 'pagado' });
                console.log(`✅ Pedido ${orderId} actualizado a PAGADO vía Webhook`);
            }
        }
        res.sendStatus(200); // Siempre responder 200 a Mercado Pago
    } catch (error) {
        console.error("🔴 Error en Webhook:", error);
        res.sendStatus(500);
    }
});

// 3. GUARDAR PEDIDO (Efectivo o inicio de Digital)
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        
        // Si es efectivo, descontamos stock de inmediato
        if (req.body.metodoPago === 'efectivo' && req.body.productos) {
            for (const item of req.body.productos) {
                if(item.productoId) {
                    await Product.findByIdAndUpdate(item.productoId, { $inc: { existencias: -Number(item.cantidad) } });
                }
            }
        }
        res.status(201).json(savedOrder);
    } catch (err) { res.status(500).json({ error: 'Error al guardar' }); }
});

// 4. OBTENER PEDIDOS (Admin)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: 'Error al obtener' }); }
});

// 5. ACTUALIZAR ESTADO MANUAL
router.patch('/:id/status', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(
            req.params.id, 
            { estado: req.body.nuevoEstado }, 
            { returnDocument: 'after' }
        );
        res.json(updated);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});

// 6. ESTADÍSTICAS (Top 5)
router.get('/stats', async (req, res) => {
    try {
        const orders = await Order.find().lean();
        const sales = {};
        
        orders.forEach(order => {
            const items = order.productos || [];
            items.forEach(p => {
                const nombre = p.nombre || "Dulce";
                const cant = parseInt(p.cantidad) || 0;
                if (cant > 0) {
                    sales[nombre] = (sales[nombre] || 0) + cant;
                }
            });
        });

        const result = Object.keys(sales).map(name => ({
            name: name,
            ventas: sales[name]
        }))
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5);

        res.json(result);
    } catch (err) {
        res.json([]);
    }
});

module.exports = router;