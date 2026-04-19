const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); 
const Product = require('../models/Product'); 
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 1. MERCADO PAGO
router.post('/create_preference', async (req, res) => {
    try {
        const body = {
            items: req.body.items.map(item => ({
                title: item.nombre,
                quantity: Number(item.cantidad),
                unit_price: Number(item.precio),
                currency_id: 'MXN',
            })),
            back_urls: {
                success: "https://humorous-nourishment-production.up.railway.app/success",
                failure: "https://humorous-nourishment-production.up.railway.app/failure",
                pending: "https://humorous-nourishment-production.up.railway.app/pending"
            },
            auto_return: "approved",
        };
        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({ id: result.id });
    } catch (error) { res.status(500).json({ error: 'Error MP' }); }
});

// 2. GUARDAR PEDIDO
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        if (req.body.productos) {
            for (const item of req.body.productos) {
                await Product.findByIdAndUpdate(item.productoId, { $inc: { existencias: -Number(item.cantidad) } });
            }
        }
        res.status(201).json(savedOrder);
    } catch (err) { res.status(500).json({ error: 'Error al guardar' }); }
});

// 3. OBTENER PEDIDOS
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: 'Error al obtener' }); }
});

// 4. ACTUALIZAR ESTADO (Arreglado para evitar el Warning de Mongoose)
router.patch('/:id/status', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(
            req.params.id, 
            { estado: req.body.nuevoEstado }, 
            { returnDocument: 'after' } // Esto quita el Warning de tus logs
        );
        res.json(updated);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});

// 5. ESTADÍSTICAS (FORZADO)
router.get('/stats', async (req, res) => {
    try {
        const orders = await Order.find().lean();
        const sales = {};
        
        orders.forEach(order => {
            if (order.productos) {
                order.productos.forEach(p => {
                    const n = p.nombre || "Dulce";
                    const c = Number(p.cantidad) || 0;
                    sales[n] = (sales[n] || 0) + c;
                });
            }
        });

        const result = Object.keys(sales).map(name => ({
            name: name,
            ventas: sales[name]
        })).sort((a, b) => b.ventas - a.ventas).slice(0, 5);

        res.json(result);
    } catch (err) {
        res.json([]);
    }
});

module.exports = router;