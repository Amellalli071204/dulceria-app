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

// 4. ACTUALIZAR ESTADO
router.patch('/:id/status', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { estado: req.body.nuevoEstado }, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});

// 5. ESTADÍSTICAS (VERSIÓN SIMPLIFICADA ANTI-ERRORES)
router.get('/stats', async (req, res) => {
    try {
        const allOrders = await Order.find().lean(); // .lean() hace que sea más rápido y fácil de leer
        const salesMap = {};

        allOrders.forEach(order => {
            if (order.productos && Array.isArray(order.productos)) {
                order.productos.forEach(p => {
                    const nombre = p.nombre || "Dulce";
                    const cantidad = Number(p.cantidad) || 0;
                    if (cantidad > 0) {
                        salesMap[nombre] = (salesMap[nombre] || 0) + cantidad;
                    }
                });
            }
        });

        const stats = Object.keys(salesMap).map(name => ({
            name: name,
            ventas: salesMap[name]
        })).sort((a, b) => b.ventas - a.ventas).slice(0, 5);

        // Si no hay nada, mandamos un array vacío para que el frontend sepa qué hacer
        res.status(200).json(stats || []);
    } catch (err) {
        console.error("Error en stats:", err);
        res.status(200).json([]); // Mandamos array vacío en lugar de error para no romper el front
    }
});

module.exports = router;