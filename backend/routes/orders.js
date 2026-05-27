const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 1. MERCADO PAGO: Crear preferencia
router.post('/create_preference', async (req, res) => {
    try {
        const { items, orderId } = req.body;
        const body = {
            items: items.map(item => ({
                title: item.nombre,
                quantity: Number(item.cantidad),
                unit_price: Number(item.precio),
                currency_id: 'MXN',
            })),
            external_reference: orderId,
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

// 2. WEBHOOK: Actualización automática e inventario
router.post('/webhook', async (req, res) => {
    const { data, type } = req.body;

    if (type !== 'payment') return res.sendStatus(200);

    try {
        // Consultar el estado real en MP
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
            headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
        });
        const paymentData = await response.json();

        if (paymentData.status === 'approved') {
            const orderId = paymentData.external_reference;
            const order = await Order.findById(orderId);

            // IDEMPOTENCIA: Solo procesar si el pedido existe y no ha sido pagado aún
            if (order && order.estado !== 'pagado') {
                order.estado = 'pagado';
                await order.save();

                // DESCONTAR STOCK
                for (const item of order.productos) {
                    await Product.findByIdAndUpdate(item.productoId, { 
                        $inc: { existencias: -Number(item.cantidad) } 
                    });
                }
                console.log(`✅ Pedido ${orderId} procesado: Stock descontado`);
            }
        }
        res.sendStatus(200);
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

// 4. OBTENER PEDIDOS
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: 'Error al obtener' }); }
});

// 5. ACTUALIZAR ESTADO MANUAL
router.patch('/:id/status', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { estado: req.body.nuevoEstado }, { returnDocument: 'after' });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});

// 6. ESTADÍSTICAS
router.get('/stats', async (req, res) => {
    try {
        const orders = await Order.find().lean();
        const sales = {};
        orders.forEach(order => {
            (order.productos || []).forEach(p => {
                sales[p.nombre] = (sales[p.nombre] || 0) + (parseInt(p.cantidad) || 0);
            });
        });
        const result = Object.keys(sales).map(name => ({ name, ventas: sales[name] }))
            .sort((a, b) => b.ventas - a.ventas).slice(0, 5);
        res.json(result);
    } catch (err) { res.json([]); }
});

module.exports = router;