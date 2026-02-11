const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { MercadoPagoConfig, Preference } = require('mercadopago');

// CONFIGURACIÓN MERCADO PAGO
// (Usa tu ACCESS_TOKEN real de Mercado Pago aquí o en el .env)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 1. CREAR PREFERENCIA (Para botón de Mercado Pago)
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear preferencia' });
    }
});

// 2. GUARDAR PEDIDO (Efectivo o después de pagar)
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.json(savedOrder);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar pedido' });
    }
});

// 3. OBTENER PEDIDOS (Para el Admin)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ fecha: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

module.exports = router;